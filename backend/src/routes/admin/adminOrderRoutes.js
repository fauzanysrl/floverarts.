const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getOrdersAdmin,
  getOrderDetailAdmin,
  updateOrderStatus,
  checkGatewayStatus,
  refundOrder
} = require('../../controllers/admin/adminOrderController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// /api/admin/orders
router.get('/', getOrdersAdmin);
router.get('/:id', getOrderDetailAdmin);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/check-gateway', checkGatewayStatus);
router.post('/:id/refund', refundOrder);

module.exports = router;
