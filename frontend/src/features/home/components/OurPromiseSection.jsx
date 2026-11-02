import React from 'react';
import RevealSection from './RevealSection';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import { OUR_PROMISE_IMAGE } from '../constants/homeImages';
import { PROMISES } from '../constants/homeData';

function PromiseIcon({ children }) {
  return (
    <div
      className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-primary mb-3.5 sm:mb-4 shrink-0"
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export function OurPromiseSection() {
  return (
    <section className="py-16 md:py-24 bg-white" id="tentang-kami" aria-labelledby="our-promise-heading">
      <RevealSection className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12 text-center">
          <span className="text-[11px] font-roboto uppercase tracking-[0.2em] text-secondaryText font-semibold mb-2 block">
            QUALITY &amp; DEDICATION
          </span>
          <h2
            id="our-promise-heading"
            className="font-heading text-3xl sm:text-4xl font-semibold text-primaryText leading-tight"
          >
            Our Promise
          </h2>
        </div>

        {/* 2 Zones Layout: Left photo (1/3) + Right 2x2 cards (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-5 items-stretch">
          {/* Left: Photo container (height 100% determined by right cards on desktop) */}
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-auto lg:h-full rounded-2xl overflow-hidden bg-[#FAF7FB]">
            <ResponsiveImage
              src={OUR_PROMISE_IMAGE}
              alt="Perangkaian buket kembar profesional FloverArts_ dengan sentuhan artisan"
              fill={true}
              objectPosition="object-center"
              fallbackLabel="Dedikasi & Kualitas FloverArts_"
            />
          </div>

          {/* Right: 2x2 Grid of 4 compact cards with equal row heights */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4 sm:gap-5 list-none p-0 m-0">
            {PROMISES.map((promise, idx) => {
              const IconComponent = promise.icon;
              return (
                <li
                  key={idx}
                  className="p-6 sm:p-7 rounded-2xl bg-[#FAF7FB] flex flex-col justify-start"
                >
                  <PromiseIcon>
                    <IconComponent size={20} />
                  </PromiseIcon>
                  <h3 className="font-heading text-lg sm:text-[19px] font-semibold text-primaryText mb-1.5 leading-snug">
                    {promise.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-secondaryText leading-relaxed line-clamp-3">
                    {promise.desc}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </RevealSection>
    </section>
  );
}

export default OurPromiseSection;

