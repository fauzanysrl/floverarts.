import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to detect when an element enters the viewport
 * Triggers once, lightweight, and respects prefers-reduced-motion.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || isVisible) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [isVisible, options.threshold, options.rootMargin]);

  return [ref, isVisible];
}

export default useScrollReveal;
