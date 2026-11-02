import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-surface-page">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-card border border-brandBorder-subtle text-center">
        <span className="text-5xl font-serif font-bold text-primary block mb-2">404</span>
        <h1 className="text-xl font-bold text-brandText-primary mb-2 font-serif">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-brandText-secondary mb-6 leading-relaxed">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-primary-hover active:bg-primary-active transition-colors shadow-button"
        >
          <Home size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
