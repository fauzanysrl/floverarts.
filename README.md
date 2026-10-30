# 🌸 FloverArts_ E-Commerce

> Platform E-Commerce Florist Artisan Luxury berbasis web dengan alur belanja transaksional, perakitan buket interaktif (*Custom Bouquet Builder*), dan integrasi pembayaran otomatis Midtrans Snap.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS, TanStack Query v5, React Router v7, Lucide Icons, Vitest, Testing Library, Oxlint.
- **Backend:** Node.js, Express.js, MySQL2 Pool (`Promise-based`), JWT Authentication, Midtrans Snap Node SDK.
- **Database:** MySQL 8.0 / MariaDB 10.4+ (skema relasional 3NF).

---

## 🏛️ Struktur Folder

```text
floverarts_/
├── backend/
│   ├── src/
│   │   ├── config/             # Koneksi database MySQL Pool
│   │   ├── controllers/        # Logika bisnis API (customer & admin)
│   │   ├── middlewares/        # JWT auth, error handler, response envelope
│   │   ├── routes/             # Routing REST API Express
│   │   └── utils/              # Helper JWT & Midtrans Snap SDK
│   └── uploads/                # Direktori penyimpanan unggahan gambar (.gitkeep)
├── frontend/
│   ├── public/                 # Aset statis terverifikasi (gambar web, ikon SVG)
│   └── src/
│       ├── api/                # Axios client & kontrak endpoint API
│       ├── app/                # Router & Providers (QueryClient)
│       ├── components/         # UI atom & komponen layout global (Navbar, Footer)
│       ├── features/
│       │   ├── auth/           # Formulir autentikasi, Context, & hook useAuth
│       │   ├── catalog/        # Komponen kartu produk & hook useProducts
│       │   └── home/           # Landing page termodularisasi (11 sections & constants)
│       ├── lib/                # Formatters, logger, dan useScrollReveal
│       ├── styles/             # Desain token TailwindCSS & CSS global
│       └── test/               # Unit testing Vitest
├── database/
│   └── database.sql            # DDL skema database & data awal (seed)
├── docs/                       # Dokumentasi PRD, SRS, Project Plan, & API Contract
├── postman/                    # Koleksi pengujian otomatis API Postman
└── scripts/                    # Skrip bantu otomasi
```

---

## 📌 Catatan Deviasi dari PRD (Frontend)

- **Landing Page Modular (`features/home/`):**
  Pada dokumen PRD bagian 5, landing page direncanakan di bawah `features/catalog/pages/HomePage.jsx`. Untuk menjaga keterbacaan kode (*clean code*), mencegah penumpukan baris dalam satu file (>800 baris), dan memisahkan domain landing page dari domain katalog produk, landing page kini ditempatkan di **`frontend/src/features/home/`** (terdiri dari 11 section modular di `components/`, konstanta di `constants/`, dan `pages/HomePage.jsx` sebagai orchestrator ramping). Domain `features/catalog/` tetap difokuskan untuk komponen spesifik katalog produk (`ProductCard`, `ProductGrid`, dsb.).
- **Hook useScrollReveal:** Ditempatkan pada `src/lib/useScrollReveal.js` untuk menghindari pembuatan folder `src/hooks/` yang tidak perlu.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Prasyarat Sistem
- **Node.js:** Versi 18+ atau 20+ LTS
- **Database:** MySQL 8.0 atau MariaDB 10.4+ (XAMPP / MySQL Server)

---

### 2. Impor Database
1. Pastikan server MySQL Anda aktif (misalnya melalui XAMPP Control Panel atau MySQL Service).
2. Buat database baru bernama `floverarts_db`:
   ```sql
   CREATE DATABASE floverarts_db;
   ```
3. Impor skema dan seed data dari file `database/database.sql`:
   - **Via CLI / Terminal:**
     ```bash
     mysql -u root -p floverarts_db < database/database.sql
     ```
   - **Via phpMyAdmin:** Buka `http://localhost/phpmyadmin`, pilih `floverarts_db`, klik tab **Import**, pilih file `database/database.sql`, lalu klik **Go**.

---

### 3. Menjalankan Backend API
1. Masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Salin template konfigurasi:
   ```bash
   cp .env.example .env
   ```
   *Buka `.env` dan sesuaikan kredensial MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).*
3. Jalankan server backend:
   ```bash
   npm run dev
   ```
   *Backend aktif di `http://localhost:5000`.*

---

### 4. Menjalankan Frontend Web
1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Salin konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
   *Frontend aktif di `http://localhost:5173` (terkonfigurasi reverse proxy otomatis ke port 5000).*

---

## 🧪 Pengujian & Kualitas Kode

```bash
cd frontend

# Menjalankan unit test (Vitest)
npm test

# Menjalankan linter (Oxlint)
npm run lint

# Menjalankan build produksi
npm run build
```
