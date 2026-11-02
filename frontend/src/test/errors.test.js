import { describe, it, expect } from 'vitest';
import { AppError, normalizeError, ERROR_MESSAGES } from '../api/errors';

describe('Error Normalization Pipeline', () => {
  it('harus mempertahankan instance AppError yang sudah ada', () => {
    const original = new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Field email tidak valid',
      status: 422,
    });
    const normalized = normalizeError(original);
    expect(normalized).toBe(original);
    expect(normalized.code).toBe('VALIDATION_ERROR');
    expect(normalized.status).toBe(422);
  });

  it('harus menormalisasi respons error resmi backend', () => {
    const backendAxiosError = {
      response: {
        status: 401,
        data: {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email atau kata sandi tidak sesuai.',
          },
        },
      },
    };

    const normalized = normalizeError(backendAxiosError);
    expect(normalized).toBeInstanceOf(AppError);
    expect(normalized.code).toBe('INVALID_CREDENTIALS');
    expect(normalized.status).toBe(401);
    expect(normalized.message).toBe('Email atau kata sandi tidak sesuai.');
    expect(normalized.isNetwork).toBe(false);
  });

  it('harus mengenali kegagalan jaringan (Network Error)', () => {
    const networkError = {
      isAxiosError: true,
      message: 'Network Error',
      response: undefined,
    };

    const normalized = normalizeError(networkError);
    expect(normalized.isNetwork).toBe(true);
    expect(normalized.code).toBe('NETWORK_ERROR');
    expect(normalized.message).toBe(ERROR_MESSAGES.NETWORK_ERROR);
  });

  it('harus mengenali timeout koneksi', () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      message: 'timeout of 15000ms exceeded',
    };

    const normalized = normalizeError(timeoutError);
    expect(normalized.isTimeout).toBe(true);
    expect(normalized.code).toBe('TIMEOUT_ERROR');
    expect(normalized.status).toBe(408);
  });

  it('harus memetakan status HTTP generik ke kode yang tepat', () => {
    const generic403 = {
      response: {
        status: 403,
        statusText: 'Forbidden',
      },
    };

    const normalized = normalizeError(generic403);
    expect(normalized.status).toBe(403);
    expect(normalized.code).toBe('FORBIDDEN');
    expect(normalized.message).toBe(ERROR_MESSAGES.FORBIDDEN);
  });
});
