const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { chargePayment } = require('../controllers/paymentController');

// Seluruh endpoint pembayaran tagihan membutuhkan autentikasi pelanggan (role: customer)
router.use(authenticate, requireRole('customer'));

// POST /api/payments/charge
router.post('/charge', chargePayment);

module.exports = router;
