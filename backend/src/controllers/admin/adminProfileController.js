const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');

// GET /api/admin/profile (Melihat Profil Akun Owner / Admin)
async function getAdminProfile(req, res, next) {
  try {
    const adminId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, email, phone, address, role, status, created_at, updated_at FROM users WHERE id = ?',
      [adminId]
    );

    if (!users || users.length === 0) {
      return res.error('Akun admin tidak ditemukan.', 'USER_NOT_FOUND', 404);
    }

    return res.success(users[0], 'Profil admin berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/profile (Pembaruan Penuh Data Profil Akun Admin)
async function updateAdminProfile(req, res, next) {
  try {
    const adminId = req.user.id;
    const { name, phone } = req.body;

    if (!name || name.trim() === '') {
      return res.error('Nama lengkap tidak boleh kosong.', 'VALIDATION_ERROR', 422);
    }

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
      [name.trim(), phone || null, adminId]
    );

    const [updated] = await pool.query(
      'SELECT id, name, email, phone, address, role, status, updated_at FROM users WHERE id = ?',
      [adminId]
    );

    return res.success(updated[0], 'Profil admin berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/profile (Pembaruan Sebagian Data Profil Akun Admin)
async function patchAdminProfile(req, res, next) {
  try {
    const adminId = req.user.id;
    const { name, phone } = req.body;

    const fields = [];
    const values = [];

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.error('Nama lengkap tidak boleh kosong jika disertakan.', 'VALIDATION_ERROR', 422);
      }
      fields.push('name = ?');
      values.push(name.trim());
    }

    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone || null);
    }

    if (fields.length === 0) {
      return res.error('Tidak ada data yang dikirim untuk diperbarui.', 'VALIDATION_ERROR', 422);
    }

    fields.push('updated_at = NOW()');
    values.push(adminId);

    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      'SELECT id, name, email, phone, address, role, status, updated_at FROM users WHERE id = ?',
      [adminId]
    );

    return res.success(updated[0], 'Sebagian data profil admin berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/change-password (Penggantian Kata Sandi Akun Owner / Admin)
async function changeAdminPassword(req, res, next) {
  try {
    const adminId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.error('Kata sandi lama dan kata sandi baru wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    if (new_password.length < 6) {
      return res.error('Kata sandi baru minimal 6 karakter.', 'VALIDATION_ERROR', 422);
    }

    // Ambil hash kata sandi saat ini dari basis data
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [adminId]);
    if (!users || users.length === 0) {
      return res.error('Pengguna tidak ditemukan.', 'USER_NOT_FOUND', 404);
    }

    const isMatch = await bcrypt.compare(old_password, users[0].password_hash);
    if (!isMatch) {
      return res.error('Kata sandi lama tidak sesuai.', 'INVALID_PASSWORD', 400);
    }

    // Enkripsi kata sandi baru
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [
      newPasswordHash,
      adminId
    ]);

    return res.success(null, 'Kata sandi akun owner/admin berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  patchAdminProfile,
  changeAdminPassword
};
