import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Wallet,
  ShieldCheck,
  Package,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { adminApi } from '../../../api/endpoints/admin';
import { formatRupiah, formatDateTime } from '../../../lib/formatters';
import {
  ROLES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE_CLASSES,
} from '../../../lib/constants';

export function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(isAuthenticated && user?.role === ROLES.OWNER_ADMIN));
  const [error, setError] = useState(null);

  const fetchSummary = () => {
    setLoading(true);
    setError(null);
    adminApi
      .getDashboardSummary()
      .then((res) => {
        setData(res.data?.data || res.data || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat ringkasan dashboard');
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && user?.role === ROLES.OWNER_ADMIN) {
      adminApi
        .getDashboardSummary()
        .then((res) => {
          if (isMounted) {
            setData(res.data?.data || res.data || {});
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Gagal memuat ringkasan dashboard');
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  // RBAC Access Control Check
  if (!isAuthenticated || user?.role !== ROLES.OWNER_ADMIN) {
    return (
      <div className="min-h-screen bg-[#FAF7F8] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-borderNeutral p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-heading font-bold text-primaryText mb-2">
            Akses Dibatasi (403 Forbidden)
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mb-6">
            Halaman ini khusus untuk peran <strong>Admin / Pemilik Toko</strong>. Akun Anda saat ini tidak memiliki izin akses ke modul ini.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F8] py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-secondaryText mb-1">
              <Link to="/" className="hover:text-primary">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-medium">Panel Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primaryText">
              Ringkasan Bisnis FloverArts
            </h1>
            <p className="text-xs sm:text-sm text-secondaryText mt-0.5">
              Pantau omzet, pesanan masuk, dan ketersediaan stok atelier bunga.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchSummary}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-borderNeutral text-xs font-medium text-primaryText rounded-md hover:bg-bgSecondary transition-colors shadow-xs"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Segarkan</span>
            </button>
            <Link
              to="/produk"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors shadow-xs"
            >
              <span>Lihat Katalog</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-lg border border-red-200 p-6 text-center text-xs text-red-600 mb-8 shadow-xs">
            <AlertTriangle size={24} className="mx-auto text-red-500 mb-2" />
            <p className="font-semibold mb-1">Gagal Menghubungi Server Admin</p>
            <p>{error}</p>
          </div>
        ) : null}

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Omzet */}
          <div className="bg-white rounded-lg border border-borderNeutral p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-secondaryText">
                Total Omzet Lunas
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-xl font-heading font-bold text-primaryText">
              {loading ? '...' : formatRupiah(data?.total_revenue || 0)}
            </p>
            <p className="text-[11px] text-secondaryText mt-1">
              Dari {loading ? '...' : data?.total_orders || 0} pesanan selesai
            </p>
          </div>

          {/* Pesanan Pending */}
          <div className="bg-white rounded-lg border border-borderNeutral p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-secondaryText">
                Pesanan Perlu Diproses
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-xl font-heading font-bold text-primaryText">
              {loading ? '...' : `${data?.pending_orders || 0} Pesanan`}
            </p>
            <p className="text-[11px] text-secondaryText mt-1">
              Menunggu pembayaran & verifikasi
            </p>
          </div>

          {/* Saldo Kas Toko */}
          <div className="bg-white rounded-lg border border-borderNeutral p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-secondaryText">
                Saldo Kas Toko
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
            <p className="text-xl font-heading font-bold text-primaryText">
              {loading ? '...' : formatRupiah(data?.total_cash_balance || 0)}
            </p>
            <p className="text-[11px] text-secondaryText mt-1">
              Akumulasi akun kas aktif
            </p>
          </div>

          {/* Peringatan Stok */}
          <div className="bg-white rounded-lg border border-borderNeutral p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-secondaryText">
                Peringatan Stok Menipis
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <p className="text-xl font-heading font-bold text-primaryText">
              {loading ? '...' : `${data?.low_stock_alerts || 0} Item`}
            </p>
            <p className="text-[11px] text-secondaryText mt-1">
              Di bawah batas minimum stok
            </p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg border border-borderNeutral shadow-xs overflow-hidden">
          <div className="p-5 border-b border-borderNeutral flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-primaryText">
                5 Pesanan Terbaru
              </h2>
              <p className="text-xs text-secondaryText">
                Transaksi terkini dari pelanggan floverarts_
              </p>
            </div>
            <span className="text-xs text-secondaryText">
              Produk Aktif: <strong>{data?.active_products || 0}</strong>
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-secondaryText">
              Memuat data transaksi...
            </div>
          ) : !data?.recent_orders || data.recent_orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-secondaryText">
              <Package size={30} className="mx-auto text-secondaryText/40 mb-2" />
              Belum ada data pesanan tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7FB] text-secondaryText border-b border-borderNeutral">
                  <tr>
                    <th className="py-3 px-4 font-semibold">No. Pesanan</th>
                    <th className="py-3 px-4 font-semibold">Penerima</th>
                    <th className="py-3 px-4 font-semibold">Waktu</th>
                    <th className="py-3 px-4 font-semibold">Total</th>
                    <th className="py-3 px-4 font-semibold">Status Pesanan</th>
                    <th className="py-3 px-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderNeutral text-primaryText">
                  {data.recent_orders.map((order) => {
                    const statusLabel =
                      ORDER_STATUS_LABELS[order.order_status] || order.order_status;
                    const badgeClass =
                      ORDER_STATUS_BADGE_CLASSES[order.order_status] ||
                      'bg-gray-100 text-gray-700 border-gray-200';

                    return (
                      <tr key={order.id} className="hover:bg-bgSecondary/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-primary">
                          #{order.order_number}
                        </td>
                        <td className="py-3.5 px-4">{order.recipient_name}</td>
                        <td className="py-3.5 px-4 text-secondaryText text-[11px]">
                          {formatDateTime(order.created_at)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          {formatRupiah(order.total_amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${badgeClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/pembayaran/${order.order_number}`}
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span>Detail</span>
                            <ArrowUpRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
