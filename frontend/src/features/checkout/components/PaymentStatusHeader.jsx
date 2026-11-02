import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function PaymentStatusHeader({ isPaidSuccess, orderNumber }) {
  return (
    <div className="text-center mb-8">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
          isPaidSuccess
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}
      >
        {isPaidSuccess ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Clock className="w-3.5 h-3.5" />
        )}
        <span>{isPaidSuccess ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}</span>
      </div>

      <h1 className="text-3xl font-serif text-[#241B22] mb-2">
        {isPaidSuccess ? 'Pembayaran Dikonfirmasi' : 'Selesaikan Pembayaran'}
      </h1>

      <p className="text-sm text-[#756A73]">
        Pesanan <span className="font-mono font-semibold text-[#241B22]">#{orderNumber}</span>
        {isPaidSuccess
          ? ' telah terverifikasi lunas. Rangkaian bunga segar Anda segera dirangkai oleh artisan florist.'
          : ' berhasil dibuat. Silakan selesaikan pembayaran di bawah ini.'}
      </p>
    </div>
  );
}

