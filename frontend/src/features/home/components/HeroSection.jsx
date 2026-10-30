import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Check } from 'lucide-react';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import {
  HERO_MAIN_BOUQUET,
  HERO_THUMB_1,
  HERO_THUMB_2,
} from '../constants/homeImages';

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-white">
      {/* Soft Ambient Blur Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] rounded-full bg-gradient-to-tr from-[#EDE3F2]/60 via-[#F5EDF8]/50 to-[#FAF7FB]/40 filter blur-3xl pointer-events-none -z-10" />

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* Left: Headline */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF7FB]/90 backdrop-blur-md text-[11px] uppercase tracking-[0.22em] text-secondaryText font-semibold mb-4 shadow-xs">
              <Sparkles size={12} className="text-primary" />
              PREMIUM FLORIST · CILACAP
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-normal text-primaryText tracking-tight leading-[1.08] mb-4">
              Flowers Made <br />
              For Every <br />
              <span className="italic font-normal">Moment</span>
            </h1>
            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed max-w-xs mb-2">
              Handcrafted bouquets from the freshest seasonal blooms, made especially for you.
            </p>
          </div>

          {/* Center: Main Bouquet Card */}
          <div className="lg:col-span-5 flex justify-center py-2 animate-scale-up delay-150">
            <div className="relative w-full max-w-[340px] sm:max-w-[370px]">
              <div className="relative aspect-[3/4] w-full rounded-[30px] overflow-hidden bg-white shadow-card border-4 border-white transition-transform duration-500 hover:rotate-0 rotate-[-1deg]">
                <ResponsiveImage
                  src={HERO_MAIN_BOUQUET}
                  alt="Buket mawar dan hydrangea merah muda signature FloverArts_"
                  aspectRatio="aspect-[3/4]"
                  priority={true}
                  objectPosition="object-center"
                  fallbackLabel="Buket Utama FloverArts_"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[26px] pointer-events-none" />
              </div>
              {/* Overlapping Mini Thumbnails */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 flex items-center gap-2 z-10 animate-fade-in-up delay-300">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 border-white shadow-lg overflow-hidden bg-white hover:scale-105 transition-transform duration-200">
                  <ResponsiveImage
                    src={HERO_THUMB_1}
                    alt="Buket bunga warna-warni kreasi kertas kraft"
                    aspectRatio="aspect-square"
                    fallbackLabel="Mini buket"
                  />
                </div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 border-white shadow-lg overflow-hidden bg-white hover:scale-105 transition-transform duration-200">
                  <ResponsiveImage
                    src={HERO_THUMB_2}
                    alt="Rangkaian buket bunga mini kreasi kraft"
                    aspectRatio="aspect-square"
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
                <span className="font-bold text-sm text-primaryText ml-1">5.0</span>
              </div>
              <span className="text-[11px] text-secondaryText tracking-wide mt-0.5">100+ Happy Customers</span>
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
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
