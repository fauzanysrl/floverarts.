import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PaymentProofPage from '../features/checkout/pages/PaymentProofPage';
import orderApi from '../api/endpoints/order';
import paymentApi from '../api/endpoints/payment';

vi.mock('../api/endpoints/order', () => ({
  default: {
    getMyOrderDetail: vi.fn(),
  },
}));

vi.mock('../api/endpoints/payment', () => ({
  default: {
    getQris: vi.fn(),
    checkStatus: vi.fn(),
    simulateSuccess: vi.fn(),
  },
}));

describe('PaymentProofPage Debug Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing with order containing qris payment', async () => {
    orderApi.getMyOrderDetail.mockResolvedValue({
      data: {
        id: 3,
        order_number: 'ORD-20261102-1234',
        total_amount: '250000.00',
        payment_status: 'menunggu_pembayaran',
        order_status: 'menunggu_pembayaran',
        payment: {
          id: 5,
          payment_type: 'qris',
          status: 'menunggu_pembayaran',
          raw_response: null,
        },
      },
    });

    paymentApi.getQris.mockResolvedValue({
      data: {
        order_id: 3,
        order_number: 'ORD-20261102-1234',
        qr_url: 'https://api.sandbox.midtrans.com/v2/qris/test/qr-code',
        qr_string: '00020101021226580016ID.CO.MIDTRANS.WWW...',
        status: 'menunggu_pembayaran',
      },
    });

    render(
      <MemoryRouter initialEntries={['/pembayaran/3']}>
        <Routes>
          <Route path="/pembayaran/:orderId" element={<PaymentProofPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Selesaikan Pembayaran')).toBeInTheDocument();
    });
  });

  it('renders without crashing when payment is null', async () => {
    orderApi.getMyOrderDetail.mockResolvedValue({
      data: {
        id: 3,
        order_number: 'ORD-20261102-1234',
        total_amount: '250000.00',
        payment_status: 'menunggu_pembayaran',
        order_status: 'menunggu_pembayaran',
        payment: null,
      },
    });

    render(
      <MemoryRouter initialEntries={['/pembayaran/3']}>
        <Routes>
          <Route path="/pembayaran/:orderId" element={<PaymentProofPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Selesaikan Pembayaran')).toBeInTheDocument();
    });
  });

  it('renders without crashing when total_amount is null or undefined', async () => {
    orderApi.getMyOrderDetail.mockResolvedValue({
      data: {
        id: 3,
        order_number: 'ORD-20261102-1234',
        total_amount: null,
        payment_status: 'menunggu_pembayaran',
        order_status: 'menunggu_pembayaran',
        payment: {
          payment_type: 'bank_transfer',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/pembayaran/3']}>
        <Routes>
          <Route path="/pembayaran/:orderId" element={<PaymentProofPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Selesaikan Pembayaran')).toBeInTheDocument();
    });
  });

  it('renders without crashing when getMyOrderDetail rejects', async () => {
    orderApi.getMyOrderDetail.mockRejectedValue(new Error('Network error or 401'));

    render(
      <MemoryRouter initialEntries={['/pembayaran/3']}>
        <Routes>
          <Route path="/pembayaran/:orderId" element={<PaymentProofPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Selesaikan Pembayaran')).toBeInTheDocument();
      expect(screen.getByText(/Info Status:/i)).toBeInTheDocument();
    });
  });
});
