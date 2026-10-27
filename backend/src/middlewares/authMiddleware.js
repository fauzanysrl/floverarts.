const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.error('Akses ditolak. Token autentikasi tidak ditemukan.', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.error('Token tidak valid atau telah kedaluwarsa. Silakan login kembali.', 'INVALID_TOKEN', 401);
    }

    // Verifikasi keberadaan dan keaktifan akun pengguna di basis data MySQL
    const [users] = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.error('Pengguna tidak ditemukan.', 'USER_NOT_FOUND', 401);
    }

    const user = users[0];
    if (user.status !== 'active') {
      return res.error('Akun Anda dinonaktifkan atau ditangguhkan. Silakan hubungi admin.', 'ACCOUNT_INACTIVE', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware Pemeriksaan Otorisasi Hak Akses (Role-Based Access Control / RBAC)
 * Contoh: requireRole('customer') atau requireRole('owner_admin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.error('Akses ditolak. Silakan login terlebih dahulu.', 'UNAUTHORIZED', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.error(`Akses ditolak. Fitur ini hanya untuk peran: ${allowedRoles.join(', ')}.`, 'FORBIDDEN', 403);
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole
};
