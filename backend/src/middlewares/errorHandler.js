/**
 * Middleware Terpusat untuk Penanganan Error Global (Centralized Error Handler)
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error Handler] ${req.method} ${req.url} - Error:`, err);

  // Penanganan error khusus MySQL: Duplikasi nilai unik (Unique constraint)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Data sudah ada di sistem (duplikasi nilai unik).',
        details: err.sqlMessage || err.message
      }
    });
  }

  // Penanganan error relasi foreign key yang tidak ditemukan
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Relasi data tidak ditemukan atau referensi tidak valid.',
        details: err.sqlMessage || err.message
      }
    });
  }

  // Penanganan error penghapusan data yang masih berelasi dengan tabel lain
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'RESTRICTED_DELETE',
        message: 'Data tidak dapat dihapus karena masih digunakan oleh relasi data lain.',
        details: err.sqlMessage || err.message
      }
    });
  }

  // Penanganan error validasi input payload
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details || null
      }
    });
  }

  // Penanganan kesalahan format parsing JSON pada request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Format payload JSON tidak valid.'
      }
    });
  }

  // Nilai cadangan baku untuk error internal server
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Terjadi kesalahan pada server backend.'
    }
  });
}

// Penangan Rute Tidak Ditemukan (404 Not Found)
function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
