import React, { useState } from 'react';
import { Building2, Copy, Check } from 'lucide-react';
import { formatRupiah } from '../../../lib/formatters';

export default function BankTransferSection({ safeTotalAmount }) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const handleCopyAccount = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('5410987654');
    }
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyAmount = () => {
    const amt = safeTotalAmount ? String(safeTotalAmount) : '250000';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(amt);
    }
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E8E0E5]">
        <div className="p-2.5 rounded-xl bg-[#EDE3F2] text-[#3B122D]">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-medium text-lg text-[#241B22]">
            Transfer Rekening Bank BCA
          </h3>
          <p className="text-xs text-[#756A73]">
            Transfer via ATM, m-BCA, atau Internet Banking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kolom Nomor Rekening */}
        <div className="p-4 rounded-xl bg-[#FAF7F8] border border-[#E8E0E5]">
          <div className="text-xs text-[#8E838C] mb-1">Nomor Rekening BCA</div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-mono font-bold text-[#241B22] tracking-wider">
              5410987654
            </span>
            <button
              type="button"
              onClick={handleCopyAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#3B122D] bg-[#EDE3F2]/60 hover:bg-[#EDE3F2] transition"
            >
              {copiedAccount ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedAccount ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <div className="text-xs text-[#756A73] mt-2">
            Atas Nama: <strong>FloverArts Atelier</strong>
          </div>
        </div>

        {/* Kolom Total Tagihan */}
        <div className="p-4 rounded-xl bg-[#FAF7F8] border border-[#E8E0E5]">
          <div className="text-xs text-[#8E838C] mb-1">Total Tagihan Pesanan</div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-serif font-bold text-[#3B122D]">
              {formatRupiah(safeTotalAmount)}
            </span>
            <button
              type="button"
              onClick={handleCopyAmount}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#3B122D] bg-[#EDE3F2]/60 hover:bg-[#EDE3F2] transition"
            >
              {copiedAmount ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedAmount ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <div className="text-xs text-[#756A73] mt-2">
            Pastikan nominal transfer sesuai persis hingga digit terakhir.
          </div>
        </div>
      </div>
    </div>
  );
}

