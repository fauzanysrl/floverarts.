const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { checkout } = require('../controllers/orderController');

// Proteksi: Semua rute pemesanan membutuhkan autentikasi pelanggan
router.use(authenticate, requireRole('customer'));

// POST /api/orders/checkout
router.post('/checkout', checkout);

module.exports = router;
