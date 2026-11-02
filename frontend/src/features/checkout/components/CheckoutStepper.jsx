import React from 'react';
import { Check } from 'lucide-react';

export default function CheckoutStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: 'Detail Pesanan' },
    { number: 2, label: 'Pembayaran' },
    { number: 3, label: 'Berhasil' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto py-5 px-2 sm:px-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <React.Fragment key={step.number}>
              {/* Step Item */}
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 z-10 bg-[#FAF7F8] px-1 sm:px-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#3B122D] text-white shadow-xs'
                      : isActive
                      ? 'bg-[#3B122D] text-white ring-3 ring-[#3B122D]/15 shadow-xs'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.number}
                </div>
                <span
                  className={`text-[10px] sm:text-xs md:text-sm font-medium transition-colors text-center sm:text-left whitespace-nowrap ${
                    isActive
                      ? 'text-[#241B22] font-semibold'
                      : isCompleted
                      ? 'text-[#3B122D]'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line (between steps) */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 sm:mx-2 bg-gray-200 relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-[#3B122D] transition-all duration-500 ${
                      currentStep > step.number ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
