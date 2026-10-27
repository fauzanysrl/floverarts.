const { pool } = require('../config/db');

// Helper untuk mengambil atau menginisialisasi keranjang belanja aktif pengguna
async function getOrCreateUserCartId(userId) {
  const [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (carts && carts.length > 0) {
    return carts[0].id;
  }
  const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return result.insertId;
}

// GET /api/cart (Melihat Rincian Keranjang Belanja Pelanggan Aktif)
async function getCart(req, res, next) {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateUserCartId(userId);

    const [items] = await pool.query(
      `SELECT ci.id, ci.cart_id, ci.product_id, ci.item_type, ci.quantity, ci.custom_details, ci.created_at,
              p.name AS product_name, p.slug AS product_slug, p.price AS product_price,
              p.stock AS product_stock, p.image_url AS product_image, p.status AS product_status
       FROM cart_items ci
       LEFT JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.id DESC`,
      [cartId]
    );

    let cartTotal = 0;
    let totalItems = 0;

    const formattedItems = items.map(item => {
      let unitPrice = 0;
      let itemName = '';
      let itemImage = null;
      let isAvailable = true;
      let maxStock = 999;

      if (item.item_type === 'standard' && item.product_id) {
        unitPrice = parseFloat(item.product_price || 0);
        itemName = item.product_name;
        itemImage = item.product_image;
        maxStock = item.product_stock;
        if (item.product_status !== 'active' || item.product_stock < item.quantity) {
          isAvailable = false;
        }
      } else if (item.item_type === 'custom') {
        const details = typeof item.custom_details === 'string'
          ? JSON.parse(item.custom_details)
          : (item.custom_details || {});

        unitPrice = parseFloat(details.calculated_total_price || details.total_price || 0);
        itemName = details.title || 'Custom Bouquet Spesial';
        itemImage = details.flower_image || details.image_url || '/uploads/custom-bouquet.jpg';
        isAvailable = details.is_available !== false;
      }

      const subtotal = unitPrice * item.quantity;
      cartTotal += subtotal;
      totalItems += item.quantity;

      return {
        id: item.id,
        item_type: item.item_type,
        product_id: item.product_id,
        name: itemName,
        slug: item.product_slug || null,
        image_url: itemImage,
        unit_price: unitPrice,
        quantity: item.quantity,
        subtotal,
        is_available: isAvailable,
        max_stock: maxStock,
        custom_details: typeof item.custom_details === 'string' ? JSON.parse(item.custom_details) : item.custom_details,
        created_at: item.created_at
      };
    });

    return res.success({
      cart_id: cartId,
      items: formattedItems,
      total_items: totalItems,
      total_amount: cartTotal
    }, 'Keranjang belanja berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// POST /api/cart/items (Menambahkan Item Produk Standar atau Custom ke Keranjang)
async function addItem(req, res, next) {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateUserCartId(userId);
    const { item_type = 'standard', product_id, quantity = 1, custom_bouquet, custom_details } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.error('Kuantitas item minimal 1.', 'VALIDATION_ERROR', 422);
    }

    let insertedId;

    // Skenario 1: Produk Standar Katalog
    if (item_type === 'standard') {
      if (!product_id) {
        return res.error('ID produk wajib disertakan untuk item standar.', 'VALIDATION_ERROR', 422);
      }

      const [products] = await pool.query(
        'SELECT id, name, price, stock, status FROM products WHERE id = ?',
        [product_id]
      );

      if (!products || products.length === 0) {
        return res.error('Produk tidak ditemukan.', 'NOT_FOUND', 404);
      }

      const product = products[0];
      if (product.status !== 'active') {
        return res.error('Produk ini sudah tidak aktif di katalog.', 'PRODUCT_INACTIVE', 400);
      }

      if (product.stock < qty) {
        return res.error(`Stok produk tidak mencukupi. Stok tersedia: ${product.stock}.`, 'INSUFFICIENT_STOCK', 400);
      }

      // Cek apakah produk standar sudah ada di keranjang -> perbarui kuantitas (increment)
      const [existingItems] = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND item_type = \'standard\'',
        [cartId, product_id]
      );

      if (existingItems && existingItems.length > 0) {
        const newQty = existingItems[0].quantity + qty;
        if (newQty > product.stock) {
          return res.error(
            `Kuantitas total di keranjang (${newQty}) melebihi stok yang tersedia (${product.stock}).`,
            'INSUFFICIENT_STOCK',
            400
          );
        }

        await pool.query('UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [
          newQty,
          existingItems[0].id
        ]);
        insertedId = existingItems[0].id;
      } else {
        const [insertRes] = await pool.query(
          `INSERT INTO cart_items (cart_id, product_id, item_type, quantity) 
           VALUES (?, ?, 'standard', ?)`,
          [cartId, product_id, qty]
        );
        insertedId = insertRes.insertId;
      }
    } 
    // Skenario 2: Custom Bouquet Dinamis
    else if (item_type === 'custom') {
      const details = custom_details || custom_bouquet;
      if (!details) {
        return res.error('Data konfigurasi custom buket wajib diisi.', 'VALIDATION_ERROR', 422);
      }

      // Pastikan ada total harga yang dihitung
      let calculatedPrice = details.calculated_total_price || details.total_price || 0;
      if (!calculatedPrice && details.flowers && Array.isArray(details.flowers)) {
        let fTotal = details.flowers.reduce((sum, f) => sum + (f.qty * f.unit_price), 0);
        let wTotal = details.wrapping ? details.wrapping.price : 0;
        let rTotal = details.ribbon ? details.ribbon.price : 0;
        let cTotal = details.card ? details.card.price : 0;
        calculatedPrice = fTotal + wTotal + rTotal + cTotal;
      }

      const finalDetails = {
        ...details,
        calculated_total_price: calculatedPrice
      };

      const [insertRes] = await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, item_type, quantity, custom_details) 
         VALUES (?, NULL, 'custom', ?, ?)`,
        [cartId, qty, JSON.stringify(finalDetails)]
      );
      insertedId = insertRes.insertId;
    } else {
      return res.error('Tipe item tidak valid. Pilihan: standard, custom.', 'VALIDATION_ERROR', 422);
    }

    return res.status(201).json({
      success: true,
      data: {
        id: insertedId,
        cart_id: cartId,
        item_type,
        quantity: qty
      },
      message: 'Item berhasil ditambahkan ke keranjang belanja!'
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/cart/items/:id (Memperbarui Kuantitas Item di Keranjang Belanja)
async function updateItemQuantity(req, res, next) {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateUserCartId(userId);
    const { id } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty <= 0) {
      return res.error('Kuantitas minimal 1.', 'VALIDATION_ERROR', 422);
    }

    const [items] = await pool.query(
      `SELECT ci.id, ci.item_type, ci.product_id, p.stock, p.status 
       FROM cart_items ci
       LEFT JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ? AND ci.cart_id = ?`,
      [id, cartId]
    );

    if (!items || items.length === 0) {
      return res.error('Item keranjang tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const item = items[0];

    // Periksa ketersediaan stok fisik jika item merupakan produk standar katalog
    if (item.item_type === 'standard' && item.product_id) {
      if (item.status !== 'active') {
        return res.error('Produk sudah tidak aktif.', 'PRODUCT_INACTIVE', 400);
      }
      if (newQty > item.stock) {
        return res.error(`Stok produk tidak mencukupi (tersedia: ${item.stock}).`, 'INSUFFICIENT_STOCK', 400);
      }
    }

    await pool.query('UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [newQty, id]);

    return res.success({ id: parseInt(id, 10), quantity: newQty }, 'Jumlah item berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

// DELETE /api/cart/items/:id (Menghapus Satu Item dari Keranjang Belanja)
async function removeItem(req, res, next) {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateUserCartId(userId);
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, cartId]);
    if (result.affectedRows === 0) {
      return res.error('Item keranjang tidak ditemukan.', 'NOT_FOUND', 404);
    }

    return res.success(null, 'Item berhasil dihapus dari keranjang.');
  } catch (error) {
    next(error);
  }
}

// DELETE /api/cart (Mengosongkan Seluruh Isi Keranjang Belanja Pelanggan)
async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateUserCartId(userId);

    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    return res.success(null, 'Seluruh isi keranjang belanja berhasil dikosongkan.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
};
