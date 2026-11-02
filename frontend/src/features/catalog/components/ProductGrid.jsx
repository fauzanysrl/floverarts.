import React from 'react';
import { Flower2, RotateCcw } from 'lucide-react';
import { animate } from 'animejs';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import ErrorState from '../../../components/feedback/ErrorState';
import { useProducts } from '../hooks/useProducts';
import { useAnimeScope } from '../../../lib/useAnimeScope';
import { DURATIONS, EASINGS } from '../../../lib/motion';

/**
 * Komponen EmptyState untuk katalog ketika produk kosong
 */
export function EmptyState({
  title = 'Produk Tidak Ditemukan',
  message = 'Maaf, belum ada rangkaian bunga yang cocok dengan filter atau kata kunci yang Anda pilih.',
  onReset,
}) {
  return (
    <div
      data-testid="catalog-empty-state"
      className="w-full py-16 px-6 bg-white rounded-2xl border border-[#EAE3E9] shadow-2xs flex flex-col items-center justify-center text-center my-4"
    >
      <div className="w-14 h-14 rounded-full bg-[#FAF7FB] border border-[#EAE3E9] flex items-center justify-center text-primary mb-4 shadow-2xs">
        <Flower2 size={26} />
      </div>
      <h3 className="font-heading text-lg font-semibold text-primaryText mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-secondaryText max-w-md leading-relaxed font-sans mb-6">
        {message}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
        >
          <RotateCcw size={13} />
          <span>Tampilkan Semua Koleksi</span>
        </button>
      )}
    </div>
  );
}

/**
 * Komponen Grid Katalog Produk FloverArts_
 * 
 * Spesifikasi & Animasi (Anime.js v4):
 * - Grid 3 kolom responsif di desktop
 * - Stagger fade-in & upward slide saat produk berganti (filter/paginasi)
 * - Aman terhadap preferensi reduced motion
 * 
 * @param {Object} props
 * @param {Array} [props.products] - Data produk langsung
 * @param {boolean} [props.isLoading] - Status loading eksplisit dari parent
 * @param {boolean} [props.isError] - Status error eksplisit dari parent
 * @param {Object|string} [props.error] - Pesan/objek error
 * @param {Function} [props.onRetry] - Handler coba lagi
 * @param {Function} [props.onReset] - Handler reset filter
 * @param {Object} [props.params] - Parameter jika menggunakan useProducts otomatis
 * @param {number} [props.skeletonCount=6] - Jumlah kartu skeleton saat loading
 * @param {string} [props.className] - Kelas CSS tambahan
 */
export function ProductGrid({
  products: controlledProducts,
  isLoading: controlledLoading,
  isError: controlledError,
  error: controlledErrorObj,
  onRetry: controlledRetry,
  onReset,
  params,
  skeletonCount = 6,
  className = '',
}) {
  const isHookMode = controlledProducts === undefined;
  const hookResult = useProducts(params || {}, {
    enabled: isHookMode,
  });

  const isLoading = isHookMode ? hookResult.isLoading : controlledLoading;
  const isError = isHookMode ? hookResult.isError : controlledError;
  const errorObj = isHookMode ? hookResult.error : controlledErrorObj;
  const onRetry = isHookMode ? () => hookResult.refetch() : controlledRetry;
  const products = isHookMode ? (hookResult.data || []) : (controlledProducts || []);

  // Animasi Stagger Anime.js saat produk ditampilkan atau berganti
  const gridRef = useAnimeScope(
    ({ root, prefersReducedMotion }) => {
      if (prefersReducedMotion || !root) return;
      const cards = root.querySelectorAll('.catalog-card-item');
      if (!cards || cards.length === 0) return;

      animate(cards, {
        opacity: [0, 1],
        translateY: [14, 0],
        delay: (_, idx) => Math.min(idx * 40, 240),
        duration: DURATIONS.reveal || 350,
        ease: EASINGS.out || 'out(3)',
      });
    },
    [products]
  );

  // 1. Keadaan Error
  if (isError) {
    const message =
      typeof errorObj === 'string'
        ? errorObj
        : errorObj?.message || 'Terjadi kendala saat memuat data produk. Silakan coba lagi.';

    return (
      <div data-testid="catalog-error-state" className="w-full bg-white rounded-2xl shadow-sm p-6 sm:p-8 my-4 border border-[#EAE3E9]">
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
    return <EmptyState onReset={onReset} />;
  }

  // 4. Keadaan Sukses (Grid Produk dengan Animasi Halus)
  return (
    <div
      ref={gridRef}
      data-testid="catalog-product-grid"
      className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full ${className}`}
    >
      {products.map((product) => (
        <div key={product.id || product.slug} className="catalog-card-item">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;
