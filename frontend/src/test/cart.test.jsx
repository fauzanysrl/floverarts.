import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../features/cart/context/CartContext';
import { useCart } from '../features/cart/hooks/useCart';
import CartDrawer from '../features/cart/components/CartDrawer';
import cartApi from '../api/endpoints/cart';
import { STORAGE_KEYS } from '../lib/constants';

// Mock authApi & cartApi
vi.mock('../api/endpoints/cart', () => ({
  default: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
}));

let mockCurrentUser = null;
vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    logout: vi.fn(),
  }),
}));

// Test consumer helper
function CartTestConsumer() {
  const {
    items,
    totalItems,
    totalAmount,
    isOpen,
    openCart,
    closeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-amount">{totalAmount}</div>
      <div data-testid="is-open">{isOpen ? 'open' : 'closed'}</div>
      <div data-testid="item-count">{items.length}</div>

      <button type="button" onClick={openCart} data-testid="btn-open">
        Open
      </button>
      <button type="button" onClick={closeCart} data-testid="btn-close">
        Close
      </button>
      <button
        type="button"
        onClick={() =>
          addItem({
            product_id: 1,
            name: 'Mawar Merah',
            price: 100000,
            quantity: 2,
            item_type: 'standard',
          })
        }
        data-testid="btn-add-mawar"
      >
        Add Mawar
      </button>
      <button
        type="button"
        onClick={() => items[0] && updateQuantity(items[0].id, 3)}
        data-testid="btn-update-first"
      >
        Update First
      </button>
      <button
        type="button"
        onClick={() => items[0] && removeItem(items[0].id)}
        data-testid="btn-remove-first"
      >
        Remove First
      </button>
      <button type="button" onClick={clearCart} data-testid="btn-clear">
        Clear
      </button>

      <CartDrawer />
    </div>
  );
}

function renderCartWithRouter() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    </MemoryRouter>
  );
}

describe('Cart Feature & CartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = null;
    sessionStorage.clear();
  });

  it('harus mengelola keranjang guest di sessionStorage tanpa crash', async () => {
    renderCartWithRouter();

    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('total-amount')).toHaveTextContent('0');
    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');

    // Tambah produk
    fireEvent.click(screen.getByTestId('btn-add-mawar'));

    expect(screen.getByTestId('total-items')).toHaveTextContent('2');
    expect(screen.getByTestId('total-amount')).toHaveTextContent('200000');
    expect(screen.getByTestId('is-open')).toHaveTextContent('open');

    // Validasi persisted di sessionStorage
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.GUEST_CART) || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].name).toBe('Mawar Merah');
  });

  it('harus dapat mengubah kuantitas dan menghapus item dari keranjang', async () => {
    renderCartWithRouter();

    // Tambah produk 2x
    fireEvent.click(screen.getByTestId('btn-add-mawar'));
    expect(screen.getByTestId('total-items')).toHaveTextContent('2');

    // Ubah kuantitas ke 3
    fireEvent.click(screen.getByTestId('btn-update-first'));
    expect(screen.getByTestId('total-items')).toHaveTextContent('3');
    expect(screen.getByTestId('total-amount')).toHaveTextContent('300000');

    // Hapus item
    fireEvent.click(screen.getByTestId('btn-remove-first'));
    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('total-amount')).toHaveTextContent('0');
  });

  it('harus merender tampilan kosong dan membuka/menutup CartDrawer', async () => {
    renderCartWithRouter();

    // Buka drawer
    fireEvent.click(screen.getByTestId('btn-open'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('open');

    // Validasi empty state di CartDrawer
    expect(screen.getByText('Keranjang Masih Kosong')).toBeInTheDocument();
    expect(screen.getByText(/Belum ada buket bunga yang ditambahkan/i)).toBeInTheDocument();

    // Tutup drawer melalui tombol close di drawer
    const closeBtn = screen.getByLabelText('Tutup keranjang');
    fireEvent.click(closeBtn);
    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');
  });

  it('harus sinkron dengan API keranjang jika pengguna login sebagai customer', async () => {
    mockCurrentUser = { id: 5, name: 'Siti Florist', role: 'customer' };

    cartApi.getCart.mockResolvedValueOnce({
      success: true,
      data: {
        cart_id: 10,
        items: [
          {
            id: 201,
            item_type: 'standard',
            product_id: 1,
            name: 'Buket Mawar Eksklusif',
            slug: 'buket-mawar-eksklusif',
            unit_price: 150000,
            quantity: 2,
            subtotal: 300000,
            max_stock: 10,
            is_available: true,
          },
        ],
        total_items: 2,
        total_amount: 300000,
      },
    });

    renderCartWithRouter();

    await waitFor(() => {
      expect(cartApi.getCart).toHaveBeenCalled();
      expect(screen.getByTestId('total-items')).toHaveTextContent('2');
      expect(screen.getByTestId('total-amount')).toHaveTextContent('300000');
    });

    // Buka drawer dan periksa elemen item yang dirender
    fireEvent.click(screen.getByTestId('btn-open'));
    expect(screen.getByText('Buket Mawar Eksklusif')).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*300\.000/)).toBeInTheDocument();
  });
});

