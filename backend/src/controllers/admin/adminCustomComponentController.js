const { pool } = require('../../config/db');

// GET /api/admin/custom-components (Melihat Seluruh Komponen Custom Bouquet: Bunga, Wrapping, Pita, Kartu)
async function getCustomComponentsAdmin(req, res, next) {
  try {
    const [components] = await pool.query(
      `SELECT id, category, name, price, stock, min_stock, image_url, status, created_at, updated_at
       FROM custom_components
       ORDER BY category ASC, id DESC`
    );

    return res.success(components, 'Seluruh komponen custom bouquet berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/custom-components (Menambahkan Komponen Bouquet Custom Baru)
async function createCustomComponent(req, res, next) {
  try {
    const { category, name, price, stock, min_stock, image_url, status = 'active' } = req.body;

    const validCategories = ['flower', 'wrapping', 'ribbon', 'card', 'decoration'];
    if (!category || !validCategories.includes(category)) {
      return res.error(`Kategori tidak valid. Pilihan: ${validCategories.join(', ')}.`, 'VALIDATION_ERROR', 422);
    }

    if (!name || name.trim() === '') {
      return res.error('Nama komponen tidak boleh kosong.', 'VALIDATION_ERROR', 422);
    }

    const numPrice = parseFloat(price || 0);
    const numStock = parseInt(stock || 0, 10);
    const numMinStock = parseInt(min_stock || 5, 10);

    const [result] = await pool.query(
      `INSERT INTO custom_components 
        (category, name, price, stock, min_stock, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category, name.trim(), numPrice, numStock, numMinStock, image_url || null, status]
    );

    const [newComp] = await pool.query('SELECT * FROM custom_components WHERE id = ?', [result.insertId]);

    // Catat mutasi inventaris awal komponen jika stok > 0
    if (numStock > 0) {
      await pool.query(
        `INSERT INTO inventory_transactions 
          (custom_component_id, type, quantity, stock_before, stock_after, reason, created_by)
         VALUES (?, 'in', ?, 0, ?, 'Stok awal penambahan komponen buket baru', ?)`,
        [result.insertId, numStock, numStock, req.user ? req.user.id : null]
      );
    }

    return res.status(201).json({
      success: true,
      data: newComp[0],
      message: 'Komponen buket custom berhasil ditambahkan.'
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/custom-components/:id (Memperbarui Data & Stok Komponen Custom)
async function updateCustomComponent(req, res, next) {
  try {
    const { id } = req.params;
    const { category, name, price, stock, min_stock, image_url, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM custom_components WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Komponen tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const current = existing[0];
    const updatedCategory = category || current.category;
    const updatedName = name ? name.trim() : current.name;
    const updatedPrice = price !== undefined ? parseFloat(price) : current.price;
    const updatedMinStock = min_stock !== undefined ? parseInt(min_stock, 10) : current.min_stock;
    const updatedStatus = status || current.status;
    const updatedImageUrl = image_url !== undefined ? image_url : current.image_url;

    await pool.query(
      `UPDATE custom_components 
       SET category = ?, name = ?, price = ?, min_stock = ?, image_url = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [updatedCategory, updatedName, updatedPrice, updatedMinStock, updatedImageUrl, updatedStatus, id]
    );

    if (stock !== undefined && parseInt(stock, 10) !== current.stock) {
      const newStock = parseInt(stock, 10);
      const diff = newStock - current.stock;
      const type = diff > 0 ? 'in' : 'adjustment';

      await pool.query('UPDATE custom_components SET stock = ? WHERE id = ?', [newStock, id]);
      await pool.query(
        `INSERT INTO inventory_transactions 
          (custom_component_id, type, quantity, stock_before, stock_after, reason, created_by)
         VALUES (?, ?, ?, ?, ?, 'Penyesuaian stok komponen buket via form edit admin', ?)`,
        [id, type, Math.abs(diff), current.stock, newStock, req.user ? req.user.id : null]
      );
    }

    const [updated] = await pool.query('SELECT * FROM custom_components WHERE id = ?', [id]);
    return res.success(updated[0], 'Komponen buket custom berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/custom-components/:id/status (Ubah Status Komponen: active / inactive)
async function toggleCustomComponentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.error('Status komponen tidak valid. Pilihan: active, inactive.', 'VALIDATION_ERROR', 422);
    }

    const [existing] = await pool.query('SELECT id, name, status FROM custom_components WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Komponen buket tidak ditemukan.', 'NOT_FOUND', 404);
    }

    await pool.query('UPDATE custom_components SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    return res.success(
      { id: parseInt(id, 10), status },
      `Status komponen "${existing[0].name}" berhasil diubah menjadi ${status}.`
    );
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/custom-components/:id (Deaktivasi Komponen Bouquet Custom / Soft Delete)
async function deleteCustomComponent(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, name, status FROM custom_components WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Komponen buket tidak ditemukan.', 'NOT_FOUND', 404);
    }

    await pool.query("UPDATE custom_components SET status = 'inactive', updated_at = NOW() WHERE id = ?", [id]);

    return res.success(null, `Komponen "${existing[0].name}" berhasil dinonaktifkan.`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomComponentsAdmin,
  createCustomComponent,
  updateCustomComponent,
  toggleCustomComponentStatus,
  deleteCustomComponent
};
