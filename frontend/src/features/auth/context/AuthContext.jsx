/**
 * AuthProvider FloverArts_
 * Mengelola state autentikasi pengguna secara defensif dan aman.
 * Sesuai Aturan C-8:
 * - Access token HANYA disimpan di memori state (bukan di storage browser).
 * - Refresh token HANYA disimpan di sessionStorage (tanpa localStorage).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../../../lib/constants';
import { setMemoryToken, getMemoryToken, registerLogoutHandler } from '../../../api/client';
import authApi from '../../../api/endpoints/auth';
import { logger } from '../../../lib/logger';
import { AuthContext } from './AuthContextInstance';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem(STORAGE_KEYS.USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fungsi Logout Terpusat
  const logout = useCallback(async () => {
    const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // Bersihkan sesi client seketika
    setMemoryToken(null);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);

    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        logger.warn('Gagal mencabut refresh token di server saat logout', err);
      }
    }
  }, []);

  // Hubungkan callback logout otomatis dari interceptor 401
  useEffect(() => {
    registerLogoutHandler(() => {
      logout();
    });
  }, [logout]);

  // Inisialisasi Sesi Saat Aplikasi Dimuat (Silent Refresh bila ada refreshToken di sessionStorage)
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedRefreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!storedRefreshToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.refreshToken(storedRefreshToken);
        const newAccessToken = res.token || res.data?.token;

        if (newAccessToken && isMounted) {
          setMemoryToken(newAccessToken);
          logger.info('Sesi autentikasi berhasil dipulihkan dari refresh token.');
        }
      } catch (err) {
        logger.warn('Gagal memulihkan sesi autentikasi pada startup', err);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Menyimpan sesi baru setelah login / registrasi berhasil
   * @param {Object} authPayload
   * @param {string} authPayload.token - Access Token JWT
   * @param {string} authPayload.refreshToken - Refresh Token JWT
   * @param {Object} authPayload.user - Objek data pengguna
   */
  const handleAuthSuccess = useCallback((authPayload) => {
    const token = authPayload.token || authPayload.data?.token;
    const refreshToken = authPayload.refreshToken || authPayload.data?.refreshToken;
    const userData = authPayload.data?.user || authPayload.user;

    if (token) {
      setMemoryToken(token);
    }

    if (refreshToken) {
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    if (userData) {
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user && !!getMemoryToken(),
    isLoading,
    login: handleAuthSuccess,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
