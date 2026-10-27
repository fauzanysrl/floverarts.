const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { getCart, addItem, updateItemQuantity, removeItem, clearCart } = require('../controllers/cartController');

// Seluruh operasi keranjang belanja hanya dapat diakses oleh Pelanggan (role: customer) yang telah login
router.use(authenticate, requireRole('customer'));

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:id', updateItemQuantity);
router.delete('/items/:id', removeItem);
router.delete('/', clearCart);

module.exports = router;
