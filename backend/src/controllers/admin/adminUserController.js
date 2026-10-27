const { pool } = require('../../config/db');

// GET /api/admin/users (Daftar Pengguna Sistem dengan Filter Peran, Status & Pencarian)
async function getUsersAdmin(req, res, next) {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const numLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let query = `
      SELECT id, name, email, phone, address, role, status, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];
    const countParams = [];

    if (role && ['customer', 'owner_admin'].includes(role)) {
      query += ' AND role = ?';
      countQuery += ' AND role = ?';
      params.push(role);
      countParams.push(role);
    }

    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(numLimit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);

    const total = countRows[0].total;

    return res.success(
      {
        users: rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: numLimit,
          total_pages: Math.ceil(total / numLimit)
        }
      },
      'Daftar pengguna berhasil dimuat.'
    );
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/users/:id (Detail Pengguna Dilengkapi Ringkasan Statistik Belanja)
async function getUserDetailAdmin(req, res, next) {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT id, name, email, phone, address, role, status, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    if (!users || users.length === 0) {
      return res.error('Pengguna tidak ditemukan.', 'USER_NOT_FOUND', 404);
    }

    const user = users[0];

    // Statistik agregasi akumulasi pesanan belanja pelanggan
    const [orderStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_orders,
         COALESCE(SUM(CASE WHEN status IN ('dikonfirmasi', 'diproses', 'siap_diambil_dikirim', 'selesai') THEN total_amount ELSE 0 END), 0) as total_spent
       FROM orders
       WHERE user_id = ?`,
      [id]
    );

    user.stats = {
      total_orders: orderStats[0].total_orders,
      total_spent: parseFloat(orderStats[0].total_spent || 0)
    };

    return res.success(user, 'Detail data pengguna berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/users/:id/status (Ubah Status Akun: active / inactive / suspended)
async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.error('Status pengguna tidak valid. Pilihan: active, inactive, suspended.', 'VALIDATION_ERROR', 422);
    }

    if (parseInt(id, 10) === req.user.id) {
      return res.error('Anda tidak dapat mengubah status akun Anda sendiri.', 'FORBIDDEN_OPERATION', 403);
    }

    const [existing] = await pool.query('SELECT id, name, status FROM users WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Pengguna tidak ditemukan.', 'USER_NOT_FOUND', 404);
    }

    await pool.query('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    // Jika akun dinonaktifkan atau ditangguhkan, cabut seluruh refresh token pengguna
    if (status !== 'active') {
      await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?', [id]);
    }

    return res.success(
      { id: parseInt(id, 10), status },
      `Status akun pengguna "${existing[0].name}" berhasil diubah menjadi ${status}.`
    );
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/users/:id (Deaktivasi Pengguna oleh Admin / Soft Delete)
async function deleteUserAdmin(req, res, next) {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.error('Anda tidak dapat menghapus akun Anda sendiri.', 'FORBIDDEN_OPERATION', 403);
    }

    const [existing] = await pool.query('SELECT id, name, status FROM users WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.error('Pengguna tidak ditemukan.', 'USER_NOT_FOUND', 404);
    }

    // Deaktivasi lembut (soft delete)
    await pool.query("UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?", [id]);
    await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?', [id]);

    return res.success(null, `Pengguna "${existing[0].name}" berhasil dinonaktifkan.`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsersAdmin,
  getUserDetailAdmin,
  updateUserStatus,
  deleteUserAdmin
};
