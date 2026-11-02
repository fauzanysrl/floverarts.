/**
 * Modul Normalisasi & Taksonomi Error Frontend FloverArts_
 * Mengonversi respons error HTTP/Axios menjadi instance AppError terstandar.
 */

export class AppError extends Error {
  /**
   * @param {Object} params
   * @param {string} params.code - Kode error terstandar
   * @param {string} params.message - Pesan error ramah pengguna dalam Bahasa Indonesia
   * @param {number} [params.status] - Kode status HTTP (400, 401, 403, 404, 500, dll.)
   * @param {any} [params.details] - Rincian validasi field atau data pendukung
   * @param {boolean} [params.isNetwork] - True jika kegagalan koneksi jaringan
   * @param {boolean} [params.isTimeout] - True jika timeout request
   */
  constructor({ code, message, status = 500, details = null, isNetwork = false, isTimeout = false }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.isNetwork = isNetwork;
    this.isTimeout = isTimeout;
  }
}

// Kamus Pemetaan Kode Error Backend -> Pesan Bahasa Indonesia
export const ERROR_MESSAGES = {
  // Autentikasi & Akun
  UNAUTHORIZED: 'Sesi Anda tidak ditemukan. Silakan masuk terlebih dahulu.',
  INVALID_TOKEN: 'Sesi Anda telah kedaluwarsa. Silakan masuk kembali.',
  USER_NOT_FOUND: 'Data pengguna tidak ditemukan.',
  INVALID_CREDENTIALS: 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.',
  ACCOUNT_INACTIVE: 'Akun Anda berstatus nonaktif atau ditangguhkan. Silakan hubungi pengelola toko.',
  FORBIDDEN: 'Anda tidak memiliki hak akses untuk membuka halaman atau fitur ini.',
  EMAIL_EXISTS: 'Alamat email sudah terdaftar. Silakan gunakan email lain atau langsung masuk.',
  INVALID_REFRESH_TOKEN: 'Sesi perpanjangan token tidak valid. Silakan masuk kembali.',
  REVOKED_REFRESH_TOKEN: 'Sesi perpanjangan token telah dicabut.',

  // Validasi & Payload
  VALIDATION_ERROR: 'Terdapat data input yang belum lengkap atau tidak valid.',
  INVALID_JSON: 'Format data permintaan tidak valid.',
  DUPLICATE_ENTRY: 'Data serupa sudah tercatat di sistem.',
  RESTRICTED_DELETE: 'Data tidak dapat dihapus karena masih digunakan oleh data lain.',
  FOREIGN_KEY_VIOLATION: 'Referensi data yang dipilih tidak valid atau sudah dihapus.',

  // Rute & Sumber Daya
  ROUTE_NOT_FOUND: 'Halaman atau layanan yang Anda tuju tidak ditemukan.',
  NOT_FOUND: 'Data yang Anda cari tidak ditemukan.',

  // Bisnis & Transaksi
  INSUFFICIENT_STOCK: 'Stok bunga atau komponen tidak mencukupi.',
  ORDER_NOT_PAYABLE: 'Status pesanan saat ini tidak memungkinkan untuk pembayaran.',
  ORDER_ALREADY_CANCELLED: 'Pesanan ini sudah dibatalkan sebelumnya.',
  ORDER_CANNOT_BE_CANCELLED: 'Pesanan yang sedang dikirim atau telah selesai tidak dapat dibatalkan.',
  INSUFFICIENT_CASH_BALANCE: 'Saldo kas tidak mencukupi untuk melakukan pengeluaran ini.',

  // Sistem & Jaringan
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  TIMEOUT_ERROR: 'Koneksi ke server melebihi batas waktu (timeout). Silakan coba beberapa saat lagi.',
  INTERNAL_SERVER_ERROR: 'Terjadi gangguan internal pada server. Tim teknis sedang menanganinya.',
  UNKNOWN_ERROR: 'Terjadi kesalahan sistem yang tidak terduga. Silakan coba kembali.',
};

/**
 * Normalisasi error apapun (AxiosError, Error biasa, atau string) menjadi AppError
 * @param {any} error
 * @returns {AppError}
 */
export function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  // Penanganan Axios Timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.toLowerCase().includes('timeout')) {
    return new AppError({
      code: 'TIMEOUT_ERROR',
      message: ERROR_MESSAGES.TIMEOUT_ERROR,
      status: 408,
      isTimeout: true,
    });
  }

  // Penanganan Kegagalan Jaringan (Network Error / Server Mati)
  if (error?.isAxiosError && !error.response) {
    return new AppError({
      code: 'NETWORK_ERROR',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      status: 0,
      isNetwork: true,
    });
  }

  // Respons resmi dari Backend ({ success: false, error: { code, message, details } })
  if (error?.response?.data?.error) {
    const backendError = error.response.data.error;
    const code = backendError.code || 'UNKNOWN_ERROR';
    const message = backendError.message || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;

    return new AppError({
      code,
      message,
      status: error.response.status,
      details: backendError.details || null,
    });
  }

  // Error HTTP generik tanpa amplop backend
  if (error?.response) {
    const status = error.response.status;
    let code = 'INTERNAL_SERVER_ERROR';
    if (status === 401) code = 'UNAUTHORIZED';
    else if (status === 403) code = 'FORBIDDEN';
    else if (status === 404) code = 'NOT_FOUND';
    else if (status === 422) code = 'VALIDATION_ERROR';

    return new AppError({
      code,
      message: ERROR_MESSAGES[code] || error.response.statusText || ERROR_MESSAGES.UNKNOWN_ERROR,
      status,
      details: error.response.data || null,
    });
  }

  // Fallback untuk Error runtime JavaScript biasa
  return new AppError({
    code: 'UNKNOWN_ERROR',
    message: error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    status: 500,
  });
}
