const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Pengujian koneksi awal ke basis data MySQL sebelum membuka port server
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn('[Peringatan] Server Express tetap berjalan, namun koneksi MySQL belum berhasil. Pastikan layanan MySQL (XAMPP/MySQL Server) aktif.');
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌸 FloverArts REST API Server Aktif di Port ${PORT}`);
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();
