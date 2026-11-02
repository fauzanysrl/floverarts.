import React, { useState } from 'react';
import {
  QrCode,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { formatRupiah } from '../../../lib/formatters';

export default function QrisPaymentSection({
  qrisData,
  qrisLoading,
  safeTotalAmount,
  safeOrderNumber,
  isCheckingStatus,
  simulatingPayment,
  onCheckStatus,
  onSimulatePayment,
}) {
  const [copiedQrisString, setCopiedQrisString] = useState(false);
  const [copiedQrisUrl, setCopiedQrisUrl] = useState(false);

  const qrDisplayUrl =
    qrisData?.qr_url ||
    `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      qrisData?.qr_string ||
        `00020101021226610015ID.CO.GOPAY.WWW0119G9360091100213054100208102003920303UMI51390016ID.OR.AIRPAY.WWW0115ID10200392019285204599953033605406${safeTotalAmount}5802ID5918FLOVERARTS ATELIER6007CILACAP61055322362210117${safeOrderNumber}6304`
    )}`;

  const effectiveQrUrl =
    qrisData?.qr_url ||
    `https://api.sandbox.midtrans.com/v2/qris/${safeOrderNumber}/qr-code`;

  const handleCopyQrisString = () => {
    const strToCopy =
      qrisData?.qr_string ||
      `00020101021226610015ID.CO.GOPAY.WWW0119G9360091100213054100208102003920303UMI51390016ID.OR.AIRPAY.WWW0115ID10200392019285204599953033605406${safeTotalAmount}5802ID5918FLOVERARTS ATELIER6007CILACAP61055322362210117${safeOrderNumber}6304`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(strToCopy);
      setCopiedQrisString(true);
      setTimeout(() => setCopiedQrisString(false), 2000);
    }
  };

  const handleCopyQrisUrl = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(effectiveQrUrl);
      setCopiedQrisUrl(true);
      setTimeout(() => setCopiedQrisUrl(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header QRIS */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E0E5]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#EDE3F2] text-[#3B122D]">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-medium text-lg text-[#241B22]">
              Pembayaran QRIS Midtrans
            </h3>
            <p className="text-xs text-[#756A73]">
              Pindai barcode QRIS resmi atau salin kodenya ke Simulator Sandbox Midtrans
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCheckStatus}
          disabled={isCheckingStatus}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E0E5] text-xs font-medium text-[#3B122D] hover:bg-[#FAF7F8] transition"
          title="Perbarui status pembayaran"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
          <span>{isCheckingStatus ? 'Mengecek...' : 'Cek Status'}</span>
        </button>
      </div>

      {/* Panduan Uji Coba Simulator Sandbox Midtrans */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EDE3F2]/40 to-[#FAF7F8] border border-[#D9B7CC] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#3B122D]">
            <Sparkles className="w-4 h-4 text-[#3B122D]" />
            <span>Panduan Uji Coba Simulator QRIS Midtrans</span>
          </div>
          <a
            href="https://simulator.sandbox.midtrans.com/v2/qris/index"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B122D] text-white text-xs font-medium hover:bg-[#4D183B] transition shadow-xs"
          >
            <span>Buka Simulator Midtrans</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-xs text-[#756A73] leading-relaxed">
          Anda dapat menguji transaksi pembayaran QRIS ini secara langsung menggunakan <strong>Simulator Sandbox Midtrans</strong>:
        </p>
        <ol className="text-xs text-[#241B22] space-y-1.5 pl-4 list-decimal">
          <li>
            Klik tombol <strong>&ldquo;Salin QR Code URL&rdquo;</strong> di bawah (atau klik kanan pada gambar barcode QRIS &gt; <em>Copy Image Address / Salin Tautan Gambar</em>).
          </li>
          <li>
            Buka tautan{' '}
            <a
              href="https://simulator.sandbox.midtrans.com/v2/qris/index"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#3B122D] underline inline-flex items-center gap-0.5"
            >
              <span>simulator.sandbox.midtrans.com/v2/qris/index</span>
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          </li>
          <li>
            Tempelkan (<em>paste</em>) URL pada kolom <strong>QR Code URL / Image URL</strong>, lalu klik <strong>Scan QR</strong>.
          </li>
          <li>
            Klik tombol <strong>Pay</strong> di halaman simulator. FloverArts otomatis memperbarui status menjadi <strong>Lunas</strong>.
          </li>
        </ol>
      </div>

      {/* Barcode QRIS & Nilai Transaksi */}
      <div className="p-6 rounded-2xl bg-[#FAF7F8] border border-[#E8E0E5] flex flex-col items-center text-center">
        {qrisLoading ? (
          <div className="w-56 h-56 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#3B122D]/20 border-t-[#3B122D] rounded-full animate-spin" />
            <span className="text-xs text-[#756A73]">Menerbitkan barcode QRIS Midtrans...</span>
          </div>
        ) : (
          <>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 inline-block">
              <img
                src={qrDisplayUrl}
                alt="QRIS Midtrans FloverArts"
                className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=00020101021226610015ID.CO.GOPAY.WWW0119G9360091100213054100208102003920303UMI51390016ID.OR.AIRPAY.WWW0115ID10200392019285204599953033605406${safeTotalAmount}5802ID5918FLOVERARTS ATELIER6007CILACAP61055322362210117${safeOrderNumber}6304`;
                }}
              />
            </div>

            <div className="text-xs font-semibold text-[#241B22] flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>QRIS Dynamic Midtrans Payment Gateway</span>
            </div>
            <div className="text-[11px] text-[#756A73] mt-1 max-w-sm">
              NMID: ID1020039201928 • Mendukung GoPay, ShopeePay, OVO, Dana, BCA Mobile, Livin by Mandiri.
            </div>

            <div className="mt-4 pt-4 border-t border-[#E8E0E5] w-full max-w-md">
              <div className="text-xs text-[#8E838C]">Total Tagihan Pesanan</div>
              <div className="text-2xl font-serif font-bold text-[#3B122D] mt-0.5">
                {formatRupiah(safeTotalAmount)}
              </div>
            </div>

            {/* Tombol Aksi QRIS */}
            <div className="mt-5 w-full max-w-md space-y-2">
              <button
                type="button"
                onClick={handleCopyQrisString}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EDE3F2] text-[#3B122D] hover:bg-[#d9c4e2] font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                {copiedQrisString ? (
                  <Check className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>
                  {copiedQrisString
                    ? 'Kode QRIS Berhasil Disalin!'
                    : 'Salin Kode QRIS (String)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyQrisUrl}
                className="w-full py-2 px-4 rounded-xl border border-[#D9B7CC] bg-white text-[#3B122D] hover:bg-[#FAF7F8] font-medium text-xs transition flex items-center justify-center gap-2"
              >
                {copiedQrisUrl ? (
                  <Check className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>
                  {copiedQrisUrl
                    ? 'URL QR Code Berhasil Disalin!'
                    : 'Salin QR Code URL'}
                </span>
              </button>

              {/* Tombol 1-Klik Simulasi Sukses */}
              <button
                type="button"
                onClick={onSimulatePayment}
                disabled={simulatingPayment}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-xs transition flex items-center justify-center gap-2 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {simulatingPayment
                    ? 'Memproses Simulasi...'
                    : '⚡ Simulasikan Bayar Berhasil (1-Klik Test)'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

