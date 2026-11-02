import React from 'react';
import { useScrollReveal } from '../../../lib/useScrollReveal';

/* Reusable animated scroll-reveal wrapper */
export function RevealSection({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out will-change-transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export default RevealSection;

