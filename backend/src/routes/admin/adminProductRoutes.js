const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getProductsAdmin,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
} = require('../../controllers/admin/adminProductController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// /api/admin/products
router.get('/', getProductsAdmin);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/status', toggleProductStatus);
router.delete('/:id', deleteProduct);

module.exports = router;
