import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

function InstagramIcon({ size = 15, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 15, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-[#3B122D] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Columns Desktop Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Kolom 1 — Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="floverarts_"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-heading text-2xl font-bold tracking-tight text-white">
                floverarts_
              </span>
            </Link>
            <p className="text-xs text-[#D8C9D3] leading-relaxed max-w-xs">
              Artisan florist yang menghadirkan rangkaian bunga segar dan buket custom untuk setiap momen berharga.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2 text-[#EDE3F2]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram floverarts_"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#3B122D] transition-colors"
              >
                <InstagramIcon size={15} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook floverarts_"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#3B122D] transition-colors"
              >
                <FacebookIcon size={15} />
              </a>
              <a
                href="https://wa.me/6281330535664"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp floverarts_"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#3B122D] transition-colors"
              >
                <MessageCircle size={15} />
              </a>
            </div>
          </div>

          {/* Kolom 2 — Navigasi */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-heading font-semibold text-white tracking-wide">
              Navigasi
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-[#EDE3F2]">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/katalog" className="hover:text-white transition-colors">
                  Katalog Bunga
                </Link>
              </li>
              <li>
                <Link to="/buket-custom" className="hover:text-white transition-colors">
                  Buket Custom
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3 — Layanan Pelanggan */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-heading font-semibold text-white tracking-wide">
              Layanan Pelanggan
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-[#EDE3F2]">
              <li>
                <a
                  href="https://wa.me/6281330535664"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Hubungi Kami
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  Pertanyaan Umum (FAQ)
                </a>
              </li>
              <li>
                <Link to="/pesanan" className="hover:text-white transition-colors">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Tentang Florist
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4 — Kontak & Atelier */}
          <div className="flex flex-col gap-3 text-xs text-[#D8C9D3]">
            <h4 className="text-sm font-heading font-semibold text-white tracking-wide">
              Kontak & Atelier
            </h4>
            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="text-[#EDE3F2] shrink-0 mt-0.5" />
              <span>Cilacap, Jawa Tengah, Indonesia</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-[#EDE3F2] shrink-0" />
              <span>081330535664</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-[#EDE3F2] shrink-0" />
              <span>hello@floverarts.com</span>
            </div>
            <p className="text-[11px] text-[#D8C9D3]/80 pt-1">
              Buka setiap hari: 08.00 – 20.00 WIB
            </p>
          </div>
        </div>

        {/* Bottom Bar: Hak Cipta */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8C9D3]/70 gap-3">
          <p>© 2026 FloverArts. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-6 text-[#EDE3F2]">
            <Link to="/kebijakan" className="hover:text-white transition-colors">
              Kebijakan Layanan & Garansi
            </Link>
            <Link to="/kebijakan" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
