/**
 * Utilitas Pemformatan Data FloverArts_
 * Menjamin konsistensi format mata uang Rupiah dan tanggal WIB (Asia/Jakarta).
 */

const idrCurrencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format angka nominal ke format Rupiah
 * @param {number|string} amount
 * @returns {string} Contoh: "Rp 150.000"
 */
export function formatIDR(amount) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount)) {
    return 'Rp 0';
  }
  return idrCurrencyFormatter.format(numericAmount);
}

export const formatRupiah = formatIDR;

/**
 * Format tanggal ke standar Indonesia (WIB)
 * @param {Date|string} dateInput
 * @param {boolean} includeTime
 * @returns {string} Contoh: "28 Oktober 2026, 14:30 WIB"
 */
export function formatDateID(dateInput, includeTime = false) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  const options = {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }
      : {}),
  };

  const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);
  return includeTime ? `${formatted} WIB` : formatted;
}

/**
 * Format tanggal beserta waktu (WIB)
 * @param {Date|string} dateInput
 * @returns {string} Contoh: "28 Oktober 2026, 14:30 WIB"
 */
export function formatDateTime(dateInput) {
  return formatDateID(dateInput, true);
}
