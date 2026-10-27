const { pool } = require('../config/db');

// GET /api/products (Daftar Katalog Bunga Publik dengan Filter & Pencarian)
async function getProducts(req, res, next) {
  try {
    const { cat, category_id, q, sort, limit = 20, page = 1 } = req.query;

    let query = `
      SELECT p.id, p.category_id, c.name AS category_name, c.slug AS category_slug,
             p.name, p.slug, p.description, p.price, p.stock, p.min_stock,
             p.image_url, p.status, p.created_at
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'active'
    `;
    const params = [];

    // Filter berdasarkan slug kategori atau ID kategori
    const selectedCat = category_id || cat;
    if (selectedCat) {
      if (!isNaN(selectedCat)) {
        query += ' AND p.category_id = ?';
        params.push(parseInt(selectedCat, 10));
      } else {
        query += ' AND c.slug = ?';
        params.push(selectedCat.trim());
      }
    }

    // Pencarian langsung (Live Search) berdasarkan nama atau deskripsi produk
    if (q && q.trim() !== '') {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const keyword = `%${q.trim()}%`;
      params.push(keyword, keyword);
    }

    // Pengurutan data (Sorting)
    if (sort === 'price_asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY p.price DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    // Pembagian halaman data (Pagination)
    const numLimit = Math.max(1, parseInt(limit, 10) || 20);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (numPage - 1) * numLimit;

    query += ' LIMIT ? OFFSET ?';
    params.push(numLimit, offset);

    const [products] = await pool.query(query, params);

    return res.success(products, 'Daftar produk berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// GET /api/products/:slug (Detail Produk Bunga Berdasarkan Slug URL)
async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const [products] = await pool.query(
      `SELECT p.id, p.category_id, c.name AS category_name, c.slug AS category_slug,
              p.name, p.slug, p.description, p.price, p.stock, p.min_stock,
              p.image_url, p.status, p.created_at, p.updated_at
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.status = 'active'`,
      [slug]
    );

    if (!products || products.length === 0) {
      return res.error('Produk bunga tidak ditemukan atau sudah tidak aktif.', 'NOT_FOUND', 404);
    }

    return res.success(products[0], 'Detail produk berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductBySlug
};
