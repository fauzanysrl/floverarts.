import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  Truck,
  Store,
  QrCode,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/hooks/useCart';
import orderApi from '../../../api/endpoints/order';
import { formatRupiah } from '../../../lib/formatters';
import CheckoutStepper from '../components/CheckoutStepper';

// Icon BCA Mobile sesuai https://icon-sets.iconify.design/arcticons/bca-mobile/
function BcaMobileIcon({ active = false, className = 'w-5 h-5' }) {
  const [hasError, setHasError] = useState(false);
  const colorHex = active ? '%23ffffff' : '%233B122D';

  if (hasError) {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect width="38" height="38" x="5" y="5" rx="10" />
        <path d="M14 17h6a4 4 0 0 1 0 8h-6m0-8v14m0-6h7a4 4 0 0 1 0 8h-7" />
        <path d="M28 20a6 6 0 1 0 0 10" />
      </svg>
    );
  }

  return (
    <img
      src={`https://api.iconify.design/arcticons:bca-mobile.svg?color=${colorHex}`}
      alt="BCA Mobile Icon"
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { items, totalAmount, clearCart, closeCart } = useCart();

  // Mode pemenuhan pesanan: 'delivery' | 'pickup'
  const [fulfillmentMethod, setFulfillmentMethod] = useState('delivery');

  // Informasi Penerima
  const [recipientName, setRecipientName] = useState(() => user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(() => user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // State khusus Ambil di Toko (Pickup)
  const [selectedBranch, setSelectedBranch] = useState('cilacap');
  const [pickupNotes, setPickupNotes] = useState('');

  // Metode Pembayaran: 2 opsi saja ('qris' atau 'bank_transfer')
  const [paymentMethod, setPaymentMethod] = useState('qris');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Pastikan Cart Drawer tertutup saat halaman Checkout terbuka
  useEffect(() => {
    if (typeof closeCart === 'function') {
      closeCart();
    }
  }, [closeCart]);

  // Auth check: Memastikan pelanggan login sebelum checkout
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'customer' && user.role !== 'owner_admin'))) {
      navigate('/masuk', { state: { from: { pathname: '/checkout' } } });
    }
  }, [user, authLoading, navigate]);

  // Perhitungan Ongkir & Total
  const shippingFee = fulfillmentMethod === 'delivery' ? 15000 : 0;
  const grandTotal = totalAmount + shippingFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja Anda kosong. Silakan pilih bunga terlebih dahulu.');
      return;
    }

    if (!recipientName.trim()) {
      setErrorMessage('Nama lengkap penerima wajib diisi.');
      return;
    }

    if (!recipientPhone.trim()) {
      setErrorMessage('Nomor telepon / WhatsApp penerima wajib diisi.');
      return;
    }

    if (fulfillmentMethod === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Alamat pengiriman wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const branchLabel =
        selectedBranch === 'cilacap'
          ? 'FloverArts Atelier Cilacap - Jl. R.E. Martadinata No. 10, Cilacap'
          : 'Boutique Dharmawangsa - Dharmawangsa Square Lt. Ground No. 12, Cilacap';

      const combinedNotes =
        fulfillmentMethod === 'delivery'
          ? notes.trim() || undefined
          : [
              notes.trim(),
              pickupNotes.trim() ? `Catatan Pengambilan: ${pickupNotes.trim()}` : '',
            ]
              .filter(Boolean)
              .join(' | ') || undefined;

      const payload = {
        fulfillment_method: fulfillmentMethod,
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        delivery_address:
          fulfillmentMethod === 'delivery'
            ? deliveryAddress.trim()
            : `FloverArts Atelier Cilacap (Ambil di Toko - ${branchLabel})`,
        delivery_date: todayStr,
        delivery_time: fulfillmentMethod === 'delivery' ? '13:00 - 16:00 WIB' : 'Buka 08:00 - 21:00 WIB',
        notes: combinedNotes,
        payment_method: paymentMethod,
        items: items.map((it) => ({
          product_id: it.product_id,
          item_type: it.item_type || 'standard',
          quantity: it.quantity || 1,
          custom_details: it.custom_details || null,
        })),
      };

      const res = await orderApi.checkout(payload);
      const createdOrder = res.data || res;
      const orderId = createdOrder.id || (createdOrder.data && createdOrder.data.id);

      await clearCart();

      if (orderId) {
        navigate(`/pembayaran/${orderId}`);
      } else {
        navigate('/produk');
      }
    } catch (err) {
      const backendMsg =
        err.response?.data?.message ||
        err.message ||
        'Gagal memproses pesanan. Silakan coba kembali.';
      setErrorMessage(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#3B122D]/20 border-t-[#3B122D] rounded-full animate-spin" />
          <p className="text-xs text-[#756A73]">Menyiapkan halaman checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-5 bg-[#EDE3F2] text-[#3B122D] rounded-full flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-[#241B22] mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-sm text-[#756A73] mb-6 max-w-sm mx-auto">
          Anda belum memilih rangkaian bunga. Silakan jelajahi katalog buket kami.
        </p>
        <Link
          to="/produk"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3B122D] text-white rounded-full text-xs font-medium hover:bg-[#4D183B] transition shadow-xs"
        >
          <span>Eksplorasi Katalog Bunga</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F8] py-8 sm:py-12 text-[#241B22]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Stepper */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <Link
              to="/produk"
              className="inline-flex items-center gap-1.5 text-xs text-[#756A73] hover:text-[#3B122D] transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali Berbelanja</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-wide text-[#241B22]">
              Checkout
            </h1>
            <div className="w-16" /> {/* Spacer balance */}
          </div>

          {/* Stepper Indikator Alur */}
          <CheckoutStepper currentStep={1} />
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs leading-relaxed animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Form Checkout Dua Kolom Clean & Minimalis */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI: Informasi Pengiriman & Metode Pembayaran */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Metode Pengiriman */}
            <div className="bg-white rounded-2xl border border-[#E8E0E5] p-5 sm:p-7 shadow-xs">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#756A73] mb-4">
                Pilih Metode Pemenuhan Bunga
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Antar ke Alamat */}
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('delivery')}
                  className={`flex items-start justify-between p-4 rounded-xl border text-left transition-all ${
                    fulfillmentMethod === 'delivery'
                      ? 'border-[#3B122D] bg-[#FAF7F8] ring-1 ring-[#3B122D]'
                      : 'border-[#E8E0E5] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        fulfillmentMethod === 'delivery'
                          ? 'bg-[#3B122D] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#241B22]">Antar ke Alamat</div>
                      <div className="text-[11px] text-[#756A73] mt-0.5">Kurir Berpendingin Atelier</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#3B122D]">Rp 15.000</span>
                </button>

                {/* Ambil di Toko */}
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('pickup')}
                  className={`flex items-start justify-between p-4 rounded-xl border text-left transition-all ${
                    fulfillmentMethod === 'pickup'
                      ? 'border-[#3B122D] bg-[#FAF7F8] ring-1 ring-[#3B122D]'
                      : 'border-[#E8E0E5] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        fulfillmentMethod === 'pickup'
                          ? 'bg-[#3B122D] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#241B22]">Ambil di Toko</div>
                      <div className="text-[11px] text-[#756A73] mt-0.5">Flagship Studio & Boutique</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Gratis
                  </span>
                </button>
              </div>
            </div>

            {/* Card 2: Form Antar ke Alamat VS Ambil di Toko */}
            {fulfillmentMethod === 'delivery' ? (
              /* TAMPILAN ANTAR KE ALAMAT */
              <div className="bg-white rounded-2xl border border-[#E8E0E5] p-5 sm:p-7 shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#756A73]">
                    Informasi Penerima Bunga
                  </h2>
                  <p className="text-xs text-[#756A73] mt-0.5">
                    Pastikan informasi alamat dan penerima sudah sesuai untuk pengantaran buket segar.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756A73] mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nama penerima"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756A73] mb-1.5">
                      Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756A73] mb-1.5">
                    Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Contoh: Jl. Diponegoro No. 45, RT 02/03, Kel. Sidakaya, Cilacap Selatan"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756A73] mb-1.5">
                    Catatan / Pesan Kartu Ucapan <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tulis pesan untuk kartu ucapan buket atau instruksi khusus..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
                  />
                </div>
              </div>
            ) : (
              /* TAMPILAN KHUSUS AMBIL DI TOKO SESUAI REFERENSI GAMBAR USER */
              <div className="bg-white rounded-2xl border border-[#E8E0E5] p-5 sm:p-7 shadow-xs space-y-6">
                {/* Header Informasi Pengambilan di Butik Atelier */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-medium text-[#241B22]">
                      Informasi Pengambilan di Butik Atelier
                    </h2>
                    <span className="sr-only">Detail Pengambilan di Butik Atelier</span>
                    <p className="text-xs text-[#756A73] mt-1 leading-relaxed">
                      Pesanan akan dirangkai segar dan siap diambil di studio pilihan Anda.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F8] text-[#756A73] border border-[#E8E0E5]">
                    <Store className="w-5 h-5 text-[#3B122D]" />
                  </div>
                </div>

                {/* Banner Estimasi Siap Diambil */}
                <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-900">
                      Estimasi Siap Diambil
                    </div>
                    <div className="text-xs text-emerald-800 mt-0.5">
                      Rangkaian bunga segar selesai ditata 2 jam setelah konfirmasi pembayaran.
                    </div>
                  </div>
                </div>

                {/* Pilih Cabang Butik Atelier */}
                <div>
                  <label className="block text-xs font-semibold text-[#756A73] uppercase tracking-wider mb-2.5">
                    Pilih Cabang Butik Atelier <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cabang 1: FloverArts Atelier Cilacap */}
                    <div
                      onClick={() => setSelectedBranch('cilacap')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                        selectedBranch === 'cilacap'
                          ? 'border-[#3B122D] bg-[#FAF7F8] ring-1 ring-[#3B122D]'
                          : 'border-[#E8E0E5] hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-[#3B122D] text-white uppercase">
                          Studio Utama & Pick-Up Lounge
                        </span>
                        {selectedBranch === 'cilacap' && (
                          <CheckCircle2 className="w-4 h-4 text-[#3B122D]" />
                        )}
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#241B22]">
                        FloverArts Atelier Cilacap
                      </div>
                      <div className="text-xs text-[#756A73] mt-1 leading-relaxed">
                        Jl. R.E. Martadinata No. 10, Cilacap Selatan, Cilacap
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#756A73] mt-2.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Buka Setiap Hari: 08:00 – 21:00 WIB</span>
                      </div>
                    </div>

                    {/* Cabang 2: Boutique Dharmawangsa */}
                    <div
                      onClick={() => setSelectedBranch('kroya')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                        selectedBranch === 'kroya'
                          ? 'border-[#3B122D] bg-[#FAF7F8] ring-1 ring-[#3B122D]'
                          : 'border-[#E8E0E5] hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                          Boutique Studio
                        </span>
                        {selectedBranch === 'kroya' && (
                          <CheckCircle2 className="w-4 h-4 text-[#3B122D]" />
                        )}
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#241B22]">
                        Boutique Dharmawangsa
                      </div>
                      <div className="text-xs text-[#756A73] mt-1 leading-relaxed">
                        Dharmawangsa Square Lt. Ground No. 12, Kebayoran Baru, Cilacap
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#756A73] mt-2.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Buka Setiap Hari: 10:00 – 20:00 WIB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimalist Map / Location Preview */}
                <div className="rounded-xl border border-[#E8E0E5] overflow-hidden bg-[#F5F2EB]">
                  <div className="relative h-28 sm:h-32 bg-[#F3EFE6] flex items-center justify-center overflow-hidden">
                    {/* SVG Street Grid Minimalis */}
                    <svg
                      className="absolute inset-0 w-full h-full opacity-40"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line x1="0" y1="30" x2="100%" y2="30" stroke="#DDD5C7" strokeWidth="3" />
                      <line x1="0" y1="80" x2="100%" y2="80" stroke="#DDD5C7" strokeWidth="4" />
                      <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#DDD5C7" strokeWidth="3" />
                      <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#DDD5C7" strokeWidth="3" />
                      <path
                        d="M 0,110 Q 200,40 500,90 T 1000,50"
                        fill="none"
                        stroke="#D1E7DD"
                        strokeWidth="16"
                        opacity="0.6"
                      />
                    </svg>

                    {/* Studio Marker Pill */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-[#3B122D] text-white px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1.5">
                        <Store className="w-3 h-3 text-[#E8D7E1]" />
                        <span>
                          {selectedBranch === 'cilacap'
                            ? 'Flagship Pick-Up Lounge'
                            : 'Boutique Pick-Up Point'}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-[#3B122D] rotate-45 -mt-1" />
                    </div>

                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-gray-600 border border-gray-200">
                      📍 Navigasi Studio Presisi
                    </div>
                  </div>

                  <div className="px-4 py-2.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="text-[#756A73]">
                      {selectedBranch === 'cilacap'
                        ? 'Jl. R.E. Martadinata No. 10, Cilacap Selatan'
                        : 'Dharmawangsa Square Lt. Ground No. 12, Cilacap'}
                    </span>
                    <a
                      href={
                        selectedBranch === 'cilacap'
                          ? 'https://maps.google.com/?q=FloverArts+Cilacap'
                          : 'https://maps.google.com/?q=Dharmawangsa+Cilacap'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B122D] font-medium hover:underline inline-flex items-center gap-1 text-xs"
                    >
                      <span>Petunjuk Arah via Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Form Input Nama & Nomor Telepon Pengambil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756A73] mb-1.5">
                      Nama Pengambil <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Clarissa Aurelia"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Nama orang yang akan mengambil pesanan di butik atelier.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756A73] mb-1.5">
                      Nomor Telepon Pengambil <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#E8E0E5] bg-[#FAF7F8] text-xs font-medium text-gray-500">
                        +62
                      </span>
                      <input
                        type="tel"
                        required
                        value={recipientPhone.replace(/^(\+62|62)/, '')}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="812-4982-1920"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-r-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Format WhatsApp aktif untuk notifikasi saat buket siap diambil.
                    </p>
                  </div>
                </div>

                {/* Catatan Tambahan Pengambilan */}
                <div className="pt-2 border-t border-[#F0EAEF]">
                  <label className="block text-xs font-medium text-[#756A73] mb-1.5">
                    Catatan Tambahan Pengambilan{' '}
                    <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                    placeholder="Catatan khusus (misal: plat nomor kendaraan untuk valet/drive-thru pickup, atau nama kurir penjemput)..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
                  />
                </div>
              </div>
            )}

            {/* Card 3: Metode Pembayaran (Hanya 2 Opsi) */}
            <div className="bg-white rounded-2xl border border-[#E8E0E5] p-5 sm:p-7 shadow-xs">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#756A73] mb-4">
                Metode Pembayaran
              </h2>

              <div className="space-y-3">
                {/* Opsi 1: QRIS */}
                <div
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'qris'
                      ? 'border-[#3B122D] bg-[#FAF7F8] ring-1 ring-[#3B122D]'
                      : 'border-[#E8E0E5] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        paymentMethod === 'qris'
                          ? 'bg-[#3B122D] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-[#241B22]">
                        QRIS (GoPay, OVO, Dana, BCA, Livin)
                      </div>
                      <div className="text-[11px] text-[#756A73] mt-0.5">
                        Pindai barcode instan via aplikasi e-wallet & mobile banking
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'qris'
                        ? 'border-[#3B122D] bg-[#3B122D] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {paymentMethod === 'qris' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Opsi 2: Transfer Bank BCA dengan Icon Resmi Arcticons BCA Mobile */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#3B122D] bg-[#FAF7F8] ring-1 ring-[#3B122D]'
                      : 'border-[#E8E0E5] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-[#3B122D] text-white'
                          : 'bg-gray-100 text-[#3B122D]'
                      }`}
                    >
                      <BcaMobileIcon
                        active={paymentMethod === 'bank_transfer'}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-[#241B22]">
                        Transfer Bank (BCA)
                      </div>
                      <div className="text-[11px] text-[#756A73] mt-0.5">
                        Transfer manual / BCA Mobile ke rekening resmi FloverArts
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-[#3B122D] bg-[#3B122D] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {paymentMethod === 'bank_transfer' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Order Summary Clean Minimalis */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-[#E8E0E5] p-5 sm:p-7 shadow-xs">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#756A73] mb-4">
                Order Summary
              </h2>

              {/* Daftar Item Produk */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 pr-1 mb-6">
                {items.map((it, idx) => {
                  const title =
                    it.product_name ||
                    it.product?.name ||
                    it.name ||
                    it.custom_details?.title ||
                    'Rangkaian Bunga';
                  const img =
                    it.primary_image ||
                    it.image_url ||
                    it.product?.primary_image ||
                    '/bouquet-rose.jpg';
                  const price =
                    it.unit_price ||
                    it.product?.price ||
                    it.custom_details?.calculated_total_price ||
                    it.price ||
                    0;
                  const itemSubtotal = it.subtotal || price * (it.quantity || 1);

                  return (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3">
                      <img
                        src={img}
                        alt={title}
                        className="w-14 h-14 object-cover rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/bouquet-rose.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-[#241B22] truncate">
                          {title}
                        </h4>
                        <div className="text-[11px] text-[#756A73] mt-0.5">
                          {it.quantity || 1} × {formatRupiah(price)}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#241B22] flex-shrink-0">
                        {formatRupiah(itemSubtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Rincian Biaya */}
              <div className="space-y-2.5 pt-4 border-t border-[#E8E0E5] text-xs">
                <div className="flex justify-between text-[#756A73]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#241B22]">{formatRupiah(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[#756A73]">
                  <span>Pengiriman</span>
                  {fulfillmentMethod === 'delivery' ? (
                    <span className="font-medium text-[#241B22]">{formatRupiah(shippingFee)}</span>
                  ) : (
                    <span className="font-medium text-emerald-700">Gratis (Ambil di Toko)</span>
                  )}
                </div>
                <div className="flex justify-between pt-3 border-t border-[#E8E0E5] text-sm font-medium text-[#241B22]">
                  <span>Total</span>
                  <span className="text-base font-serif font-bold text-[#3B122D]">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Tombol Bayar Sekarang (Sesuai Permintaan) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-3.5 px-4 bg-[#3B122D] text-white rounded-xl font-medium text-sm hover:bg-[#4D183B] active:bg-[#2B0C20] transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
