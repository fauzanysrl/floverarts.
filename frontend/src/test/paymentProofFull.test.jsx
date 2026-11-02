import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AppProviders from '../app/providers';
import CustomerLayout from '../components/layout/CustomerLayout';
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

describe('PaymentProof with AppProviders and Layout', () => {
  it('renders CustomerLayout with PaymentProofPage smoothly', async () => {
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
        <AppProviders>
          <Routes>
            <Route
              path="/pembayaran/:orderId"
              element={
                <CustomerLayout>
                  <PaymentProofPage />
                </CustomerLayout>
              }
            />
          </Routes>
        </AppProviders>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Selesaikan Pembayaran')).toBeInTheDocument();
    });
  });
});
