const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../../controllers/admin/adminCategoryController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// /api/admin/categories
router.get('/', getCategoriesAdmin);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
