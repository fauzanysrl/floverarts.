import React from 'react';
import { RotateCcw } from 'lucide-react';
import RevealSection from './RevealSection';
import ProductGrid from '../../catalog/components/ProductGrid';

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

        {/* Product Grid Terpusat */}
        <ProductGrid
          products={products}
          isLoading={isProductsLoading}
          isError={isProductsError}
          error={productsError}
          onRetry={refetchProducts}
          skeletonCount={4}
          className="lg:grid-cols-4"
        />
      </RevealSection>
    </section>
  );
}

export default BestSellingSection;

