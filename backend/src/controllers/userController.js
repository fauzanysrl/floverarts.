const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// GET /api/user/profile (Melihat Profil Pengguna Login)
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const [users] = await pool.query(
      'SELECT id, name, email, phone, address, role, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return res.error('Pengguna tidak ditemukan.', 'USER_NOT_FOUND', 404);
    }

    return res.success(users[0], 'Profil pengguna berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// PUT /api/user/profile (Pembaruan Penuh Data Profil Pelanggan)
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    if (!name || name.trim() === '') {
      return res.error('Nama lengkap tidak boleh kosong.', 'VALIDATION_ERROR', 422);
    }

    await pool.query(
      `UPDATE users 
       SET name = ?, phone = ?, address = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name.trim(), phone || null, address || null, userId]
    );

    const [updated] = await pool.query(
      'SELECT id, name, email, phone, address, role, status, updated_at FROM users WHERE id = ?',
      [userId]
    );

    return res.success(updated[0], 'Profil berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// PUT /api/user/change-password (Penggantian Kata Sandi Akun Mandiri)
async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.error('Kata sandi lama dan kata sandi baru wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    if (new_password.length < 6) {
      return res.error('Kata sandi baru minimal terdiri dari 6 karakter.', 'VALIDATION_ERROR', 422);
    }

    // Ambil hash kata sandi saat ini dari basis data
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.error('Pengguna tidak ditemukan.', 'USER_NOT_FOUND', 404);
    }

    const isMatch = await bcrypt.compare(old_password, users[0].password_hash);
    if (!isMatch) {
      return res.error('Kata sandi lama tidak sesuai.', 'INVALID_PASSWORD', 400);
    }

    // Enkripsi kata sandi baru menggunakan salt Bcrypt
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [
      newPasswordHash,
      userId
    ]);

    return res.success(null, 'Kata sandi berhasil diperbarui. Silakan login kembali jika diperlukan.');
  } catch (error) {
    next(error);
  }
}

// PATCH /api/user/profile (Pembaruan Sebagian Profil Pelanggan)
async function patchProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

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

    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address || null);
    }

    if (fields.length === 0) {
      return res.error('Tidak ada data profil yang dikirim untuk diperbarui.', 'VALIDATION_ERROR', 422);
    }

    fields.push('updated_at = NOW()');
    values.push(userId);

    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      'SELECT id, name, email, phone, address, role, status, updated_at FROM users WHERE id = ?',
      [userId]
    );

    return res.success(updated[0], 'Sebagian data profil berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// DELETE /api/user/profile (Deaktivasi Mandiri Akun Pelanggan / Soft Delete)
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;

    // Deaktivasi lembut: ubah status menjadi inactive
    await pool.query("UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?", [userId]);

    // Cabut seluruh sesi refresh token aktif milik pengguna ini
    await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?', [userId]);

    return res.success(null, 'Akun pengguna berhasil dinonaktifkan.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  patchProfile,
  changePassword,
  deleteAccount
};
