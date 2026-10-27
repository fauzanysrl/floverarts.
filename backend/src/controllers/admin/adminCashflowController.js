const { pool } = require('../../config/db');

// GET /api/admin/cash-accounts (Melihat Seluruh Daftar Akun Kas Toko)
async function getCashAccounts(req, res, next) {
  try {
    const [accounts] = await pool.query(
      'SELECT id, name, account_type, account_number, balance, status, created_at, updated_at FROM cash_accounts ORDER BY id ASC'
    );

    return res.success(accounts, 'Daftar akun kas toko berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/cash-accounts (Menambahkan Akun Kas Baru: Bank, Tunai, Gateway)
async function createCashAccount(req, res, next) {
  try {
    const { name, account_type = 'cash', account_number, balance = 0 } = req.body;

    if (!name || name.trim() === '') {
      return res.error('Nama akun kas wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    const validTypes = ['cash', 'bank', 'payment_gateway', 'other'];
    if (!validTypes.includes(account_type)) {
      return res.error(`Tipe akun kas tidak valid. Pilihan: ${validTypes.join(', ')}.`, 'VALIDATION_ERROR', 422);
    }

    const numBalance = parseFloat(balance || 0);
    if (numBalance < 0) {
      return res.error('Saldo awal tidak boleh negatif.', 'VALIDATION_ERROR', 422);
    }

    const [result] = await pool.query(
      `INSERT INTO cash_accounts (name, account_type, account_number, balance, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [name.trim(), account_type, account_number || null, numBalance]
    );

    const [newAccount] = await pool.query('SELECT * FROM cash_accounts WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      data: newAccount[0],
      message: 'Akun kas baru berhasil ditambahkan.'
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/cashflow (Melihat Riwayat Transaksi Arus Kas Toko: Pemasukan & Pengeluaran)
async function getCashflowTransactions(req, res, next) {
  try {
    const { type, limit = 50, page = 1 } = req.query;

    let query = `
      SELECT cf.id, cf.cash_account_id, cf.order_id, cf.type, cf.source, cf.category,
             cf.amount, cf.reference_number, cf.notes, cf.transaction_date, cf.created_at,
             ca.name AS cash_account_name,
             u.name AS created_by_name
      FROM cashflow_transactions cf
      JOIN cash_accounts ca ON ca.id = cf.cash_account_id
      LEFT JOIN users u ON u.id = cf.created_by
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND cf.type = ?';
      params.push(type);
    }

    query += ' ORDER BY cf.transaction_date DESC, cf.id DESC';

    const numLimit = Math.max(1, parseInt(limit, 10) || 50);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (numPage - 1) * numLimit;

    query += ' LIMIT ? OFFSET ?';
    params.push(numLimit, offset);

    const [transactions] = await pool.query(query, params);

    return res.success(transactions, 'Daftar riwayat arus kas berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/cashflow/expense (Pencatatan Biaya Operasional / Pengeluaran Toko)
async function recordExpense(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { cash_account_id, amount, category, notes, reference_number } = req.body;

    if (!cash_account_id || !amount || !category) {
      await connection.rollback();
      return res.error('Akun kas, nominal pengeluaran, dan kategori wajib diisi.', 'VALIDATION_ERROR', 422);
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      await connection.rollback();
      return res.error('Nominal pengeluaran harus lebih besar dari 0.', 'VALIDATION_ERROR', 422);
    }

    // Cek akun kas dan saldo
    const [accounts] = await connection.query(
      'SELECT id, name, balance, status FROM cash_accounts WHERE id = ? FOR UPDATE',
      [cash_account_id]
    );

    if (!accounts || accounts.length === 0) {
      await connection.rollback();
      return res.error('Akun kas tidak ditemukan.', 'NOT_FOUND', 404);
    }

    const account = accounts[0];
    if (account.status !== 'active') {
      await connection.rollback();
      return res.error('Akun kas sedang tidak aktif.', 'ACCOUNT_INACTIVE', 400);
    }

    // Penolakan Defisit Saldo: saldo kas tidak boleh negatif
    if (parseFloat(account.balance) < numAmount) {
      await connection.rollback();
      return res.error(
        `Saldo akun kas "${account.name}" tidak mencukupi untuk pengeluaran ini. (Saldo: Rp ${account.balance}, Dibutuhkan: Rp ${numAmount})`,
        'INSUFFICIENT_FUNDS',
        422
      );
    }

    // Simpan mutasi pengeluaran kas
    const [result] = await connection.query(
      `INSERT INTO cashflow_transactions 
        (cash_account_id, created_by, type, source, category, amount, reference_number, notes)
       VALUES (?, ?, 'expense', 'operational_expense', ?, ?, ?, ?)`,
      [
        cash_account_id,
        req.user ? req.user.id : null,
        category.trim(),
        numAmount,
        reference_number || `EXP-${Date.now()}`,
        notes || null
      ]
    );

    // Potong saldo akun kas
    await connection.query(
      'UPDATE cash_accounts SET balance = balance - ?, updated_at = NOW() WHERE id = ?',
      [numAmount, cash_account_id]
    );

    const [updatedAccount] = await connection.query('SELECT balance FROM cash_accounts WHERE id = ?', [cash_account_id]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        cash_account_id,
        account_name: account.name,
        amount: numAmount,
        category,
        remaining_balance: updatedAccount[0].balance,
        reference_number: reference_number || null,
        notes: notes || null
      },
      message: 'Pengeluaran kas toko berhasil dicatat.'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// GET /api/admin/reports/cashflow/recap (Rekapitulasi Arus Kas: Pemasukan, Pengeluaran & Arus Kas Bersih)
async function getCashflowRecap(req, res, next) {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(id) AS total_transactions
      FROM cashflow_transactions
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      query += ' AND DATE(transaction_date) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(transaction_date) <= ?';
      params.push(end_date);
    }

    const [summary] = await pool.query(query, params);

    const totalIncome = parseFloat(summary[0].total_income || 0);
    const totalExpense = parseFloat(summary[0].total_expense || 0);
    const netCashflow = totalIncome - totalExpense;

    // Breakdown per kategori
    let catQuery = `
      SELECT category, type, COALESCE(SUM(amount), 0) AS total_amount, COUNT(id) AS transaction_count
      FROM cashflow_transactions
      WHERE 1=1
    `;
    const catParams = [];
    if (start_date) {
      catQuery += ' AND DATE(transaction_date) >= ?';
      catParams.push(start_date);
    }
    if (end_date) {
      catQuery += ' AND DATE(transaction_date) <= ?';
      catParams.push(end_date);
    }
    catQuery += ' GROUP BY category, type ORDER BY total_amount DESC';

    const [breakdown] = await pool.query(catQuery, catParams);

    return res.success({
      period: {
        start_date: start_date || 'All Time',
        end_date: end_date || 'All Time'
      },
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_cashflow: netCashflow,
        total_transactions: parseInt(summary[0].total_transactions || 0, 10)
      },
      breakdown
    }, 'Rekapitulasi arus kas berhasil dihitung.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCashAccounts,
  createCashAccount,
  getCashflowTransactions,
  recordExpense,
  getCashflowRecap
};
