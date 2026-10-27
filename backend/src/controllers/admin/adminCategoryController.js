const { pool } = require('../../config/db');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET /api/admin/categories (Melihat Daftar Seluruh Kategori beserta Jumlah Produk)
async function getCategoriesAdmin(req, res, next) {
  try {
    const [categories] = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, c.created_at, c.updated_at,
              COUNT(p.id) AS total_products
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.id ASC`
    );

    return res.success(categories, 'Seluruh daftar kategori berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/categories (Membuat Kategori Produk Baru)
async function createCategory(req, res, next) {
  try {
    const { name, slug: customSlug, description } = req.body;

    if (!name || name.trim() === '') {
      return res.error('Nama kategori tidak boleh kosong.', 'VALIDATION_ERROR', 422);
    }

    const trimmedName = name.trim();
    let slug = customSlug ? slugify(customSlug) : slugify(trimmedName);

    // Pastikan slug unik agar tidak terjadi tabrakan indeks basis data
    const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [trimmedName, slug, description || null]
    );

    const [newCategory] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      data: newCategory[0],
      message: 'Kategori baru berhasil ditambahkan.'
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/categories/:id (Memperbarui Data Kategori Produk)
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.error('Nama kategori tidak boleh kosong.', 'VALIDATION_ERROR', 422);
    }

    const [existing] = await pool.query('SELECT id, name, slug FROM categories WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Kategori tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [trimmedName, slug, description || null, id]
    );

    const [updated] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return res.success(updated[0], 'Kategori berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/categories/:id (Menghapus Kategori - Ditolak jika Masih Memiliki Produk)
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Kategori tidak ditemukan.', 'NOT_FOUND', 404);
    }

    // Periksa apakah kategori masih terikat dengan produk aktif
    const [productsCount] = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
      [id]
    );

    if (productsCount[0].total > 0) {
      return res.error(
        `Kategori "${existing[0].name}" tidak dapat dihapus karena masih digunakan oleh ${productsCount[0].total} produk.`,
        'CATEGORY_IN_USE',
        400,
        { active_products_count: productsCount[0].total }
      );
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    return res.success(null, `Kategori "${existing[0].name}" berhasil dihapus.`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory
};
