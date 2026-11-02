import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductCard from '../features/catalog/components/ProductCard';
import ProductGrid from '../features/catalog/components/ProductGrid';
import ProductCardSkeleton from '../features/catalog/components/ProductCardSkeleton';
import CatalogPage from '../features/catalog/pages/CatalogPage';
import catalogApi from '../api/endpoints/catalog';

const mockProduct = {
  id: 1,
  name: 'Buket Mawar Merah',
  slug: 'buket-mawar-merah-klasik',
  category_id: 1,
  category_name: 'Romance',
  price: 250000,
  description: 'Rangkaian 10 tangkai mawar merah segar pilihan terbaik.',
  image_url: '/public/hero-giant-bouquet.png',
  stock: 10,
};

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ProductCard Component', () => {
  it('harus menampilkan nama produk, harga berformat Rupiah, dan badge kategori', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    // 1. Nama produk tampil
    expect(screen.getByText('Buket Mawar Merah')).toBeInTheDocument();

    // 2. Kategori produk tampil
    expect(screen.getByText('Romance')).toBeInTheDocument();

    // 3. Harga Rupiah tampil dengan format benar (Rp 250.000)
    expect(screen.getByText(/Rp\s*250\.000/)).toBeInTheDocument();
  });

  it('TIDAK boleh menampilkan deskripsi, label "Harga", maupun tombol "Detail"', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    // Deskripsi produk tidak boleh ada
    expect(
      screen.queryByText('Rangkaian 10 tangkai mawar merah segar pilihan terbaik.')
    ).not.toBeInTheDocument();

    // Label kata "Harga" tidak boleh ada
    expect(screen.queryByText('Harga')).not.toBeInTheDocument();

    // Tombol teks "Detail" tidak boleh ada
    expect(screen.queryByText('Detail')).not.toBeInTheDocument();

    // Tombol hati wishlist tidak boleh ada
    expect(screen.queryByLabelText(/wishlist/i)).not.toBeInTheDocument();
  });

  it('harus memiliki tautan tunggal ke /produk/:slug dengan aria-label yang aksesibel', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    // Seluruh kartu adalah link
    const link = screen.getByRole('link', {
      name: 'Lihat detail Buket Mawar Merah',
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/produk/buket-mawar-merah-klasik');
  });

  it('menampilkan fallback netral jika gambar tidak ada atau gagal dimuat', () => {
    const productWithoutImage = { ...mockProduct, image_url: null };
    renderWithRouter(<ProductCard product={productWithoutImage} />);

    expect(screen.getByText('FloverArts_')).toBeInTheDocument();
  });
});

describe('ProductCardSkeleton Component', () => {
  it('harus merender skeleton kartu dengan aria-hidden', () => {
    render(<ProductCardSkeleton />);
    const skeleton = screen.getByTestId('product-card-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('ProductGrid Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (ui) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );

  it('harus menampilkan skeleton ketika dalam keadaan loading', () => {
    renderWithProviders(
      <ProductGrid products={[]} isLoading={true} isError={false} skeletonCount={4} />
    );

    expect(screen.getByTestId('catalog-loading-state')).toBeInTheDocument();
    expect(screen.getAllByTestId('product-card-skeleton')).toHaveLength(4);
  });

  it('harus menampilkan empty state jika daftar produk kosong dan tidak sedang loading', () => {
    renderWithProviders(
      <ProductGrid products={[]} isLoading={false} isError={false} />
    );

    expect(screen.getByTestId('catalog-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Produk Tidak Ditemukan')).toBeInTheDocument();
  });

  it('harus menampilkan ErrorState dengan tombol Coba Lagi saat terjadi kegagalan fetching', () => {
    const handleRetry = vi.fn();
    renderWithProviders(
      <ProductGrid
        products={[]}
        isLoading={false}
        isError={true}
        error={new Error('Koneksi ke backend gagal')}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId('catalog-error-state')).toBeInTheDocument();
    expect(screen.getByText('Gagal Memuat Produk')).toBeInTheDocument();
    expect(screen.getByText('Koneksi ke backend gagal')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /coba lagi/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('harus menampilkan kartu-kartu produk saat sukses memuat data', () => {
    const mockList = [
      mockProduct,
      {
        id: 2,
        name: 'Buket Lily Putih Elegan',
        slug: 'buket-lily-putih-elegan',
        category_name: 'Buket Segar',
        price: 320000,
        image_url: '/uploads/products/lily.jpg',
      },
    ];

    renderWithProviders(
      <ProductGrid products={mockList} isLoading={false} isError={false} />
    );

    expect(screen.getByTestId('catalog-product-grid')).toBeInTheDocument();
    expect(screen.getByText('Buket Mawar Merah')).toBeInTheDocument();
    expect(screen.getByText('Buket Lily Putih Elegan')).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*320\.000/)).toBeInTheDocument();
  });
});

describe('CatalogPage Component', () => {
  it('harus merender header katalog, pill kategori, dan produk dengan benar', async () => {
    vi.spyOn(catalogApi, 'getCategories').mockResolvedValueOnce({
      success: true,
      data: [
        { id: 1, name: 'Buket Bunga Segar', slug: 'buket-bunga-segar' },
        { id: 3, name: 'Buket Wisuda & Hadiah', slug: 'buket-wisuda-hadiah' },
      ],
    });
    vi.spyOn(catalogApi, 'getProducts').mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 101,
          name: 'Classic Sunset Bouquet',
          category_id: 1,
          category_name: 'Buket Bunga Segar',
          slug: 'classic-sunset-bouquet',
          price: 350000,
          stock: 12,
          image_url: '/bouquet-sunflower.jpg',
        },
      ],
    });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/produk']}>
          <CatalogPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Katalog Rangkaian Bunga/i })).toBeInTheDocument();
    expect(screen.getByText('Semua Koleksi')).toBeInTheDocument();
    expect(await screen.findByText('Classic Sunset Bouquet')).toBeInTheDocument();
  });
});
