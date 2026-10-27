const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getInventoryTransactions,
  restockInventory,
  getLowStockAlerts
} = require('../../controllers/admin/adminInventoryController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// /api/admin/inventory
router.get('/transactions', getInventoryTransactions);
router.post('/restock', restockInventory);
router.get('/low-stock', getLowStockAlerts);

module.exports = router;
