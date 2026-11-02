import React from 'react';
import RevealSection from './RevealSection';
import FaqAccordion from '../../catalog/components/FaqAccordion';

export function FaqSection() {
  return (
    <section id="faq" className="py-16 md:py-20 bg-white">
      <RevealSection className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] font-roboto uppercase tracking-[0.2em] text-secondaryText font-semibold mb-1 block">
            TANYA JAWAB
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-primaryText">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>
        <FaqAccordion />
      </RevealSection>
    </section>
  );
}

export default FaqSection;

