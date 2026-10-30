import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';
import HomePage from '../features/home/pages/HomePage';
import LoginForm from '../features/auth/components/LoginForm';
import NotFoundPage from '../pages/NotFound';

export function AppRouter() {
  return (
    <Routes>
      {/* Rute Utama Pelanggan (Beranda & Katalog) */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/produk"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }
      />

      {/* Rute Masuk / Autentikasi (Standalone Card) */}
      <Route path="/masuk" element={<LoginForm />} />

      {/* Rute 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
