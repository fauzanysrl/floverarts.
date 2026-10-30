import React from 'react';
import RevealSection from './RevealSection';
import { ORDER_STEPS } from '../constants/homeData';

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <RevealSection className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-semibold mb-1 block">
          HOW IT WORKS
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-primaryText mb-12">
          Ordering Is Simple
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ORDER_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 bg-[#FAF7FB] rounded-2xl shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-softLavender text-primary font-serif font-bold text-sm flex items-center justify-center mb-3">
                {step.num}
              </div>
              <h4 className="font-serif text-base font-bold text-primaryText mb-1.5">{step.title}</h4>
              <p className="text-xs text-secondaryText leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </RevealSection>
    </section>
  );
}

export default HowItWorksSection;
