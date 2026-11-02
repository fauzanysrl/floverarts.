/**
 * Motion Tokens & Constants FloverArts_
 * Sumber kebenaran durasi, easing, dan skala gerak (Anime.js v4 & Tailwind CSS).
 *
 * Kurva CSS: cubic-bezier(0.22, 1, 0.36, 1)
 * Padanan Anime.js v4: cubicBezier(0.22, 1, 0.36, 1) atau ease bawaan 'out(3)' / 'outCubic'.
 */

export const DURATIONS = {
  instant: 100, // Umpan balik klik/tekan (80-150 ms)
  fast: 150,    // Transisi kecil, hover, switch
  base: 250,    // Transisi sedang, drawer slide, page enter, alert
  slow: 400,    // Stagger max, modal, accordion
  reveal: 600,  // Scroll reveal konten halaman
};

export const EASINGS = {
  standard: 'cubicBezier(0.22, 1, 0.36, 1)', // Kurva standar masuk
  out: 'out(3)',                             // outCubic bawaan animejs
  inOut: 'inOut(3)',                         // inOutCubic bawaan animejs
  linear: 'linear',
};

export const PRESS_SCALE = {
  button: 0.97,
  card: 0.98,
};

/**
 * Mendeteksi preferensi reduced motion dari sistem / browser pengguna
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default {
  DURATIONS,
  EASINGS,
  PRESS_SCALE,
  prefersReducedMotion,
};

