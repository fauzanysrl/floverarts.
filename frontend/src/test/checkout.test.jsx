import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import orderApi from '../api/endpoints/order';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let mockUser = { id: 1, name: 'Clarissa Aurelia', phone: '81234567890', role: 'customer' };
vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
  }),
}));

let mockCartItems = [];
let mockTotalAmount = 0;
const mockClearCart = vi.fn();

vi.mock('../features/cart/hooks/useCart', () => ({
  useCart: () => ({
    items: mockCartItems,
    totalAmount: mockTotalAmount,
    clearCart: mockClearCart,
    closeCart: vi.fn(),
  }),
}));

vi.mock('../api/endpoints/order', () => ({
  default: {
    checkout: vi.fn(),
  },
}));

describe('CheckoutPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 1, name: 'Clarissa Aurelia', phone: '81234567890', role: 'customer' };
    mockCartItems = [];
    mockTotalAmount = 0;
  });

  it('harus menampilkan pesan keranjang kosong jika belum ada item', () => {
    mockCartItems = [];
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Keranjang Belanja Kosong')).toBeInTheDocument();
    expect(screen.getByText('Eksplorasi Katalog Bunga')).toBeInTheDocument();
  });

  it('harus merender form checkout lengkap jika keranjang berisi item', () => {
    mockCartItems = [
      {
        product_id: 1,
        product_name: 'Blushing Pink Harmony',
        unit_price: 250000,
        quantity: 1,
        subtotal: 250000,
      },
    ];
    mockTotalAmount = 250000;

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument();
    expect(screen.getByText('Antar ke Alamat')).toBeInTheDocument();
    expect(screen.getByText('Ambil di Toko')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Blushing Pink Harmony')).toBeInTheDocument();
  });

  it('dapat beralih antara mode Antar ke Alamat dan Ambil di Toko', () => {
    mockCartItems = [
      {
        product_id: 1,
        product_name: 'Blushing Pink Harmony',
        unit_price: 250000,
        quantity: 1,
        subtotal: 250000,
      },
    ];
    mockTotalAmount = 250000;

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    // Default mode: Antar ke Alamat
    expect(screen.getByText('Informasi Penerima Bunga')).toBeInTheDocument();

    // Klik Ambil di Toko
    fireEvent.click(screen.getByText('Ambil di Toko'));
    expect(screen.getByText('Detail Pengambilan di Butik Atelier')).toBeInTheDocument();
    expect(screen.getByText('FloverArts Atelier Cilacap')).toBeInTheDocument();
  });

  it('dapat membuat pesanan dan melakukan redirect ke halaman pembayaran', async () => {
    mockCartItems = [
      {
        product_id: 1,
        product_name: 'Blushing Pink Harmony',
        unit_price: 250000,
        quantity: 1,
        subtotal: 250000,
      },
    ];
    mockTotalAmount = 250000;

    orderApi.checkout.mockResolvedValueOnce({
      data: {
        id: 99,
        order_number: 'FA-20261102-0099',
      },
    });

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    // Isi alamat pengiriman
    const addressInput = screen.getByPlaceholderText(/Contoh: Jl. Diponegoro No. 45/i);
    fireEvent.change(addressInput, { target: { value: 'Jl. Kenanga No. 12, Cilacap' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Bayar Sekarang/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(orderApi.checkout).toHaveBeenCalledTimes(1);
      expect(mockClearCart).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/pembayaran/99');
    });
  });
});
