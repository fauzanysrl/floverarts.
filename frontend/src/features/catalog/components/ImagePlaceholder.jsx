import React, { useState } from 'react';
import { Flower2 } from 'lucide-react';

/**
 * Komponen ImagePlaceholder Bersih, Minimalis & Elegan
 * Menggunakan palet lembut #F5F0F7 dan border #EAE3E9.
 * Tidak memakai foto palsu / AI slop. Siap diganti foto asli oleh pengguna.
 */
export function ImagePlaceholder({
  src,
  alt = 'Floverarts Bouquet',
  className = '',
  aspectRatio = 'aspect-square',
  label = 'Area Foto Buket',
  rounded = 'rounded-md',
}) {
  const [hasError, setHasError] = useState(false);

  const shouldShowImage = src && !hasError;

  return (
    <div
      className={`relative w-full ${aspectRatio} ${rounded} bg-[#F5F0F7] border border-[#EAE3E9] overflow-hidden flex items-center justify-center select-none group ${className}`}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary/30 group-hover:text-primary/60 transition-colors shadow-xs">
            <Flower2 size={20} />
          </div>
          <span className="text-xs font-medium text-secondaryText tracking-wide">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export default ImagePlaceholder;
