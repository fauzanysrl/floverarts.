/**
 * Centralized Logger untuk Frontend FloverArts_
 * Mencegah kebocoran token JWT, kata sandi, atau data sensitif ke console produksi.
 */

const isProd = import.meta.env.PROD;

function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  const sensitiveKeys = ['token', 'refreshToken', 'password', 'password_hash', 'credit_card'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
}

export const logger = {
  info: (message, context = null) => {
    if (!isProd) {
      console.log(`[FloverArts:INFO] ${message}`, context ? sanitizeData(context) : '');
    }
  },
  warn: (message, context = null) => {
    if (!isProd) {
      console.warn(`[FloverArts:WARN] ${message}`, context ? sanitizeData(context) : '');
    }
  },
  error: (message, error = null) => {
    // Di produksi, bisa diteruskan ke Sentry / Log monitoring
    if (!isProd) {
      console.error(`[FloverArts:ERROR] ${message}`, error ? sanitizeData(error) : '');
    }
  },
};
