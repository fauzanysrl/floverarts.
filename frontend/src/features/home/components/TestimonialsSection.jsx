import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import RevealSection from './RevealSection';
import { TESTIMONIALS } from '../constants/homeData';

function TestimonialCard({ item, isCenter, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full transition-colors duration-500 text-left select-none ${
        isCenter
          ? 'bg-[#1a0d15] text-white shadow-2xl cursor-default'
          : 'bg-[#F8F6F8] text-[#30242D] shadow-sm hover:bg-[#F2EDF2] cursor-pointer'
      }`}
    >
      <div>
        {/* Rating Stars */}
        <div className="flex gap-1 mb-3.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={14}
              className={
                isCenter
                  ? 'fill-amber-300 text-amber-300'
                  : 'fill-[#C4B4BD] text-[#C4B4BD]'
              }
            />
          ))}
        </div>

        {/* Quote */}
        <p
          className={`text-sm sm:text-base leading-relaxed italic font-light ${
            isCenter ? 'text-white/95' : 'text-[#857985]'
          }`}
        >
          {item.quote}
        </p>
      </div>

      {/* Author & Initial Avatar */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-current/10">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs border-2 shrink-0 ${
            isCenter
              ? 'bg-white/20 text-white border-white/40'
              : 'bg-softLavender text-primary border-softLavender'
          }`}
          aria-hidden="true"
        >
          {item.initials || item.name.charAt(0)}
        </div>
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              isCenter ? 'text-white' : 'text-[#30242D]'
            }`}
          >
            {item.name}
          </p>
          <p
            className={`text-[10px] ${
              isCenter ? 'text-white/70' : 'text-[#857985]'
            }`}
          >
            {item.role}
          </p>
        </div>
      </div>
    </div>
  );
}

function TestimonialCarousel({ items }) {
  const [active, setActive] = useState(1); // default active index: 1 (Nur Hayati)
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const total = items.length;

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setActive((a) => (a + 1) % total);
  }, [total]);

  // Touch Swipe Handlers untuk Layar Sentuh / Mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      next(); // Geser ke kiri -> lanjut ke testimoni berikutnya
    } else if (distance < -minSwipeDistance) {
      prev(); // Geser ke kanan -> kembali ke testimoni sebelumnya
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Smooth Sliding Carousel Stage */}
      <div className="relative h-[230px] sm:h-[240px] w-full flex items-center justify-center overflow-hidden sm:overflow-visible">
        {items.map((item, idx) => {
          // Hitung relative circular offset terhadap kartu aktif (-1: kiri, 0: tengah, 1: kanan)
          let offset = (idx - active) % total;
          if (offset < -Math.floor(total / 2)) offset += total;
          if (offset > Math.floor(total / 2)) offset -= total;

          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;

          // Hitung opacity & zIndex berdasarkan posisi
          let opacityStyle = 0;
          let zIndexStyle = 1;
          let pointerEvents = 'none';

          if (isCenter) {
            opacityStyle = 1;
            zIndexStyle = 20;
            pointerEvents = 'auto';
          } else if (isLeft || isRight) {
            opacityStyle = 0.55;
            zIndexStyle = 10;
            pointerEvents = 'auto';
          }

          return (
            <div
              key={item.name}
              style={{
                opacity: opacityStyle,
                zIndex: zIndexStyle,
                pointerEvents,
              }}
              className={`absolute top-0 bottom-0 w-[88%] max-w-[340px] sm:max-w-[380px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCenter
                  ? 'translate-x-0 scale-100'
                  : isLeft
                  ? '-translate-x-[105%] sm:-translate-x-[340px] md:-translate-x-[370px] scale-90 sm:scale-95'
                  : isRight
                  ? 'translate-x-[105%] sm:translate-x-[340px] md:translate-x-[370px] scale-90 sm:scale-95'
                  : 'translate-x-0 scale-75 opacity-0'
              }`}
            >
              <TestimonialCard
                item={item}
                isCenter={isCenter}
                onClick={() => {
                  if (isLeft) prev();
                  if (isRight) next();
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Arrow Navigation Buttons dengan Efek Klik Responsif & Animasi Sentuh */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous testimonial"
        className="group absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-[#3B122D] text-[#30242D] hover:text-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 active:scale-80 hover:scale-105 active:shadow-inner cursor-pointer z-30 focus:outline-none focus:ring-2 focus:ring-[#3B122D]/40"
      >
        <ChevronLeft
          size={20}
          className="stroke-[2.2] transition-transform duration-150 group-hover:-translate-x-0.5 group-active:-translate-x-1"
        />
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Next testimonial"
        className="group absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-[#3B122D] text-[#30242D] hover:text-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 active:scale-80 hover:scale-105 active:shadow-inner cursor-pointer z-30 focus:outline-none focus:ring-2 focus:ring-[#3B122D]/40"
      >
        <ChevronRight
          size={20}
          className="stroke-[2.2] transition-transform duration-150 group-hover:translate-x-0.5 group-active:translate-x-1"
        />
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`rounded-full transition-all duration-300 active:scale-75 ${
              i === active
                ? 'w-7 h-2.5 bg-[#3B122D] shadow-xs'
                : 'w-2.5 h-2.5 bg-[#EAE3E9] hover:bg-[#D9B7CC] hover:scale-125'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white">
      <RevealSection className="w-full">
        <span className="text-[11px] font-roboto uppercase tracking-[0.2em] text-secondaryText font-semibold mb-1 block">
          CLIENT FEEDBACK
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-primaryText mb-12">
          Customer Testimonials
        </h2>
        <div className="relative px-4 sm:px-10">
          <TestimonialCarousel items={TESTIMONIALS} />
        </div>
      </RevealSection>
    </section>
  );
}

export default TestimonialsSection;
