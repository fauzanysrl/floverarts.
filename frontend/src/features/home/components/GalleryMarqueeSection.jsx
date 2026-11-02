import React from 'react';
import { GALLERY_ROW_1, GALLERY_ROW_2 } from '../constants/homeImages';

function MarqueeRow({ images, direction = 'left' }) {
  const doubled = [...images, ...images]; // duplicate for seamless loop
  return (
    <div className="marquee-track overflow-hidden w-full">
      <div className={direction === 'left' ? 'marquee-left' : 'marquee-right'}>
        {doubled.map((src, i) => (
          <div
            key={i}
            className="w-[260px] sm:w-[320px] h-[200px] sm:h-[230px] mx-2.5 rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-white group"
          >
            <img
              src={src}
              alt={`Gallery ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GalleryMarqueeSection() {
  return (
    <section className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="text-[11px] font-roboto uppercase tracking-[0.2em] text-secondaryText font-semibold mb-1 block">
          VISUAL INSPIRATION
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-primaryText">
          Bouquet Gallery
        </h2>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="mb-5">
        <MarqueeRow images={GALLERY_ROW_1} direction="left" />
      </div>
      {/* Row 2 — scrolls right */}
      <div>
        <MarqueeRow images={GALLERY_ROW_2} direction="right" />
      </div>
    </section>
  );
}

export default GalleryMarqueeSection;

