const { pool } = require('../config/db');

// Generator format nomor faktur pesanan: ORD-YYYYMMDD-XXXX (unik & terstandar)
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

// POST /api/orders/checkout (Proses Checkout Pesanan & Pembuatan Faktur)
async function checkout(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const {
      fulfillment_method = 'delivery',
      recipient_name,
      recipient_phone,
      delivery_address,
      delivery_date,
      delivery_time,
      notes,
      items: directItems
    } = req.body;

    // Validasi field wajib formulir pengiriman
    if (!recipient_name || !recipient_phone || !delivery_date) {
      await connection.rollback();
      return res.error('Nama penerima, nomor HP, dan tanggal pengiriman wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    if (fulfillment_method === 'delivery' && (!delivery_address || delivery_address.trim() === '')) {
      await connection.rollback();
      return res.error('Alamat pengiriman wajib diisi untuk metode pengiriman (delivery).', 'VALIDATION_ERROR', 422);
    }

    // Ambil item pesanan dari direct payload (buy now) atau keranjang belanja aktif pengguna
    let orderItemsData = [];
    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      orderItemsData = directItems;
    } else {
      // Ambil seluruh isi keranjang belanja aktif pengguna
      const [cartRows] = await connection.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
      if (cartRows && cartRows.length > 0) {
        const [cartItems] = await connection.query(
          'SELECT * FROM cart_items WHERE cart_id = ?',
          [cartRows[0].id]
        );
        orderItemsData = cartItems;
      }
    }

    if (orderItemsData.length === 0) {
      await connection.rollback();
      return res.error('Tidak ada item untuk diproses checkout.', 'EMPTY_ORDER', 400);
    }

    let calculatedTotal = 0;
    const resolvedOrderItems = [];

    // Verifikasi harga snapshot dan ketersediaan stok
    for (const item of orderItemsData) {
      const qty = parseInt(item.quantity || 1, 10);
      const itemType = item.item_type || 'standard';

      if (itemType === 'standard') {
        const [prods] = await connection.query(
          'SELECT id, name, price, stock, status FROM products WHERE id = ?',
          [item.product_id]
        );
        if (!prods || prods.length === 0) {
          await connection.rollback();
          return res.error(`Produk ID ${item.product_id} tidak ditemukan.`, 'NOT_FOUND', 404);
        }
        const prod = prods[0];
        if (prod.status !== 'active') {
          await connection.rollback();
          return res.error(`Produk "${prod.name}" sudah tidak aktif.`, 'PRODUCT_INACTIVE', 400);
        }
        if (prod.stock < qty) {
          await connection.rollback();
          return res.error(`Stok "${prod.name}" tidak mencukupi (tersedia: ${prod.stock}).`, 'INSUFFICIENT_STOCK', 400);
        }

        const unitPrice = parseFloat(prod.price);
        const subtotal = unitPrice * qty;
        calculatedTotal += subtotal;

        resolvedOrderItems.push({
          product_id: prod.id,
          item_type: 'standard',
          product_name_snapshot: prod.name,
          unit_price_snapshot: unitPrice,
          quantity: qty,
          subtotal,
          custom_details: null
        });
      } else if (itemType === 'custom') {
        const details = typeof item.custom_details === 'string'
          ? JSON.parse(item.custom_details)
          : (item.custom_details || {});

        const unitPrice = parseFloat(details.calculated_total_price || details.total_price || 150000);
        const subtotal = unitPrice * qty;
        calculatedTotal += subtotal;

        resolvedOrderItems.push({
          product_id: null,
          item_type: 'custom',
          product_name_snapshot: details.title || 'Custom Bouquet Eksklusif',
          unit_price_snapshot: unitPrice,
          quantity: qty,
          subtotal,
          custom_details: JSON.stringify(details)
        });
      }
    }

    const orderNumber = generateOrderNumber();

    // Simpan order
    const [orderRes] = await connection.query(
      `INSERT INTO orders 
        (user_id, order_number, total_amount, payment_status, order_status, fulfillment_method,
         recipient_name, recipient_phone, delivery_address, delivery_date, delivery_time, notes)
       VALUES (?, ?, ?, 'menunggu_pembayaran', 'menunggu_pembayaran', ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        calculatedTotal,
        fulfillment_method,
        recipient_name.trim(),
        recipient_phone.trim(),
        delivery_address ? delivery_address.trim() : '-',
        delivery_date,
        delivery_time || null,
        notes || null
      ]
    );

    const orderId = orderRes.insertId;

    // Simpan rincian order items dengan snapshot harga
    for (const rItem of resolvedOrderItems) {
      await connection.query(
        `INSERT INTO order_items 
          (order_id, product_id, item_type, product_name_snapshot, unit_price_snapshot, quantity, subtotal, custom_details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          rItem.product_id,
          rItem.item_type,
          rItem.product_name_snapshot,
          rItem.unit_price_snapshot,
          rItem.quantity,
          rItem.subtotal,
          rItem.custom_details
        ]
      );
    }

    // Catat audit status log awal
    await connection.query(
      `INSERT INTO order_status_logs 
        (order_id, previous_status, new_status, changed_by, notes)
       VALUES (?, NULL, 'menunggu_pembayaran', ?, 'Pesanan berhasil dibuat, menunggu pembayaran pelanggan')`,
      [orderId, userId]
    );

    // Kosongkan keranjang belanja pelanggan setelah checkout berhasil
    const [cartRows] = await connection.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (cartRows && cartRows.length > 0) {
      await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartRows[0].id]);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      data: {
        id: orderId,
        order_number: orderNumber,
        total_amount: calculatedTotal,
        payment_status: 'menunggu_pembayaran',
        order_status: 'menunggu_pembayaran',
        recipient_name,
        recipient_phone,
        delivery_date,
        items: resolvedOrderItems
      },
      message: 'Pesanan berhasil dibuat. Silakan lanjutkan ke pembayaran.'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// GET /api/user/orders (Daftar Riwayat Seluruh Pesanan Pelanggan)
async function getMyOrders(req, res, next) {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT o.id, o.order_number, o.total_amount, o.payment_status, o.order_status,
              o.fulfillment_method, o.recipient_name, o.delivery_date, o.courier, o.tracking_number,
              o.created_at,
              COUNT(oi.id) AS total_items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.id DESC`,
      [userId]
    );

    return res.success(orders, 'Daftar riwayat pesanan berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// GET /api/user/orders/:id (Detail Rincian Pesanan Pelanggan Tertentu)
async function getMyOrderDetail(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!orders || orders.length === 0) {
      return res.error('Pesanan tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const order = orders[0];

    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );

    const formattedItems = items.map(item => ({
      ...item,
      custom_details: typeof item.custom_details === 'string' ? JSON.parse(item.custom_details) : item.custom_details
    }));

    // Ambil riwayat rekaman transaksi pembayaran terakhir jika tersedia
    const [payments] = await pool.query(
      'SELECT id, gateway, gateway_order_id, payment_type, amount, status, snap_token, checkout_url, created_at FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    );

    return res.success({
      ...order,
      items: formattedItems,
      payment: payments.length > 0 ? payments[0] : null
    }, 'Detail pesanan berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// GET /api/user/orders/:id/tracking (Pelacakan Status & Ekspedisi Pengiriman Pesanan)
async function getOrderTracking(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT id, order_number, order_status, payment_status, courier, tracking_number, recipient_name, delivery_address, delivery_date, delivery_time FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!orders || orders.length === 0) {
      return res.error('Pesanan tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const order = orders[0];

    // Ambil seluruh logs riwayat status
    const [logs] = await pool.query(
      `SELECT osl.id, osl.previous_status, osl.new_status, osl.notes, osl.created_at,
              u.name AS changed_by_name
       FROM order_status_logs osl
       LEFT JOIN users u ON u.id = osl.changed_by
       WHERE osl.order_id = ?
       ORDER BY osl.id ASC`,
      [id]
    );

    return res.success({
      order,
      tracking: {
        current_status: order.order_status,
        courier: order.courier,
        tracking_number: order.tracking_number,
        logs
      }
    }, 'Informasi pelacakan status pesanan berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkout,
  getMyOrders,
  getMyOrderDetail,
  getOrderTracking
};
