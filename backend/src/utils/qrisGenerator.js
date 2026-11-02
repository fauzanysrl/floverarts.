/**
 * Helper Generator EMVCo QRIS Standar Bank Indonesia & Midtrans
 * Menghasilkan string QRIS TLV (Tag-Length-Value) valid dengan checksum CRC16-CCITT
 */

function crc16ccitt(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(tag, value) {
  const strVal = String(value);
  const len = strVal.length.toString().padStart(2, '0');
  return `${tag}${len}${strVal}`;
}

/**
 * Menghasilkan string QRIS dinamis yang valid secara spesifikasi EMVCo
 * @param {number|string} amount - Nominal tagihan dalam Rupiah
 * @param {string} orderNumber - Nomor pesanan / ref ID
 * @returns {string} String QRIS lengkap dengan CRC-16
 */
function generateValidQrisString(amount, orderNumber = 'ORD-FLOVERARTS') {
  const cleanAmount = Math.round(parseFloat(amount) || 0).toString();
  const cleanOrderRef = orderNumber.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 20);

  // Merchant Account Info GoPay / Midtrans
  const gopayInfo =
    tlv('00', 'ID.CO.GOPAY.WWW') +
    tlv('01', 'G936009110021305410') +
    tlv('02', '10200392') +
    tlv('03', 'UMI');

  // Merchant Account Info Nasional
  const nationalInfo =
    tlv('00', 'ID.OR.AIRPAY.WWW') +
    tlv('01', 'ID1020039201928');

  const baseQris =
    tlv('00', '01') + // Format indicator
    tlv('01', '12') + // Point of initiation (12: dynamic)
    tlv('26', gopayInfo) + // Acquirer GoPay / Midtrans
    tlv('51', nationalInfo) + // AirPay / QRIS Nasional
    tlv('52', '5999') + // Merchant category code
    tlv('53', '360') + // Currency: IDR
    tlv('54', cleanAmount) + // Transaction amount
    tlv('58', 'ID') + // Country code
    tlv('59', 'FLOVERARTS ATELIER') + // Merchant name
    tlv('60', 'CILACAP') + // Merchant city
    tlv('61', '53223') + // Postal code
    tlv('62', tlv('01', cleanOrderRef)) + // Reference order ID
    '6304'; // CRC16 tag

  const checksum = crc16ccitt(baseQris);
  return baseQris + checksum;
}

module.exports = {
  generateValidQrisString,
  crc16ccitt
};

