import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { logger } from '../../lib/logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Unhandled React Render Error:', { error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-surface-page">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-card border border-brandBorder-subtle text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-semantic-errorBg flex items-center justify-center text-semantic-error">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-xl font-bold text-brandText-primary mb-2 font-serif">
              Terjadi Gangguan Tampilan
            </h2>
            <p className="text-sm text-brandText-secondary mb-6 leading-relaxed">
              Mohon maaf, terjadi kendala saat memuat bagian ini. Silakan coba muat ulang halaman.
            </p>
            {this.state.error && (
              <div className="text-left bg-red-50 text-red-700 p-3 rounded-lg text-xs font-mono mb-4 overflow-auto max-h-40 border border-red-200">
                {this.state.error?.toString()}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-primary-hover active:bg-primary-active transition-colors shadow-button"
              >
                <RotateCcw size={16} />
                <span>Muat Ulang</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-input text-brandText-primary text-sm font-semibold rounded-sm hover:bg-brandBorder-input transition-colors border border-brandBorder-subtle"
              >
                <Home size={16} />
                <span>Beranda</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
