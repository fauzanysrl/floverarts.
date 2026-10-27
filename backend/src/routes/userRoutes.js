const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { getProfile, updateProfile, patchProfile, changePassword, deleteAccount } = require('../controllers/userController');
const { getMyOrders, getMyOrderDetail, getOrderTracking } = require('../controllers/orderController');

// Seluruh rute profil dan pesanan pelanggan memerlukan verifikasi token JWT
router.use(authenticate);

// Profil Pelanggan
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.patch('/profile', patchProfile);
router.delete('/profile', deleteAccount);
router.put('/change-password', changePassword);

// Riwayat & Pelacakan Pesanan Pelanggan
router.get('/orders', getMyOrders);
router.get('/orders/:id', getMyOrderDetail);
router.get('/orders/:id/tracking', getOrderTracking);

module.exports = router;
