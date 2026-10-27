const fs = require('fs');
const path = require('path');

function generateTldrawRoadmap() {
  const records = [];

  // Document record
  records.push({
    gridSize: 10,
    name: "FloverArts 3-Week Fullstack Roadmap",
    meta: {},
    id: "document:document",
    typeName: "document"
  });

  // Page record
  records.push({
    meta: {},
    id: "page:page",
    name: "Roadmap 3 Minggu",
    index: "a1",
    typeName: "page"
  });

  // Camera record
  records.push({
    x: 200,
    y: 100,
    z: 0.65,
    meta: {},
    id: "camera:page:page",
    typeName: "camera"
  });

  // Instance record
  records.push({
    editingShapeId: null,
    croppingShapeId: null,
    selectedShapeIds: [],
    hoveredShapeId: null,
    camera: "camera:page:page",
    pageId: "page:page",
    typeName: "instance",
    id: "instance:instance"
  });

  let shapeCounter = 1;
  function getNextIndex() {
    return 'a' + (shapeCounter++);
  }

  // 1. MAIN TITLE BANNER
  records.push({
    x: 80,
    y: 40,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: {},
    id: "shape:main_banner",
    type: "geo",
    props: {
      w: 1600,
      h: 110,
      geo: "rectangle",
      color: "violet",
      labelColor: "black",
      fill: "solid",
      dash: "solid",
      size: "l",
      font: "sans",
      text: "🌸 FLOVERARTS_ : MASTER ROADMAP 3 MINGGU (21 HARI)\nStrategi: Selesaikan 100% Backend Dulu ➔ Baru Integrasikan Frontend & Deploy",
      align: "middle",
      verticalAlign: "middle",
      growY: 0,
      url: ""
    },
    parentId: "page:page",
    index: getNextIndex(),
    typeName: "shape"
  });

  // STRATEGY CALLOUT CARD (Top right or below banner)
  records.push({
    x: 80,
    y: 170,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: {},
    id: "shape:callout_strategy",
    type: "geo",
    props: {
      w: 1600,
      h: 80,
      geo: "rectangle",
      color: "grey",
      labelColor: "black",
      fill: "semi",
      dash: "draw",
      size: "s",
      font: "sans",
      text: "💡 PRINSIP 'BE DULU BIAR TIDAK RIBET':\n1. Minggu 1 tuntas menguji 100% endpoint via Postman. Database, harga, validasi stok, & webhook sudah pasti beres.\n2. Minggu 2 & 3 Frontend tinggal 'menjahit' (connect) UI ke API yang sudah stabil tanpa ada kebingungan logika data.",
      align: "start",
      verticalAlign: "middle",
      growY: 0,
      url: ""
    },
    parentId: "page:page",
    index: getNextIndex(),
    typeName: "shape"
  });

  // 3 COLUMNS: Week 1 (BE), Week 2 (FE Customer), Week 3 (Admin, QA & Cloud)
  const columns = [
    {
      week: "MINGGU 1 (HARI 1 - 7)",
      title: "🔥 FASE 1: 100% BACKEND REST API",
      subtitle: "Target: Semua Endpoint Lolos Uji Postman Runner",
      color: "blue",
      fill: "pattern",
      x: 80,
      days: [
        {
          day: "HARI 1 (Kamis, 22 Okt)",
          title: "Setup Node.js Express & MySQL Pool",
          tasks: "• Inisialisasi Express.js REST API + .env\n• Koneksi driver mysql2/promise pool ke floverarts_db\n• Health Check API GET /api/health (200 OK)\n• Standard JSON response & Global error handler",
          tag: "P0 • Fondasi Server"
        },
        {
          day: "HARI 2 (Jumat, 23 Okt)",
          title: "JWT Authentication & Role Middleware",
          tasks: "• Register customer (Bcrypt hash password)\n• Login & penerbitan JWT Token (2 role: customer, owner_admin)\n• Middleware auth: verifyToken & requireRole\n• Endpoint Profil Saya & Logout",
          tag: "P0 • Security & Auth"
        },
        {
          day: "HARI 3 (Sabtu, 24 Okt)",
          title: "Modul Kategori & Katalog Produk",
          tasks: "• GET /api/categories (list kategori aktif)\n• GET /api/products (filter ?cat=, live search ?q=)\n• GET /api/products/:slug (detail lengkap & stok)\n• CRUD Admin Produk & Kategori (khusus owner_admin)",
          tag: "P0 • Katalog Data"
        },
        {
          day: "HARI 4 (Minggu, 25 Okt)",
          title: "Custom Bouquet API & Keranjang Belanja",
          tasks: "• GET /api/custom-components (bunga, wrap, pita, kartu)\n• CRUD Keranjang Belanja (GET, POST, PATCH, DELETE /api/cart)\n• Simpan racikan custom ke cart_item_components\n• Kalkulasi subtotal otomatis di server",
          tag: "P0 • Keranjang & Custom"
        },
        {
          day: "HARI 5 (Senin, 26 Okt)",
          title: "Engine Checkout & Validasi Stok",
          tasks: "• POST /api/orders/checkout dari isi keranjang\n• Validasi stok bunga server-authoritative\n• Snapshot harga produk & alamat/jadwal kirim\n• Status awal order: menunggu_pembayaran",
          tag: "P0 • Transaksi Order"
        },
        {
          day: "HARI 6 (Selasa, 27 Okt)",
          title: "Midtrans Snap SDK & Webhook Idempotensi",
          tasks: "• POST /api/payments/charge (terbitkan Snap Token)\n• POST /api/webhooks/midtrans (verifikasi SHA512 signature)\n• Potong stok fisik & catat mutasi saat settlement\n• Idempotensi event_key & SOP order needs_attention",
          tag: "P0 • Payment Gateway"
        },
        {
          day: "HARI 7 (Rabu, 28 Okt)",
          title: "Admin APIs, Cashflow & Backend Freeze",
          tasks: "• REST API Transisi Status Order (Kemas, Resi, Selesai, Batal)\n• REST API Mutasi Stok & Restock inventaris\n• REST API Cashflow Toko & Rekap Kas CSV\n• 🎯 MILESTONE 1: 100% Postman Collection Runner PASS!",
          tag: "P0 • Milestone BE Siap"
        }
      ]
    },
    {
      week: "MINGGU 2 (HARI 8 - 14)",
      title: "🎨 FASE 2: FRONTEND CUSTOMER UI",
      subtitle: "Target: Pelanggan Bisa Belanja & Bayar dari Web",
      color: "green",
      fill: "pattern",
      x: 610,
      days: [
        {
          day: "HARI 8 (Kamis, 29 Okt)",
          title: "Setup React Vite & Axios Interceptor",
          tasks: "• Setup React 18 + Vite + TailwindCSS\n• Axios instance dengan Interceptor Bearer JWT Token\n• State Management: AuthContext (login/user)\n• CartContext (sinkronisasi keranjang ke server)",
          tag: "P0 • Fondasi Client"
        },
        {
          day: "HARI 9 (Jumat, 30 Okt)",
          title: "Halaman Auth & Header / Navigation",
          tasks: "• Halaman Login & Register responsif & validasi form\n• Navbar estetik dengan badge counter keranjang\n• Dropdown akun pengguna & tombol Logout\n• Protected Route untuk halaman khusus customer",
          tag: "P0 • UI Autentikasi"
        },
        {
          day: "HARI 10 (Sabtu, 31 Okt)",
          title: "UI Katalog Bunga & Halaman Detail",
          tasks: "• Grid kartu produk dengan foto, harga, & stok badge\n• Filter tab kategori bunga & Search bar debounced\n• Halaman Detail Produk (/produk/:slug)\n• Pilihan jumlah & tombol 'Tambah ke Keranjang'",
          tag: "P0 • UI Katalog"
        },
        {
          day: "HARI 11 (Minggu, 1 Nov)",
          title: "UI Custom Bouquet Builder (Fitur Bintang)",
          tasks: "• Stepper 4 Tahap: Bunga ➔ Wrapping ➔ Pita ➔ Kartu Ucapan\n• Live Price Calculator (harga berubah real-time)\n• Preview visual komponen terpilih\n• Tombol masukkan buket racikan sendiri ke keranjang",
          tag: "P0 • Custom Builder"
        },
        {
          day: "HARI 12 (Senin, 2 Nov)",
          title: "UI Keranjang Belanja & Checkout Form",
          tasks: "• Drawer / Halaman Keranjang: ubah qty & hapus item\n• Halaman Checkout: input penerima, alamat lengkap\n• Pemilihan tanggal & jam pengiriman bunga\n• Ringkasan rincian biaya pesanan",
          tag: "P0 • UI Checkout"
        },
        {
          day: "HARI 13 (Selasa, 3 Nov)",
          title: "Integrasi Midtrans Snap Popup di Web",
          tasks: "• Pasang script Snap.js di React\n• Munculkan modal pembayaran Snap saat tombol Bayar ditekan\n• Tangani callback onSuccess, onPending, onError, onClose\n• Redirect mulus ke halaman nota/sukses pesanan",
          tag: "P0 • UI Payment"
        },
        {
          day: "HARI 14 (Rabu, 4 Nov)",
          title: "Riwayat Order, Tracking & Profil User",
          tasks: "• Halaman Riwayat Transaksi Pelanggan (/riwayat)\n• Halaman Live Order Tracking (/pesanan/:id)\n• Stepper 6 status pengerjaan bunga & info kurir/resi\n• Halaman Edit Profil & Ganti Kata Sandi",
          tag: "P0 • UI Tracking"
        }
      ]
    },
    {
      week: "MINGGU 3 (HARI 15 - 21)",
      title: "👑 FASE 3: ADMIN UI, TESTING & DEPLOY",
      subtitle: "Target: Dashboard Owner Berfungsi & Live Cloud",
      color: "orange",
      fill: "pattern",
      x: 1140,
      days: [
        {
          day: "HARI 15 (Kamis, 5 Nov)",
          title: "Shell Dashboard Admin & Overview Metrics",
          tasks: "• Sidebar Admin Navigation & Route Guard role 'owner_admin'\n• Ringkasan metrik: Omzet hari ini, Total order baru\n• Widget alert notifikasi stok bunga menipis\n• Grafik ringkas penjualan bulanan",
          tag: "P1 • Dashboard Admin"
        },
        {
          day: "HARI 16 (Jumat, 6 Nov)",
          title: "Admin Kelola Katalog Produk & Kategori",
          tasks: "• Tabel data master produk & filter kategori\n• Modal formulir tambah & edit produk (upload gambar)\n• Toggle ubah status produk (aktif/nonaktif/stok)\n• CRUD Kategori (validasi cegah hapus kategori berproduk)",
          tag: "P0 • Admin Produk"
        },
        {
          day: "HARI 17 (Sabtu, 7 Nov)",
          title: "Admin Kelola Pesanan & Fulfillment",
          tasks: "• Tabel pesanan masuk dengan badge 6 status baku\n• Modal rincian pengerjaan buket (komposisi & ucapan)\n• Tombol aksi: 'Mulai Kemas', input 'Kurir & Resi', 'Selesai'\n• Tombol 'Cek Gateway' & Tombol 'Batal & Refund'",
          tag: "P0 • Admin Pesanan"
        },
        {
          day: "HARI 18 (Minggu, 8 Nov)",
          title: "Admin Inventaris, Restock & Cashflow",
          tasks: "• Halaman stok: Form restock bunga masuk & riwayat mutasi\n• Halaman arus kas: Catat pengeluaran operasional toko\n• Rekapitulasi kas bulanan & Tombol Export ke CSV\n• Manajemen Akun Kas Toko (Kasir, BCA, Midtrans)",
          tag: "P1 • Admin Kas & Stok"
        },
        {
          day: "HARI 19 (Senin, 9 Nov)",
          title: "Uji End-to-End (E2E) & Responsif Mobile",
          tasks: "• Simulasi penuh: Pelanggan checkout ➔ Bayar Sandbox ➔ Owner kemas & input resi ➔ Selesai\n• Uji responsif layar HP (360px) & tablet\n• Uji skenario edge-case: stok habis saat settlement, refund",
          tag: "P0 • QA & Bugfixing"
        },
        {
          day: "HARI 20 (Selasa, 10 Nov)",
          title: "Deployment ke Cloud (Live Production)",
          tasks: "• Backend: Deploy ke Railway / Render / VPS\n• Frontend: Deploy ke Vercel / Netlify\n• Database: Cloud Managed MySQL (Railway/Aiven)\n• Atur URL Webhook HTTPS resmi di dashboard Midtrans",
          tag: "P0 • Cloud Hosting"
        },
        {
          day: "HARI 21 (Rabu, 11 Nov)",
          title: "Final Polish, Dokumentasi & Siap Sidang!",
          tasks: "• Final Code Freeze di repository Git\n• Update README.md & dokumentasi panduan install\n• Siapkan akun demo penguji & skrip presentasi\n• 🏆 100% SELESAI & SIAP PRESENTASI!",
          tag: "P0 • Launch & Done"
        }
      ]
    }
  ];

  // Render Columns and Cards
  columns.forEach((col) => {
    // Column Header Box
    records.push({
      x: col.x,
      y: 280,
      rotation: 0,
      isLocked: false,
      opacity: 1,
      meta: {},
      id: `shape:col_header_${col.week.slice(0, 8)}`,
      type: "geo",
      props: {
        w: 500,
        h: 90,
        geo: "rectangle",
        color: col.color,
        labelColor: "black",
        fill: "solid",
        dash: "solid",
        size: "m",
        font: "sans",
        text: `${col.week}\n${col.title}\n${col.subtitle}`,
        align: "middle",
        verticalAlign: "middle",
        growY: 0,
        url: ""
      },
      parentId: "page:page",
      index: getNextIndex(),
      typeName: "shape"
    });

    // Day Cards in column
    let cardY = 390;
    col.days.forEach((day, idx) => {
      records.push({
        x: col.x,
        y: cardY,
        rotation: 0,
        isLocked: false,
        opacity: 1,
        meta: {},
        id: `shape:card_${col.week.slice(0, 8)}_day_${idx + 1}`,
        type: "geo",
        props: {
          w: 500,
          h: 165,
          geo: "rectangle",
          color: col.color,
          labelColor: "black",
          fill: "semi",
          dash: "solid",
          size: "s",
          font: "sans",
          text: `📅 ${day.day}\n⭐ ${day.title} [${day.tag}]\n${day.tasks}`,
          align: "start",
          verticalAlign: "start",
          growY: 0,
          url: ""
        },
        parentId: "page:page",
        index: getNextIndex(),
        typeName: "shape"
      });

      cardY += 180;
    });
  });

  // Footer / Status milestone summary banner
  records.push({
    x: 80,
    y: 1670,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: {},
    id: "shape:footer_banner",
    type: "geo",
    props: {
      w: 1600,
      h: 90,
      geo: "rectangle",
      color: "green",
      labelColor: "black",
      fill: "solid",
      dash: "solid",
      size: "m",
      font: "sans",
      text: "✅ TARGET HASIL AKHIR (HARI KE-21):\nSeluruh 25 Fitur SRS (Auth, Katalog, Custom Bouquet Builder, Midtrans Payment, Tracking Resi, Admin Dashboard & Cashflow) 100% Live & Siap Presentasi!",
      align: "middle",
      verticalAlign: "middle",
      growY: 0,
      url: ""
    },
    parentId: "page:page",
    index: getNextIndex(),
    typeName: "shape"
  });

  const tldrawFile = {
    tldrawFileFormatVersion: 1,
    schema: {
      schemaVersion: 2,
      sequences: {
        "com.tldraw.store": 4,
        "com.tldraw.asset": 1,
        "com.tldraw.camera": 1,
        "com.tldraw.document": 2,
        "com.tldraw.instance": 25,
        "com.tldraw.instance_page_state": 5,
        "com.tldraw.page": 1,
        "com.tldraw.instance_presence": 5,
        "com.tldraw.pointer": 1,
        "com.tldraw.shape": 4,
        "com.tldraw.asset.bookmark": 2,
        "com.tldraw.asset.image": 5,
        "com.tldraw.asset.video": 5,
        "com.tldraw.shape.group": 0,
        "com.tldraw.shape.bookmark": 2,
        "com.tldraw.shape.embed": 4,
        "com.tldraw.shape.image": 4,
        "com.tldraw.shape.text": 2,
        "com.tldraw.shape.video": 2,
        "com.tldraw.shape.draw": 2,
        "com.tldraw.shape.geo": 9,
        "com.tldraw.shape.line": 5,
        "com.tldraw.shape.note": 8,
        "com.tldraw.shape.frame": 0,
        "com.tldraw.shape.arrow": 5,
        "com.tldraw.shape.highlight": 1
      }
    },
    records: records
  };

  const outputPath = path.join(__dirname, 'FLOVERARTS_ROADMAP_3_WEEKS.tldr');
  fs.writeFileSync(outputPath, JSON.stringify(tldrawFile, null, 2), 'utf-8');
  console.log('Successfully generated:', outputPath);
}

generateTldrawRoadmap();
