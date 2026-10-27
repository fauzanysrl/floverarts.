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

// GET /api/admin/products (Melihat Seluruh Katalog Produk Toko)
async function getProductsAdmin(req, res, next) {
  try {
    const [products] = await pool.query(
      `SELECT p.id, p.category_id, c.name AS category_name,
              p.name, p.slug, p.description, p.price, p.stock, p.min_stock,
              p.image_url, p.status, p.created_at, p.updated_at
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.id DESC`
    );

    return res.success(products, 'Seluruh produk katalog toko berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/products (Menambahkan Produk Bunga Baru ke Katalog)
async function createProduct(req, res, next) {
  try {
    const { category_id, name, slug: customSlug, description, price, stock, min_stock, image_url, status = 'active' } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.error('Kategori, nama produk, dan harga wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    const numPrice = parseFloat(price);
    const numStock = parseInt(stock || 0, 10);
    const numMinStock = parseInt(min_stock || 5, 10);

    if (numPrice < 0) {
      return res.error('Harga tidak boleh kurang dari 0.', 'VALIDATION_ERROR', 422);
    }

    if (numStock < 0) {
      return res.error('Stok fisik awal tidak boleh negatif.', 'VALIDATION_ERROR', 422);
    }

    // Pastikan kategori yang dipilih valid di basis data
    const [cat] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (!cat || cat.length === 0) {
      return res.error('Kategori produk yang dipilih tidak valid.', 'VALIDATION_ERROR', 400);
    }

    const trimmedName = name.trim();
    let slug = customSlug ? slugify(customSlug) : slugify(trimmedName);

    // Pastikan slug produk bersifat unik
    const [existing] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [result] = await pool.query(
      `INSERT INTO products 
        (category_id, name, slug, description, price, stock, min_stock, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, trimmedName, slug, description || null, numPrice, numStock, numMinStock, image_url || null, status]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    // Catat mutasi inventaris awal jika stok fisik > 0
    if (numStock > 0) {
      await pool.query(
        `INSERT INTO inventory_transactions 
          (product_id, type, quantity, stock_before, stock_after, reason, created_by)
         VALUES (?, 'in', ?, 0, ?, 'Stok awal penambahan produk baru', ?)`,
        [result.insertId, numStock, numStock, req.user ? req.user.id : null]
      );
    }

    return res.status(201).json({
      success: true,
      data: newProduct[0],
      message: 'Produk bunga baru berhasil ditambahkan ke katalog.'
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/products/:id (Memperbarui Data & Stok Produk Bunga)
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, stock, min_stock, image_url, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Produk tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const current = existing[0];
    const updatedCategoryId = category_id !== undefined ? category_id : current.category_id;
    const updatedName = name ? name.trim() : current.name;
    const updatedPrice = price !== undefined ? parseFloat(price) : current.price;
    const updatedMinStock = min_stock !== undefined ? parseInt(min_stock, 10) : current.min_stock;
    const updatedStatus = status ? status : current.status;
    const updatedImageUrl = image_url !== undefined ? image_url : current.image_url;
    const updatedDesc = description !== undefined ? description : current.description;

    // Perbarui slug URL jika nama produk mengalami perubahan
    let updatedSlug = current.slug;
    if (name && name.trim() !== current.name) {
      updatedSlug = slugify(name.trim());
      const [duplicateSlug] = await pool.query('SELECT id FROM products WHERE slug = ? AND id != ?', [updatedSlug, id]);
      if (duplicateSlug && duplicateSlug.length > 0) {
        updatedSlug = `${updatedSlug}-${Date.now()}`;
      }
    }

    await pool.query(
      `UPDATE products 
       SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, 
           min_stock = ?, image_url = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [updatedCategoryId, updatedName, updatedSlug, updatedDesc, updatedPrice, updatedMinStock, updatedImageUrl, updatedStatus, id]
    );

    // Jika nilai stok dikirimkan secara eksplisit dan berbeda dengan stok sebelumnya
    if (stock !== undefined && parseInt(stock, 10) !== current.stock) {
      const newStock = parseInt(stock, 10);
      const diff = newStock - current.stock;
      const type = diff > 0 ? 'in' : 'adjustment';

      await pool.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);
      await pool.query(
        `INSERT INTO inventory_transactions 
          (product_id, type, quantity, stock_before, stock_after, reason, created_by)
         VALUES (?, ?, ?, ?, ?, 'Penyesuaian stok via form edit produk admin', ?)`,
        [id, type, Math.abs(diff), current.stock, newStock, req.user ? req.user.id : null]
      );
    }

    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return res.success(updatedProduct[0], 'Data produk berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/products/:id/status (Ubah Status Produk: active / inactive)
async function toggleProductStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.error('Status produk tidak valid. Pilihan: active, inactive.', 'VALIDATION_ERROR', 422);
    }

    const [existing] = await pool.query('SELECT id, name, status FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Produk tidak ditemukan.', 'NOT_FOUND', 404);
    }

    await pool.query('UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    return res.success({ id: parseInt(id, 10), status }, `Status produk "${existing[0].name}" berhasil diubah menjadi ${status}.`);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/products/:id (Deaktivasi Produk Bunga / Soft Delete)
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, name, status FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Produk tidak ditemukan.', 'NOT_FOUND', 404);
    }

    await pool.query("UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = ?", [id]);

    return res.success(null, `Produk "${existing[0].name}" berhasil dinonaktifkan.`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProductsAdmin,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
};
