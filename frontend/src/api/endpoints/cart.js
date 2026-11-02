/**
 * Endpoint Layanan Keranjang Belanja FloverArts_
 * Berkomunikasi dengan rute /api/cart backend
 */
import apiClient from '../client';

export const cartApi = {
  /**
   * Mengambil rincian keranjang belanja pelanggan aktif
   */
  getCart: () => apiClient.get('/cart'),

  /**
   * Menambahkan item produk standar atau custom ke keranjang
   * @param {Object} data { item_type, product_id, quantity, custom_details }
   */
  addItem: (data) => apiClient.post('/cart/items', data),

  /**
   * Memperbarui kuantitas item dalam keranjang
   * @param {number|string} itemId
   * @param {number} quantity
   */
  updateQuantity: (itemId, quantity) => apiClient.patch(`/cart/items/${itemId}`, { quantity }),

  /**
   * Menghapus satu item dari keranjang
   * @param {number|string} itemId
   */
  removeItem: (itemId) => apiClient.delete(`/cart/items/${itemId}`),

  /**
   * Mengosongkan seluruh item dalam keranjang
   */
  clearCart: () => apiClient.delete('/cart'),
};

export default cartApi;

