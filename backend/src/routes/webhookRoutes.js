const express = require('express');
const router = express.Router();
const { handleMidtransWebhook } = require('../controllers/webhookController');

// POST /api/webhooks/midtrans (Terbuka untuk notifikasi server-to-server Midtrans)
router.post('/midtrans', handleMidtransWebhook);

module.exports = router;
