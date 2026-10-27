const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const { getDashboardSummary } = require('../../controllers/admin/adminDashboardController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// GET /api/admin/dashboard
router.get('/', getDashboardSummary);

module.exports = router;
