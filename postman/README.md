# Koleksi & Environment Postman FloverArts API (Audited & Final)

Folder ini berisi berkas ekspor Postman yang telah diaudit secara menyeluruh dan disesuaikan 100% dengan endpoint backend Express.js dan skema basis data FloverArts.

## Berkas yang Tersedia:
1. **`FloverArts_API_postman_audited.json`**
   - Koleksi Postman utama (83 endpoints).
   - Terbagi menjadi 4 folder utama:
     - `01. Autentikasi & Sesi Pengguna`
     - `02. Alur Pelanggan (Customer Journey)`
     - `03. Alur Admin & Owner (Backoffice & Pengelolaan)`
     - `04. Pengujian Keamanan & RBAC (Cross-Role Security Suite)`
2. **`FloverArts_Dev_postman_audited.json`**
   - Environment Postman dengan variabel lengkap:
     - `base_url`: `http://localhost:5000`
     - `customer_token`, `customer_refresh_token` (Siti Nurhaliza - customer)
     - `admin_token`, `admin_refresh_token` (Owner Admin)
     - `test_user_token`, `test_user_refresh_token` (Akun uji coba register/deaktivasi)

## Petunjuk Import ke Postman:
1. Buka aplikasi Postman.
2. Klik tombol **Import** di kiri atas.
3. Seret dan lepas (*drag and drop*) kedua file JSON di atas.
4. Pada pojok kanan atas Postman, pilih environment **FloverArts Dev Environment (Audited)**.
5. Jalankan request `01.02 Login Pelanggan (Siti)` dan `01.03 Login Owner / Admin` untuk menginisialisasi token secara otomatis via test script.
