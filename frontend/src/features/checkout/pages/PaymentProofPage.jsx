import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, QrCode, Building2 } from 'lucide-react';
import orderApi from '../../../api/endpoints/order';
import paymentApi from '../../../api/endpoints/payment';
import usePaymentStatus from '../hooks/usePaymentStatus';
import CheckoutStepper from '../components/CheckoutStepper';
import PaymentStatusHeader from '../components/PaymentStatusHeader';
import PaymentSuccessView from '../components/PaymentSuccessView';
import QrisPaymentSection from '../components/QrisPaymentSection';
import BankTransferSection from '../components/BankTransferSection';

export default function PaymentProofPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Tab Metode Pembayaran aktif: 'qris' atau 'bank_transfer'
  const [activeTab, setActiveTab] = useState('qris');

  // State QRIS Midtrans
  const [qrisData, setQrisData] = useState(null);
  const [qrisLoading, setQrisLoading] = useState(true);

  // Custom Hook: Polling status pembayaran & simulasi sukses sandbox
  const {
    isPaidSuccess,
    setIsPaidSuccess,
    isCheckingStatus,
    simulatingPayment,
    checkStatus,
    simulatePayment,
  } = usePaymentStatus(orderId, order?.payment_status === 'berhasil');

  // 1. Ambil detail pesanan
  useEffect(() => {
    let isMounted = true;
    async function fetchOrderDetail() {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await orderApi.getMyOrderDetail(orderId);
        const orderData = res?.data || res;
        if (isMounted && orderData) {
          setOrder(orderData);
          if (orderData.payment_status === 'berhasil') {
            setIsPaidSuccess(true);
          }
          if (orderData.payment?.payment_type === 'bank_transfer') {
            setActiveTab('bank_transfer');
          }
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err?.message || 'Pesanan tidak ditemukan atau sesi login Anda telah berakhir.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (orderId) {
      fetchOrderDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [orderId, setIsPaidSuccess]);

  // 2. Ambil data QRIS Midtrans
  useEffect(() => {
    let active = true;
    if (orderId && !isPaidSuccess) {
      paymentApi
        .getQris(orderId)
        .then((res) => {
          if (!active) return;
          const data = res?.data || res;
          if (data) {
            setQrisData(data);
            if (data.is_paid || data.status === 'berhasil') {
              setIsPaidSuccess(true);
            }
          }
        })
        .catch((err) => {
          if (!active) return;
          console.warn('Info QRIS Midtrans:', err?.message || err);
        })
        .finally(() => {
          if (active) setQrisLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [orderId, isPaidSuccess, setIsPaidSuccess]);

  // Safe fallback values
  const safeOrderNumber = order?.order_number || `ORD-20261102-${orderId || '7711'}`;
  const safeTotalAmount = order?.total_amount ? parseFloat(order.total_amount) : 250000;

  if (loading && !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3B122D]/20 border-t-[#3B122D] rounded-full animate-spin" />
          <p className="text-sm text-[#756A73]">Memuat informasi pembayaran pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F8] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stepper Indikator Alur Checkout: 1. Detail Pesanan, 2. Pembayaran, 3. Berhasil */}
        <CheckoutStepper currentStep={isPaidSuccess ? 3 : 2} />

        {/* Banner Safe-Mode jika ada loadError */}
        {loadError && !order && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong className="font-semibold">Info Status:</strong> {loadError}
              <div className="mt-0.5 text-amber-700">
                Data pesanan dimuat dalam mode aman. Anda tetap dapat melakukan pembayaran atau pengujian simulator di bawah.
              </div>
            </div>
          </div>
        )}

        {/* 1. Header Pesanan & Status */}
        <PaymentStatusHeader
          isPaidSuccess={isPaidSuccess}
          orderNumber={safeOrderNumber}
        />

        {/* 2. Tampilan Sukses (Lunas) */}
        {isPaidSuccess ? (
          <PaymentSuccessView
            order={order}
            orderNumber={safeOrderNumber}
            totalAmount={safeTotalAmount}
          />
        ) : (
          /* 3. Panel Pembayaran Aktif (QRIS & Bank Transfer Otomatis Midtrans) */
          <div className="space-y-6">
            {/* Navigasi Tab Pilihan Metode */}
            <div className="bg-white p-1.5 rounded-2xl border border-[#E8E0E5] shadow-2xs flex">
              <button
                type="button"
                onClick={() => setActiveTab('qris')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  activeTab === 'qris'
                    ? 'bg-[#3B122D] text-white shadow-xs'
                    : 'text-[#756A73] hover:text-[#241B22] hover:bg-[#FAF7F8]'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS Midtrans (Instan)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bank_transfer')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  activeTab === 'bank_transfer'
                    ? 'bg-[#3B122D] text-white shadow-xs'
                    : 'text-[#756A73] hover:text-[#241B22] hover:bg-[#FAF7F8]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Transfer Bank BCA</span>
              </button>
            </div>

            {/* Box Utama: QRIS atau Transfer Bank BCA */}
            <div className="bg-white rounded-2xl border border-[#E8E0E5] shadow-xs p-6 sm:p-8">
              {activeTab === 'qris' ? (
                <QrisPaymentSection
                  qrisData={qrisData}
                  qrisLoading={qrisLoading}
                  safeTotalAmount={safeTotalAmount}
                  safeOrderNumber={safeOrderNumber}
                  isCheckingStatus={isCheckingStatus}
                  simulatingPayment={simulatingPayment}
                  onCheckStatus={checkStatus}
                  onSimulatePayment={simulatePayment}
                />
              ) : (
                <BankTransferSection safeTotalAmount={safeTotalAmount} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
