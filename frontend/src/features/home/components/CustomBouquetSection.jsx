import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import RevealSection from './RevealSection';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import { CUSTOM_BOUQUET_SHOWCASE } from '../constants/homeImages';

export function CustomBouquetSection() {
  return (
    <section className="py-16 md:py-24">
      <RevealSection className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7FB] rounded-[28px] p-8 sm:p-12 md:p-14 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-semibold mb-2">
              CUSTOM ARRANGEMENT
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-primaryText mb-4 leading-tight">
              Made Especially for You
            </h2>
            <p className="text-sm sm:text-base text-secondaryText leading-relaxed mb-8 max-w-lg">
              Create a bouquet that reflects your personal style. Choose your favorite flowers and make every arrangement meaningful.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8">
              {[
                'Pilihan Bunga Segar Bebas',
                'Warna Wrapping Satin Premium',
                'Kartu Ucapan Pesan Tulus',
                'Perhitungan Estimasi Harga Live',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-primaryText font-medium">
                  <Check size={16} className="text-primary shrink-0 stroke-[2.5]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link
              to="/buket-custom"
              className="px-7 py-3.5 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary-hover active:scale-95 transition-all shadow-button inline-flex items-center gap-2 tracking-wider uppercase"
            >
              <span>CREATE YOUR BOUQUET</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden shadow-card border-4 border-white bg-white">
              <ResponsiveImage
                src={CUSTOM_BOUQUET_SHOWCASE}
                alt="Rangkaian buket kustom satin buatan tangan oleh FloverArts_"
                aspectRatio="aspect-[4/5]"
                fallbackLabel="Buket Custom"
              />
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

export default CustomBouquetSection;
