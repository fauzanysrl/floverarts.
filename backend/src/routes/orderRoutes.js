const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { checkout } = require('../controllers/orderController');

// Proteksi: Rute pemesanan membutuhkan autentikasi pengguna
router.use(authenticate, requireRole('customer', 'owner_admin'));

// POST /api/orders/checkout
router.post('/checkout', checkout);

module.exports = router;
