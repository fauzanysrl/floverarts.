/**
 * Middleware untuk standardisasi Response Envelope
 * Format Sukses: { success: true, data: ..., message: ... }
 * Format Error: { success: false, error: { code: ..., message: ..., details: ... } }
 */
function responseHandler(req, res, next) {
  res.success = function (data = null, message = 'Operasi berhasil', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message
    });
  };

  res.error = function (message = 'Terjadi kesalahan sistem', code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    const responsePayload = {
      success: false,
      error: {
        code,
        message
      }
    };

    if (details) {
      responsePayload.error.details = details;
    }

    return res.status(statusCode).json(responsePayload);
  };

  next();
}

module.exports = responseHandler;
