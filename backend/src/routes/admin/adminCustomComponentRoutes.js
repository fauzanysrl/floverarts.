const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getCustomComponentsAdmin,
  createCustomComponent,
  updateCustomComponent,
  toggleCustomComponentStatus,
  deleteCustomComponent
} = require('../../controllers/admin/adminCustomComponentController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// /api/admin/custom-components
router.get('/', getCustomComponentsAdmin);
router.post('/', createCustomComponent);
router.put('/:id', updateCustomComponent);
router.patch('/:id/status', toggleCustomComponentStatus);
router.delete('/:id', deleteCustomComponent);

module.exports = router;
