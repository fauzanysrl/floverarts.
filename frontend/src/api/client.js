/**
 * Axios HTTP Client FloverArts_
 * Titik tunggal pemanggilan HTTP ke backend API.
 * Mendukung autentikasi Bearer token dari memori dan antrean silent refresh token.
 */
import axios from 'axios';
import { normalizeError } from './errors';
import { STORAGE_KEYS } from '../lib/constants';
import { logger } from '../lib/logger';

// Variabel memori untuk access token (TIDAK disimpan di localStorage/sessionStorage)
let memoryAccessToken = null;
let logoutCallback = null;

// Antrean request yang menunggu proses refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Setter & Getter Access Token di memori
 */
export function setMemoryToken(token) {
  memoryAccessToken = token;
}

export function getMemoryToken() {
  return memoryAccessToken;
}

export function registerLogoutHandler(cb) {
  logoutCallback = cb;
}

// Inisialisasi Instance Axios
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor Permintaan (Request)
apiClient.interceptors.request.use(
  (config) => {
    if (memoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(normalizeError(error));
  }
);

// Interceptor Respons (Response)
apiClient.interceptors.response.use(
  (response) => {
    // Kembalikan payload data langsung jika amplop respons sesuai { success: true, data }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Jika error bukan 401 atau request menuju rute refresh/login, langsung lempar
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh-token')
    ) {
      return Promise.reject(normalizeError(error));
    }

    // Tangani 401 dengan Silent Refresh menggunakan refreshToken dari sessionStorage
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(normalizeError(err));
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const storedRefreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!storedRefreshToken) {
      isRefreshing = false;
      if (logoutCallback) logoutCallback();
      return Promise.reject(normalizeError(error));
    }

    try {
      logger.info('Mencoba memperbarui sesi via silent refresh token...');
      const refreshResponse = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh-token`,
        { refreshToken: storedRefreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newAccessToken =
        refreshResponse.data?.token || refreshResponse.data?.data?.token;

      if (!newAccessToken) {
        throw new Error('Token baru tidak ditemukan pada respons refresh.');
      }

      setMemoryToken(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      logger.warn('Sesi kedaluwarsa atau refresh token ditolak. Melakukan logout...');
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      setMemoryToken(null);

      if (logoutCallback) {
        logoutCallback();
      }

      return Promise.reject(normalizeError(refreshErr));
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
