const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getAdminProfile,
  updateAdminProfile,
  patchAdminProfile,
  changeAdminPassword
} = require('../../controllers/admin/adminProfileController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// /api/admin/profile & change-password
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.patch('/profile', patchAdminProfile);
router.put('/change-password', changeAdminPassword);

module.exports = router;
