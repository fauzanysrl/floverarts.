const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// POST /api/auth/register (Pendaftaran Akun Pelanggan Baru)
async function register(req, res, next) {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.error('Nama, email, dan kata sandi wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    if (password.length < 6) {
      return res.error('Kata sandi minimal terdiri dari 6 karakter.', 'VALIDATION_ERROR', 422);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Periksa apakah alamat email sudah terdaftar sebelumnya
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.error('Alamat email sudah terdaftar. Silakan gunakan email lain atau login.', 'EMAIL_EXISTS', 409);
    }

    // Enkripsi kata sandi menggunakan algoritma Bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Simpan data pengguna baru ke basis data
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, address, role, status)
       VALUES (?, ?, ?, ?, ?, 'customer', 'active')`,
      [name.trim(), cleanEmail, passwordHash, phone || null, address || null]
    );

    const newUserId = result.insertId;

    // Inisialisasi wadah keranjang belanja aktif untuk pengguna baru
    await pool.query('INSERT IGNORE INTO carts (user_id) VALUES (?)', [newUserId]);

    // Terbitkan Access Token JWT dan Refresh Token
    const token = generateToken({
      id: newUserId,
      email: cleanEmail,
      role: 'customer'
    });
    const refreshToken = generateRefreshToken({ id: newUserId });

    // Simpan hash SHA-256 dari Refresh Token ke basis data untuk audit sesi
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [newUserId, tokenHash, expiresAt]
    );

    return res.status(201).json({
      success: true,
      token,
      refreshToken,
      data: {
        token,
        refreshToken,
        user: {
          id: newUserId,
          name: name.trim(),
          email: cleanEmail,
          phone: phone || null,
          address: address || null,
          role: 'customer',
          status: 'active'
        }
      },
      message: 'Pendaftaran akun berhasil!'
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login (Autentikasi Masuk Pelanggan & Admin)
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.error('Email dan kata sandi wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Cari pengguna berdasarkan alamat email
    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, phone, address, role, status FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (!users || users.length === 0) {
      return res.error('Email atau kata sandi tidak sesuai.', 'INVALID_CREDENTIALS', 401);
    }

    const user = users[0];

    // Periksa status keaktifan akun
    if (user.status !== 'active') {
      return res.error(
        'Akun Anda berstatus nonaktif atau ditangguhkan. Silakan hubungi pengelola toko.',
        'ACCOUNT_INACTIVE',
        403
      );
    }

    // Bandingkan kata sandi masukan dengan hash Bcrypt di basis data
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.error('Email atau kata sandi tidak sesuai.', 'INVALID_CREDENTIALS', 401);
    }

    // Terbitkan Access Token JWT dan Refresh Token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Simpan hash SHA-256 dari Refresh Token ke basis data
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          status: user.status
        }
      },
      message: `Login berhasil! Selamat datang, ${user.name}.`
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/refresh-token (Pembaruan Access Token yang Kedaluwarsa)
async function refreshTokenHandler(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.error('Refresh token wajib disertakan.', 'VALIDATION_ERROR', 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.error('Refresh token tidak valid atau telah kedaluwarsa.', 'INVALID_REFRESH_TOKEN', 401);
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const [rows] = await pool.query(
      'SELECT id, user_id, is_revoked, expires_at FROM refresh_tokens WHERE token_hash = ? AND user_id = ?',
      [tokenHash, decoded.id]
    );

    if (!rows || rows.length === 0 || rows[0].is_revoked || new Date(rows[0].expires_at) < new Date()) {
      return res.error('Refresh token telah dicabut atau kedaluwarsa.', 'REVOKED_REFRESH_TOKEN', 401);
    }

    // Ambil data akun pengguna terkini
    const [users] = await pool.query('SELECT id, email, role, status FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0 || users[0].status !== 'active') {
      return res.error('Pengguna tidak aktif.', 'USER_INACTIVE', 401);
    }

    const user = users[0];
    const newAccessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      token: newAccessToken,
      data: {
        token: newAccessToken
      },
      message: 'Token sesi berhasil diperbarui.'
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout (Pencabutan Sesi & Refresh Token)
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?', [tokenHash]);
    } else if (req.user) {
      await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?', [req.user.id]);
    }

    return res.status(200).json({
      success: true,
      message: 'Logout berhasil. Sesi telah diakhiri.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout
};
