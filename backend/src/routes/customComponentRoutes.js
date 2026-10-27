const express = require('express');
const router = express.Router();
const { getCustomComponents } = require('../controllers/customComponentController');

// Rute Publik untuk Melihat Komponen Custom Bouquet
router.get('/', getCustomComponents);

module.exports = router;
