-- =============================================================================
-- DATABASE SETUP LENGKAP: FloverArts_ E-Commerce (v1.1)
-- Target RDBMS : MySQL 8.0.16+ / MariaDB 10.5+
-- Charset      : utf8mb4
-- Collation    : utf8mb4_unicode_ci
-- Storage      : InnoDB
-- Deskripsi    : Berkas SQL all-in-one (DDL + Relasi FK + Indeks + Seed Data Awal)
--                Dapat langsung di-import di phpMyAdmin, DBeaver, MySQL Workbench,
--                atau via terminal CLI.
-- =============================================================================

-- 1. PEMBUATAN DATABASE
CREATE DATABASE IF NOT EXISTS `floverarts_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `floverarts_db`;

-- Matikan sementara foreign key check agar proses drop & create tabel berjalan lancar
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- 2. DROP TABLE SECARA BERSIH JIKA SUDAH ADA (Urutan dari anak ke induk)
DROP TABLE IF EXISTS `payment_webhook_logs`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_status_logs`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `inventory_transactions`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `cashflow_transactions`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cash_accounts`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `custom_components`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- =============================================================================
-- 3. DEFINISI STRUKTUR TABEL (DDL)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 TABEL PENGGUNA (users)
-- Mendukung 2 role resmi: 'customer' dan 'owner_admin'
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `role` ENUM('customer', 'owner_admin') NOT NULL DEFAULT 'customer',
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`),
    INDEX `idx_users_role_status` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.2 TABEL REFRESH TOKEN SESI (refresh_tokens)
-- Menyimpan hash token penyegaran sesi JWT untuk autentikasi aman
-- -----------------------------------------------------------------------------
CREATE TABLE `refresh_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE,
    `expires_at` DATETIME NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_tokens_hash` (`token_hash`),
    INDEX `idx_tokens_user_status` (`user_id`, `is_revoked`),
    CONSTRAINT `fk_tokens_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.3 TABEL KATEGORI PRODUK (categories)
-- -----------------------------------------------------------------------------
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_categories_name` (`name`),
    UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.4 TABEL PRODUK KATALOG REGULER (products)
-- -----------------------------------------------------------------------------
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    `min_stock` INT NOT NULL DEFAULT 5,
    `image_url` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_products_slug` (`slug`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_status` (`status`),
    INDEX `idx_products_stock_min` (`stock`, `min_stock`),
    CONSTRAINT `chk_products_stock` CHECK (`stock` >= 0),
    CONSTRAINT `chk_products_price` CHECK (`price` >= 0),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.5 TABEL KOMPONEN CUSTOM BOUQUET (custom_components)
-- Bunga segar/artifisial, kertas wrapping, pita, kartu ucapan, dekorasi
-- -----------------------------------------------------------------------------
CREATE TABLE `custom_components` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` ENUM('flower', 'wrapping', 'ribbon', 'card', 'decoration') NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `stock` INT NOT NULL DEFAULT 0,
    `min_stock` INT NOT NULL DEFAULT 5,
    `image_url` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_components_category_status` (`category`, `status`),
    CONSTRAINT `chk_components_stock` CHECK (`stock` >= 0),
    CONSTRAINT `chk_components_price` CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.6 TABEL KERANJANG PENGGUNA (carts)
-- -----------------------------------------------------------------------------
CREATE TABLE `carts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_carts_user` (`user_id`),
    CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.7 TABEL ITEM KERANJANG (cart_items)
-- Mendukung item standar (produk katalog) dan custom bouquet (via JSON detail)
-- -----------------------------------------------------------------------------
CREATE TABLE `cart_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cart_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NULL,
    `item_type` ENUM('standard', 'custom') NOT NULL DEFAULT 'standard',
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `custom_details` JSON NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_cart_items_cart` (`cart_id`),
    INDEX `idx_cart_items_product` (`product_id`),
    CONSTRAINT `chk_cart_items_qty` CHECK (`quantity` > 0),
    CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`)
        REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.8 TABEL PESANAN (orders)
-- 6 Status Baku: menunggu_pembayaran, dikonfirmasi, diproses,
--                siap_diambil_dikirim, selesai, dibatalkan.
-- -----------------------------------------------------------------------------
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_number` VARCHAR(50) NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `payment_status` ENUM('menunggu_pembayaran', 'berhasil', 'gagal', 'kedaluwarsa', 'dikembalikan') 
        NOT NULL DEFAULT 'menunggu_pembayaran',
    `order_status` ENUM('menunggu_pembayaran', 'dikonfirmasi', 'diproses', 'siap_diambil_dikirim', 'selesai', 'dibatalkan') 
        NOT NULL DEFAULT 'menunggu_pembayaran',
    `fulfillment_method` ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery',
    `recipient_name` VARCHAR(100) NOT NULL,
    `recipient_phone` VARCHAR(20) NOT NULL,
    `delivery_address` TEXT NOT NULL,
    `delivery_date` DATE NOT NULL,
    `delivery_time` TIME NULL,
    `courier` VARCHAR(100) NULL,
    `tracking_number` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `needs_attention` BOOLEAN NOT NULL DEFAULT FALSE,
    `attention_reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_orders_number` (`order_number`),
    INDEX `idx_orders_user` (`user_id`),
    INDEX `idx_orders_payment_status` (`payment_status`),
    INDEX `idx_orders_order_status` (`order_status`),
    INDEX `idx_orders_created_at` (`created_at`),
    INDEX `idx_orders_needs_attention` (`needs_attention`),
    CONSTRAINT `chk_orders_total` CHECK (`total_amount` >= 0),
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.9 TABEL ITEM PESANAN (order_items)
-- Mengunci snapshot nama dan harga saat checkout untuk konsistensi nota historis
-- -----------------------------------------------------------------------------
CREATE TABLE `order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NULL,
    `item_type` ENUM('standard', 'custom') NOT NULL DEFAULT 'standard',
    `product_name_snapshot` VARCHAR(150) NOT NULL,
    `unit_price_snapshot` DECIMAL(12, 2) NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `custom_details` JSON NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_order_items_order` (`order_id`),
    INDEX `idx_order_items_product` (`product_id`),
    CONSTRAINT `chk_order_items_qty` CHECK (`quantity` > 0),
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.10 TABEL LOG STATUS PESANAN (order_status_logs)
-- Jejak audit pergantian status pesanan
-- -----------------------------------------------------------------------------
CREATE TABLE `order_status_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `previous_status` VARCHAR(50) NULL,
    `new_status` VARCHAR(50) NOT NULL,
    `changed_by` BIGINT UNSIGNED NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_status_logs_order` (`order_id`),
    INDEX `idx_status_logs_created` (`created_at`),
    CONSTRAINT `fk_status_logs_order` FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_status_logs_user` FOREIGN KEY (`changed_by`)
        REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.11 TABEL TRANSAKSI PEMBAYARAN MIDTRANS (payments)
-- Single source of truth riwayat interaksi gateway, mendukung retry pembayaran
-- -----------------------------------------------------------------------------
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `gateway` VARCHAR(50) NOT NULL DEFAULT 'midtrans',
    `gateway_order_id` VARCHAR(100) NOT NULL,
    `gateway_transaction_id` VARCHAR(100) NULL,
    `payment_type` VARCHAR(50) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('menunggu_pembayaran', 'berhasil', 'gagal', 'kedaluwarsa', 'dikembalikan') 
        NOT NULL DEFAULT 'menunggu_pembayaran',
    `snap_token` VARCHAR(255) NULL,
    `checkout_url` TEXT NULL,
    `raw_response` JSON NULL,
    `expired_at` DATETIME NULL,
    `paid_at` DATETIME NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_payments_gateway_order_id` (`gateway_order_id`),
    INDEX `idx_payments_order` (`order_id`),
    INDEX `idx_payments_gateway_trans` (`gateway_transaction_id`),
    INDEX `idx_payments_status` (`status`),
    CONSTRAINT `chk_payments_amount` CHECK (`amount` > 0),
    CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.12 TABEL LOG AUDIT WEBHOOK MIDTRANS (payment_webhook_logs)
-- Idempotensi ketat menggunakan event_key (hash deterministik notifikasi Midtrans)
-- -----------------------------------------------------------------------------
CREATE TABLE `payment_webhook_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payment_id` BIGINT UNSIGNED NULL,
    `event_key` VARCHAR(64) NOT NULL,
    `signature_status` ENUM('valid', 'invalid', 'skipped') NOT NULL DEFAULT 'valid',
    `raw_status` VARCHAR(50) NULL,
    `payload` JSON NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `received_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_webhook_event_key` (`event_key`),
    INDEX `idx_webhook_payment` (`payment_id`),
    CONSTRAINT `fk_webhook_payment` FOREIGN KEY (`payment_id`)
        REFERENCES `payments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.13 TABEL MUTASI INVENTARIS STOK (inventory_transactions)
-- Audit pergerakan stok produk dan komponen custom bouquet
-- -----------------------------------------------------------------------------
CREATE TABLE `inventory_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NULL,
    `custom_component_id` BIGINT UNSIGNED NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `type` ENUM('in', 'out', 'adjustment') NOT NULL,
    `quantity` INT NOT NULL,
    `stock_before` INT NOT NULL,
    `stock_after` INT NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_inv_product` (`product_id`),
    INDEX `idx_inv_component` (`custom_component_id`),
    INDEX `idx_inv_order` (`order_id`),
    INDEX `idx_inv_created_at` (`created_at`),
    CONSTRAINT `fk_inv_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_inv_component` FOREIGN KEY (`custom_component_id`)
        REFERENCES `custom_components` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_inv_order` FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_inv_creator` FOREIGN KEY (`created_by`)
        REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.14 TABEL NOTIFIKASI SISTEM (notifications)
-- Peringatan stok menipis dan pembaruan penting pesanan
-- -----------------------------------------------------------------------------
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NULL,
    `custom_component_id` BIGINT UNSIGNED NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `read_at` DATETIME NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_notifications_user_read` (`user_id`, `is_read`),
    INDEX `idx_notifications_product` (`product_id`),
    INDEX `idx_notifications_component` (`custom_component_id`),
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_notif_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_notif_component` FOREIGN KEY (`custom_component_id`)
        REFERENCES `custom_components` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.15 TABEL SUMBER KAS TOKO (cash_accounts)
-- Rekening kasir, bank operasional, dan escrow payment gateway
-- -----------------------------------------------------------------------------
CREATE TABLE `cash_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `account_type` ENUM('cash', 'bank', 'payment_gateway', 'other') NOT NULL DEFAULT 'cash',
    `account_number` VARCHAR(50) NULL,
    `balance` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cash_accounts_name` (`name`),
    INDEX `idx_cash_accounts_status` (`status`),
    CONSTRAINT `chk_cash_accounts_balance` CHECK (`balance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3.16 TABEL ARUS KAS MASUK & KELUAR (cashflow_transactions)
-- Indeks unik (order_id, source) memastikan penjualan & refund pesanan tidak konflik
-- -----------------------------------------------------------------------------
CREATE TABLE `cashflow_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cash_account_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `type` ENUM('income', 'expense') NOT NULL,
    `source` ENUM('order_sales', 'manual_income', 'stock_purchase', 'operational_expense', 'refund', 'other') NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `reference_number` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cashflow_order_source` (`order_id`, `source`),
    INDEX `idx_cashflow_account` (`cash_account_id`),
    INDEX `idx_cashflow_date` (`transaction_date`),
    INDEX `idx_cashflow_type_date` (`type`, `transaction_date`),
    CONSTRAINT `chk_cashflow_amount` CHECK (`amount` > 0),
    CONSTRAINT `fk_cashflow_account` FOREIGN KEY (`cash_account_id`)
        REFERENCES `cash_accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_cashflow_order` FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_cashflow_creator` FOREIGN KEY (`created_by`)
        REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nyalakan kembali foreign key check
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;


-- =============================================================================
-- 4. DATA AWAL SIAP UJI (SEED DATA DEMO)
-- Kredensial default seluruh user: Password123!
-- Bcrypt Hash: $2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm
-- =============================================================================

-- 4.1 PENGGUNA DEMO
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `address`, `role`, `status`) VALUES
(1, 'Owner FloverArts', 'owner@example.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', '081234567890', 'Jl. Bunga Melati No. 10, Jakarta Selatan', 'owner_admin', 'active'),
(2, 'Pelanggan Siti', 'siti@example.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', '089876543210', 'Jl. Kemang Raya No. 45, Jakarta Selatan', 'customer', 'active'),
(3, 'Pelanggan Budi', 'budi@example.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', '085678901234', 'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan', 'customer', 'active');

-- Inisialisasi Keranjang Belanja Default Customer
INSERT INTO `carts` (`id`, `user_id`) VALUES
(1, 2),
(2, 3);

-- 4.2 AKUN SUMBER KAS
INSERT INTO `cash_accounts` (`id`, `name`, `account_type`, `account_number`, `balance`, `status`) VALUES
(1, 'Kas Tunai Kasir Toko', 'cash', NULL, 500000.00, 'active'),
(2, 'Rekening Bank BCA Toko', 'bank', '5410987654', 2500000.00, 'active'),
(3, 'Saldo Midtrans Escrow', 'payment_gateway', 'MIDTRANS-FLOVER-SANDBOX', 0.00, 'active');

-- 4.3 PENCATATAN SALDO AWAL PADA ARUS KAS
INSERT INTO `cashflow_transactions` (`id`, `cash_account_id`, `order_id`, `created_by`, `type`, `source`, `category`, `amount`, `reference_number`, `notes`, `transaction_date`) VALUES
(1, 1, NULL, 1, 'income', 'manual_income', 'Modal Awal', 500000.00, 'INIT-CASH-001', 'Penyetoran modal awal kas kecil toko', NOW()),
(2, 2, NULL, 1, 'income', 'manual_income', 'Modal Awal', 2500000.00, 'INIT-BANK-001', 'Penyetoran saldo awal rekening operasional BCA', NOW());

-- 4.4 KATEGORI PRODUK
INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Buket Bunga Segar', 'buket-bunga-segar', 'Rangkaian bunga potong segar pilihan (Mawar, Lily, Baby Breath).'),
(2, 'Buket Artificial & Kering', 'buket-artificial-kering', 'Buket bunga tiruan dan bunga kering estetik yang awet bertahun-tahun.'),
(3, 'Buket Wisuda & Hadiah', 'buket-wisuda-hadiah', 'Kombinasi buket dengan boneka wisuda, cokelat, atau aksesori ucapan.'),
(4, 'Bunga Meja & Vas', 'bunga-meja-vas', 'Dekorasi bunga meja elegan untuk ruangan kerja, rumah, dan ucapan kantor.');

-- 4.5 KATALOG PRODUK REGULER
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `stock`, `min_stock`, `image_url`, `status`) VALUES
(1, 1, 'Buket Mawar Merah Klasik (10 Tangkai)', 'buket-mawar-merah-klasik', 'Rangkaian 10 tangkai mawar merah segar dengan aksen baby breath premium dan wrapping hitam elegan.', 250000.00, 15, 5, '/uploads/products/mawar-klasik.jpg', 'active'),
(2, 1, 'Buket Pure Lily Putih', 'buket-pure-lily-putih', 'Buket bunga lily putih wangi segar dipadukan dengan daun eucalyptus segar.', 320000.00, 8, 4, '/uploads/products/pure-lily.jpg', 'active'),
(3, 2, 'Buket Rustic Dried Sunflower', 'buket-rustic-dried-sunflower', 'Bunga matahari kering dengan kombinasi gandum dan kapas bergaya vintage rustic.', 185000.00, 20, 5, '/uploads/products/rustic-sunflower.jpg', 'active'),
(4, 3, 'Buket Wisuda Teddy Bear & Cokelat', 'buket-wisuda-teddy-bear-cokelat', 'Buket wisuda dilengkapi boneka teddy toga dan 3 cokelat Ferrero Rocher.', 210000.00, 3, 5, '/uploads/products/wisuda-teddy.jpg', 'active');

-- 4.6 KOMPONEN CUSTOM BOUQUET DINAMIS
INSERT INTO `custom_components` (`id`, `category`, `name`, `price`, `stock`, `min_stock`, `image_url`, `status`) VALUES
-- Bunga Utama
(1, 'flower', 'Bunga Mawar Merah Segar (per tangkai)', 15000.00, 50, 10, '/uploads/components/rose-red.jpg', 'active'),
(2, 'flower', 'Bunga Mawar Putih Segar (per tangkai)', 15000.00, 40, 10, '/uploads/components/rose-white.jpg', 'active'),
(3, 'flower', 'Bunga Matahari Segar (per tangkai)', 25000.00, 25, 5, '/uploads/components/sunflower.jpg', 'active'),
(4, 'flower', 'Baby Breath Putih (per ikat)', 35000.00, 15, 5, '/uploads/components/baby-breath.jpg', 'active'),
-- Kertas Wrapping
(5, 'wrapping', 'Kertas Wrapping Hitam Matte', 20000.00, 30, 8, '/uploads/components/wrap-black.jpg', 'active'),
(6, 'wrapping', 'Kertas Wrapping Cokelat Kraft Vintage', 15000.00, 45, 10, '/uploads/components/wrap-kraft.jpg', 'active'),
(7, 'wrapping', 'Kertas Wrapping Pink Pastel Korea', 20000.00, 25, 8, '/uploads/components/wrap-pink.jpg', 'active'),
-- Pita Buket
(8, 'ribbon', 'Pita Satin Emas / Gold', 10000.00, 50, 10, '/uploads/components/ribbon-gold.jpg', 'active'),
(9, 'ribbon', 'Pita Satin Marun Elegan', 10000.00, 40, 10, '/uploads/components/ribbon-maroon.jpg', 'active'),
-- Kartu Ucapan & Aksesori
(10, 'card', 'Kartu Ucapan Lipat Eksklusif + Amplop', 10000.00, 100, 20, '/uploads/components/card-envelope.jpg', 'active'),
(11, 'decoration', 'Lampu LED String Fairy Lights', 15000.00, 20, 5, '/uploads/components/fairy-lights.jpg', 'active');

-- =============================================================================
-- 5. VERIFIKASI AKHIR DATABASE
-- =============================================================================
SELECT 'DATABASE SETUP FLOVERARTS BERHASIL DIPASANG!' AS status,
       (SELECT COUNT(*) FROM `users`) AS total_users,
       (SELECT COUNT(*) FROM `categories`) AS total_categories,
       (SELECT COUNT(*) FROM `products`) AS total_products,
       (SELECT COUNT(*) FROM `custom_components`) AS total_custom_components,
       (SELECT COUNT(*) FROM `cash_accounts`) AS total_cash_accounts;
