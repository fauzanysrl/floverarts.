/**
 * Endpoint Layanan Katalog Publik (Kategori & Produk)
 */
import apiClient from '../client';

export const catalogApi = {
  /**
   * Mengambil daftar seluruh kategori aktif
   */
  getCategories: () => apiClient.get('/categories'),

  /**
   * Mengambil daftar produk (mendukung filter category_id, search, limit, page)
   * @param {Object} [params]
   */
  getProducts: (params = {}) => apiClient.get('/products', { params }),

  /**
   * Mengambil detail produk berdasarkan slug
   * @param {string} slug
   */
  getProductBySlug: (slug) => apiClient.get(`/products/${slug}`),

  /**
   * Mengambil master komponen buket custom
   */
  getCustomComponents: () => apiClient.get('/custom-components'),
};

export default catalogApi;
