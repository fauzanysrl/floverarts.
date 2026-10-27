const { pool } = require('../config/db');

// GET /api/custom-components (Melihat Komponen Custom Bouquet Aktif: Bunga, Wrapping, Pita, Kartu Ucapan)
async function getCustomComponents(req, res, next) {
  try {
    const { category } = req.query;

    let query = `
      SELECT id, category, name, price, stock, min_stock, image_url, status
      FROM custom_components
      WHERE status = 'active'
    `;
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY category ASC, price ASC';

    const [components] = await pool.query(query, params);

    // Mengembalikan daftar komponen sebagai array di properti data agar sesuai dengan penegasan automated test Postman
    return res.success(components, 'Daftar komponen buket custom berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomComponents
};
