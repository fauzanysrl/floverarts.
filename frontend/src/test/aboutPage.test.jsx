import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AboutPage from '../pages/AboutPage';

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AboutPage Component', () => {
  it('harus merender seluruh 6 section utama tentang kami', () => {
    renderWithProviders(<AboutPage />);

    // 1. Hero Section
    expect(
      screen.getByRole('heading', { name: /Bunga untuk Setiap Cerita dan Perasaan\./i })
    ).toBeInTheDocument();

    // 2. Brand Story Section
    expect(
      screen.getByRole('heading', { name: /Setiap Rangkaian Memiliki Suara/i })
    ).toBeInTheDocument();

    // 3. Our Values Section
    expect(
      screen.getByRole('heading', { name: /Komitmen Kami untuk Setiap Tangkai/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Bunga Segar Terkurasi Ketat/i)).toBeInTheDocument();
    expect(screen.getByText(/Sentuhan Personal di Setiap Rangkaian/i)).toBeInTheDocument();

    // 4. Our Process Section
    expect(
      screen.getByRole('heading', { name: /Proses Pembuatan Rangkaian/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/01 \/ Eksplorasi Desain/i)).toBeInTheDocument();
    expect(screen.getByText(/02 \/ Perangkaian Artisan/i)).toBeInTheDocument();
    expect(screen.getByText(/03 \/ Kartu Ucapan Khusus/i)).toBeInTheDocument();
    expect(screen.getByText(/04 \/ Pengantaran Terjaga/i)).toBeInTheDocument();

    // 5. Featured Collection Section
    expect(
      screen.getByRole('heading', { name: /Koleksi Pilihan FloverArts/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('about-featured-grid')).toBeInTheDocument();

    // 6. Closing CTA Section
    expect(
      screen.getByRole('heading', { name: /Hadirkan Kesan Mendalam Lewat Rangkaian Bunga Segar\./i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Jelajahi Katalog Bunga/i })).toHaveAttribute('href', '/katalog');
    expect(screen.getByRole('link', { name: /Rangkai Buket Custom/i })).toHaveAttribute('href', '/buket-custom');
  });

  it('harus menampilkan 4 kartu produk pada featured collection', () => {
    renderWithProviders(<AboutPage />);
    const grid = screen.getByTestId('about-featured-grid');
    const links = grid.querySelectorAll('a[href^="/produk/"]');
    expect(links.length).toBeGreaterThanOrEqual(4);
  });
});
