import React from 'react';
import RevealSection from './RevealSection';
import { OCCASIONS } from '../constants/homeData';

export function OccasionsSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <RevealSection className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-semibold mb-1 block">
          OCCASIONS
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primaryText mb-10">
          Flowers for Every Moment
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {OCCASIONS.map((occasion, idx) => (
            <a
              key={idx}
              href="#katalog"
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#FAF7FB] shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-[#FAF7FB]">
                <img
                  src={occasion.image}
                  alt={occasion.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 text-center text-white">
                <p className="font-serif text-sm font-semibold tracking-wide">{occasion.name}</p>
                <p className="text-[10px] text-white/80 font-light">{occasion.label}</p>
              </div>
            </a>
          ))}
        </div>
      </RevealSection>
    </section>
  );
}

export default OccasionsSection;
