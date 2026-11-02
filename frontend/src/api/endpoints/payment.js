/**
 * Endpoint Layanan Pembayaran FloverArts_
 * Berkomunikasi dengan rute /api/payments backend
 */
import apiClient from '../client';

export const paymentApi = {
  /**
   * Mengirimkan tagihan pembayaran Snap (Midtrans)
   * @param {Object} data { order_id, payment_type }
   */
  charge: (data) => apiClient.post('/payments/charge', data),

  /**
   * Menerbitkan atau mengambil QRIS Midtrans resmi untuk pesanan
   * @param {number|string} orderId
   */
  getQris: (orderId) => apiClient.post('/payments/qris', { order_id: orderId }),

  /**
   * Memeriksa dan mensinkronisasi status pembayaran terkini
   * @param {number|string} orderId
   */
  checkStatus: (orderId) => apiClient.get(`/payments/status/${orderId}`),

  /**
   * Mensimulasikan pembayaran berhasil (1-klik sandbox testing)
   * @param {number|string} orderId
   */
  simulateSuccess: (orderId) => apiClient.post(`/payments/simulate-success/${orderId}`),
};

export default paymentApi;
