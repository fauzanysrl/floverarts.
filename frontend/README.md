# FloverArts_ Frontend (React.js + Vite)

Front-end antarmuka autentikasi / login untuk **FloverArts_**, dibuat menggunakan **React.js**, **Plus Jakarta Sans**, dan **Vite**, terhubung langsung dengan REST API backend.

---

## 🎨 Fitur Tampilan & Desain
- **Typography Sesuai Permintaan**: Menggunakan font modern **Plus Jakarta Sans** untuk seluruh body, label, input, tombol, serta aksen serif elegan untuk headline "Selamat Datang".
- **Desain Presisi Sesuai Mockup**:
  - Badge logo floverarts_ dan language selector (ID/EN)
  - Judul "Selamat Datang" dan deskripsi toko
  - Input Alamat Email & Kata Sandi (dengan tombol toggle lihat/sembunyikan sandi)
  - Fitur "Ingat saya" (checkbox) dan tautan "Lupa kata sandi?"
  - Tombol masuk warna burgundy mewah (`#371727`) dengan loading spinner
  - Tombol masuk alternatif "Masuk dengan Google"
  - Banner buket satin merah elegan (*Round Bouquet Satin*) di sisi kanan dengan teks overlay artistik
- **Penuh Responsif**: Tampilan menyesuaikan otomatis untuk layar desktop besar, tablet, hingga smartphone (mobile-friendly).
- **Koneksi API Backend**:
  - Terhubung ke endpoint `POST /api/auth/login` (port `5000`)
  - Menyimpan JWT Access Token & data profil di `localStorage` / `sessionStorage`
  - Dilengkapi banner feedback notifikasi untuk pesan sukses maupun penanganan pesan kesalahan dari backend
  - Tombol pengisian cepat demo (**siti@example.com** & **owner@example.com**) untuk memudahkan pengujian.

---

## 🚀 Cara Menjalankan Frontend

1. Masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka browser pada URL yang ditampilkan di terminal (biasanya `http://localhost:5173`).

---

## 🔗 Integrasi Backend
Pastikan backend berjalan di port 5000:
```bash
cd backend
npm run dev
```
Proxy Vite pada `vite.config.js` telah dikonfigurasi untuk meneruskan setiap pemanggilan `/api` langsung ke `http://localhost:5000`.
