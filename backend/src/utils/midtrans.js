const midtransClient = require('midtrans-client');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

function getCredentials() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-UU.oPBSj2B1NvZo6vqYetSrC';
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'Mid-client-eb2fGHRiwm6ty0xW';
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  return { serverKey, clientKey, isProduction };
}

function getCoreApi() {
  const { serverKey, clientKey, isProduction } = getCredentials();
  return new midtransClient.CoreApi({
    isProduction,
    serverKey,
    clientKey
  });
}

function getSnap() {
  const { serverKey, clientKey, isProduction } = getCredentials();
  return new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey
  });
}

const snap = getSnap();
const coreApi = getCoreApi();

/**
 * Helper Verifikasi Keaslian Signature Key SHA-512 dari Webhook Notifikasi Midtrans
 */
function verifySignatureKey(orderId, statusCode, grossAmount, signatureKey) {
  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }
  const { serverKey } = getCredentials();
  const payloadStr = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const calculatedSignature = crypto.createHash('sha512').update(payloadStr).digest('hex');

  return calculatedSignature.toLowerCase() === signatureKey.toLowerCase();
}

function calculateSignatureKey(orderId, statusCode, grossAmount) {
  const { serverKey } = getCredentials();
  const payloadStr = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(payloadStr).digest('hex');
}

module.exports = {
  snap,
  coreApi,
  getCoreApi,
  getSnap,
  getCredentials,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-UU.oPBSj2B1NvZo6vqYetSrC',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'Mid-client-eb2fGHRiwm6ty0xW',
  verifySignatureKey,
  calculateSignatureKey
};
