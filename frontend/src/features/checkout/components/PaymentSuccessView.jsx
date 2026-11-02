import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Printer, Package, ArrowRight } from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../../lib/formatters';

export default function PaymentSuccessView({ order, orderNumber, totalAmount }) {
  const whatsappUrl = `https://wa.me/6281330535664?text=${encodeURIComponent(
    `Halo FloverArts Atelier, saya ingin konfirmasi pesanan #${orderNumber} sebesar ${formatRupiah(
      totalAmount
    )} telah berhasil dibayar. Mohon bantu proses perangkaian bunga ya. Terima kasih!`
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Tampilan Konfirmasi Sukses di Layar */}
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 text-center space-y-5 animate-fadeIn print:hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Pembayaran Berhasil Terverifikasi
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif text-[#241B22] mt-3 mb-2">
            Terima Kasih atas Pesanan Anda!
          </h2>

          <p className="text-xs sm:text-sm text-[#756A73] max-w-lg mx-auto leading-relaxed">
            Pembayaran untuk pesanan <strong className="text-[#241B22]">#{orderNumber}</strong> sebesar{' '}
            <strong className="text-[#3B122D]">{formatRupiah(totalAmount)}</strong> telah lunas.
            Artisan Florist FloverArts segera menyiapkan rangkaian bunga segar Anda.
          </p>
        </div>

        {/* Tombol Aksi Penting Pelanggan */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {/* 1. Tombol WhatsApp Konfirmasi */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi Florist via WhatsApp</span>
          </a>

          {/* 2. Tombol Cetak Struk */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-white border border-borderNeutral text-primaryText rounded-md text-xs sm:text-sm font-medium hover:bg-bgSecondary transition flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-secondaryText" />
            <span>Cetak Struk Pembayaran</span>
          </button>

          {/* 3. Tombol Lacak di Pesanan Saya */}
          <Link
            to="/pesanan"
            className="px-5 py-2.5 bg-primary text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-primary-hover transition flex items-center gap-1.5 shadow-xs"
          >
            <Package className="w-4 h-4" />
            <span>Pesanan Saya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* STRUK DIGITAL RAMAH CETAK (PRINT-ONLY & TAMPILAN RESI RESMI) */}
      <div className="bg-white rounded-2xl border border-borderNeutral p-6 sm:p-8 shadow-xs text-xs text-primaryText font-sans print:border-none print:shadow-none print:p-0">
        <div className="flex items-center justify-between border-b border-borderNeutral pb-4 mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-primary">FloverArts Atelier</h3>
            <p className="text-[11px] text-secondaryText">Jl. R.E. Martadinata No. 10, Cilacap · WA: 081330535664</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              LUNAS / PAID
            </span>
            <p className="text-[11px] font-bold text-primaryText mt-1">#{orderNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-borderNeutral text-[11px]">
          <div>
            <span className="text-secondaryText block">Penerima:</span>
            <span className="font-semibold">{order?.recipient_name || 'Pelanggan FloverArts'}</span>
            <span className="text-secondaryText block mt-0.5">{order?.recipient_phone}</span>
          </div>
          <div>
            <span className="text-secondaryText block">Metode Pemenuhan:</span>
            <span className="font-semibold">
              {order?.fulfillment_method === 'pickup' ? 'Ambil di Toko (Pick-Up)' : 'Antar ke Alamat'}
            </span>
            <span className="text-secondaryText block mt-0.5">
              {order?.created_at ? formatDateTime(order.created_at) : 'Hari Ini'}
            </span>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center text-sm font-bold">
          <span>Total Pembayaran</span>
          <span className="text-primary font-heading text-base">{formatRupiah(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

