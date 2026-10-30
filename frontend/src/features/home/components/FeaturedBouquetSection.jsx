import React from 'react';
import RevealSection from './RevealSection';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import {
  FEATURED_MAIN_BOUQUET,
  FEATURED_MINI_THUMB_1,
  FEATURED_MINI_THUMB_2,
  FEATURED_CARD_LEFT_THUMB,
  FEATURED_CARD_RIGHT_THUMB,
} from '../constants/homeImages';

export function FeaturedBouquetSection() {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <RevealSection className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Mini Thumbnails */}
        <div className="flex items-center justify-center gap-3.5 mb-8">
          {[
            { src: FEATURED_MINI_THUMB_1, alt: 'Display buket bunga kering bernuansa hijau di rak' },
            { src: FEATURED_MINI_THUMB_2, alt: 'Buket bunga carnation dan mawar berbungkus kertas pink' },
          ].map((thumb, i) => (
            <div key={i} className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden shadow-sm border-2 border-white bg-white hover:scale-105 transition-transform duration-300">
              <ResponsiveImage
                src={thumb.src}
                alt={thumb.alt}
                aspectRatio="aspect-square"
              />
            </div>
          ))}
        </div>

        {/* Heading */}
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-[62px] text-primaryText font-normal tracking-tight leading-[1.12] mb-12 sm:mb-16">
          Handcrafted Bouquets <br />
          <span className="italic font-normal">You'll Love</span>
        </h2>

        {/* Main Image + Floating Cards */}
        <div className="relative w-full max-w-[540px] flex flex-col items-center">
          <div className="relative aspect-[3/4] w-full rounded-[32px] sm:rounded-[40px] overflow-hidden bg-white shadow-card border-4 border-white">
            <ResponsiveImage
              src={FEATURED_MAIN_BOUQUET}
              alt="Rangkaian buket satin eksklusif Pink Serenity Lily FloverArts_"
              aspectRatio="aspect-[3/4]"
              fallbackLabel="Buket Pilihan FloverArts_"
            />
          </div>

          {/* Left Floating Card */}
          <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:absolute sm:-left-12 lg:-left-24 sm:top-14 z-20">
            <div className="bg-white rounded-[24px] shadow-card p-4 sm:p-5 flex items-center gap-3.5 max-w-[320px] w-full text-left hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-[#F5F0F7]">
                <ResponsiveImage
                  src={FEATURED_CARD_LEFT_THUMB}
                  alt="Buket bundar lily dan anyelir berbalut kain goni"
                  aspectRatio="aspect-square"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#6D8B72] mb-0.5">BEST SELLER</span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-primaryText leading-snug">Pink Harmony</h4>
                <span className="text-xs text-secondaryText font-medium mt-0.5">Rp 125.000</span>
              </div>
            </div>
          </div>

          {/* Right Floating Card */}
          <div className="w-full sm:w-auto mt-3 sm:mt-0 sm:absolute sm:-right-12 lg:-right-24 sm:bottom-14 z-20">
            <div className="bg-white rounded-[24px] shadow-card p-4 sm:p-5 flex items-center gap-3.5 max-w-[320px] w-full text-left hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-[#F5F0F7]">
                <ResponsiveImage
                  src={FEATURED_CARD_RIGHT_THUMB}
                  alt="Buket bunga daisy putih di dalam paper bag kraft"
                  aspectRatio="aspect-square"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#B88A50] mb-0.5">NEW</span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-primaryText leading-snug">White Bloom</h4>
                <span className="text-xs text-secondaryText font-medium mt-0.5">Rp 115.000</span>
              </div>
            </div>
          </div>
        </div>

      </RevealSection>
    </section>
  );
}

export default FeaturedBouquetSection;
