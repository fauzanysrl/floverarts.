const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const {
  chargePayment,
  createQrisCharge,
  checkPaymentStatus,
  simulatePaymentSuccess,
} = require('../controllers/paymentController');

// Seluruh endpoint pembayaran tagihan membutuhkan autentikasi pelanggan (role: customer)
router.use(authenticate, requireRole('customer'));

// POST /api/payments/charge
router.post('/charge', chargePayment);

// POST /api/payments/qris - Penerbitan QRIS Midtrans
router.post('/qris', createQrisCharge);

// GET /api/payments/status/:orderId - Pengecekan status pembayaran
router.get('/status/:orderId', checkPaymentStatus);

// POST /api/payments/simulate-success/:orderId - 1-klik simulasi pembayaran sukses
router.post('/simulate-success/:orderId', simulatePaymentSuccess);

module.exports = router;
