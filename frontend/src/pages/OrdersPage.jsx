import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Truck,
  MapPin,
  ArrowRight,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { orderApi } from '../api/endpoints/order';
import { formatRupiah, formatDateTime } from '../lib/formatters';
import { ORDER_STATUS } from '../lib/constants';
import { findMatchingFallback } from '../lib/imageResolver';

export function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      orderApi
        .getMyOrders()
        .then((res) => {
          if (isMounted) {
            const list = res.data?.data || res.data || [];
            setOrders(Array.isArray(list) ? list : []);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Gagal memuat daftar pesanan');
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleLookup = (e) => {
    e.preventDefault();
    if (!lookupOrderNumber.trim()) return;
    navigate(`/pembayaran/${encodeURIComponent(lookupOrderNumber.trim())}`);
  };

  // Hitung jumlah per kategori status
  const counts = {
    all: orders.length,
    processing: orders.filter((o) =>
      ['dikonfirmasi', 'diproses', 'siap_diambil_dikirim'].includes(o.order_status)
    ).length,
    completed: orders.filter((o) => o.order_status === 'selesai').length,
    canceled: orders.filter((o) => o.order_status === 'dibatalkan').length,
    pending: orders.filter((o) => o.order_status === 'menunggu_pembayaran').length,
  };

  const filteredOrders = orders.filter((order) => {
    // Filter Tab Status
    if (activeTab === 'processing') {
      if (!['dikonfirmasi', 'diproses', 'siap_diambil_dikirim'].includes(order.order_status)) {
        return false;
      }
    } else if (activeTab === 'completed') {
      if (order.order_status !== 'selesai') return false;
    } else if (activeTab === 'canceled') {
      if (order.order_status !== 'dibatalkan') return false;
    } else if (activeTab === 'pending') {
      if (order.order_status !== 'menunggu_pembayaran') return false;
    }

    // Filter Kata Kunci Pencarian
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const orderNum = (order.order_number || '').toLowerCase();
    const recipient = (order.recipient_name || '').toLowerCase();
    return orderNum.includes(q) || recipient.includes(q);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case ORDER_STATUS.MENUNGGU_PEMBAYARAN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Menunggu Pembayaran
          </span>
        );
      case ORDER_STATUS.DIKONFIRMASI:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Pembayaran Dikonfirmasi
          </span>
        );
      case ORDER_STATUS.DIPROSES:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Sedang Dirangkai
          </span>
        );
      case ORDER_STATUS.SIAP_DIAMBIL_DIKIRIM:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium border border-cyan-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            Siap Diambil / Dikirim
          </span>
        );
      case ORDER_STATUS.SELESAI:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Selesai
          </span>
        );
      case ORDER_STATUS.DIBATALKAN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F8] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-secondaryText mb-2">
            <Link to="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">Pesanan Saya</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primaryText">
            Pesanan Saya
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-1">
            Pantau status perangkaian, pengiriman, dan rincian buket bunga Anda.
          </p>
        </div>

        {/* Guest Order Lookup Card */}
        {!isAuthenticated && (
          <div className="bg-white rounded-2xl border border-borderNeutral p-6 mb-8 shadow-xs">
            <h2 className="text-base font-semibold text-primaryText mb-1.5">
              Lacak Pesanan Pembeli Tamu
            </h2>
            <p className="text-xs text-secondaryText mb-4 leading-relaxed">
              Jika Anda memesan tanpa akun, masukkan nomor pesanan Anda (contoh: <code>#ORD-...</code> atau <code>#A1...</code>) untuk melihat status dan pembayaran.
            </p>
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Masukkan Nomor Pesanan..."
                value={lookupOrderNumber}
                onChange={(e) => setLookupOrderNumber(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-borderNeutral rounded-xl outline-none focus:border-primary bg-[#FAF7F8]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
              >
                Cari Pesanan
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-borderNeutral flex items-center justify-between text-xs text-secondaryText">
              <span>Sudah memiliki akun FloverArts?</span>
              <Link to="/masuk" className="text-primary font-semibold hover:underline">
                Masuk ke Akun
              </Link>
            </div>
          </div>
        )}

        {/* Authenticated User Order List */}
        {isAuthenticated && (
          <>
            {/* Filter Tabs Navigation (Sesuai Referensi Gambar 1) */}
            <div className="bg-white border border-[#E8E0E5] rounded-2xl p-1.5 flex items-center justify-start gap-1 sm:gap-2 mb-6 shadow-2xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-[#3B122D] text-white shadow-xs'
                    : 'text-[#756A73] hover:text-[#241B22] hover:bg-[#FAF7F8]'
                }`}
              >
                <span>Semua</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('processing')}
                className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'processing'
                    ? 'bg-[#3B122D] text-white shadow-xs'
                    : 'text-[#756A73] hover:text-[#241B22] hover:bg-[#FAF7F8]'
                }`}
              >
                <span>Diproses / Dikirim</span>
                {counts.processing > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === 'processing'
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {counts.processing}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'completed'
                    ? 'bg-[#3B122D] text-white shadow-xs'
                    : 'text-[#756A73] hover:text-[#241B22] hover:bg-[#FAF7F8]'
                }`}
              >
                <span>Selesai</span>
                {counts.completed > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === 'completed'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {counts.completed}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'bg-[#3B122D] text-white shadow-xs'
                    : 'text-[#756A73] hover:text-[#241B22] hover:bg-[#FAF7F8]'
                }`}
              >
                <span>Menunggu Pembayaran</span>
                {counts.pending > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === 'pending'
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {counts.pending}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('canceled')}
                className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'canceled'
                    ? 'bg-[#3B122D] text-white shadow-xs'
                    : 'text-[#756A73] hover:text-[#241B22] hover:bg-[#FAF7F8]'
                }`}
              >
                <span>Dibatalkan</span>
                {counts.canceled > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === 'canceled'
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {counts.canceled}
                  </span>
                )}
              </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white rounded-2xl border border-borderNeutral p-3 mb-6 flex items-center gap-2 shadow-xs">
              <Search size={16} className="text-secondaryText shrink-0 ml-1.5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nomor pesanan atau nama penerima..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm outline-none text-primaryText bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-secondaryText hover:text-primaryText px-2 font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-borderNeutral p-12 text-center text-xs text-secondaryText">
                <div className="w-8 h-8 border-3 border-[#3B122D]/20 border-t-[#3B122D] rounded-full animate-spin mx-auto mb-3" />
                Memuat riwayat pesanan buket bunga...
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-6 text-center text-xs text-red-600">
                <AlertCircle size={20} className="mx-auto mb-2 text-red-500" />
                {error}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-borderNeutral p-12 text-center">
                <Package size={40} className="mx-auto text-secondaryText/40 mb-3" />
                <h3 className="text-sm font-semibold text-primaryText mb-1">
                  Tidak Ada Pesanan
                </h3>
                <p className="text-xs text-secondaryText mb-5">
                  {searchQuery || activeTab !== 'all'
                    ? 'Tidak ditemukan pesanan dengan kriteria filter saat ini.'
                    : 'Anda belum memiliki riwayat pesanan buket bunga.'}
                </p>
                <Link
                  to="/produk"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary-hover transition-colors shadow-button"
                >
                  Lihat Katalog Bunga
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const isPending =
                    order.order_status === ORDER_STATUS.MENUNGGU_PEMBAYARAN;

                  // Ambil daftar items atau buat item fallback jika order.items kosong
                  const orderItems =
                    order.items && order.items.length > 0
                      ? order.items
                      : [
                          {
                            id: 1,
                            product_name_snapshot: 'Rangkaian Buket FloverArts',
                            unit_price_snapshot: order.total_amount,
                            quantity: 1,
                            image_url: null,
                          },
                        ];

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E0E5] p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-4"
                    >
                      {/* 1. Header Card: ShoppingBag Icon + Order Number + Status Dot Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#F0EAEF]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF7F8] flex items-center justify-center text-[#241B22] shrink-0 border border-[#E8E0E5]">
                            <ShoppingBag className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div>
                            <span className="font-heading font-bold text-sm sm:text-base text-[#241B22] tracking-tight">
                              #{order.order_number}
                            </span>
                            <span className="text-[11px] text-gray-400 block sm:hidden">
                              {formatDateTime(order.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.order_status)}
                        </div>
                      </div>

                      {/* 2. Sub-bar Route / Fulfillment (Sesuai Persis Gambar 1) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#756A73] py-2.5 px-3.5 sm:px-4 bg-[#FAF7F8] rounded-xl border border-[#F0EAEF] gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                          <Truck className="w-3.5 h-3.5 text-[#3B122D]" />
                          <span className="font-medium text-[#241B22]">
                            FloverArts Studio Cilacap
                          </span>
                        </div>

                        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-400">
                          <span className="tracking-widest">········</span>
                          <span className="bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 font-sans">
                            {formatDateTime(order.created_at)}
                          </span>
                          <span className="tracking-widest">········&gt;</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 text-right">
                          <MapPin className="w-3.5 h-3.5 text-[#3B122D]" />
                          <span className="font-medium text-[#241B22] truncate max-w-[200px]">
                            {order.fulfillment_method === 'pickup'
                              ? 'Ambil di Toko'
                              : `${order.recipient_name} (Antar Alamat)`}
                          </span>
                        </div>
                      </div>

                      {/* 3. Daftar Produk Buket (Sesuai Persis Inner Row Gambar 1) */}
                      <div className="space-y-2.5">
                        {orderItems.map((item, idx) => {
                          const productName =
                            item.product_name_snapshot ||
                            item.product_name ||
                            'Buket Bunga Segar Pilihan';
                          const itemImage =
                            item.image_url || findMatchingFallback('', productName);

                          return (
                            <div
                              key={item.id || idx}
                              className="border border-[#F0EAEF] rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 sm:gap-4 bg-white hover:bg-[#FAF7F8]/50 transition-colors"
                            >
                              {/* Square Thumbnail Image */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                                <img
                                  src={itemImage}
                                  alt={productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Detail Produk */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-semibold text-xs sm:text-sm text-[#241B22] truncate">
                                  {productName}
                                </h4>
                                <div className="text-xs sm:text-sm font-roboto font-bold text-[#241B22] mt-1">
                                  {formatRupiah(item.unit_price_snapshot || item.price || 0)}{' '}
                                  <span className="text-[11px] font-normal text-gray-400">
                                    x{item.quantity || 1}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#756A73] block mt-0.5 truncate">
                                  {item.custom_details
                                    ? 'Buket Custom Handcrafted'
                                    : 'Buket Bunga Segar Pilihan'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 4. Footer Card: Total Amount & Details Button (Sesuai Persis Gambar 1) */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-left">
                          <span className="text-xs sm:text-sm text-gray-500 font-sans">Total: </span>
                          <span className="font-roboto font-bold text-sm sm:text-base text-[#241B22]">
                            {formatRupiah(order.total_amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <Link
                              to={`/pembayaran/${order.order_number}`}
                              className="px-4 sm:px-5 py-2 bg-[#3B122D] text-white text-xs font-semibold rounded-full hover:bg-[#4D183B] transition-all shadow-xs"
                            >
                              Bayar Sekarang
                            </Link>
                          )}
                          <Link
                            to={`/pembayaran/${order.order_number}`}
                            className="px-5 sm:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-[#241B22] text-xs font-semibold rounded-full transition-all"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
