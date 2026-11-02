import React, { useState } from 'react';
import { Flower2 } from 'lucide-react';
import { findMatchingFallback } from '../../lib/imageResolver';

/**
 * ResponsiveImage Component
 * 
 * Reusable image component that prevents Cumulative Layout Shift (CLS),
 * supports priority loading (eager / fetchpriority), configurable object-position,
 * and graceful neutral fallback on image load failure.
 *
 * @param {string} src - Image source URL or imported asset
 * @param {string} alt - Indonesian descriptive alt text (or '' for decorative)
 * @param {string} [className] - Additional classes for container
 * @param {string} [imgClassName] - Additional classes for <img> element
 * @param {string} [aspectRatio] - Tailwind aspect ratio class (e.g. 'aspect-[3/4]', 'aspect-square')
 * @param {string} [objectPosition] - Object position class (e.g. 'object-center', 'object-[center_35%]')
 * @param {string} [rounded] - Tailwind rounded class (e.g. 'rounded-2xl', 'rounded-full')
 * @param {boolean} [priority=false] - Above-the-fold hero image optimization
 * @param {string} [fallbackLabel] - Optional label shown in fallback state
 * @param {boolean} [fill=false] - When true, image absolutely fills parent container (absolute inset-0)
 */
export function ResponsiveImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  aspectRatio = '',
  objectPosition = 'object-center',
  rounded = 'rounded-none',
  priority = false,
  fallbackLabel = 'Buket FloverArts_',
  fill = false,
  slug = '',
}) {
  const [failedSrc, setFailedSrc] = useState(null);

  const fallback = findMatchingFallback(slug, alt || fallbackLabel);
  let activeSrc = src;
  if (failedSrc === src && src) {
    activeSrc = fallback;
  }
  const isBroken = !activeSrc || failedSrc === fallback;

  // Decorative check
  const isDecorative = !alt || alt.trim() === '';

  // Container styling based on layout mode
  const containerClasses = fill
    ? `relative w-full h-full overflow-hidden ${rounded} ${className}`
    : `relative w-full ${aspectRatio} overflow-hidden ${rounded} ${className}`;

  const handleError = () => {
    if (failedSrc !== src && src) {
      setFailedSrc(src);
    } else {
      setFailedSrc(fallback);
    }
  };

  if (isBroken) {
    return (
      <div
        className={`${containerClasses} bg-[#F5F0F7] border border-[#EAE3E9] flex flex-col items-center justify-center p-3 select-none text-center`}
        aria-hidden={isDecorative ? 'true' : undefined}
      >
        <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-primary/40 shadow-xs mb-1">
          <Flower2 size={18} />
        </div>
        {fallbackLabel && (
          <span className="text-[11px] font-medium text-secondaryText tracking-wide line-clamp-1">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  const imgClasses = fill
    ? `absolute inset-0 w-full h-full object-cover ${objectPosition} ${imgClassName}`
    : `w-full h-full object-cover ${objectPosition} ${imgClassName}`;

  return (
    <div className={containerClasses}>
      <img
        src={activeSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={handleError}
        className={imgClasses}
        aria-hidden={isDecorative ? 'true' : undefined}
      />
    </div>
  );
}

export default ResponsiveImage;
