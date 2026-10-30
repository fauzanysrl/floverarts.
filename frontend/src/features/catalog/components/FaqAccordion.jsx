import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../../home/constants/homeData';

export function FaqAccordion({ faqs = FAQS }) {
  const [openId, setOpenId] = useState(1);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="rounded-2xl bg-[#FAF7FB] overflow-hidden transition-all duration-300 shadow-xs"
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-serif font-bold text-primaryText hover:text-primary transition-colors gap-4"
              aria-expanded={isOpen}
            >
              <span>{faq.question}</span>
              <ChevronDown
                size={18}
                className={`text-secondaryText transition-transform duration-300 ease-out shrink-0 ${
                  isOpen ? 'rotate-180 text-primary' : ''
                }`}
              />
            </button>
            <div className={`accordion-wrapper ${isOpen ? 'open' : ''}`}>
              <div className="accordion-content-inner">
                <div className="px-5 pb-5 text-xs sm:text-sm text-secondaryText leading-relaxed pt-1">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
