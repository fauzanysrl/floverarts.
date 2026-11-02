import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import {
  HERO_MAIN_BOUQUET,
  HERO_THUMB_1,
  HERO_THUMB_2,
} from '../constants/homeImages';

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* Left: Headline */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#FAF7FB] text-[11px] font-roboto uppercase tracking-[0.22em] text-secondaryText font-semibold mb-4 border border-[#EAE3E9]">
              PREMIUM FLORIST · CILACAP
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-semibold text-primaryText tracking-tight leading-[1.08] mb-4">
              Flowers Made <br />
              For Every <br />
              <span className="italic font-normal">Moment</span>
            </h1>
            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed max-w-xs mb-2 font-sans">
              Handcrafted bouquets from the freshest seasonal blooms, made especially for you.
            </p>
          </div>

          {/* Center: Main Bouquet Card */}
          <div className="lg:col-span-5 flex justify-center py-2 animate-scale-up delay-150">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[440px]">
              <div className="relative aspect-[3/4] w-full rounded-[28px] overflow-hidden bg-white shadow-card border-4 border-white transition-transform duration-500 hover:rotate-0 rotate-[3deg]">
                <ResponsiveImage
                  src={HERO_MAIN_BOUQUET}
                  alt="Buket mawar merah signature FloverArts_"
                  fill={true}
                  priority={true}
                  rounded="rounded-none"
                  objectPosition="object-center"
                  fallbackLabel="Buket Utama FloverArts_"
                />
              </div>
              {/* Overlapping Mini Thumbnails */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 flex items-center gap-2 z-10 animate-fade-in-up delay-300">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 border-white shadow-lg overflow-hidden bg-white hover:scale-105 transition-transform duration-200">
                  <ResponsiveImage
                    src={HERO_THUMB_1}
                    alt="Buket anniversary pastel FloverArts_"
                    fill={true}
                    rounded="rounded-[10px]"
                    fallbackLabel="Mini buket"
                  />
                </div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 border-white shadow-lg overflow-hidden bg-white hover:scale-105 transition-transform duration-200">
                  <ResponsiveImage
                    src={HERO_THUMB_2}
                    alt="Buket bunga warna-warni kreasi FloverArts_"
                    fill={true}
                    rounded="rounded-[10px]"
                    fallbackLabel="Mini buket"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Rating, Checklist, Buttons (Side by Side) */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left gap-5 animate-fade-in-up delay-200">
            <div className="flex flex-col items-center lg:items-start">
              <div className="flex items-center gap-1.5 text-amber-500">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-sm text-primaryText ml-1 font-roboto">5.0</span>
              </div>
              <span className="text-[11px] text-secondaryText tracking-wide mt-0.5 font-roboto">100+ Happy Customers</span>
            </div>

            <div className="flex flex-col items-start gap-2.5 my-1 text-left">
              {['Fresh Seasonal Flowers', 'Handcrafted to Order', 'Custom Arrangements', 'Local Delivery'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs sm:text-[13px] text-primaryText font-medium">
                  <Check size={14} className="text-primary stroke-[2.5]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Side by side buttons (Shop Now & Contact Us) */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto pt-1">
              <a
                href="#katalog"
                className="px-6 sm:px-7 py-3 sm:py-3.5 bg-[#3B122D] text-white text-xs font-semibold rounded-full hover:bg-primary-hover active:scale-95 transition-all duration-200 tracking-wider uppercase shadow-button text-center shrink-0"
              >
                Shop Now
              </a>
              <Link
                to="/buket-custom"
                className="px-6 sm:px-7 py-3 sm:py-3.5 bg-[#EDE3F2] text-[#3B122D] text-xs font-semibold rounded-full hover:bg-accentLavender/60 active:scale-95 transition-all duration-200 tracking-wider uppercase text-center shrink-0"
              >
                Buket Custom
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;

