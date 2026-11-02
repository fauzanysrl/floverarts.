import React from 'react';

/**
 * Skeleton Loader untuk ProductCard
 * Memiliki dimensi, padding, dan rasio aspek yang identik dengan ProductCard
 * untuk mencegah Layout Shift (CLS) saat data produk sedang dimuat.
 */
export function ProductCardSkeleton({ className = '' }) {
  return (
    <div
      data-testid="product-card-skeleton"
      className={`bg-white rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col select-none ${className}`}
      aria-hidden="true"
    >
      {/* Photo Frame Skeleton (Aspect Ratio 1:1) */}
      <div className="relative aspect-square w-full rounded-xl skeleton-shimmer overflow-hidden">
        {/* Placeholder shimmer badge top-right */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-16 h-5 rounded-full bg-softLavender/80" />
      </div>

      {/* Info Skeleton */}
      <div className="pt-3 sm:pt-4 pb-1 sm:pb-2 flex flex-col justify-between">
        {/* Title skeleton (2 lines to match line-clamp-2 min-height) */}
        <div className="min-h-[2.5rem] sm:min-h-[3rem] flex flex-col justify-center gap-1.5">
          <div className="h-4 skeleton-shimmer rounded-xs w-4/5" />
          <div className="h-3.5 skeleton-shimmer rounded-xs w-3/5" />
        </div>

        {/* Price skeleton */}
        <div className="mt-2">
          <div className="h-4 skeleton-shimmer rounded-xs w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
