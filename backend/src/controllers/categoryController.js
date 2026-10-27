const { pool } = require('../config/db');

// GET /api/categories (Melihat Daftar Seluruh Kategori Produk Publik)
async function getCategories(req, res, next) {
  try {
    const [categories] = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, c.created_at,
              COUNT(p.id) AS total_products
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    return res.success(categories, 'Daftar kategori berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories
};
