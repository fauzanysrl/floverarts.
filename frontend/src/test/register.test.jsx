import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegisterForm from '../features/auth/components/RegisterForm';
import authApi from '../api/endpoints/auth';

// Mock authApi
vi.mock('../api/endpoints/auth', () => ({
  default: {
    register: vi.fn(),
  },
}));

// Mock useAuth
const mockLogin = vi.fn();
vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: mockLogin,
  }),
}));

function renderRegister(initialRoute = '/daftar') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/daftar" element={<RegisterForm />} />
        <Route path="/masuk" element={<div>Halaman Masuk</div>} />
        <Route path="/" element={<div>Halaman Beranda</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus merender seluruh field registrasi dan tombol submit dengan benar', () => {
    renderRegister();

    expect(screen.getByRole('heading', { name: /Buat Akun Baru/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Minimal 6 karakter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nomor WhatsApp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Pengiriman/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daftar Sekarang/i })).toBeInTheDocument();
    expect(screen.getByText(/Sudah punya akun\?/i)).toBeInTheDocument();
  });

  it('harus memvalidasi field yang kosong secara defensif', async () => {
    renderRegister();

    const submitBtn = screen.getByRole('button', { name: /Daftar Sekarang/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Silakan masukkan nama lengkap Anda.')).toBeInTheDocument();
  });

  it('harus memvalidasi kata sandi kurang dari 6 karakter', async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'budi@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Minimal 6 karakter/i), {
      target: { value: '123' },
    });

    const submitBtn = screen.getByRole('button', { name: /Daftar Sekarang/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('Kata sandi minimal terdiri dari 6 karakter.')
    ).toBeInTheDocument();
  });

  it('harus mengirim data registrasi ke API dan memanggil login saat sukses', async () => {
    const mockSuccessResponse = {
      success: true,
      message: 'Pendaftaran berhasil!',
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      data: {
        user: { id: 10, name: 'Budi Santoso', email: 'budi@example.com', role: 'customer' },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      },
    };
    authApi.register.mockResolvedValueOnce(mockSuccessResponse);

    renderRegister();

    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'budi@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Minimal 6 karakter/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor WhatsApp/i), {
      target: { value: '08123456789' },
    });

    const submitBtn = screen.getByRole('button', { name: /Daftar Sekarang/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password: 'password123',
        phone: '08123456789',
        address: undefined,
      });
      expect(mockLogin).toHaveBeenCalledWith(mockSuccessResponse);
    });
  });

  it('harus menampilkan pesan error jika registrasi gagal di server', async () => {
    authApi.register.mockRejectedValueOnce(
      new Error('Alamat email sudah terdaftar. Silakan gunakan email lain atau login.')
    );

    renderRegister();

    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'budi@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Minimal 6 karakter/i), {
      target: { value: 'password123' },
    });

    const submitBtn = screen.getByRole('button', { name: /Daftar Sekarang/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Alamat email sudah terdaftar. Silakan gunakan email lain atau login.')
      ).toBeInTheDocument();
    });
  });
});
