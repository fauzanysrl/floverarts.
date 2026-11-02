import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Flower2 } from 'lucide-react';
import { formatIDR } from '../../../lib/formatters';
import { findMatchingFallback } from '../../../lib/imageResolver';

/**
 * Helper untuk memetakan nama kategori yang tampil di badge produk.
 * Kategori resmi toko FloverArts_: Anniversary, Romance, Thank you, Celebration, Birthday.
 */
function getProductCategoryLabel(product) {
  if (!product) return '';
  const rawCat = (product.category_name || '').trim();

  // Validasi jika sudah salah satu dari 5 kategori resmi
  const validCategories = ['Anniversary', 'Romance', 'Thank you', 'Celebration', 'Birthday'];
  if (validCategories.includes(rawCat)) {
    return rawCat;
  }

  // Fallback pemetaan dari data backend / legacy ke 5 kategori resmi
  const nameLower = (product.name || '').toLowerCase();
  const catLower = rawCat.toLowerCase();

  if (nameLower.includes('anniversary') || catLower.includes('anniversary')) return 'Anniversary';
  if (nameLower.includes('birthday') || nameLower.includes('ulang tahun') || nameLower.includes('hbd') || catLower.includes('birthday')) return 'Birthday';
  if (nameLower.includes('wisuda') || nameLower.includes('graduation') || nameLower.includes('sunset') || nameLower.includes('sunflower') || nameLower.includes('matahari') || nameLower.includes('mix') || catLower.includes('celebration')) return 'Celebration';
  if (nameLower.includes('lily') || nameLower.includes('daisy') || nameLower.includes('terima kasih') || catLower.includes('thank')) return 'Thank you';
  if (nameLower.includes('tulip') || nameLower.includes('rose') || nameLower.includes('mawar') || catLower.includes('romance') || catLower.includes('segar')) return 'Romance';

  return 'Romance';
}

/**
 * Komponen Kartu Produk FloverArts_
 * 
 * Spesifikasi & Desain:
 * - Seluruh kartu adalah satu <Link> ke /produk/:slug (Aksesibilitas & Anti-nested interactive)
 * - Foto di dalam kartu dengan padding konsisten, aspect-ratio 1:1, sudut rounded-xl
 * - Badge kategori di pojok kanan atas foto (tidak ikut blur saat hover)
 * - Efek hover (desktop hover-capable): foto zoom ~1.07 & blur ~5px, tombol lingkaran burgundy 48px muncul di tengah
 * - Layar sentuh: foto tidak di-blur, ikon panah kecil permanen di pojok foto
 * - Menggunakan formatIDR untuk mata uang Rupiah
 * - Tanpa deskripsi, tombol "Detail", label "Harga", maupun tombol wishlist
 */
export function ProductCard({ product }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!product) return null;

  const originalSrc = product.image_url;
  const fallback = findMatchingFallback(product.slug, product.name);
  const categoryBadge = getProductCategoryLabel(product);

  // Jika image_url awal tidak ada, langsung tampilkan placeholder netral
  // Jika image_url dari backend gagal dimuat (404), beralih ke foto asli lokal di public
  let displayImage = originalSrc;
  if (failedSrc === originalSrc && originalSrc) {
    displayImage = fallback;
  }
  const isBroken = !displayImage || failedSrc === fallback;

  const handleImageError = () => {
    if (failedSrc !== originalSrc && originalSrc) {
      setFailedSrc(originalSrc);
    } else {
      setFailedSrc(fallback);
    }
  };

  return (
    <Link
      to={`/produk/${product.slug}`}
      aria-label={`Lihat detail ${product.name}`}
      className="group block bg-white rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-card hover:-translate-y-1.5 active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none will-change-transform cursor-pointer"
    >
      {/* Photo Frame Container (Aspect Ratio 1:1) */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FAF7FB]">
        {/* Photo with hover blur & zoom (only active on hover-capable devices) */}
        <div className="w-full h-full overflow-hidden">
          {isBroken || !displayImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7FB] text-secondaryText">
              <Flower2 size={28} className="text-accentLavender mb-1" />
              <span className="text-[11px] text-secondaryText">FloverArts_</span>
            </div>
          ) : (
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover object-center transition-[transform,filter] duration-300 ease-out motion-reduce:transform-none motion-reduce:filter-none motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.07] [@media(hover:hover)]:group-hover:blur-[5px] [@media(hover:hover)]:group-focus-visible:scale-[1.07] [@media(hover:hover)]:group-focus-visible:blur-[5px]"
            />
          )}
        </div>

        {/* Category Badge: Top-right corner of photo, separate from blur container */}
        {categoryBadge && (
          <span className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2.5 sm:px-3 py-1 bg-primaryText/85 text-white text-[11px] font-roboto font-medium rounded-full shadow-xs backdrop-blur-xs select-none z-10">
            {categoryBadge}
          </span>
        )}

        {/* Center Circle Action Button (Hover-capable devices only) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden [@media(hover:hover)]:flex items-center justify-center z-10"
        >
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-button opacity-0 scale-90 transition-[opacity,transform] duration-300 ease-out [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-focus-visible:opacity-100 [@media(hover:hover)]:group-focus-visible:scale-100 motion-reduce:transform-none motion-reduce:transition-none">
            <ArrowUpRight size={22} className="text-white" />
          </div>
        </div>

        {/* Touch Screen Indicator: Small permanent arrow badge at corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2.5 right-2.5 flex [@media(hover:hover)]:hidden items-center justify-center w-7 h-7 rounded-full bg-primary/90 text-white shadow-sm z-10"
        >
          <ArrowUpRight size={14} className="text-white" />
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 sm:pt-4 pb-1 sm:pb-2 flex flex-col justify-between">
        {/* Product Name (Poppins heading, line-clamp-2 with fixed min-height for row alignment) */}
        <div className="min-h-[2.5rem] sm:min-h-[3rem] flex items-start">
          <h3 className="font-heading text-base sm:text-lg text-primaryText font-medium leading-snug line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Formatted Rupiah Price (Roboto for maximum numerical legibility) */}
        <div className="mt-1">
          <span className="font-roboto text-sm sm:text-base font-semibold text-primary">
            {formatIDR(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
