import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Komponen ErrorState untuk menangani tampilan kegagalan data fetching
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.message]
 * @param {Function} [props.onRetry]
 */
export function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat mengambil data dari server. Silakan coba lagi.',
  onRetry,
}) {
  return (
    <div className="w-full py-12 px-4 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-semantic-errorBg flex items-center justify-center text-semantic-error mb-3">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-bold text-brandText-primary mb-1">
        {title}
      </h3>
      <p className="text-sm text-brandText-secondary max-w-sm mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary-hover active:bg-primary-active transition-colors shadow-sm"
        >
          <RefreshCw size={14} />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  );
}

export default ErrorState;
