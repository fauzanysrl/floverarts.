import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';
import HomePage from '../features/home/pages/HomePage';
import CatalogPage from '../features/catalog/pages/CatalogPage';
import ProductDetailPage from '../features/catalog/pages/ProductDetailPage';
import CustomBouquetPage from '../features/custom/pages/CustomBouquetPage';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import PaymentProofPage from '../features/checkout/pages/PaymentProofPage';
import AboutPage from '../pages/AboutPage';
import PolicyPage from '../pages/PolicyPage';
import OrdersPage from '../pages/OrdersPage';
import ProfilePage from '../pages/ProfilePage';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import { useCart } from '../features/cart/hooks/useCart';
import NotFoundPage from '../pages/NotFound';

function CartRedirect() {
  const { openCart } = useCart();
  React.useEffect(() => {
    openCart();
  }, [openCart]);
  return <HomePage />;
}

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
            <CatalogPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/katalog"
        element={
          <CustomerLayout>
            <CatalogPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/produk/:slug"
        element={
          <CustomerLayout>
            <ProductDetailPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/keranjang"
        element={
          <CustomerLayout>
            <CartRedirect />
          </CustomerLayout>
        }
      />
      <Route
        path="/buket-custom"
        element={
          <CustomerLayout>
            <CustomBouquetPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <CustomerLayout>
            <CheckoutPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/pembayaran/:orderId"
        element={
          <CustomerLayout>
            <PaymentProofPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/about"
        element={
          <CustomerLayout>
            <AboutPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/tentang-kami"
        element={
          <CustomerLayout>
            <AboutPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/kebijakan"
        element={
          <CustomerLayout>
            <PolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <CustomerLayout>
            <PolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          <CustomerLayout>
            <PolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/pesanan"
        element={
          <CustomerLayout>
            <OrdersPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/profil"
        element={
          <CustomerLayout>
            <ProfilePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <CustomerLayout>
            <AdminDashboardPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <CustomerLayout>
            <AdminDashboardPage />
          </CustomerLayout>
        }
      />

      {/* Rute Masuk & Daftar Autentikasi (Standalone Card) */}
      <Route path="/masuk" element={<LoginForm />} />
      <Route path="/daftar" element={<RegisterForm />} />

      {/* Rute 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
