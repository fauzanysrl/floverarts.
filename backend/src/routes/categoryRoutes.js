const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');

// Rute Publik untuk Melihat Daftar Kategori Produk
router.get('/', getCategories);

module.exports = router;
