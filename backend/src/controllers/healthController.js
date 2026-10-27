const { pool } = require('../config/db');

// GET /api/health (Pemeriksaan Status Kesehatan Server & Latensi Basis Data MySQL)
async function getHealth(req, res, next) {
  try {
    const startTime = Date.now();
    const [dbResult] = await pool.query('SELECT 1 + 1 AS check_sum, NOW() as server_time');
    const latency = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      status: 'healthy',
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'connected',
          latency_ms: latency,
          server_time: dbResult[0].server_time
        },
        environment: process.env.NODE_ENV || 'development'
      },
      message: 'FloverArts Backend API is healthy & connected to MySQL'
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'error',
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Koneksi database MySQL gagal.',
        details: error.message
      }
    });
  }
}

module.exports = {
  getHealth
};
