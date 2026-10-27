const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug } = require('../controllers/productController');

// Rute Katalog Produk Publik (Dapat diakses tanpa autentikasi)
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
