import { useState, useEffect, useCallback } from 'react';
import paymentApi from '../../../api/endpoints/payment';

/**
 * Custom Hook untuk Polling dan Sinkronisasi Status Pembayaran
 * @param {string|number} orderId - ID pesanan
 * @param {boolean} initialPaidStatus - Status lunas awal (dari detail pesanan)
 */
export function usePaymentStatus(orderId, initialPaidStatus = false) {
  const [isPaidSuccess, setIsPaidSuccess] = useState(initialPaidStatus);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  // Sinkronisasi status jika status awal dari server berubah menjadi lunas
  useEffect(() => {
    let timer;
    if (initialPaidStatus && !isPaidSuccess) {
      timer = setTimeout(() => {
        setIsPaidSuccess(true);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [initialPaidStatus, isPaidSuccess]);

  // Handler pengecekan status ke API
  const checkStatus = useCallback(async () => {
    if (!orderId || isPaidSuccess) return;
    try {
      setIsCheckingStatus(true);
      const res = await paymentApi.checkStatus(orderId);
      const statusData = res?.data || res;
      if (statusData?.is_paid || statusData?.payment_status === 'berhasil') {
        setIsPaidSuccess(true);
      }
    } catch {
      // Background polling error diabaikan agar tidak mengganggu UI
    } finally {
      setIsCheckingStatus(false);
    }
  }, [orderId, isPaidSuccess]);

  // Auto polling setiap 3.5 detik selama belum lunas
  useEffect(() => {
    if (isPaidSuccess || !orderId) return;
    const interval = setInterval(() => {
      checkStatus();
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaidSuccess, orderId, checkStatus]);

  // Handler 1-klik simulasi pembayaran (Sandbox Testing)
  const simulatePayment = useCallback(async () => {
    if (!orderId) return;
    try {
      setSimulatingPayment(true);
      await paymentApi.simulateSuccess(orderId);
      setIsPaidSuccess(true);
    } catch (err) {
      alert(err?.message || 'Gagal menjalankan simulasi pembayaran.');
    } finally {
      setSimulatingPayment(false);
    }
  }, [orderId]);

  return {
    isPaidSuccess,
    setIsPaidSuccess,
    isCheckingStatus,
    simulatingPayment,
    checkStatus,
    simulatePayment,
  };
}

export default usePaymentStatus;
