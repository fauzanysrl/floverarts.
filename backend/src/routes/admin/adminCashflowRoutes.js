const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../middlewares/authMiddleware');
const {
  getCashAccounts,
  createCashAccount,
  getCashflowTransactions,
  recordExpense,
  getCashflowRecap
} = require('../../controllers/admin/adminCashflowController');

// Khusus Owner / Admin
router.use(authenticate, requireRole('owner_admin'));

// Akun Kas
router.get('/cash-accounts', getCashAccounts);
router.post('/cash-accounts', createCashAccount);

// Arus Kas (Cashflow)
router.get('/cashflow', getCashflowTransactions);
router.post('/cashflow/expense', recordExpense);

// Laporan Rekapitulasi Kas
router.get('/reports/cashflow/recap', getCashflowRecap);

module.exports = router;
