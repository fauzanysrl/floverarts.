const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getUsersAdmin,
  getUserDetailAdmin,
  updateUserStatus,
  deleteUserAdmin
} = require('../../controllers/admin/adminUserController');

// Proteksi Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// /api/admin/users
router.get('/', getUsersAdmin);
router.get('/:id', getUserDetailAdmin);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUserAdmin);

module.exports = router;
