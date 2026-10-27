const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'floverarts_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Pengujian koneksi awal saat modul dimuat
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Terhubung ke MySQL [${process.env.DB_NAME || 'floverarts_db'}] di ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database ERROR] Gagal terhubung ke MySQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
