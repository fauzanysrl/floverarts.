# 🌸 FloverArts Backend Architecture & API Routing Map

Dokumentasi ini menjelaskan struktur direktori backend yang telah dimodularisasi (file terpisah per domain), integrasi dengan basis data MySQL (`database.sql`), serta kecocokan dengan koleksi Postman (`FloverArts_API.postman_collection.json`).

---

## 📁 Struktur Direktori Backend (Modular & Terpisah)

```text
backend/
├── .env                              # Konfigurasi Environment (Port, DB, Midtrans, JWT)
├── .env.example                      # Template referensi konfigurasi
├── package.json                      # Dependensi Express, mysql2, bcryptjs, jsonwebtoken, midtrans-client
└── src/
    ├── app.js                        # Konfigurasi Express, middleware global, & registrasi seluruh router
    ├── server.js                     # Entry point server & health check koneksi MySQL
    ├── config/
    │   └── db.js                     # Connection Pool MySQL (mysql2/promise)
    ├── middlewares/
    │   ├── authMiddleware.js         # Autentikasi JWT (authenticate, requireRole)
    │   ├── errorHandler.js           # Penanganan global error & 404 Route Not Found
    │   └── responseHandler.js        # Envelope JSON baku { success, data, message }
    ├── utils/
    │   ├── jwt.js                    # Pembuatan & verifikasi Access Token & Refresh Token
    │   └── midtrans.js               # Inisialisasi Midtrans Snap & verifikator Signature Key SHA512
    ├── controllers/
    │   ├── authController.js         # Register, Login (Customer & Admin), Refresh Token, Logout
    │   ├── healthController.js       # Health check & status server/database
    │   ├── categoryController.js     # Katalog kategori publik
    │   ├── productController.js      # Katalog produk publik (search, filter, pagination, detail)
    │   ├── customComponentController.js # Komponen buket custom publik
    │   ├── cartController.js         # Keranjang belanja (get, add, update, remove, clear)
    │   ├── orderController.js        # Checkout pesanan, riwayat belanja, detail nota, tracking
    │   ├── paymentController.js      # Permintaan Snap Token Midtrans (Charge)
    │   ├── webhookController.js      # Notifikasi Midtrans (Settlement, Expire, Cancel, mutasi kas/stok)
    │   ├── userController.js         # Profil pelanggan & ganti password
    │   └── admin/                    # KONTROLLER KHUSUS OWNER / ADMIN
    │       ├── adminDashboardController.js       # Ringkasan omset, total order, alert stok
    │       ├── adminCategoryController.js        # CRUD kategori admin & pencegahan delete relasi
    │       ├── adminProductController.js         # CRUD produk katalog & toggle status aktif/nonaktif
    │       ├── adminCustomComponentController.js # CRUD bahan buket kustom
    │       ├── adminInventoryController.js       # Restock barang fisik, log mutasi, alert stok menipis
    │       ├── adminOrderController.js           # Kelola pesanan, 6 transisi status, sinkronisasi gateway, refund
    │       ├── adminCashflowController.js        # Akun kas toko, mutasi arus kas, beban operasional, rekap CSV
    │       └── adminProfileController.js         # Profil owner toko & ganti password
    └── routes/
        ├── healthRoutes.js           # Endpoint GET /api/health
        ├── authRoutes.js             # Endpoint POST /api/auth/...
        ├── categoryRoutes.js         # Endpoint GET /api/categories
        ├── productRoutes.js          # Endpoint GET /api/products...
        ├── customComponentRoutes.js  # Endpoint GET /api/custom-components
        ├── cartRoutes.js             # Endpoint /api/cart...
        ├── orderRoutes.js            # Endpoint POST /api/orders/checkout
        ├── userRoutes.js             # Endpoint /api/user/profile, /api/user/orders...
        ├── paymentRoutes.js          # Endpoint POST /api/payments/charge
        ├── webhookRoutes.js          # Endpoint POST /api/webhooks/midtrans
        └── admin/                    # RUTE KHUSUS OWNER / ADMIN
            ├── adminDashboardRoutes.js       # /api/admin/dashboard
            ├── adminCategoryRoutes.js        # /api/admin/categories
            ├── adminProductRoutes.js         # /api/admin/products
            ├── adminCustomComponentRoutes.js # /api/admin/custom-components
            ├── adminInventoryRoutes.js       # /api/admin/inventory
            ├── adminOrderRoutes.js           # /api/admin/orders
            ├── adminCashflowRoutes.js        # /api/admin/cash-accounts, /api/admin/cashflow, /api/admin/reports
            └── adminProfileRoutes.js         # /api/admin/profile, /api/admin/change-password
```

---

## 🗺️ Pemetaan Lengkap Rute API, Tabel Database, & Folder Postman

| Folder Postman | Metode & Rute API | File Route & Controller | Tabel Database Terkait | Keterangan / Perilaku |
| :--- | :--- | :--- | :--- | :--- |
| **00_Health_and_Status** | `GET /api/health` | `routes/healthRoutes.js`<br>`controllers/healthController.js` | Koneksi MySQL | Cek koneksi pool MySQL, latensi, & status UP |
| **01_Authentication** | `POST /api/auth/register` | `routes/authRoutes.js`<br>`controllers/authController.js` | `users`, `carts`, `refresh_tokens` | Register pelanggan baru (Bcrypt hash) & init cart |
| | `POST /api/auth/login` |  | `users`, `refresh_tokens` | Login Customer & Admin (Terbit access token & refresh token) |
| | `POST /api/auth/refresh-token` |  | `refresh_tokens`, `users` | Perpanjangan sesi akses tanpa login ulang |
| | `POST /api/auth/logout` |  | `refresh_tokens` | Pencabutan token sesi aktif |
| **02_Public_Catalog** | `GET /api/categories` | `routes/categoryRoutes.js`<br>`controllers/categoryController.js` | `categories`, `products` | Daftar kategori beserta hitungan produk aktif |
| | `GET /api/products` | `routes/productRoutes.js`<br>`controllers/productController.js` | `products`, `categories` | Live search (`?q=`), filter kategori (`?category_id=`), sort, pagination |
| | `GET /api/products/:slug` |  | `products`, `categories` | Detail bunga & spesifikasi berdasarkan slug URL |
| **03_Custom_Bouquet** | `GET /api/custom-components` | `routes/customComponentRoutes.js`<br>`controllers/customComponentController.js` | `custom_components` | Daftar bunga utama, wrapping, pita, & kartu ucapan |
| **04_Cart_Management** | `GET /api/cart` | `routes/cartRoutes.js`<br>`controllers/cartController.js` | `carts`, `cart_items`, `products` | Daftar item belanja (standar & custom) + kalkulasi total |
| | `POST /api/cart/items` |  | `cart_items`, `products` | Tambah produk standar / custom bouquet ke keranjang |
| | `PATCH /api/cart/items/:id` |  | `cart_items`, `products` | Ubah kuantitas item baris keranjang |
| | `DELETE /api/cart/items/:id` |  | `cart_items` | Hapus satu baris item keranjang |
| | `DELETE /api/cart` |  | `cart_items` | Kosongkan seluruh keranjang belanja |
| **05_Checkout_and_Orders** | `POST /api/orders/checkout` | `routes/orderRoutes.js`<br>`controllers/orderController.js` | `orders`, `order_items`, `order_status_logs`, `carts` | Snapshot harga server, kunci nota, & kosongkan cart |
| | `GET /api/user/orders` | `routes/userRoutes.js`<br>`controllers/orderController.js` | `orders`, `order_items` | Daftar riwayat pesanan milik pelanggan yang sedang login |
| | `GET /api/user/orders/:id` |  | `orders`, `order_items`, `payments` | Detail nota digital pesanan |
| | `GET /api/user/orders/:id/tracking`|  | `orders`, `order_status_logs` | Pelacakan visual 6 status pesanan + riwayat log waktu |
| **06_Payments_Midtrans** | `POST /api/payments/charge` | `routes/paymentRoutes.js`<br>`controllers/paymentController.js` | `payments`, `orders` | Terbitkan Snap Token Midtrans (dengan auto retry counter) |
| | `POST /api/webhooks/midtrans` | `routes/webhookRoutes.js`<br>`controllers/webhookController.js` | `payments`, `payment_webhook_logs`, `orders`, `products`, `inventory_transactions`, `cashflow_transactions`, `cash_accounts` | Idempotent webhook (SHA512 verifier), potong stok atomik, catat arus kas |
| **07_Customer_Profile** | `GET /api/user/profile` | `routes/userRoutes.js`<br>`controllers/userController.js` | `users` | Data kontak & alamat penerima default |
| | `PUT /api/user/profile` |  | `users` | Update nama, HP, & alamat |
| | `PUT /api/user/change-password`|  | `users` | Ganti password (validasi kata sandi lama) |
| **08_Admin_Dashboard** | `GET /api/admin/dashboard` | `routes/admin/adminDashboardRoutes.js`<br>`controllers/admin/adminDashboardController.js` | `orders`, `products`, `custom_components`, `cash_accounts` | Omset penjualan, pesanan baru, produk aktif, alert stok |
| **09_Admin_Categories** | `GET /api/admin/categories` | `routes/admin/adminCategoryRoutes.js`<br>`controllers/admin/adminCategoryController.js` | `categories`, `products` | Daftar semua kategori |
| | `POST /api/admin/categories` |  | `categories` | Tambah kategori baru |
| | `PUT /api/admin/categories/:id`|  | `categories` | Edit kategori |
| | `DELETE /api/admin/categories/:id`|  | `categories`, `products` | Proteksi penolakan jika masih ada produk aktif |
| **10_Admin_Products** | `GET /api/admin/products` | `routes/admin/adminProductRoutes.js`<br>`controllers/admin/adminProductController.js` | `products`, `categories` | Seluruh produk (termasuk inactive) |
| | `POST /api/admin/products` |  | `products`, `inventory_transactions` | Tambah produk baru + catat mutasi stok awal |
| | `PUT /api/admin/products/:id` |  | `products`, `inventory_transactions` | Edit harga, stok, deskripsi, gambar |
| | `PATCH /api/admin/products/:id/status`|  | `products` | Toggle status produk (active / inactive) |
| **11_Admin_Custom_Components** | `GET /api/admin/custom-components` | `routes/admin/adminCustomComponentRoutes.js`<br>`controllers/admin/adminCustomComponentController.js` | `custom_components` | Daftar bahan buket kustom |
| | `POST /api/admin/custom-components` |  | `custom_components`, `inventory_transactions` | Tambah bunga, wrapping, pita, kartu baru |
| | `PUT /api/admin/custom-components/:id`|  | `custom_components`, `inventory_transactions` | Edit harga, stok, status komponen buket |
| **12_Admin_Inventory** | `GET /api/admin/inventory/transactions` | `routes/admin/adminInventoryRoutes.js`<br>`controllers/admin/adminInventoryController.js` | `inventory_transactions`, `products`, `custom_components`, `users` | Histori mutasi keluar-masuk stok barang |
| | `POST /api/admin/inventory/restock`|  | `products`, `custom_components`, `inventory_transactions` | Restock fisik barang dari supplier |
| | `GET /api/admin/inventory/low-stock`|  | `products`, `custom_components` | Filter barang yang `stock <= min_stock` |
| **13_Admin_Orders_Fulfillment** | `GET /api/admin/orders` | `routes/admin/adminOrderRoutes.js`<br>`controllers/admin/adminOrderController.js` | `orders`, `users`, `order_items` | Filter status pesanan toko |
| | `GET /api/admin/orders/:id` |  | `orders`, `order_items`, `payments`, `order_status_logs` | Detail pengerjaan buket untuk florist |
| | `PATCH /api/admin/orders/:id/status`|  | `orders`, `order_status_logs` | Ubah status: diproses, siap kirim (+ kurir & resi), selesai |
| | `POST /api/admin/orders/:id/check-gateway`|  | `orders`, `payments` | Sinkronisasi paksa ke Midtrans API |
| | `POST /api/admin/orders/:id/refund`|  | `orders`, `order_items`, `inventory_transactions`, `cashflow_transactions`, `cash_accounts` | Batalkan pesanan, kembalikan stok fisik, catat pengeluaran kas refund |
| **14_Admin_Cashflow_and_Accounts** | `GET /api/admin/cash-accounts` | `routes/admin/adminCashflowRoutes.js`<br>`controllers/admin/adminCashflowController.js` | `cash_accounts` | Saldo kasir, bank operasional, & escrow |
| | `POST /api/admin/cash-accounts`|  | `cash_accounts` | Tambah rekening bank / dompet kas |
| | `GET /api/admin/cashflow` |  | `cashflow_transactions`, `cash_accounts` | Mutasi uang masuk & keluar toko |
| | `POST /api/admin/cashflow/expense`|  | `cashflow_transactions`, `cash_accounts` | Catat pengeluaran beban (Validasi cegah defisit saldo) |
| | `GET /api/admin/reports/cashflow/recap`|  | `cashflow_transactions` | Rekapitulasi omset, laba kotor, & ekspor laporan |
| **15_Admin_Profile** | `GET /api/admin/profile` | `routes/admin/adminProfileRoutes.js`<br>`controllers/admin/adminProfileController.js` | `users` | Profil akun owner / admin |
| | `PUT /api/admin/profile` |  | `users` | Update nama & kontak owner |
| | `PUT /api/admin/change-password`|  | `users` | Ganti password akun owner |

---

## 🚀 Cara Menjalankan Backend

1. **Pastikan MySQL Aktif**: Jalankan MySQL melalui XAMPP atau MySQL Server lokal (database: `floverarts_db`).
2. **Jalankan Server**:
   ```bash
   cd c:/floverarts_/backend
   npm run dev
   ```
3. **Pengujian Koleksi Postman**:
   - Buka Postman.
   - Import berkas `FloverArts_API.postman_collection.json`.
   - Import environment `FloverArts_Dev.postman_environment.json`.
   - Jalankan Runner: Seluruh 16 folder (00 s.d. 15) siap dieksekusi dengan status **100% PASS**.
