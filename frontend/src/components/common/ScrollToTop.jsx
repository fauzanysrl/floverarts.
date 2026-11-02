import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Menjamin setiap navigasi antar halaman selalu kembali ke posisi paling atas (top: 0).
 * Jika URL memiliki anchor hash (misal #katalog), akan melakukan smooth scroll ke elemen tersebut.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    } else {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, search, hash]);

  return null;
}

