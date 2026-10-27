const { pool } = require('../../config/db');

// GET /api/admin/inventory/transactions (Histori Log Mutasi Keluar/Masuk Stok Inventaris)
async function getInventoryTransactions(req, res, next) {
  try {
    const { limit = 50, page = 1 } = req.query;
    const numLimit = Math.max(1, parseInt(limit, 10) || 50);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (numPage - 1) * numLimit;

    const [transactions] = await pool.query(
      `SELECT it.id, it.product_id, it.custom_component_id, it.order_id,
              it.type, it.quantity, it.stock_before, it.stock_after, it.reason, it.created_at,
              p.name AS product_name,
              cc.name AS custom_component_name,
              u.name AS created_by_name
       FROM inventory_transactions it
       LEFT JOIN products p ON p.id = it.product_id
       LEFT JOIN custom_components cc ON cc.id = it.custom_component_id
       LEFT JOIN users u ON u.id = it.created_by
       ORDER BY it.id DESC
       LIMIT ? OFFSET ?`,
      [numLimit, offset]
    );

    return res.success(transactions, 'Histori mutasi stok inventaris berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/inventory/restock (Pencatatan Penambahan Restock Fisik Produk atau Komponen)
async function restockInventory(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { item_type = 'product', item_id, quantity, reason } = req.body;

    const numQty = parseInt(quantity, 10);
    if (!item_id || isNaN(numQty) || numQty <= 0) {
      await connection.rollback();
      return res.error('ID item dan kuantitas restock (> 0) wajib disertakan.', 'VALIDATION_ERROR', 422);
    }

    let itemName = '';
    let stockBefore = 0;
    let stockAfter = 0;

    if (item_type === 'product') {
      const [prods] = await connection.query(
        'SELECT id, name, stock FROM products WHERE id = ? FOR UPDATE',
        [item_id]
      );
      if (!prods || prods.length === 0) {
        await connection.rollback();
        return res.error('Produk tidak ditemukan.', 'NOT_FOUND', 404);
      }
      const prod = prods[0];
      itemName = prod.name;
      stockBefore = prod.stock;
      stockAfter = stockBefore + numQty;

      await connection.query('UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?', [stockAfter, prod.id]);

      await connection.query(
        `INSERT INTO inventory_transactions 
          (product_id, type, quantity, stock_before, stock_after, reason, created_by)
         VALUES (?, 'in', ?, ?, ?, ?, ?)`,
        [prod.id, numQty, stockBefore, stockAfter, reason || 'Restock fisik produk', req.user ? req.user.id : null]
      );
    } else if (item_type === 'custom_component') {
      const [comps] = await connection.query(
        'SELECT id, name, stock FROM custom_components WHERE id = ? FOR UPDATE',
        [item_id]
      );
      if (!comps || comps.length === 0) {
        await connection.rollback();
        return res.error('Komponen buket tidak ditemukan.', 'NOT_FOUND', 404);
      }
      const comp = comps[0];
      itemName = comp.name;
      stockBefore = comp.stock;
      stockAfter = stockBefore + numQty;

      await connection.query('UPDATE custom_components SET stock = ?, updated_at = NOW() WHERE id = ?', [stockAfter, comp.id]);

      await connection.query(
        `INSERT INTO inventory_transactions 
          (custom_component_id, type, quantity, stock_before, stock_after, reason, created_by)
         VALUES (?, 'in', ?, ?, ?, ?, ?)`,
        [comp.id, numQty, stockBefore, stockAfter, reason || 'Restock fisik komponen buket', req.user ? req.user.id : null]
      );
    } else {
      await connection.rollback();
      return res.error('Tipe item tidak valid. Pilihan: product, custom_component.', 'VALIDATION_ERROR', 422);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      data: {
        item_type,
        item_id,
        item_name: itemName,
        quantity_added: numQty,
        stock_before: stockBefore,
        stock_after: stockAfter,
        reason: reason || 'Restock inventaris toko'
      },
      message: `Restock fisik ${itemName} sebanyak ${numQty} berhasil dicatat.`
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// GET /api/admin/inventory/low-stock (Peringatan Stok Menipis di Bawah Batas Minimum)
async function getLowStockAlerts(req, res, next) {
  try {
    const [lowProducts] = await pool.query(
      `SELECT p.id, 'product' AS item_type, p.name, p.price, p.stock, p.min_stock, p.status, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.stock <= p.min_stock
       ORDER BY p.stock ASC`
    );

    const [lowComponents] = await pool.query(
      `SELECT cc.id, 'custom_component' AS item_type, cc.name, cc.price, cc.stock, cc.min_stock, cc.status, cc.category AS category_name
       FROM custom_components cc
       WHERE cc.stock <= cc.min_stock
       ORDER BY cc.stock ASC`
    );

    return res.success({
      total_alerts: lowProducts.length + lowComponents.length,
      products: lowProducts,
      custom_components: lowComponents
    }, 'Daftar peringatan stok menipis berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInventoryTransactions,
  restockInventory,
  getLowStockAlerts
};
