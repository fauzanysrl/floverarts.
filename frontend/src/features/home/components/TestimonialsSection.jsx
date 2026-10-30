import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import RevealSection from './RevealSection';
import { TESTIMONIALS } from '../constants/homeData';

function TestimonialCard({ item, center = false }) {
  return (
    <div
      className={`rounded-2xl p-6 flex flex-col gap-4 transition-all duration-500 ${
        center
          ? 'bg-[#1a0d15] text-white shadow-2xl scale-100'
          : 'bg-[#F8F6F8] text-[#30242D] shadow-xs scale-95 opacity-60'
      }`}
    >
      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            className={center ? 'fill-amber-300 text-amber-300' : 'fill-[#C4B4BD] text-[#C4B4BD]'}
          />
        ))}
      </div>

      {/* Quote */}
      <p className={`text-sm leading-relaxed italic font-light ${center ? 'text-white/90' : 'text-[#857985]'}`}>
        {item.quote}
      </p>

      {/* Author & Initial Avatar (Zero external image dependencies) */}
      <div className="flex items-center gap-3 mt-auto">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-xs border-2 shrink-0 ${
            center
              ? 'bg-white/20 text-white border-white/40'
              : 'bg-softLavender text-primary border-softLavender'
          }`}
          aria-hidden="true"
        >
          {item.initials || item.name.charAt(0)}
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${center ? 'text-white' : 'text-[#30242D]'}`}>
            {item.name}
          </p>
          <p className={`text-[10px] ${center ? 'text-white/60' : 'text-[#857985]'}`}>{item.role}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialCarousel({ items }) {
  const [active, setActive] = useState(1); // start at index 1 (center)
  const total = items.length;

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setActive((a) => (a + 1) % total);
  }, [total]);

  // Auto-advance every 5s
  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  // Indices of left, center, right visible cards
  const leftIdx   = (active - 1 + total) % total;
  const centerIdx = active;
  const rightIdx  = (active + 1) % total;

  return (
    <div className="relative w-full select-none">
      {/* Three-card viewport */}
      <div className="flex items-center justify-center gap-4 md:gap-6 overflow-visible px-4 md:px-0">
        {/* LEFT card */}
        <div
          className="hidden sm:block w-full max-w-[300px] flex-shrink-0 cursor-pointer"
          onClick={prev}
        >
          <TestimonialCard item={items[leftIdx]} />
        </div>

        {/* CENTER card */}
        <div className="w-full max-w-[380px] flex-shrink-0 z-10">
          <TestimonialCard item={items[centerIdx]} center />
        </div>

        {/* RIGHT card */}
        <div
          className="hidden sm:block w-full max-w-[300px] flex-shrink-0 cursor-pointer"
          onClick={next}
        >
          <TestimonialCard item={items[rightIdx]} />
        </div>
      </div>

      {/* Arrow buttons */}
      <button
        onClick={prev}
        aria-label="Previous testimonial"
        className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#30242D] hover:bg-[#F5F0F7] transition-colors z-20"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Next testimonial"
        className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#30242D] hover:bg-[#F5F0F7] transition-colors z-20"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? 'w-6 h-2 bg-[#3B122D]'
                : 'w-2 h-2 bg-[#EAE3E9] hover:bg-[#D9B7CC]'
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
        <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-semibold mb-1 block">
          CLIENT FEEDBACK
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primaryText mb-12">
          Customer Testimonials
        </h2>
        <div className="relative px-8 sm:px-12">
          <TestimonialCarousel items={TESTIMONIALS} />
        </div>
      </RevealSection>
    </section>
  );
}

export default TestimonialsSection;

