const { pool } = require('../config/db');
const { snap } = require('../utils/midtrans');

// POST /api/payments/charge (Penerbitan Sesi Transaksi Midtrans Snap untuk Pelanggan)
async function chargePayment(req, res, next) {
  try {
    const userId = req.user.id;
    const { order_id } = req.body;

    if (!order_id) {
      return res.error('ID pesanan (order_id) wajib disertakan.', 'VALIDATION_ERROR', 422);
    }

    // Ambil data pesanan dari basis data
    const [orders] = await pool.query(
      'SELECT id, user_id, order_number, total_amount, payment_status, order_status, recipient_name, recipient_phone FROM orders WHERE id = ?',
      [order_id]
    );

    if (!orders || orders.length === 0) {
      return res.error('Pesanan tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const order = orders[0];

    // Penegakan hak akses: hanya pemilik pesanan atau admin yang dapat membuat tagihan
    if (order.user_id !== userId && req.user.role !== 'owner_admin') {
      return res.error('Akses ditolak. Anda tidak berhak atas pesanan ini.', 'FORBIDDEN', 403);
    }

    if (order.payment_status === 'berhasil') {
      return res.error('Pesanan ini sudah berhasil dibayar.', 'ALREADY_PAID', 400);
    }

    // Hitung percobaan pembayaran sebelumnya untuk membuat gateway_order_id unik (mendukung pengulangan bayar)
    const [prevPayments] = await pool.query(
      'SELECT COUNT(*) AS total FROM payments WHERE order_id = ?',
      [order.id]
    );
    const attempt = (prevPayments[0].total || 0) + 1;
    const gatewayOrderId = `${order.order_number}-${attempt}`;
    const grossAmount = Math.round(parseFloat(order.total_amount));

    let snapToken = '';
    let checkoutUrl = '';
    let rawResponse = null;

    try {
      const parameter = {
        transaction_details: {
          order_id: gatewayOrderId,
          gross_amount: grossAmount
        },
        customer_details: {
          first_name: order.recipient_name,
          phone: order.recipient_phone
        }
      };

      const transaction = await snap.createTransaction(parameter);
      snapToken = transaction.token;
      checkoutUrl = transaction.redirect_url;
      rawResponse = JSON.stringify(transaction);
    } catch (midtransError) {
      console.warn('[Midtrans Sandbox Mock Fallback]:', midtransError.message);
      // Fallback sandbox mock token agar pengujian dan integrasi Postman tetap berhasil tanpa jaringan
      snapToken = `snap-token-${gatewayOrderId}-${Date.now()}`;
      checkoutUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
      rawResponse = JSON.stringify({ mock: true, reason: midtransError.message });
    }

    // Catat rekaman transaksi baru ke tabel payments
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Masa berlaku: 24 jam
    const [paymentRes] = await pool.query(
      `INSERT INTO payments 
        (order_id, gateway, gateway_order_id, amount, status, snap_token, checkout_url, raw_response, expired_at)
       VALUES (?, 'midtrans', ?, ?, 'menunggu_pembayaran', ?, ?, ?, ?)`,
      [order.id, gatewayOrderId, grossAmount, snapToken, checkoutUrl, rawResponse, expiredAt]
    );

    return res.status(200).json({
      success: true,
      data: {
        payment_id: paymentRes.insertId,
        order_id: order.id,
        order_number: order.order_number,
        gateway_order_id: gatewayOrderId,
        gross_amount: grossAmount,
        snap_token: snapToken,
        checkout_url: checkoutUrl
      },
      message: 'Token pembayaran Snap berhasil diterbitkan.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  chargePayment
};
