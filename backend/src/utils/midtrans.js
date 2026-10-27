const midtransClient = require('midtrans-client');
const crypto = require('crypto');
require('dotenv').config();

const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-FloverArtsDev12345678';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-FloverArtsDev12345678';
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Inisialisasi Klien Midtrans Snap SDK
const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey
});

/**
 * Helper Verifikasi Keaslian Signature Key SHA-512 dari Webhook Notifikasi Midtrans
 * Formula baku keamanan: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
function verifySignatureKey(orderId, statusCode, grossAmount, signatureKey) {
  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }

  // Format grossAmount dipastikan string sesuai format payload gateway
  const payloadStr = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const calculatedSignature = crypto.createHash('sha512').update(payloadStr).digest('hex');

  return calculatedSignature.toLowerCase() === signatureKey.toLowerCase();
}

/**
 * Helper untuk menghitung nilai Signature Key SHA-512 (berguna untuk pengujian unit & integrasi)
 */
function calculateSignatureKey(orderId, statusCode, grossAmount) {
  const payloadStr = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(payloadStr).digest('hex');
}

module.exports = {
  snap,
  serverKey,
  clientKey,
  verifySignatureKey,
  calculateSignatureKey
};
