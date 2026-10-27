const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'floverarts_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'floverarts_super_refresh_jwt_key_2026';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const crypto = require('crypto');

/**
 * Membuat token akses JWT (Access Token) untuk otorisasi sesi API
 * Masa berlaku default: 7 hari
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Memvalidasi keaslian dan masa berlaku token akses JWT
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Membuat Refresh Token JWT berumur panjang dengan jti acak
 * Jti mencegah tabrakan hash token unik pada basis data MySQL
 * Masa berlaku default: 30 hari
 */
function generateRefreshToken(payload) {
  const jti = crypto.randomBytes(16).toString('hex');
  return jwt.sign({ ...payload, jti }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });
}

/**
 * Memvalidasi keaslian dan masa berlaku Refresh Token JWT
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken
};
