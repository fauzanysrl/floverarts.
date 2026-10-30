import React from 'react';
import { RotateCcw } from 'lucide-react';
import RevealSection from './RevealSection';
import ProductCard from '../../catalog/components/ProductCard';
import ErrorState from '../../../components/feedback/ErrorState';

export function BestSellingSection({
  activeCategory,
  searchQuery,
  categories,
  isCategoriesLoading,
  products,
  isProductsLoading,
  isProductsError,
  productsError,
  refetchProducts,
  onSelectCategory,
  onClearFilters,
}) {
  return (
    <section id="katalog" className="py-16 md:py-24">
      <RevealSection className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-semibold mb-1 block">CURATED SELECTION</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primaryText">Best-Selling Bouquets</h2>
          </div>
          {(activeCategory || searchQuery) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-primary bg-softLavender px-4 py-2 rounded-full hover:bg-accentLavender/50 transition-colors font-medium"
            >
              <RotateCcw size={13} />
              <span>Show All Bouquets</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-10 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectCategory('')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all select-none ${
              !activeCategory ? 'bg-primary text-white shadow-xs' : 'bg-[#FAF7FB] text-secondaryText hover:text-primaryText hover:bg-[#EDE3F2]'
            }`}
          >
            All Bouquets
          </button>
          {!isCategoriesLoading &&
            categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id.toString())}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all select-none ${
                  activeCategory === cat.id.toString()
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-[#FAF7FB] text-secondaryText hover:text-primaryText hover:bg-[#EDE3F2]'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Product Grid */}
        {isProductsError ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 my-6">
            <ErrorState
              title="Gagal Memuat Produk"
              message={productsError?.message || 'Tidak dapat terhubung ke server backend.'}
              onRetry={refetchProducts}
            />
          </div>
        ) : isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-xs p-4 flex flex-col gap-3 animate-pulse">
                <div className="w-full aspect-[4/5] bg-bgSecondary rounded-xl" />
                <div className="h-4 bg-bgSecondary rounded w-3/4" />
                <div className="h-3 bg-bgSecondary rounded w-1/2" />
                <div className="h-5 bg-bgSecondary rounded w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </RevealSection>
    </section>
  );
}

export default BestSellingSection;
