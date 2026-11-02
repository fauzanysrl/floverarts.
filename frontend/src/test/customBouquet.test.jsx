import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomBouquetPage from '../features/custom/pages/CustomBouquetPage';

const mockAddItem = vi.fn();

vi.mock('../features/cart/hooks/useCart', () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

describe('CustomBouquetPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus merender judul, 4 langkah wizard, dan ringkasan harga awal', () => {
    render(
      <MemoryRouter>
        <CustomBouquetPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Rakit Buket Impian Anda')).toBeDefined();
    expect(screen.getByText('Langkah 1: Pilih Bunga Utama & Kuantitas')).toBeDefined();
    expect(screen.getByText('Ringkasan Racikan Anda')).toBeDefined();
    expect(screen.getByText(/Total Estimasi:/i)).toBeDefined();
  });

  it('dapat mengubah jumlah tangkai bunga dan harga terupdate', () => {
    render(
      <MemoryRouter>
        <CustomBouquetPage />
      </MemoryRouter>
    );

    // Default 5 tangkai mawar (35.000 x 5 = 175.000) + wrapping kraft (20.000) + pita plum (10.000) = 205.000
    expect(screen.getByText(/205\.000/)).toBeDefined();

    // Tambah kuantitas tangkai
    const plusButtons = screen.getAllByRole('button');
    const plusBtn = plusButtons.find((btn) => btn.querySelector('svg.lucide-plus'));
    if (plusBtn) {
      fireEvent.click(plusBtn);
      // Kuantitas jadi 6: (35.000 x 6 = 210.000) + 20.000 + 10.000 = 240.000
      expect(screen.getByText(/240\.000/)).toBeDefined();
    }
  });

  it('dapat berpindah antar langkah wizard hingga langkah 4', () => {
    render(
      <MemoryRouter>
        <CustomBouquetPage />
      </MemoryRouter>
    );

    // Klik lanjut ke langkah 2
    fireEvent.click(screen.getByText(/Lanjut ke Langkah 2/i));
    expect(screen.getByText('Langkah 2: Pilih Kertas Pembungkus (Wrapping Paper)')).toBeDefined();

    // Klik lanjut ke langkah 3
    fireEvent.click(screen.getByText(/Lanjut ke Langkah 3/i));
    expect(screen.getByText('Langkah 3: Pilih Pita & Aksesoris Tambahan')).toBeDefined();

    // Klik lanjut ke langkah 4
    fireEvent.click(screen.getByText(/Lanjut ke Langkah 4/i));
    expect(screen.getByText('Langkah 4: Kartu Ucapan & Pesan Personal')).toBeDefined();
    expect(screen.getByText('Masukkan ke Keranjang')).toBeDefined();
  });

  it('dapat menyimpan racikan ke keranjang belanja saat tombol diklik', async () => {
    render(
      <MemoryRouter>
        <CustomBouquetPage />
      </MemoryRouter>
    );

    // Langsung klik tombol simpan di panel kanan
    const addToCartButton = screen.getByText('Tambahkan ke Keranjang');
    await act(async () => {
      fireEvent.click(addToCartButton);
    });

    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem.mock.calls[0][0].item_type).toBe('custom');
    expect(mockAddItem.mock.calls[0][0].name).toContain('Custom Bouquet');
  });
});
