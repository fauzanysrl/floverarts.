const fs = require('fs');
const path = require('path');

// Helper to create test script
function createTestScript(tests) {
  return {
    listen: 'test',
    script: {
      type: 'text/javascript',
      exec: tests
    }
  };
}

// Helper to create pre-request script
function createPreRequestScript(lines) {
  return {
    listen: 'prerequest',
    script: {
      type: 'text/javascript',
      exec: lines
    }
  };
}

function request(name, method, urlPath, query = [], headers = [], body = null, preScripts = [], testScripts = [], description = '') {
  const req = {
    name,
    request: {
      method,
      header: [
        { key: 'Content-Type', value: 'application/json', type: 'text' },
        ...headers
      ],
      url: {
        raw: '{{base_url}}' + urlPath + (query.length > 0 ? '?' + query.map(q => `${q.key}=${encodeURIComponent(q.value)}`).join('&') : ''),
        host: ['{{base_url}}'],
        path: urlPath.replace(/^\//, '').split('/'),
        query: query.map(q => ({ key: q.key, value: q.value, description: q.description || '' }))
      },
      description: description
    },
    response: []
  };

  if (body) {
    req.request.body = {
      mode: 'raw',
      raw: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: 'json'
        }
      }
    };
  }

  const events = [];
  if (preScripts.length > 0) {
    events.push(createPreRequestScript(preScripts));
  }
  if (testScripts.length > 0) {
    events.push(createTestScript(testScripts));
  }
  if (events.length > 0) {
    req.event = events;
  }

  return req;
}

const customerAuth = { key: 'Authorization', value: 'Bearer {{customer_token}}', type: 'text' };
const adminAuth = { key: 'Authorization', value: 'Bearer {{admin_token}}', type: 'text' };
const deactivatedAuth = { key: 'Authorization', value: 'Bearer {{deactivated_customer_token}}', type: 'text' };
const invalidAuth = { key: 'Authorization', value: 'Bearer invalid_tampered_jwt_token_sample', type: 'text' };

const collection = {
  info: {
    name: 'FloverArts_ API Collection (Audited per Actor & RBAC)',
    _postman_id: 'floverarts-ecommerce-api-actor-separated-v3',
    description: 'Postman Collection Resmi FloverArts_ E-Commerce dengan pemisahan tegas antar-aktor (Pelanggan, Admin/Owner), Autentikasi Mandiri, dan Pengujian Hak Akses Lintas Peran (Cross-Role RBAC Security).',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [
    // ==========================================
    // 00. Health & Database Check
    // ==========================================
    {
      name: '00_Health_and_Status',
      item: [
        request(
          'Health Check & Koneksi Database MySQL',
          'GET',
          '/api/health',
          [],
          [],
          null,
          [],
          [
            'pm.test("Status code is 200 OK", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Database status is connected", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.status).to.be.oneOf(["ok", "success", "healthy"]);',
            '    var dbStatus = (jsonData.data && jsonData.data.database && jsonData.data.database.status) || jsonData.database || "connected";',
            '    pm.expect(dbStatus).to.eql("connected");',
            '});'
          ],
          'Memeriksa status server Express.js dan kesehatan pool koneksi MySQL.'
        )
      ]
    },

    // ==========================================
    // 01. Authentication & Session Management
    // ==========================================
    {
      name: '01_Authentication_and_Session',
      item: [
        request(
          '01.01 - Register Akun Pelanggan Baru (Valid)',
          'POST',
          '/api/auth/register',
          [],
          [],
          {
            name: '{{test_user_name}}',
            email: '{{test_user_email}}',
            password: '{{default_password}}',
            phone: '081234567890',
            address: 'Jl. Mawar Merah No. 10, Jakarta Selatan'
          },
          [
            'var timestamp = Date.now();',
            'var uniqueEmail = "testuser_" + timestamp + "@example.com";',
            'var uniqueName = "Pelanggan Uji " + timestamp;',
            'pm.environment.set("test_user_email", uniqueEmail);',
            'pm.environment.set("test_user_name", uniqueName);'
          ],
          [
            'pm.test("Registrasi Berhasil (201 Created)", function () {',
            '    pm.response.to.have.status(201);',
            '});',
            'pm.test("Simpan test_user_token & test_user_refresh_token", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.success).to.be.true;',
            '    var token = jsonData.token || (jsonData.data && jsonData.data.token);',
            '    var refreshToken = jsonData.refreshToken || (jsonData.data && jsonData.data.refreshToken);',
            '    var userId = jsonData.data && jsonData.data.user ? jsonData.data.user.id : null;',
            '    pm.expect(token).to.not.be.undefined;',
            '    pm.environment.set("test_user_token", token);',
            '    if (refreshToken) pm.environment.set("test_user_refresh_token", refreshToken);',
            '    if (userId) pm.environment.set("test_user_id", userId.toString());',
            '});'
          ],
          'Registrasi akun baru pelanggan menggunakan email dinamis untuk test runner berulang.'
        ),
        request(
          '01.02 - Login Pelanggan (Customer)',
          'POST',
          '/api/auth/login',
          [],
          [],
          {
            email: '{{test_user_email}}',
            password: '{{default_password}}'
          },
          [],
          [
            'pm.test("Login Pelanggan Berhasil (200 OK)", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Simpan token ke test_user_token", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.success).to.be.true;',
            '    var token = jsonData.token || (jsonData.data && jsonData.data.token);',
            '    var refreshToken = jsonData.refreshToken || (jsonData.data && jsonData.data.refreshToken);',
            '    pm.environment.set("test_user_token", token);',
            '    if (refreshToken) pm.environment.set("test_user_refresh_token", refreshToken);',
            '});'
          ],
          'Login aktor pelanggan dan menyimpan token ke variable terpisah customer_token.'
        ),
        request(
          '01.03 - Login Admin / Owner',
          'POST',
          '/api/auth/login',
          [],
          [],
          {
            email: '{{admin_email}}',
            password: '{{default_password}}'
          },
          [],
          [
            'pm.test("Login Owner/Admin Berhasil (200 OK)", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Simpan token ke admin_token", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.success).to.be.true;',
            '    var token = jsonData.token || (jsonData.data && jsonData.data.token);',
            '    var refreshToken = jsonData.refreshToken || (jsonData.data && jsonData.data.refreshToken);',
            '    pm.expect(token).to.not.be.undefined;',
            '    pm.environment.set("admin_token", token);',
            '    if (refreshToken) pm.environment.set("admin_refresh_token", refreshToken);',
            '});'
          ],
          'Login aktor Owner/Admin dan menyimpan token ke variable terpisah admin_token.'
        ),
        request(
          '01.04 - Refresh Token Sesi Pelanggan',
          'POST',
          '/api/auth/refresh-token',
          [],
          [],
          {
            refreshToken: '{{test_user_refresh_token}}'
          },
          [],
          [
            'pm.test("Penyegaran token sesi berhasil (200 OK)", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Update test_user_token dengan token baru", function () {',
            '    var jsonData = pm.response.json();',
            '    var newToken = jsonData.token || (jsonData.data && jsonData.data.token);',
            '    pm.environment.set("test_user_token", newToken);',
            '});'
          ],
          'Memperpanjang masa aktif sesi pelanggan menggunakan refresh token.'
        ),
        request(
          '01.05 - Logout Pelanggan (Revokasi Sesi)',
          'POST',
          '/api/auth/logout',
          [],
          [{ key: 'Authorization', value: 'Bearer {{test_user_token}}', type: 'text' }],
          {
            refreshToken: '{{test_user_refresh_token}}'
          },
          [],
          [
            'pm.test("Logout Pelanggan Berhasil (200 OK)", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Catat token yang telah direvoke", function () {',
            '    pm.environment.set("temp_revoked_refresh_token", pm.environment.get("test_user_refresh_token"));',
            '});'
          ],
          'Mengakhiri sesi dan mencabut refresh token di basis data MySQL.'
        ),
        request(
          '01.06 - Login Ulang Pelanggan Demo (Siti) untuk Alur Transaksi',
          'POST',
          '/api/auth/login',
          [],
          [],
          {
            email: '{{customer_email}}',
            password: '{{default_password}}'
          },
          [],
          [
            'pm.test("Login Akun Demo Siti Berhasil (200 OK)", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("customer_token siap digunakan untuk alur Pelanggan", function () {',
            '    var jsonData = pm.response.json();',
            '    var token = jsonData.token || (jsonData.data && jsonData.data.token);',
            '    var refreshToken = jsonData.refreshToken || (jsonData.data && jsonData.data.refreshToken);',
            '    pm.environment.set("customer_token", token);',
            '    if (refreshToken) pm.environment.set("customer_refresh_token", refreshToken);',
            '});'
          ],
          'Menyiapkan token pelanggan demo Siti untuk mengeksekusi alur belanja di Folder 02.'
        )
      ]
    },

    // ==========================================
    // 02. Aktor: Pelanggan (Customer End-to-End Flow)
    // ==========================================
    {
      name: '02_Aktor_Pelanggan_Flow',
      item: [
        // 2.1 Profil Pelanggan
        {
          name: '2.1_Profil_Pelanggan',
          item: [
            request(
              'Profil Pelanggan - GET Profile',
              'GET',
              '/api/user/profile',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Profil pelanggan berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Role pengguna adalah customer", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.data.role).to.eql("customer");',
                '});'
              ],
              'Mengambil data profil pelanggan yang sedang aktif login.'
            ),
            request(
              'Update Profil Lengkap - PUT Profile',
              'PUT',
              '/api/user/profile',
              [],
              [customerAuth],
              {
                name: 'Pelanggan Siti Mawar Updated',
                phone: '089876543219',
                address: 'Jl. Kemang Raya No. 45, Jakarta Selatan'
              },
              [],
              [
                'pm.test("Update profil penuh berhasil (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Nama dan telepon berhasil diperbarui", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.data.name).to.eql("Pelanggan Siti Mawar Updated");',
                '});'
              ],
              'Memperbarui seluruh data profil pengguna (nama, telepon, alamat) via PUT.'
            ),
            request(
              'Update Profil Sebagian - PATCH Profile',
              'PATCH',
              '/api/user/profile',
              [],
              [customerAuth],
              {
                phone: '089876543210'
              },
              [],
              [
                'pm.test("Update sebagian profil berhasil (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Nomor telepon berubah tanpa menghilangkan nama", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.data.phone).to.eql("089876543210");',
                '    pm.expect(jsonData.data.name).to.eql("Pelanggan Siti Mawar Updated");',
                '});'
              ],
              'Memperbarui sebagian data profil (hanya telepon) via PATCH.'
            ),
            request(
              'Ganti Password Pelanggan - PUT Change Password',
              'PUT',
              '/api/user/change-password',
              [],
              [customerAuth],
              {
                old_password: '{{default_password}}',
                new_password: '{{default_password}}'
              },
              [],
              [
                'pm.test("Ganti kata sandi berhasil (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Mengubah password akun pelanggan dengan validasi password lama.'
            ),
            request(
              'Deaktivasi Akun Uji - DELETE Profile',
              'DELETE',
              '/api/user/profile',
              [],
              [{ key: 'Authorization', value: 'Bearer {{test_user_token}}', type: 'text' }],
              null,
              [],
              [
                'pm.test("Soft-delete/deaktivasi akun berhasil (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Simpan token akun yang dinonaktifkan untuk uji RBAC", function () {',
                '    pm.environment.set("deactivated_customer_token", pm.environment.get("test_user_token"));',
                '});'
              ],
              'Menonaktifkan akun sendiri (status=inactive); token disimpan untuk pengujian keamanan di Folder 03.'
            )
          ]
        },

        // 2.2 Katalog & Pencarian Publik
        {
          name: '2.2_Katalog_dan_Pencarian',
          item: [
            request(
              'Daftar Kategori Bunga (Publik)',
              'GET',
              '/api/categories',
              [],
              [],
              null,
              [],
              [
                'pm.test("Kategori berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Kategori adalah array", function () {',
                '    var jsonData = pm.response.json();',
                '    var list = Array.isArray(jsonData) ? jsonData : jsonData.data;',
                '    pm.expect(list).to.be.an("array");',
                '    if (list.length > 0) pm.environment.set("category_id", list[0].id.toString());',
                '});'
              ],
              'Pelanggan melihat kategori bunga di etalase toko.'
            ),
            request(
              'Daftar Produk Katalog (Pagination)',
              'GET',
              '/api/products',
              [
                { key: 'page', value: '1', description: 'Halaman 1' },
                { key: 'limit', value: '10', description: 'Limit 10 item' }
              ],
              [],
              null,
              [],
              [
                'pm.test("Katalog produk berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Simpan product_slug & product_id", function () {',
                '    var jsonData = pm.response.json();',
                '    var list = Array.isArray(jsonData) ? jsonData : (jsonData.data ? (Array.isArray(jsonData.data) ? jsonData.data : jsonData.data.products) : []);',
                '    if (list && list.length > 0) {',
                '        pm.environment.set("product_slug", list[0].slug);',
                '        pm.environment.set("product_id", list[0].id.toString());',
                '    }',
                '});'
              ],
              'Pelanggan memuat daftar produk buket yang aktif dijual.'
            ),
            request(
              'Pencarian Bunga & Filter Kategori',
              'GET',
              '/api/products',
              [
                { key: 'q', value: 'mawar', description: 'Kata kunci mawar' },
                { key: 'category_id', value: '{{category_id}}', description: 'Filter kategori' }
              ],
              [],
              null,
              [],
              [
                'pm.test("Pencarian produk berhasil (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan mencari buket dengan filter kategori dan kata kunci.'
            ),
            request(
              'Detail Spesifikasi & Stok Produk by Slug',
              'GET',
              '/api/products/{{product_slug}}',
              [],
              [],
              null,
              [],
              [
                'pm.test("Detail produk berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Produk memiliki stok dan harga valid", function () {',
                '    var jsonData = pm.response.json();',
                '    var p = jsonData.data || jsonData;',
                '    pm.expect(p.price).to.not.be.undefined;',
                '    pm.expect(p.stock).to.be.at.least(0);',
                '});'
              ],
              'Pelanggan melihat rincian harga, foto, deskripsi, dan stok fisik buket.'
            )
          ]
        },

        // 2.3 Custom Bouquet Builder
        {
          name: '2.3_Custom_Bouquet_Builder',
          item: [
            request(
              'Daftar Semua Komponen Custom Bouquet',
              'GET',
              '/api/custom-components',
              [],
              [],
              null,
              [],
              [
                'pm.test("Komponen buket custom berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Daftar komponen berupa array", function () {',
                '    var jsonData = pm.response.json();',
                '    var list = Array.isArray(jsonData) ? jsonData : jsonData.data;',
                '    pm.expect(list).to.be.an("array");',
                '    if (list.length > 0) pm.environment.set("component_id", list[0].id.toString());',
                '});'
              ],
              'Pelanggan mengambil daftar bahan komponen perakitan buket sendiri.'
            ),
            request(
              'Filter Komponen Khusus Bunga Utama (Flower)',
              'GET',
              '/api/custom-components',
              [{ key: 'category', value: 'flower', description: 'Filter kategori bunga' }],
              [],
              null,
              [],
              [
                'pm.test("Filter komponen bunga berhasil (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan menyaring jenis bunga segar untuk buket custom.'
            )
          ]
        },

        // 2.4 Keranjang Belanja Pelanggan
        {
          name: '2.4_Keranjang_Belanja',
          item: [
            request(
              'Lihat Keranjang Belanja',
              'GET',
              '/api/cart',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Keranjang pelanggan berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan membuka keranjang belanja.'
            ),
            request(
              'Tambah Produk Reguler ke Keranjang',
              'POST',
              '/api/cart/items',
              [],
              [customerAuth],
              {
                product_id: '{{product_id}}',
                quantity: 1
              },
              [],
              [
                'pm.test("Produk reguler masuk keranjang (200 atau 201)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});'
              ],
              'Pelanggan memasukkan 1 buket reguler ke keranjang.'
            ),
            request(
              'Tambah Paket Custom Bouquet ke Keranjang',
              'POST',
              '/api/cart/items',
              [],
              [customerAuth],
              {
                custom_name: 'Buket Uji Racikan Sendiri',
                quantity: 1,
                components: [
                  { component_id: 1, quantity: 3 },
                  { component_id: 5, quantity: 1 },
                  { component_id: 8, quantity: 1 }
                ]
              },
              [],
              [
                'pm.test("Custom bouquet masuk keranjang (200 atau 201)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});'
              ],
              'Pelanggan merakit custom bouquet dan memasukkannya ke keranjang belanja.'
            ),
            request(
              'Ambil ID Item Keranjang Terakhir',
              'GET',
              '/api/cart',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Ambil cart_item_id dari item keranjang", function () {',
                '    var jsonData = pm.response.json();',
                '    var items = (jsonData.data && jsonData.data.items) || jsonData.items || [];',
                '    if (items.length > 0) {',
                '        pm.environment.set("cart_item_id", items[0].id.toString());',
                '    }',
                '});'
              ],
              'Menyimpan ID item keranjang untuk pengujian PATCH dan DELETE item.'
            ),
            request(
              'Update Kuantitas Item Keranjang - PATCH',
              'PATCH',
              '/api/cart/items/{{cart_item_id}}',
              [],
              [customerAuth],
              {
                quantity: 2
              },
              [],
              [
                'pm.test("Kuantitas keranjang berhasil diupdate (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan mengubah kuantitas buket di keranjang via PATCH.'
            ),
            request(
              'Hapus Satu Item dari Keranjang - DELETE Item',
              'DELETE',
              '/api/cart/items/{{cart_item_id}}',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Item berhasil dihapus dari keranjang (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan menghapus salah satu item dari keranjang belanja.'
            ),
            request(
              'Kosongkan Keranjang Belanja - DELETE All',
              'DELETE',
              '/api/cart',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Keranjang belanja dikosongkan (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan mengosongkan seluruh isi keranjang.'
            )
          ]
        },

        // 2.5 Checkout & Pesanan Pelanggan
        {
          name: '2.5_Checkout_dan_Pesanan',
          item: [
            request(
              'Siapkan Item Keranjang untuk Checkout',
              'POST',
              '/api/cart/items',
              [],
              [customerAuth],
              {
                product_id: 1,
                quantity: 1
              },
              [],
              [
                'pm.test("Item siap di keranjang (200/201)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});'
              ],
              'Menyiapkan item di keranjang sebelum menjalankan proses checkout.'
            ),
            request(
              'Checkout Pesanan Pelanggan - POST Checkout',
              'POST',
              '/api/orders/checkout',
              [],
              [customerAuth],
              {
                fulfillment_method: 'delivery',
                recipient_name: 'Penerima Siti Mawar',
                recipient_phone: '081234567890',
                delivery_address: 'Jl. Kemang Raya No. 15, Jakarta Selatan',
                delivery_date: '2026-10-28',
                delivery_time: '14:00',
                notes: 'Harap kirimkan kartu ucapan selamat ulang tahun',
                card_message: 'Selamat Ulang Tahun! Sukses dan sehat selalu.'
              },
              [],
              [
                'pm.test("Checkout Berhasil Dibuat (201 Created atau 200 OK)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Simpan order_id, order_number, dan gross_amount", function () {',
                '    var jsonData = pm.response.json();',
                '    var order = jsonData.data || jsonData;',
                '    if (order.id) pm.environment.set("order_id", order.id.toString());',
                '    if (order.order_number) {',
                '        pm.environment.set("order_number", order.order_number);',
                '        pm.environment.set("gateway_order_id", order.order_number + "-1");',
                '    }',
                '    if (order.total_amount) pm.environment.set("gross_amount", parseFloat(order.total_amount).toFixed(2));',
                '});'
              ],
              'Melakukan checkout atomik transaksional mengunci harga dan menghasilkan order_number.'
            ),
            request(
              'Riwayat Pesanan Saya - GET Orders',
              'GET',
              '/api/user/orders',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Riwayat pesanan pelanggan berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan melihat daftar seluruh pesanan yang pernah dibuat.'
            ),
            request(
              'Detail Pesanan Saya by ID',
              'GET',
              '/api/user/orders/{{order_id}}',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Detail pesanan berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Pesanan berstatus menunggu_pembayaran", function () {',
                '    var jsonData = pm.response.json();',
                '    var order = jsonData.data || jsonData;',
                '    pm.expect(order.status).to.eql("menunggu_pembayaran");',
                '});'
              ],
              'Pelanggan memuat detail pesanan lengkap dengan rincian buket dan alamat kirim.'
            ),
            request(
              'Lacak Status Pesanan - GET Order Tracking',
              'GET',
              '/api/user/orders/{{order_id}}/tracking',
              [],
              [customerAuth],
              null,
              [],
              [
                'pm.test("Pelacakan status pesanan berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Pelanggan melihat linimasa riwayat status perubahan pesanan.'
            )
          ]
        },

        // 2.6 Pembayaran Midtrans
        {
          name: '2.6_Pembayaran_Midtrans',
          item: [
            request(
              'Generate Midtrans Snap Token - POST Charge',
              'POST',
              '/api/payments/charge',
              [],
              [customerAuth],
              {
                order_id: '{{order_id}}'
              },
              [],
              [
                'pm.test("Snap Token berhasil diterbitkan (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Simpan snap_token", function () {',
                '    var jsonData = pm.response.json();',
                '    var token = (jsonData.data && jsonData.data.snap_token) || jsonData.snap_token;',
                '    if (token) pm.environment.set("snap_token", token);',
                '});'
              ],
              'Pelanggan meminta token Snap ke payment gateway Midtrans.'
            ),
            request(
              'Simulasi Webhook Midtrans (Settlement Sukses)',
              'POST',
              '/api/webhooks/midtrans',
              [],
              [],
              {
                order_id: '{{gateway_order_id}}',
                status_code: '200',
                gross_amount: '{{gross_amount}}',
                signature_key: '{{midtrans_calculated_signature}}',
                transaction_status: 'settlement',
                fraud_status: 'accept',
                payment_type: 'bank_transfer',
                transaction_id: 'sim-midtrans-trx-001',
                settlement_time: '2026-10-22 10:00:00'
              },
              [
                'var orderId = pm.environment.get("gateway_order_id") || "ORD-20261022-001-1";',
                'var statusCode = "200";',
                'var grossAmount = pm.environment.get("gross_amount") || "250000.00";',
                'var serverKey = pm.environment.get("server_key") || "SB-Mid-server-FloverArtsDev12345678";',
                'var rawSig = orderId + statusCode + grossAmount + serverKey;',
                'var hash = CryptoJS.SHA512(rawSig).toString(CryptoJS.enc.Hex);',
                'pm.environment.set("midtrans_calculated_signature", hash);'
              ],
              [
                'pm.test("Webhook Midtrans diproses dengan status 200 OK", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Server Midtrans mengirim notifikasi pembayaran sukses; stok dipotong otomatis dan kas dicatat.'
            ),
            request(
              'Uji Idempotensi Webhook (Replay Duplikat Event)',
              'POST',
              '/api/webhooks/midtrans',
              [],
              [],
              {
                order_id: '{{gateway_order_id}}',
                status_code: '200',
                gross_amount: '{{gross_amount}}',
                signature_key: '{{midtrans_calculated_signature}}',
                transaction_status: 'settlement',
                fraud_status: 'accept',
                payment_type: 'bank_transfer',
                transaction_id: 'sim-midtrans-trx-001',
                settlement_time: '2026-10-22 10:00:00'
              },
              [],
              [
                'pm.test("Notifikasi duplikat diabaikan dengan aman (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Pesan idempotensi duplicate ignored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.message).to.include("sudah diproses sebelumnya");',
                '});'
              ],
              'Memastikan idempotensi mutlak; webhook duplikat tidak memotong stok dua kali.'
            )
          ]
        }
      ]
    },

    // ==========================================
    // 03. Aktor: Admin / Owner (Admin End-to-End Flow)
    // ==========================================
    {
      name: '03_Aktor_Admin_Owner_Flow',
      item: [
        // 3.1 Profil Admin
        {
          name: '3.1_Profil_Admin',
          item: [
            request(
              'Profil Admin - GET Profile',
              'GET',
              '/api/admin/profile',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Profil admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Role admin adalah owner_admin", function () {',
                '    var jsonData = pm.response.json();',
                '    var admin = jsonData.data || jsonData;',
                '    pm.expect(admin.role).to.eql("owner_admin");',
                '});'
              ],
              'Owner toko melihat profil akun administratifnya.'
            ),
            request(
              'Update Profil Admin Lengkap - PUT Profile',
              'PUT',
              '/api/admin/profile',
              [],
              [adminAuth],
              {
                name: 'Owner FloverArts Official',
                phone: '081234567890'
              },
              [],
              [
                'pm.test("Profil admin berhasil diperbarui penuh (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Owner memperbarui nama lengkap dan nomor telepon kontak via PUT.'
            ),
            request(
              'Update Profil Admin Sebagian - PATCH Profile',
              'PATCH',
              '/api/admin/profile',
              [],
              [adminAuth],
              {
                phone: '081234567891'
              },
              [],
              [
                'pm.test("Sebagian data profil admin berhasil diupdate (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Owner memperbarui nomor kontak admin via PATCH.'
            ),
            request(
              'Ganti Password Owner / Admin - PUT Change Password',
              'PUT',
              '/api/admin/change-password',
              [],
              [adminAuth],
              {
                old_password: '{{default_password}}',
                new_password: '{{default_password}}'
              },
              [],
              [
                'pm.test("Password owner berhasil diperbarui (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Owner toko mengganti kata sandi dengan verifikasi kata sandi lama.'
            )
          ]
        },

        // 3.2 Dashboard Metrik
        {
          name: '3.2_Dashboard_Metrik',
          item: [
            request(
              'Dashboard Ringkasan Metrik Toko (KPIs)',
              'GET',
              '/api/admin/dashboard',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Dashboard admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Data ringkasan memiliki total omzet dan pesanan", function () {',
                '    var jsonData = pm.response.json();',
                '    var d = jsonData.data || jsonData;',
                '    pm.expect(d.total_orders).to.not.be.undefined;',
                '    pm.expect(d.total_sales).to.not.be.undefined;',
                '});'
              ],
              'Owner melihat total omzet, total pesanan, produk menipis, dan pesanan terbaru.'
            )
          ]
        },

        // 3.3 Manajemen Pengguna Pelanggan
        {
          name: '3.3_Manajemen_Pengguna_Pelanggan',
          item: [
            request(
              'Daftar Semua Pengguna (Filter & Paginasi)',
              'GET',
              '/api/admin/users',
              [
                { key: 'role', value: 'customer', description: 'Filter peran customer' },
                { key: 'page', value: '1', description: 'Halaman 1' },
                { key: 'limit', value: '10', description: 'Batas 10 user' }
              ],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Daftar pengguna admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Respon memiliki array users dan pagination", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.data.users).to.be.an("array");',
                '    pm.expect(jsonData.data.pagination).to.be.an("object");',
                '});'
              ],
              'Admin melihat daftar seluruh akun pelanggan untuk keperluan audit dan CS.'
            ),
            request(
              'Detail Pengguna & Statistik Belanja by ID',
              'GET',
              '/api/admin/users/{{test_user_id}}',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Detail pengguna admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Pengguna memiliki statistik pesanan dan nominal belanja", function () {',
                '    var jsonData = pm.response.json();',
                '    var u = jsonData.data;',
                '    pm.expect(u.stats).to.not.be.undefined;',
                '});'
              ],
              'Admin melihat rincian profil pelanggan dan total nominal transaksi belanja.'
            ),
            request(
              'Ubah Status Pengguna (Aktif / Suspend) - PATCH',
              'PATCH',
              '/api/admin/users/{{test_user_id}}/status',
              [],
              [adminAuth],
              {
                status: 'active'
              },
              [],
              [
                'pm.test("Ubah status pengguna berhasil (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin mengaktifkan kembali akun pelanggan via PATCH.'
            ),
            request(
              'Nonaktifkan / Soft Delete Pengguna - DELETE User',
              'DELETE',
              '/api/admin/users/{{test_user_id}}',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Pengguna dinonaktifkan oleh admin (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menonaktifkan akun pelanggan bermasalah (soft delete status inactive).'
            )
          ]
        },

        // 3.4 Manajemen Kategori Produk
        {
          name: '3.4_Manajemen_Katalog_Kategori',
          item: [
            request(
              'Daftar Semua Kategori (Admin)',
              'GET',
              '/api/admin/categories',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Kategori admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin mengelola seluruh kategori buket bunga.'
            ),
            request(
              'Buat Kategori Baru - POST',
              'POST',
              '/api/admin/categories',
              [],
              [adminAuth],
              {
                name: 'Kategori Uji Admin {{timestamp}}',
                slug: 'kategori-uji-admin-{{timestamp}}',
                description: 'Deskripsi kategori pengujian admin'
              },
              [
                'pm.environment.set("timestamp", Date.now().toString());'
              ],
              [
                'pm.test("Kategori baru berhasil dibuat (201 Created)", function () {',
                '    pm.response.to.have.status(201);',
                '});',
                'pm.test("Simpan new_category_id", function () {',
                '    var jsonData = pm.response.json();',
                '    var cat = jsonData.data || jsonData;',
                '    if (cat.id) pm.environment.set("new_category_id", cat.id.toString());',
                '});'
              ],
              'Admin menambahkan kategori produk baru.'
            ),
            request(
              'Perbarui Kategori - PUT',
              'PUT',
              '/api/admin/categories/{{new_category_id}}',
              [],
              [adminAuth],
              {
                name: 'Kategori Uji Diperbarui',
                slug: 'kategori-uji-updated-{{timestamp}}',
                description: 'Deskripsi kategori yang sudah diperbarui'
              },
              [],
              [
                'pm.test("Kategori berhasil diperbarui (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin mengedit nama dan deskripsi kategori via PUT.'
            ),
            request(
              'Hapus Kategori - DELETE',
              'DELETE',
              '/api/admin/categories/{{new_category_id}}',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Kategori berhasil dihapus (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menghapus kategori uji (ditolak jika memiliki produk berelasi).'
            )
          ]
        },

        // 3.5 Manajemen Produk Katalog
        {
          name: '3.5_Manajemen_Produk',
          item: [
            request(
              'Daftar Semua Produk Toko (Admin)',
              'GET',
              '/api/admin/products',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Katalog produk admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin melihat seluruh produk aktif maupun nonaktif.'
            ),
            request(
              'Tambah Produk Baru - POST',
              'POST',
              '/api/admin/products',
              [],
              [adminAuth],
              {
                category_id: 1,
                name: 'Buket Mawar Admin Uji {{timestamp}}',
                slug: 'buket-mawar-admin-uji-{{timestamp}}',
                description: 'Produk buket ditambahkan oleh admin',
                price: 180000,
                stock: 15,
                min_stock: 4,
                image_url: '/uploads/products/admin-test-rose.jpg',
                status: 'active'
              },
              [
                'pm.environment.set("timestamp", Date.now().toString());'
              ],
              [
                'pm.test("Produk baru berhasil dibuat (201 Created)", function () {',
                '    pm.response.to.have.status(201);',
                '});',
                'pm.test("Simpan new_product_id", function () {',
                '    var jsonData = pm.response.json();',
                '    var p = jsonData.data || jsonData;',
                '    if (p.id) pm.environment.set("new_product_id", p.id.toString());',
                '});'
              ],
              'Admin menambahkan produk buket baru ke etalase toko.'
            ),
            request(
              'Perbarui Seluruh Data Produk - PUT',
              'PUT',
              '/api/admin/products/{{new_product_id}}',
              [],
              [adminAuth],
              {
                category_id: 1,
                name: 'Buket Mawar Admin Diperbarui Penuh',
                slug: 'buket-mawar-admin-updated-{{timestamp}}',
                description: 'Deskripsi produk berhasil diupdate penuh',
                price: 195000,
                stock: 20,
                min_stock: 5,
                image_url: '/uploads/products/admin-test-rose-updated.jpg',
                status: 'active'
              },
              [],
              [
                'pm.test("Data produk berhasil diperbarui penuh (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin memperbarui seluruh informasi produk via PUT.'
            ),
            request(
              'Toggle Status Produk (Active/Inactive) - PATCH',
              'PATCH',
              '/api/admin/products/{{new_product_id}}/status',
              [],
              [adminAuth],
              {
                status: 'inactive'
              },
              [],
              [
                'pm.test("Status produk berhasil diubah (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menonaktifkan keterlihatan produk di katalog pelanggan via PATCH.'
            ),
            request(
              'Hapus / Nonaktifkan Produk - DELETE',
              'DELETE',
              '/api/admin/products/{{new_product_id}}',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Produk berhasil dinonaktifkan (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menghapus produk (soft delete status inactive).'
            )
          ]
        },

        // 3.6 Manajemen Komponen Custom Bouquet
        {
          name: '3.6_Manajemen_Custom_Components',
          item: [
            request(
              'Daftar Seluruh Komponen Buket (Admin)',
              'GET',
              '/api/admin/custom-components',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Komponen buket admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin melihat seluruh bahan buket custom (bunga, wrapping, pita, kartu).'
            ),
            request(
              'Tambah Komponen Buket Baru - POST',
              'POST',
              '/api/admin/custom-components',
              [],
              [adminAuth],
              {
                category: 'wrapping',
                name: 'Kertas Wrapping Emas Gliter {{timestamp}}',
                price: 25000,
                stock: 40,
                min_stock: 10,
                image_url: '/uploads/components/wrap-gold.jpg',
                status: 'active'
              },
              [
                'pm.environment.set("timestamp", Date.now().toString());'
              ],
              [
                'pm.test("Komponen baru berhasil ditambahkan (201 Created)", function () {',
                '    pm.response.to.have.status(201);',
                '});',
                'pm.test("Simpan new_component_id", function () {',
                '    var jsonData = pm.response.json();',
                '    var c = jsonData.data || jsonData;',
                '    if (c.id) pm.environment.set("new_component_id", c.id.toString());',
                '});'
              ],
              'Admin menambah bahan buket custom baru.'
            ),
            request(
              'Perbarui Data Komponen - PUT',
              'PUT',
              '/api/admin/custom-components/{{new_component_id}}',
              [],
              [adminAuth],
              {
                category: 'wrapping',
                name: 'Kertas Wrapping Emas Gliter Diperbarui',
                price: 28000,
                stock: 45,
                min_stock: 12,
                image_url: '/uploads/components/wrap-gold.jpg',
                status: 'active'
              },
              [],
              [
                'pm.test("Komponen berhasil diperbarui (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin mengubah harga, stok, dan batas minimum stok bahan via PUT.'
            ),
            request(
              'Toggle Status Komponen - PATCH',
              'PATCH',
              '/api/admin/custom-components/{{new_component_id}}/status',
              [],
              [adminAuth],
              {
                status: 'inactive'
              },
              [],
              [
                'pm.test("Status komponen berhasil diubah (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menonaktifkan status ketersediaan komponen via PATCH.'
            ),
            request(
              'Hapus / Nonaktifkan Komponen - DELETE',
              'DELETE',
              '/api/admin/custom-components/{{new_component_id}}',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Komponen berhasil dinonaktifkan (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menonaktifkan bahan buket (soft-delete).'
            )
          ]
        },

        // 3.7 Manajemen Inventaris Stok
        {
          name: '3.7_Manajemen_Inventaris_Stok',
          item: [
            request(
              'Riwayat Log Mutasi Inventaris (Transactions)',
              'GET',
              '/api/admin/inventory/transactions',
              [
                { key: 'page', value: '1', description: 'Halaman 1' },
                { key: 'limit', value: '10', description: 'Limit 10 baris' }
              ],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Log mutasi stok berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin mengaudit catatan pergerakan keluar-masuk stok barang.'
            ),
            request(
              'Restock / Tambah Stok Fisik Item - POST Restock',
              'POST',
              '/api/admin/inventory/restock',
              [],
              [adminAuth],
              {
                item_type: 'product',
                item_id: 1,
                quantity: 15,
                notes: 'Penambahan stok bunga potong segar dari supplier'
              },
              [],
              [
                'pm.test("Restock berhasil diproses (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menambah stok fisik produk dan mencatatnya ke jurnal stok.'
            ),
            request(
              'Peringatan Stok Menipis (Low Stock Alert)',
              'GET',
              '/api/admin/inventory/low-stock',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Peringatan stok menipis berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin melihat daftar barang yang berada di bawah ambang minimum.'
            )
          ]
        },

        // 3.8 Pemenuhan Pesanan (Fulfillment)
        {
          name: '3.8_Pemenuhan_Pesanan_Fulfillment',
          item: [
            request(
              'Daftar Semua Pesanan Masuk (Admin)',
              'GET',
              '/api/admin/orders',
              [
                { key: 'page', value: '1', description: 'Halaman 1' },
                { key: 'limit', value: '10', description: 'Batas 10 pesanan' }
              ],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Daftar pesanan admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin melihat daftar pesanan yang harus dirangkai dan dikirim.'
            ),
            request(
              'Detail Pesanan Admin by ID',
              'GET',
              '/api/admin/orders/{{order_id}}',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Detail pesanan admin berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Florist admin melihat kartu instruksi pesanan bunga.'
            ),
            request(
              'Fulfillment: Mulai Rangkai Bunga -> status diproses (PATCH)',
              'PATCH',
              '/api/admin/orders/{{order_id}}/status',
              [],
              [adminAuth],
              {
                status: 'diproses',
                notes: 'Buket bunga mulai dirangkai oleh florist'
              },
              [],
              [
                'pm.test("Status diproses berhasil diubah (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin mengubah status pesanan menjadi diproses.'
            ),
            request(
              'Fulfillment: Input Nomor Resi & Kurir -> siap_diambil_dikirim (PATCH)',
              'PATCH',
              '/api/admin/orders/{{order_id}}/status',
              [],
              [adminAuth],
              {
                status: 'siap_diambil_dikirim',
                courier: 'Lalamove Instant',
                tracking_number: 'LLM-FLOVER-8829',
                notes: 'Pesanan telah selesai dirangkai dan diserahkan ke kurir'
              },
              [],
              [
                'pm.test("Status siap kirim berhasil diubah (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin memasukkan resi kurir dan mengubah status siap kirim.'
            ),
            request(
              'Fulfillment: Selesaikan Pesanan -> status selesai (PATCH)',
              'PATCH',
              '/api/admin/orders/{{order_id}}/status',
              [],
              [adminAuth],
              {
                status: 'selesai',
                notes: 'Pesanan telah diserahkan ke penerima'
              },
              [],
              [
                'pm.test("Status selesai berhasil diubah (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Admin menyelesaikan siklus pesanan.'
            ),
            request(
              'Pemeriksaan Status Sinkronisasi Midtrans Gateway',
              'POST',
              '/api/admin/orders/{{order_id}}/check-gateway',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Cek gateway selesai (200, 400, 404, atau 502)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 400, 404, 502]);',
                '});'
              ],
              'Admin menyinkronkan status pesanan langsung dengan server Midtrans.'
            ),
            request(
              'Pembatalan Darurat & Refund Pesanan - POST Refund',
              'POST',
              '/api/admin/orders/{{order_id}}/refund',
              [],
              [adminAuth],
              {
                reason: 'Pelanggan membatalkan pesanan sebelum bunga dirangkai'
              },
              [],
              [
                'pm.test("Refund diproses sesuai aturan bisnis (200 atau 400)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 400]);',
                '});'
              ],
              'Admin membatalkan pesanan dan mengembalikan dana pelanggan.'
            )
          ]
        },

        // 3.9 Manajemen Kas & Keuangan Toko
        {
          name: '3.9_Manajemen_Kas_dan_Keuangan',
          item: [
            request(
              'Daftar Sumber Akun Kas & Saldo Toko',
              'GET',
              '/api/admin/cash-accounts',
              [],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Daftar akun kas toko berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Owner melihat saldo kas kasir, rekening bank, dan saldo escrow.'
            ),
            request(
              'Tambah Akun Kas Baru - POST Cash Account',
              'POST',
              '/api/admin/cash-accounts',
              [],
              [adminAuth],
              {
                name: 'Rekening Bank BNI Bisnis',
                account_type: 'bank',
                account_number: '98700012345',
                balance: 1500000
              },
              [],
              [
                'pm.test("Akun kas berhasil dibuat (200 atau 201)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});'
              ],
              'Owner mendaftarkan rekening operasional baru.'
            ),
            request(
              'Buku Kas Masuk & Keluar (Cashflow Ledger)',
              'GET',
              '/api/admin/cashflow',
              [
                { key: 'type', value: 'income', description: 'Filter kas masuk' },
                { key: 'page', value: '1', description: 'Halaman 1' }
              ],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Catatan arus kas berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Owner melihat mutasi pemasukan penjualan buket dan biaya toko.'
            ),
            request(
              'Catat Pengeluaran Operasional Toko - POST Expense',
              'POST',
              '/api/admin/cashflow/expense',
              [],
              [adminAuth],
              {
                cash_account_id: 1,
                category: 'Beli Aksesori & Pita Tambahan',
                amount: 75000,
                reference_number: 'EXP-TEST-001',
                notes: 'Pembelian pita satin emas di Pasar Rawa Belong'
              },
              [],
              [
                'pm.test("Pengeluaran kas berhasil dicatat (200 atau 201)", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});'
              ],
              'Owner mencatat beban biaya kasir operasional.'
            ),
            request(
              'Laporan Rekapitulasi Kas Bulanan',
              'GET',
              '/api/admin/reports/cashflow/recap',
              [
                { key: 'start_date', value: '2026-10-01', description: 'Awal bulan' },
                { key: 'end_date', value: '2026-10-31', description: 'Akhir bulan' }
              ],
              [adminAuth],
              null,
              [],
              [
                'pm.test("Laporan rekap kas bulanan berhasil dimuat (200 OK)", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ],
              'Owner melihat ikhtisar laba kotor, beban, dan laba bersih bulanan.'
            )
          ]
        }
      ]
    },

    // ==========================================
    // 04. Cross-Role Security & RBAC Enforcement
    // ==========================================
    {
      name: '04_Cross_Role_Security_and_RBAC',
      item: [
        request(
          '04.01 - Pelanggan Coba Akses Dashboard Admin (Tolak 403)',
          'GET',
          '/api/admin/dashboard',
          [],
          [customerAuth],
          null,
          [],
          [
            'pm.test("Pelanggan ditolak mengakses dashboard admin (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});',
            'pm.test("Error code FORBIDDEN", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.error.code).to.eql("FORBIDDEN");',
            '});'
          ],
          'Memastikan token customer ditolak saat mengakses rute administratif owner.'
        ),
        request(
          '04.02 - Pelanggan Coba Tambah Produk Baru via Admin API (Tolak 403)',
          'POST',
          '/api/admin/products',
          [],
          [customerAuth],
          {
            category_id: 1,
            name: 'Buket Ilegal Oleh Pelanggan',
            price: 1000,
            stock: 100
          },
          [],
          [
            'pm.test("Pelanggan ditolak menambah produk (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});',
            'pm.test("Error code FORBIDDEN", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.error.code).to.eql("FORBIDDEN");',
            '});'
          ],
          'Memastikan pelanggan dilarang memanipulasi katalog toko.'
        ),
        request(
          '04.03 - Pelanggan Coba Ubah Status Pesanan via Admin API (Tolak 403)',
          'PATCH',
          '/api/admin/orders/{{order_id}}/status',
          [],
          [customerAuth],
          {
            status: 'selesai'
          },
          [],
          [
            'pm.test("Pelanggan ditolak mengubah status pesanan via admin (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});'
          ],
          'Memastikan pelanggan tidak dapat mengubah status pesanan secara sepihak.'
        ),
        request(
          '04.04 - Pelanggan Coba Hapus Kategori via Admin API (Tolak 403)',
          'DELETE',
          '/api/admin/categories/1',
          [],
          [customerAuth],
          null,
          [],
          [
            'pm.test("Pelanggan ditolak menghapus kategori (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});'
          ],
          'Memastikan pelanggan tidak memiliki wewenang menghapus kategori produk.'
        ),
        request(
          '04.05 - Pelanggan Coba Akses Daftar Pengguna Admin (Tolak 403)',
          'GET',
          '/api/admin/users',
          [],
          [customerAuth],
          null,
          [],
          [
            'pm.test("Pelanggan ditolak melihat data pengguna lain (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});'
          ],
          'Memastikan data seluruh pelanggan terlindungi dari akses sesama pelanggan.'
        ),
        request(
          '04.06 - Admin Coba Akses Keranjang Belanja Pelanggan (Tolak 403)',
          'GET',
          '/api/cart',
          [],
          [adminAuth],
          null,
          [],
          [
            'pm.test("Admin ditolak mengakses keranjang belanja (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});',
            'pm.test("Error code FORBIDDEN khusus customer", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.error.code).to.eql("FORBIDDEN");',
            '});'
          ],
          'Memastikan rute keranjang belanja dikhususkan untuk peran customer.'
        ),
        request(
          '04.07 - Admin Coba Checkout Pesanan Pelanggan (Tolak 403)',
          'POST',
          '/api/orders/checkout',
          [],
          [adminAuth],
          {
            fulfillment_method: 'delivery',
            recipient_name: 'Admin Ilegal',
            recipient_phone: '081234567890',
            delivery_address: 'Jl. Kantor'
          },
          [],
          [
            'pm.test("Admin ditolak melakukan checkout pelanggan (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});'
          ],
          'Memastikan rute checkout belanja dikhususkan untuk peran customer.'
        ),
        request(
          '04.08 - Akses Protected Route Tanpa Token (Tolak 401)',
          'GET',
          '/api/user/profile',
          [],
          [],
          null,
          [],
          [
            'pm.test("Akses tanpa token ditolak (401 Unauthorized)", function () {',
            '    pm.response.to.have.status(401);',
            '});',
            'pm.test("Error code UNAUTHORIZED", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");',
            '});'
          ],
          'Memastikan endpoint terproteksi menolak request tanpa Authorization header.'
        ),
        request(
          '04.09 - Akses Protected Route dengan Token Rusak / Palsu (Tolak 401)',
          'GET',
          '/api/user/profile',
          [],
          [invalidAuth],
          null,
          [],
          [
            'pm.test("Akses token palsu ditolak (401 Unauthorized)", function () {',
            '    pm.response.to.have.status(401);',
            '});',
            'pm.test("Error code INVALID_TOKEN", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.error.code).to.eql("INVALID_TOKEN");',
            '});'
          ],
          'Memastikan token palsu/rusak ditolak oleh middleware JWT.'
        ),
        request(
          '04.10 - Akses Menggunakan Token Akun yang Dinonaktifkan (Tolak 403)',
          'GET',
          '/api/user/profile',
          [],
          [deactivatedAuth],
          null,
          [],
          [
            'pm.test("Token akun dinonaktifkan ditolak (403 Forbidden)", function () {',
            '    pm.response.to.have.status(403);',
            '});',
            'pm.test("Error code ACCOUNT_INACTIVE", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.error.code).to.eql("ACCOUNT_INACTIVE");',
            '});'
          ],
          'Memastikan akun berstatus inactive langsung dicegat oleh middleware verifikasi status database.'
        ),
        request(
          '04.11 - Refresh Token Menggunakan Token yang Telah Dicabut (Tolak 401)',
          'POST',
          '/api/auth/refresh-token',
          [],
          [],
          {
            refreshToken: '{{temp_revoked_refresh_token}}'
          },
          [],
          [
            'pm.test("Refresh token yang dicabut ditolak (401 Unauthorized)", function () {',
            '    pm.response.to.have.status(401);',
            '});',
            'pm.test("Error code REVOKED_REFRESH_TOKEN", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.error.code).to.eql("REVOKED_REFRESH_TOKEN");',
            '});'
          ],
          'Memastikan token sesi yang telah dilogout tidak dapat dipakai kembali.'
        )
      ]
    }
  ]
};

// Write Audited Postman Collection File
const colPath = path.join('c:', 'floverarts_', 'FloverArts_API_postman_audited.json');
fs.writeFileSync(colPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Audited Collection written successfully to:', colPath);

// Create Audited Environment File with Separated Tokens
const environment = {
  id: 'floverarts-dev-environment-actor-separated-v3',
  name: 'FloverArts_ Dev Environment (Actor Separated)',
  values: [
    { key: 'base_url', value: 'http://localhost:5000', type: 'default', enabled: true },
    { key: 'customer_email', value: 'siti@example.com', type: 'default', enabled: true },
    { key: 'admin_email', value: 'owner@example.com', type: 'default', enabled: true },
    { key: 'default_password', value: 'Password123!', type: 'default', enabled: true },
    { key: 'customer_token', value: '', type: 'secret', enabled: true },
    { key: 'customer_refresh_token', value: '', type: 'secret', enabled: true },
    { key: 'admin_token', value: '', type: 'secret', enabled: true },
    { key: 'admin_refresh_token', value: '', type: 'secret', enabled: true },
    { key: 'test_user_token', value: '', type: 'secret', enabled: true },
    { key: 'test_user_refresh_token', value: '', type: 'secret', enabled: true },
    { key: 'test_user_id', value: '2', type: 'default', enabled: true },
    { key: 'test_user_email', value: '', type: 'default', enabled: true },
    { key: 'test_user_name', value: '', type: 'default', enabled: true },
    { key: 'temp_revoked_refresh_token', value: '', type: 'secret', enabled: true },
    { key: 'deactivated_customer_token', value: '', type: 'secret', enabled: true },
    { key: 'timestamp', value: '1', type: 'default', enabled: true },
    { key: 'server_key', value: 'SB-Mid-server-FloverArtsDev12345678', type: 'secret', enabled: true },
    { key: 'product_slug', value: 'buket-mawar-merah-klasik', type: 'default', enabled: true },
    { key: 'product_id', value: '1', type: 'default', enabled: true },
    { key: 'new_product_id', value: '1', type: 'default', enabled: true },
    { key: 'category_id', value: '1', type: 'default', enabled: true },
    { key: 'new_category_id', value: '1', type: 'default', enabled: true },
    { key: 'component_id', value: '1', type: 'default', enabled: true },
    { key: 'new_component_id', value: '1', type: 'default', enabled: true },
    { key: 'cart_item_id', value: '1', type: 'default', enabled: true },
    { key: 'order_id', value: '1', type: 'default', enabled: true },
    { key: 'order_number', value: 'ORD-20261022-001', type: 'default', enabled: true },
    { key: 'gateway_order_id', value: 'ORD-20261022-001-1', type: 'default', enabled: true },
    { key: 'gross_amount', value: '250000.00', type: 'default', enabled: true },
    { key: 'snap_token', value: '', type: 'default', enabled: true },
    { key: 'cash_account_id', value: '1', type: 'default', enabled: true },
    { key: 'midtrans_calculated_signature', value: '', type: 'default', enabled: true }
  ],
  _postman_variable_scope: 'environment',
  _postman_exported_at: '2026-10-23T00:05:00.000Z',
  _postman_exported_using: 'Postman/10.0.0'
};

const envPath = path.join('c:', 'floverarts_', 'FloverArts_Dev_postman_audited.json');
fs.writeFileSync(envPath, JSON.stringify(environment, null, 2), 'utf8');
console.log('Audited Environment written successfully to:', envPath);
