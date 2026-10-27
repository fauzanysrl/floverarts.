const { pool } = require('../../config/db');

// GET /api/admin/dashboard (Ringkasan Metrik Bisnis Dashboard Admin)
async function getDashboardSummary(req, res, next) {
  try {
    // 1. Total Pendapatan / Omzet Bersih dari Pesanan yang Telah Lunas
    const [revenueRows] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue,
              COUNT(id) AS total_orders
       FROM orders
       WHERE payment_status = 'berhasil'`
    );

    // 2. Jumlah Pesanan Baru yang Memerlukan Tindakan (Menunggu Pembayaran / Dikonfirmasi)
    const [pendingOrdersRows] = await pool.query(
      `SELECT COUNT(id) AS pending_orders
       FROM orders
       WHERE order_status IN ('menunggu_pembayaran', 'dikonfirmasi')`
    );

    // 3. Jumlah Produk Bunga yang Berstatus Aktif di Katalog
    const [productsRows] = await pool.query(
      "SELECT COUNT(id) AS active_products FROM products WHERE status = 'active'"
    );

    // 4. Peringatan Stok Menipis (Produk & Komponen di bawah atau sama dengan batas minimum stok)
    const [lowStockProd] = await pool.query(
      "SELECT COUNT(id) AS total FROM products WHERE stock <= min_stock AND status = 'active'"
    );
    const [lowStockComp] = await pool.query(
      "SELECT COUNT(id) AS total FROM custom_components WHERE stock <= min_stock AND status = 'active'"
    );
    const totalLowStock = (lowStockProd[0].total || 0) + (lowStockComp[0].total || 0);

    // 5. Total Akumulasi Saldo Kas Toko dari Seluruh Akun Kas Aktif
    const [cashRows] = await pool.query(
      "SELECT COALESCE(SUM(balance), 0) AS total_cash FROM cash_accounts WHERE status = 'active'"
    );

    // 6. Daftar 5 Transaksi Pesanan Terbaru untuk Ditampilkan di Widget Dashboard
    const [recentOrders] = await pool.query(
      `SELECT id, order_number, recipient_name, total_amount, payment_status, order_status, created_at
       FROM orders
       ORDER BY id DESC
       LIMIT 5`
    );

    return res.success({
      total_revenue: parseFloat(revenueRows[0].total_revenue || 0),
      total_orders: parseInt(revenueRows[0].total_orders || 0, 10),
      pending_orders: parseInt(pendingOrdersRows[0].pending_orders || 0, 10),
      active_products: parseInt(productsRows[0].active_products || 0, 10),
      low_stock_alerts: totalLowStock,
      total_cash_balance: parseFloat(cashRows[0].total_cash || 0),
      recent_orders: recentOrders
    }, 'Ringkasan dashboard admin berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary
};
