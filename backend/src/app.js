const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const responseHandler = require('./middlewares/responseHandler');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// =============================================================================
// ROUTE IMPORTS (TERPISAH & MODULAR SESUAI DOMAIN)
// =============================================================================
// 1. Sistem & Kesehatan Server
const healthRoutes = require('./routes/healthRoutes');

// 2. Autentikasi Pengguna & Sesi (Pelanggan & Admin)
const authRoutes = require('./routes/authRoutes');

// 3. Katalog Publik (Bunga, Kategori, Custom Bouquet Components)
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customComponentRoutes = require('./routes/customComponentRoutes');

// 4. Keranjang Belanja Pelanggan
const cartRoutes = require('./routes/cartRoutes');

// 5. Pesanan & Checkout Pelanggan
const orderRoutes = require('./routes/orderRoutes');

// 6. Profil & Riwayat Pesanan Pelanggan
const userRoutes = require('./routes/userRoutes');

// 7. Pembayaran Midtrans Snap & Webhook
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// 8. Modul Khusus Owner / Admin
const adminDashboardRoutes = require('./routes/admin/adminDashboardRoutes');
const adminCategoryRoutes = require('./routes/admin/adminCategoryRoutes');
const adminProductRoutes = require('./routes/admin/adminProductRoutes');
const adminCustomComponentRoutes = require('./routes/admin/adminCustomComponentRoutes');
const adminInventoryRoutes = require('./routes/admin/adminInventoryRoutes');
const adminOrderRoutes = require('./routes/admin/adminOrderRoutes');
const adminCashflowRoutes = require('./routes/admin/adminCashflowRoutes');
const adminProfileRoutes = require('./routes/admin/adminProfileRoutes');
const adminUserRoutes = require('./routes/admin/adminUserRoutes');

const app = express();

// =============================================================================
// MIDDLEWARE GLOBAL
// =============================================================================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware Standardisasi Format Amplop Respon (Response Envelope)
app.use(responseHandler);

// Rute Sambutan Beranda (Root Welcome Endpoint)
app.get('/', (req, res) => {
  return res.success({
    name: 'FloverArts E-Commerce API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health'
  }, 'Selamat datang di FloverArts REST API');
});

// =============================================================================
// REGISTRASI RUTE API (TERSTRUKTUR SESUAI DOMAIN BISNIS & RBAC)
// =============================================================================
// 00. Kesehatan Server & Latensi Basis Data
app.use('/api', healthRoutes);

// 01. Autentikasi & Manajemen Sesi Token
app.use('/api/auth', authRoutes);

// 02. Katalog Publik Bunga & Kategori
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// 03. Master Komponen Buket Custom
app.use('/api/custom-components', customComponentRoutes);

// 04. Manajemen Keranjang Belanja Pelanggan
app.use('/api/cart', cartRoutes);

// 05. Checkout Pesanan & Data Pengguna Pelanggan
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes); // Menangani /api/user/profile, /api/user/orders, /api/user/orders/:id/tracking

// 06. Transaksi Pembayaran Midtrans Snap & Webhook Notifikasi
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// 08-15. Modul Pengelolaan Khusus Backoffice (Owner / Admin)
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/custom-components', adminCustomComponentRoutes);
app.use('/api/admin/inventory', adminInventoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin', adminCashflowRoutes); // Menangani /api/admin/cash-accounts, /api/admin/cashflow, /api/admin/reports/...
app.use('/api/admin', adminProfileRoutes);  // Menangani /api/admin/profile, /api/admin/change-password
app.use('/api/admin/users', adminUserRoutes); // Menangani manajemen pengguna oleh owner/admin

// =============================================================================
// PENANGANAN KESALAHAN (ERROR HANDLING)
// =============================================================================
// Penangan Rute Tidak Ditemukan (404 Not Found)
app.use(notFoundHandler);

// Penangan Kesalahan Global (Global Error Handler)
app.use(errorHandler);

module.exports = app;
