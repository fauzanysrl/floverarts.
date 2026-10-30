import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '../features/home/pages/HomePage';
import catalogApi from '../api/endpoints/catalog';

beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = MockIntersectionObserver;

  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
});

function renderHomePage(initialEntries = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('HomePage Component', () => {
  it('harus render seluruh section utama tanpa error', () => {
    renderHomePage();

    // 1. Hero headline tampil
    expect(screen.getByText(/Flowers Made/i)).toBeInTheDocument();

    // 2. Featured Bouquets heading tampil
    expect(screen.getByText(/You'll Love/i)).toBeInTheDocument();

    // 3. Best-Selling Bouquets section tampil
    expect(screen.getByText('Best-Selling Bouquets')).toBeInTheDocument();

    // 4. Bouquet Gallery heading tampil
    expect(screen.getByText('Bouquet Gallery')).toBeInTheDocument();

    // 5. Custom Bouquet section headline tampil
    expect(screen.getByText('Made Especially for You')).toBeInTheDocument();

    // 6. Occasions heading tampil
    expect(screen.getByText('Flowers for Every Moment')).toBeInTheDocument();

    // 7. Our Promise heading tampil
    expect(screen.getByText('Our Promise')).toBeInTheDocument();

    // 8. How It Works heading tampil
    expect(screen.getByText('Ordering Is Simple')).toBeInTheDocument();

    // 9. Testimonials heading tampil
    expect(screen.getByText('Customer Testimonials')).toBeInTheDocument();

    // 10. FAQ heading tampil
    expect(screen.getByText('Pertanyaan yang Sering Diajukan')).toBeInTheDocument();

    // 11. Final CTA heading tampil
    expect(screen.getByText(/Find The Perfect/i)).toBeInTheDocument();
  });

  it('harus mengirim parameter "q" ke API backend dan menampilkan produk hasil pencarian', async () => {
    const mockProducts = [
      {
        id: 99,
        name: 'Buket Mawar Hitam Spesial',
        slug: 'buket-mawar-hitam-spesial',
        category_name: 'Buket Bunga Segar',
        price: 350000,
        stock: 5,
        image_url: '/hero-giant-bouquet.png',
      },
    ];

    const getProductsSpy = vi.spyOn(catalogApi, 'getProducts').mockResolvedValue({
      success: true,
      data: mockProducts,
    });

    renderHomePage(['/?q=Mawar']);

    // Verifikasi parameter pencarian yang dikirim adalah q: 'Mawar'
    await waitFor(() => {
      expect(getProductsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'Mawar' })
      );
    });

    // Produk hasil pencarian harus tampil
    expect(await screen.findByText('Buket Mawar Hitam Spesial')).toBeInTheDocument();
  });

  it('harus menampilkan EmptyState dan TIDAK menampilkan produk default saat pencarian kosong', async () => {
    vi.spyOn(catalogApi, 'getProducts').mockResolvedValue({
      success: true,
      data: [],
    });

    renderHomePage(['/?q=BungaTidakAda123']);

    // Harus menampilkan empty state "Produk Tidak Ditemukan"
    expect(await screen.findByTestId('catalog-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Produk Tidak Ditemukan')).toBeInTheDocument();

    // Produk default (Classic Sunset Bouquet) TIDAK boleh muncul
    expect(screen.queryByText('Classic Sunset Bouquet')).not.toBeInTheDocument();
  });

  it('harus menampilkan fallback produk default saat tanpa filter dan database belum memiliki produk', async () => {
    vi.spyOn(catalogApi, 'getProducts').mockResolvedValue({
      success: true,
      data: [],
    });

    renderHomePage(['/']);

    // Karena tanpa filter dan data belum seeded, fallback produk default ditampilkan
    expect(await screen.findByText('Classic Sunset Bouquet')).toBeInTheDocument();
  });
});
