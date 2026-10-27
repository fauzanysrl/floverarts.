const crypto = require('crypto');
const { pool } = require('../config/db');
const { verifySignatureKey } = require('../utils/midtrans');

// POST /api/webhooks/midtrans (Penerima Notifikasi Asinkron Gateway Pembayaran Midtrans)
async function handleMidtransWebhook(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const payload = req.body;
    const {
      order_id, // Identitas transaksi gateway, contoh: ORD-20261022-001-1
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
      payment_type
    } = payload;

    if (!order_id || !status_code || !gross_amount) {
      return res.status(400).json({ success: false, message: 'Payload webhook tidak lengkap.' });
    }

    // 1. Verifikasi Keaslian Signature Key SHA-512 dari Midtrans
    const isValidSignature = verifySignatureKey(order_id, status_code, gross_amount, signature_key);
    const signatureStatus = isValidSignature ? 'valid' : 'invalid';

    // 2. Jaminan Idempotensi Mutlak melalui Hash Event Key (SHA-256)
    const eventKey = crypto
      .createHash('sha256')
      .update(`${order_id}_${transaction_status}_${transaction_id || ''}`)
      .digest('hex');

    // Periksa apakah rekaman pembayaran tersedia di basis data
    const [payments] = await connection.query(
      'SELECT id, order_id, amount, status FROM payments WHERE gateway_order_id = ? ORDER BY id DESC LIMIT 1',
      [order_id]
    );

    const payment = payments && payments.length > 0 ? payments[0] : null;

    // Catat log payload webhook ke tabel payment_webhook_logs
    try {
      await connection.query(
        `INSERT INTO payment_webhook_logs 
          (payment_id, event_key, signature_status, raw_status, payload, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          payment ? payment.id : null,
          eventKey,
          signatureStatus,
          transaction_status,
          JSON.stringify(payload),
          req.ip || req.connection.remoteAddress
        ]
      );
    } catch (logErr) {
      if (logErr.code === 'ER_DUP_ENTRY') {
        // Notifikasi event ini sudah pernah diproses sebelumnya -> kembalikan respon 200 OK idempotent
        return res.status(200).json({ success: true, message: 'Event webhook telah diproses sebelumnya (idempotent).' });
      }
    }

    if (!payment) {
      // Jika payment tidak ditemukan berdasarkan gateway_order_id spesifik, cari berdasarkan base order number
      const baseOrderNumber = order_id.split('-').slice(0, 3).join('-');
      const [orderByNum] = await connection.query(
        'SELECT id, order_number, total_amount, payment_status, order_status FROM orders WHERE order_number = ?',
        [baseOrderNumber]
      );

      if (!orderByNum || orderByNum.length === 0) {
        console.warn(`[Webhook Warning] Order tidak ditemukan untuk ID: ${order_id}`);
        return res.status(200).json({ success: true, message: 'Pesanan tidak terdaftar, notifikasi dicatat.' });
      }
    }

    await connection.beginTransaction();

    const targetOrderId = payment ? payment.order_id : null;
    const [orderRows] = await connection.query(
      'SELECT id, order_number, total_amount, payment_status, order_status FROM orders WHERE id = ? FOR UPDATE',
      [targetOrderId]
    );

    if (!orderRows || orderRows.length === 0) {
      await connection.rollback();
      return res.status(200).json({ success: true, message: 'Order tidak ditemukan.' });
    }

    const order = orderRows[0];

    // =========================================================================
    // SKENARIO 1: PEMBAYARAN BERHASIL / LUNAS (settlement / capture)
    // =========================================================================
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      // Jika pesanan sudah berstatus lunas sebelumnya, abaikan (idempotent)
      if (order.payment_status === 'berhasil') {
        await connection.rollback();
        return res.status(200).json({ success: true, message: 'Pesanan sudah berstatus lunas sebelumnya.' });
      }

      // 1. Perbarui Rekaman Transaksi Pembayaran
      if (payment) {
        await connection.query(
          `UPDATE payments 
           SET status = 'berhasil', paid_at = NOW(), gateway_transaction_id = ?, payment_type = ?, updated_at = NOW() 
           WHERE id = ?`,
          [transaction_id || null, payment_type || 'other', payment.id]
        );
      }

      // 2. Pemotongan Stok Fisik Secara Atomik untuk Seluruh Item Pesanan
      const [orderItems] = await connection.query(
        'SELECT id, product_id, item_type, quantity, custom_details FROM order_items WHERE order_id = ?',
        [order.id]
      );

      let hasStockDeficit = false;
      let deficitReason = '';

      for (const item of orderItems) {
        if (item.item_type === 'standard' && item.product_id) {
          const [pRows] = await connection.query(
            'SELECT id, name, stock FROM products WHERE id = ? FOR UPDATE',
            [item.product_id]
          );

          if (pRows && pRows.length > 0) {
            const p = pRows[0];
            const stockBefore = p.stock;
            const newStock = stockBefore - item.quantity;

            if (newStock < 0) {
              hasStockDeficit = true;
              deficitReason = `Stok produk "${p.name}" habis saat pembayaran tiba.`;
            }

            await connection.query('UPDATE products SET stock = GREATEST(0, ?) WHERE id = ?', [newStock, p.id]);

            // Catat riwayat mutasi inventaris keluar
            await connection.query(
              `INSERT INTO inventory_transactions 
                (product_id, order_id, type, quantity, stock_before, stock_after, reason)
               VALUES (?, ?, 'out', ?, ?, GREATEST(0, ?), 'Pengurangan stok pesanan lunas')`,
              [p.id, order.id, item.quantity, stockBefore, newStock]
            );
          }
        }
      }

      // 3. Perbarui Status Pesanan Menjadi 'dikonfirmasi'
      const newOrderStatus = 'dikonfirmasi';
      await connection.query(
        `UPDATE orders 
         SET payment_status = 'berhasil', order_status = ?, needs_attention = ?, attention_reason = ?, updated_at = NOW() 
         WHERE id = ?`,
        [newOrderStatus, hasStockDeficit ? 1 : 0, hasStockDeficit ? deficitReason : null, order.id]
      );

      // 4. Catat Log Audit Perubahan Status
      await connection.query(
        `INSERT INTO order_status_logs 
          (order_id, previous_status, new_status, notes)
         VALUES (?, ?, ?, 'Pembayaran diverifikasi via Midtrans Webhook')`,
        [order.id, order.order_status, newOrderStatus]
      );

      // 5. Catat Arus Kas Penjualan Masuk (Cashflow Income)
      // Gunakan akun kas Midtrans Escrow atau fallback ke akun kas utama toko
      const [accRows] = await connection.query(
        "SELECT id FROM cash_accounts WHERE account_type = 'payment_gateway' AND status = 'active' LIMIT 1"
      );
      const cashAccountId = accRows.length > 0 ? accRows[0].id : 1;
      const orderAmount = parseFloat(order.total_amount);

      // Pastikan arus kas belum pernah dicatat untuk order ini
      const [existingCf] = await connection.query(
        "SELECT id FROM cashflow_transactions WHERE order_id = ? AND source = 'order_sales'",
        [order.id]
      );

      if (!existingCf || existingCf.length === 0) {
        await connection.query(
          `INSERT INTO cashflow_transactions 
            (cash_account_id, order_id, type, source, category, amount, reference_number, notes)
           VALUES (?, ?, 'income', 'order_sales', 'Penjualan Bunga', ?, ?, 'Pemasukan dari pembayaran pesanan online')`,
          [cashAccountId, order.id, orderAmount, order.order_number]
        );

        // Tambah saldo akun kas secara langsung
        await connection.query(
          'UPDATE cash_accounts SET balance = balance + ?, updated_at = NOW() WHERE id = ?',
          [orderAmount, cashAccountId]
        );
      }

      await connection.commit();
      return res.status(200).json({ success: true, message: 'Pembayaran berhasil diproses dan dicatat.' });
    }

    // =========================================================================
    // SKENARIO 2: SESI KEDALUWARSA ATAU DIBATALKAN (expire, cancel, deny)
    // =========================================================================
    else if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
      // Proteksi: Notifikasi expire tidak boleh membatalkan pesanan yang SUDAH lunas sebelumnya
      if (order.payment_status === 'berhasil') {
        await connection.rollback();
        return res.status(200).json({ success: true, message: 'Pesanan telah lunas, mengabaikan notifikasi kedaluwarsa sesi lama.' });
      }

      if (payment) {
        await connection.query(
          "UPDATE payments SET status = 'kedaluwarsa', updated_at = NOW() WHERE id = ?",
          [payment.id]
        );
      }

      await connection.query(
        "UPDATE orders SET payment_status = 'kedaluwarsa', order_status = 'dibatalkan', updated_at = NOW() WHERE id = ?",
        [order.id]
      );

      await connection.query(
        `INSERT INTO order_status_logs 
          (order_id, previous_status, new_status, notes)
         VALUES (?, ?, 'dibatalkan', 'Batas waktu pembayaran telah kedaluwarsa')`,
        [order.id, order.order_status]
      );

      await connection.commit();
      return res.status(200).json({ success: true, message: 'Status pembayaran kedaluwarsa berhasil diproses.' });
    }

    await connection.commit();
    return res.status(200).json({ success: true, message: 'Webhook notifikasi dicatat.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  handleMidtransWebhook
};
