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
          <span className="text-[11px] font-roboto uppercase tracking-[0.2em] text-secondaryText font-semibold mb-3">
            SIAP MEMESAN?
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-[52px] font-semibold text-primaryText leading-[1.1] mb-5">
            Find The Perfect <br />
            Bouquet Today
          </h2>
          <p className="text-sm text-secondaryText leading-relaxed max-w-[420px] mb-8 font-sans">
            Dari perayaan momen spesial hingga kejutan hangat untuk orang terkasih, FloverArts siap merangkai bunga segar terbaik dengan ketulusan dan sentuhan artistik.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#katalog"
              className="px-7 py-3.5 bg-[#3B122D] text-white text-sm font-semibold rounded-full hover:bg-primary-hover active:scale-95 transition-all shadow-button"
            >
              Pesan Sekarang
            </a>
            <Link
              to="/buket-custom"
              className="px-7 py-3.5 bg-[#EDE3F2] text-[#3B122D] text-sm font-semibold rounded-full hover:bg-accentLavender/60 active:scale-95 transition-all"
            >
              Buket Custom
            </Link>
          </div>
        </div>

        {/* Right: Shop photo with floating product card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[420px]">
            {/* Rounded bouquet photo */}
            <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-card bg-white border-4 border-white">
              <ResponsiveImage
                src={FINAL_CTA_SHOP_IMAGE}
                alt="Rangkaian buket bunga spesial FloverArts_"
                aspectRatio="aspect-[4/3]"
                objectPosition="object-center"
                fallbackLabel="Buket FloverArts_"
              />
            </div>

            {/* Floating product card — top left corner */}
            <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 bg-white rounded-[20px] shadow-card p-3.5 flex items-center gap-3 z-10 hover:-translate-y-1 transition-transform border border-[#FAF7FB]">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7FB] shrink-0 border border-white">
                <ResponsiveImage
                  src={FINAL_CTA_FLOAT_THUMB}
                  alt="Buket promo Sweet Romance"
                  aspectRatio="aspect-square"
                />
              </div>
              <div>
                <span className="text-[10px] font-roboto font-bold text-[#B88A50] uppercase tracking-wider block">PROMO SPESIAL</span>
                <p className="text-sm font-heading font-semibold text-primaryText leading-tight">Sweet Romance</p>
                <p className="text-xs text-secondaryText mt-0.5 font-roboto">
                  <span className="font-semibold text-primary font-roboto">Rp 250.000</span>{' '}
                  <span className="line-through text-[#C4B4BD] font-roboto">Rp 280.000</span>
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

