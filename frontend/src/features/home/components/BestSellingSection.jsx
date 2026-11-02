import React from 'react';
import { RotateCcw } from 'lucide-react';
import RevealSection from './RevealSection';
import ProductGrid from '../../catalog/components/ProductGrid';

export function BestSellingSection({
  activeCategory,
  searchQuery,
  products,
  isProductsLoading,
  isProductsError,
  productsError,
  refetchProducts,
  onClearFilters,
}) {
  return (
    <section id="katalog" className="pt-2 pb-16 md:pt-4 md:pb-24">
      <RevealSection className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header & Subtitle */}
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-primaryText mb-3">
            Best Selling Bouquets
          </h2>
          <p className="font-sans font-normal text-[14px] text-secondaryText leading-relaxed">
            Rangkaian bunga dan hadiah penuh makna yang paling digemari, dirancang dengan indah untuk menjadikan setiap momen terasa istimewa.
          </p>
          {(activeCategory || searchQuery) && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1.5 text-xs text-primary bg-softLavender px-4 py-2 rounded-full hover:bg-accentLavender/50 transition-colors font-medium"
              >
                <RotateCcw size={13} />
                <span>Show All Bouquets</span>
              </button>
            </div>
          )}
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
