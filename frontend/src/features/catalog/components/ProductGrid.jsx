import React from 'react';
import { Flower2 } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import ErrorState from '../../../components/feedback/ErrorState';
import { useProducts } from '../hooks/useProducts';

/**
 * Komponen EmptyState untuk katalog ketika produk kosong
 */
export function EmptyState({
  title = 'Produk Tidak Ditemukan',
  message = 'Maaf, belum ada rangkaian bunga yang tersedia pada kategori ini.',
}) {
  return (
    <div
      data-testid="catalog-empty-state"
      className="w-full py-16 px-4 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center text-center my-4"
    >
      <div className="w-14 h-14 rounded-full bg-[#FAF7FB] flex items-center justify-center text-primary/40 mb-3.5">
        <Flower2 size={28} />
      </div>
      <h3 className="font-serif text-lg font-bold text-primaryText mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-secondaryText max-w-sm leading-relaxed">
        {message}
      </p>
    </div>
  );
}

/**
 * Komponen Grid Katalog Produk FloverArts_
 * 
 * Spesifikasi & Responsivitas (Mobile-First):
 * - 2 kolom di layar mobile (360px - 412px, tanpa overflow horizontal)
 * - 3 kolom di layar tablet (md: 768px)
 * - 4 kolom di layar desktop lebar (xl: 1280px ke atas)
 * - 4 Keadaan Wajib: Loading, Error, Empty, Success
 * 
 * @param {Object} props
 * @param {Array} [props.products] - Data produk langsung (opsional jika dikontrol parent)
 * @param {boolean} [props.isLoading] - Status loading eksplisit dari parent
 * @param {boolean} [props.isError] - Status error eksplisit dari parent
 * @param {Object|string} [props.error] - Pesan/objek error
 * @param {Function} [props.onRetry] - Handler coba lagi
 * @param {Object} [props.params] - Parameter jika menggunakan useProducts otomatis
 * @param {number} [props.skeletonCount=8] - Jumlah kartu skeleton saat loading
 * @param {string} [props.className] - Kelas CSS tambahan
 */
export function ProductGrid({
  products: controlledProducts,
  isLoading: controlledLoading,
  isError: controlledError,
  error: controlledErrorObj,
  onRetry: controlledRetry,
  params,
  skeletonCount = 8,
  className = '',
}) {
  // Jika props tidak dipasok dari parent, gunakan hook useProducts internal
  const isHookMode = controlledProducts === undefined;
  const hookResult = useProducts(params || {}, {
    enabled: isHookMode,
  });

  const isLoading = isHookMode ? hookResult.isLoading : controlledLoading;
  const isError = isHookMode ? hookResult.isError : controlledError;
  const errorObj = isHookMode ? hookResult.error : controlledErrorObj;
  const onRetry = isHookMode ? () => hookResult.refetch() : controlledRetry;
  const products = isHookMode ? (hookResult.data || []) : (controlledProducts || []);

  // 1. Keadaan Error
  if (isError) {
    const message =
      typeof errorObj === 'string'
        ? errorObj
        : errorObj?.message || 'Terjadi kendala saat mengambil data produk. Silakan coba lagi.';

    return (
      <div data-testid="catalog-error-state" className="w-full bg-white rounded-2xl shadow-sm p-6 sm:p-8 my-4">
        <ErrorState
          title="Gagal Memuat Produk"
          message={message}
          onRetry={onRetry}
        />
      </div>
    );
  }

  // 2. Keadaan Loading (Skeleton)
  if (isLoading) {
    const skeletons = Array.from({ length: skeletonCount }, (_, idx) => idx);
    return (
      <div
        data-testid="catalog-loading-state"
        className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full ${className}`}
      >
        {skeletons.map((key) => (
          <ProductCardSkeleton key={key} />
        ))}
      </div>
    );
  }

  // 3. Keadaan Kosong (Empty State)
  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  // 4. Keadaan Sukses (Grid Produk)
  return (
    <div
      data-testid="catalog-product-grid"
      className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id || product.slug} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
