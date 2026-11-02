import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductDetailPage from '../features/catalog/pages/ProductDetailPage';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { CartProvider } from '../features/cart/context/CartContext';
import catalogApi from '../api/endpoints/catalog';

// Mock catalogApi
vi.mock('../api/endpoints/catalog', () => ({
  default: {
    getProductBySlug: vi.fn(),
    getProducts: vi.fn(),
  },
}));

const mockProduct = {
  id: 101,
  name: 'Buket Mawar Pastel Elegant',
  slug: 'buket-mawar-pastel-elegant',
  category_id: 1,
  category_name: 'Buket Bunga Segar',
  price: 275000,
  description: 'Rangkaian 12 mawar segar dengan wrapping lavender premium.',
  image_url: '/public/hero-giant-bouquet.png',
  stock: 5,
  min_stock: 2,
};

function renderWithClient(initialRoute = '/produk/buket-mawar-pastel-elegant') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/produk/:slug" element={<ProductDetailPage />} />
              <Route path="/" element={<div>Halaman Beranda</div>} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ProductDetailPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus merender informasi detail produk secara lengkap dari API', async () => {
    catalogApi.getProductBySlug.mockResolvedValueOnce({
      success: true,
      data: mockProduct,
    });
    catalogApi.getProducts.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    renderWithClient();

    // Tunggu data dimuat
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Buket Mawar Pastel Elegant');
    });

    // Validasi harga Rupiah
    expect(screen.getByText(/Rp\s*275\.000/)).toBeInTheDocument();

    // Validasi deskripsi
    expect(screen.getByText(/Rangkaian 12 mawar segar/i)).toBeInTheDocument();

    // Validasi badge stok tersedia
    expect(screen.getByText(/Stok Tersedia \(5 buket\)/i)).toBeInTheDocument();

    // Validasi tombol aksi
    expect(screen.getByRole('button', { name: /Tambah ke Keranjang/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beli Sekarang/i })).toBeInTheDocument();
  });

  it('harus memvalidasi kontrol penambahan dan pengurangan kuantitas', async () => {
    catalogApi.getProductBySlug.mockResolvedValueOnce({
      success: true,
      data: mockProduct,
    });
    catalogApi.getProducts.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    renderWithClient();

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    const btnPlus = screen.getByLabelText(/Tambah jumlah/i);
    const btnMinus = screen.getByLabelText(/Kurangi jumlah/i);

    // Kuantitas awal adalah 1, tombol kurangi harus disabled
    expect(btnMinus).toBeDisabled();

    // Tambah kuantitas
    fireEvent.click(btnPlus);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(btnMinus).not.toBeDisabled();

    // Kurangi kuantitas kembali ke 1
    fireEvent.click(btnMinus);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(btnMinus).toBeDisabled();
  });

  it('harus menampilkan notifikasi saat tombol Tambah ke Keranjang ditekan', async () => {
    catalogApi.getProductBySlug.mockResolvedValueOnce({
      success: true,
      data: mockProduct,
    });
    catalogApi.getProducts.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    renderWithClient();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tambah ke Keranjang/i })).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Tambah ke Keranjang/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/1x Buket Mawar Pastel Elegant dimasukkan ke keranjang!/i)
      ).toBeInTheDocument();
    });
  });

  it('harus menampilkan status error / not found jika produk tidak ditemukan', async () => {
    catalogApi.getProductBySlug.mockRejectedValueOnce(new Error('Produk tidak ditemukan'));

    renderWithClient('/produk/slug-tidak-ada');

    await waitFor(() => {
      expect(screen.getByText('Buket Tidak Ditemukan')).toBeInTheDocument();
    });

    expect(screen.getByText('Kembali ke Katalog')).toBeInTheDocument();
  });
});

