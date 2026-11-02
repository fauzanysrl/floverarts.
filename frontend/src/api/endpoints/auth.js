/**
 * Endpoint Layanan Autentikasi FloverArts_
 */
import apiClient from '../client';

export const authApi = {
  /**
   * Pendaftaran akun pelanggan baru
   * @param {Object} data { name, email, password, phone, address }
   */
  register: (data) => apiClient.post('/auth/register', data),

  /**
   * Masuk sistem (Pelanggan / Admin)
   * @param {Object} credentials { email, password }
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /**
   * Memperbarui access token
   * @param {string} refreshToken
   */
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refreshToken }),

  /**
   * Keluar dari sesi dan mencabut refresh token di server
   * @param {string} refreshToken
   */
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
};

export default authApi;
