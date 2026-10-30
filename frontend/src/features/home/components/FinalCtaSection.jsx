import React from 'react';
import { Link } from 'react-router-dom';
import RevealSection from './RevealSection';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import { FINAL_CTA_SHOP_IMAGE, FINAL_CTA_FLOAT_THUMB } from '../constants/homeImages';

export function FinalCtaSection() {
  return (
    <section className="py-16 md:py-24 max-w-container mx-auto px-4 sm:px-6 lg:px-8 bg-white">
      <RevealSection className="bg-[#FAF7FB] rounded-[28px] p-8 sm:p-12 md:p-14 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-10 items-center overflow-hidden">
        {/* Left: Headline, description, CTA buttons */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-semibold mb-4">
            READY TO ORDER?
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-normal text-primaryText leading-[1.1] mb-5">
            Find The Perfect <br />
            Bouquet Today
          </h2>
          <p className="text-sm text-secondaryText leading-relaxed max-w-[400px] mb-8">
            From life's biggest celebrations to the smallest thoughtful gestures, we're here to help you find flowers that leave a lasting impression. Explore our handcrafted collection or get in touch to create a bouquet that's uniquely yours.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#katalog"
              className="px-7 py-3.5 bg-[#3B122D] text-white text-sm font-semibold rounded-full hover:bg-primary-hover active:scale-95 transition-all shadow-button"
            >
              Shop Now
            </a>
            <Link
              to="/buket-custom"
              className="px-7 py-3.5 bg-[#EDE3F2] text-[#3B122D] text-sm font-semibold rounded-full hover:bg-accentLavender/60 active:scale-95 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right: Shop photo with floating product card (The Blossom style) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[420px]">
            {/* Rounded shop photo */}
            <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-card bg-[#F5F0F7]">
              <img
                src={FINAL_CTA_SHOP_IMAGE}
                alt="Floverarts florist studio"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating product card — top left corner like reference */}
            <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 bg-white rounded-[20px] shadow-card p-3.5 flex items-center gap-3 z-10 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F5F0F7] shrink-0">
                <ResponsiveImage
                  src={FINAL_CTA_FLOAT_THUMB}
                  alt="Buket promo Vanilla Mojito"
                  aspectRatio="aspect-square"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#B88A50] uppercase tracking-wider block">Sale</span>
                <p className="text-sm font-serif font-bold text-primaryText leading-tight">Vanilla Mojito</p>
                <p className="text-xs text-secondaryText mt-0.5">
                  <span className="font-medium text-primaryText">Rp 115.000</span>{' '}
                  <span className="line-through text-[#C4B4BD]">Rp 140.000</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

export default FinalCtaSection;
