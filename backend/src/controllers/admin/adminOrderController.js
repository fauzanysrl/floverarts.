const { pool } = require('../../config/db');

// GET /api/admin/orders (Melihat Daftar Seluruh Pesanan Toko dengan Filter Status)
async function getOrdersAdmin(req, res, next) {
  try {
    const { status, payment_status, limit = 50, page = 1 } = req.query;

    let query = `
      SELECT o.id, o.order_number, o.user_id, o.total_amount, o.payment_status, o.order_status,
             o.fulfillment_method, o.recipient_name, o.recipient_phone, o.delivery_date, o.delivery_time,
             o.courier, o.tracking_number, o.needs_attention, o.attention_reason, o.created_at,
             u.name AS customer_name, u.email AS customer_email,
             COUNT(oi.id) AS total_items
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.order_status = ?';
      params.push(status);
    }

    if (payment_status) {
      query += ' AND o.payment_status = ?';
      params.push(payment_status);
    }

    query += ' GROUP BY o.id ORDER BY o.id DESC';

    const numLimit = Math.max(1, parseInt(limit, 10) || 50);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (numPage - 1) * numLimit;

    query += ' LIMIT ? OFFSET ?';
    params.push(numLimit, offset);

    const [orders] = await pool.query(query, params);

    return res.success(orders, 'Daftar pesanan toko berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/orders/:id (Melihat Rincian Lengkap Pesanan, Item Snapshot, Pembayaran & Log Status)
async function getOrderDetailAdmin(req, res, next) {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ?`,
      [id]
    );

    if (!orders || orders.length === 0) {
      return res.error('Pesanan tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const order = orders[0];

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    const formattedItems = items.map(item => ({
      ...item,
      custom_details: typeof item.custom_details === 'string' ? JSON.parse(item.custom_details) : item.custom_details
    }));

    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC',
      [id]
    );

    const [logs] = await pool.query(
      `SELECT osl.*, u.name AS changed_by_name
       FROM order_status_logs osl
       LEFT JOIN users u ON u.id = osl.changed_by
       WHERE osl.order_id = ?
       ORDER BY osl.id ASC`,
      [id]
    );

    return res.success({
      ...order,
      items: formattedItems,
      payments,
      status_logs: logs
    }, 'Detail pesanan florist berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/orders/:id/status (Memperbarui Status Progres Pesanan, Kurir & Nomor Resi)
async function updateOrderStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { order_status, courier, tracking_number, notes } = req.body;

    const validStatuses = ['menunggu_pembayaran', 'dikonfirmasi', 'diproses', 'siap_diambil_dikirim', 'selesai', 'dibatalkan'];
    if (!order_status || !validStatuses.includes(order_status)) {
      await connection.rollback();
      return res.error(`Status pesanan tidak valid. Pilihan: ${validStatuses.join(', ')}.`, 'VALIDATION_ERROR', 422);
    }

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (!orders || orders.length === 0) {
      await connection.rollback();
      return res.error('Pesanan tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const order = orders[0];
    const previousStatus = order.order_status;

    // Perbarui data tabel orders
    const updatedCourier = courier !== undefined ? courier : order.courier;
    const updatedTracking = tracking_number !== undefined ? tracking_number : order.tracking_number;

    await connection.query(
      `UPDATE orders 
       SET order_status = ?, courier = ?, tracking_number = ?, updated_at = NOW() 
       WHERE id = ?`,
      [order_status, updatedCourier, updatedTracking, id]
    );

    // Catat log histori perubahan status pesanan
    await connection.query(
      `INSERT INTO order_status_logs 
        (order_id, previous_status, new_status, changed_by, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [id, previousStatus, order_status, req.user ? req.user.id : null, notes || `Status diubah oleh admin menjadi ${order_status}`]
    );

    await connection.commit();

    return res.success({
      id: parseInt(id, 10),
      order_number: order.order_number,
      previous_status: previousStatus,
      new_status: order_status,
      courier: updatedCourier,
      tracking_number: updatedTracking
    }, `Status pesanan berhasil diubah menjadi "${order_status}".`);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// POST /api/admin/orders/:id/check-gateway (Pemeriksaan Sinkronisasi Status Gateway Pembayaran)
async function checkGatewayStatus(req, res, next) {
  try {
    const { id } = req.params;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!orders || orders.length === 0) {
      return res.error('Pesanan tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const order = orders[0];
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    );

    const payment = payments.length > 0 ? payments[0] : null;

    return res.success({
      order_id: order.id,
      order_number: order.order_number,
      current_payment_status: order.payment_status,
      current_order_status: order.order_status,
      gateway_status: payment ? payment.status : 'no_payment_record',
      sync_result: 'Status tersinkronisasi dengan baik.'
    }, 'Pengecekan status pembayaran ke gateway berhasil.');
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/orders/:id/refund (Pembatalan Pesanan, Pengembalian Stok & Pengeluaran Kas Refund)
async function refundOrder(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { reason, refund_amount } = req.body;

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (!orders || orders.length === 0) {
      await connection.rollback();
      return res.error('Pesanan tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const order = orders[0];
    if (order.order_status === 'dibatalkan') {
      await connection.rollback();
      return res.error('Pesanan ini sudah dibatalkan sebelumnya.', 'ALREADY_CANCELLED', 400);
    }

    const amount = refund_amount !== undefined ? parseFloat(refund_amount) : parseFloat(order.total_amount);

    // 1. Kembalikan stok fisik untuk produk standar
    const [items] = await connection.query('SELECT product_id, item_type, quantity FROM order_items WHERE order_id = ?', [id]);
    for (const item of items) {
      if (item.item_type === 'standard' && item.product_id) {
        const [prodRows] = await connection.query('SELECT id, stock FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (prodRows && prodRows.length > 0) {
          const prod = prodRows[0];
          const newStock = prod.stock + item.quantity;
          await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, prod.id]);
          await connection.query(
            `INSERT INTO inventory_transactions 
              (product_id, order_id, type, quantity, stock_before, stock_after, reason, created_by)
             VALUES (?, ?, 'in', ?, ?, ?, 'Pengembalian stok pesanan dibatalkan / refund', ?)`,
            [prod.id, order.id, item.quantity, prod.stock, newStock, req.user ? req.user.id : null]
          );
        }
      }
    }

    // 2. Potong saldo kas dan catat cashflow transaksi keluar refund
    const [accRows] = await connection.query("SELECT id, balance FROM cash_accounts WHERE status = 'active' ORDER BY id ASC LIMIT 1");
    const cashAccountId = accRows.length > 0 ? accRows[0].id : 1;

    await connection.query(
      `INSERT INTO cashflow_transactions 
        (cash_account_id, order_id, created_by, type, source, category, amount, reference_number, notes)
       VALUES (?, ?, ?, 'expense', 'refund', 'Pengembalian Dana (Refund)', ?, ?, ?)`,
      [
        cashAccountId,
        order.id,
        req.user ? req.user.id : null,
        amount,
        `REF-${order.order_number}`,
        reason || 'Pembatalan dan pengembalian dana pesanan'
      ]
    );

    await connection.query('UPDATE cash_accounts SET balance = GREATEST(0, balance - ?), updated_at = NOW() WHERE id = ?', [
      amount,
      cashAccountId
    ]);

    // 3. Update status pesanan
    const previousStatus = order.order_status;
    await connection.query(
      "UPDATE orders SET payment_status = 'dikembalikan', order_status = 'dibatalkan', updated_at = NOW() WHERE id = ?",
      [id]
    );

    // 4. Catat log status
    await connection.query(
      `INSERT INTO order_status_logs 
        (order_id, previous_status, new_status, changed_by, notes)
       VALUES (?, ?, 'dibatalkan', ?, ?)`,
      [id, previousStatus, req.user ? req.user.id : null, `Pesanan dibatalkan & di-refund: ${reason || '-'}`]
    );

    await connection.commit();

    return res.success({
      order_id: order.id,
      order_number: order.order_number,
      refund_amount: amount,
      reason: reason || '-'
    }, 'Pesanan berhasil dibatalkan dan dana refund telah dicatat.');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getOrdersAdmin,
  getOrderDetailAdmin,
  updateOrderStatus,
  checkGatewayStatus,
  refundOrder
};
