/**
 * Endpoint Layanan Pemesanan FloverArts_
 * Berkomunikasi dengan rute /api/orders dan /api/user/orders backend
 */
import apiClient from '../client';

export const orderApi = {
  /**
   * Membuat pesanan baru (checkout)
   * @param {Object} data { fulfillment_method, recipient_name, recipient_phone, delivery_address, delivery_date, delivery_time, notes, payment_method, items }
   */
  checkout: (data) => apiClient.post('/orders/checkout', data),

  /**
   * Mengambil riwayat seluruh pesanan pelanggan
   */
  getMyOrders: () => apiClient.get('/user/orders'),

  /**
   * Mengambil detail pesanan tertentu
   * @param {number|string} orderId
   */
  getMyOrderDetail: (orderId) => apiClient.get(`/user/orders/${orderId}`),

  /**
   * Mengambil pelacakan pesanan
   * @param {number|string} orderId
   */
  getOrderTracking: (orderId) => apiClient.get(`/user/orders/${orderId}/tracking`),
};

export default orderApi;

