import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    id: 1,
    question: 'Bagaimana cara memesan buket bunga?',
    answer:
      'Pilih buket favorit Anda dari katalog atau gunakan fitur Custom Bouquet, klik "Detail / Pesan", tambahkan ke keranjang, dan lakukan checkout dengan mengisi alamat penerima serta tanggal pengiriman.',
  },
  {
    id: 2,
    question: 'Bisakah saya merakit buket custom sendiri?',
    answer:
      'Ya! Floverarts menyediakan fitur Custom Bouquet di mana Anda dapat memilih sendiri jenis bunga segar, warna kertas pembungkus (wrapping), pita, serta menuliskan pesan personal pada kartu ucapan.',
  },
  {
    id: 3,
    question: 'Metode pembayaran apa saja yang didukung?',
    answer:
      'Seluruh pembayaran diproses otomatis dan aman melalui Midtrans Snap. Kami menerima QRIS (GoPay, OVO, ShopeePay, DANA), Virtual Account Bank (BCA, Mandiri, BNI, BRI), dan Kartu Kredit.',
  },
  {
    id: 4,
    question: 'Bagaimana cara melacak status pesanan saya?',
    answer:
      'Setelah pembayaran terkonfirmasi, Anda dapat memantau status pesanan (dikonfirmasi → diproses → siap dikirim → selesai) dan nomor resi kurir secara real-time melalui menu "Pesanan Saya".',
  },
  {
    id: 5,
    question: 'Bisakah saya menentukan tanggal dan waktu pengiriman?',
    answer:
      'Tentu saja. Pada saat checkout, Anda dapat memilih tanggal pengiriman yang diinginkan, baik untuk pengiriman di hari yang sama (Same-Day) maupun pemesanan terjadwal untuk hari ulang tahun atau wisuda mendatang.',
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState(1);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      {FAQS.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="rounded-2xl bg-[#FAF7FB] overflow-hidden transition-all duration-300 shadow-xs"
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-serif font-bold text-primaryText hover:text-primary transition-colors gap-4"
              aria-expanded={isOpen}
            >
              <span>{faq.question}</span>
              <ChevronDown
                size={18}
                className={`text-secondaryText transition-transform duration-300 ease-out shrink-0 ${
                  isOpen ? 'rotate-180 text-primary' : ''
                }`}
              />
            </button>
            <div className={`accordion-wrapper ${isOpen ? 'open' : ''}`}>
              <div className="accordion-content-inner">
                <div className="px-5 pb-5 text-xs sm:text-sm text-secondaryText leading-relaxed pt-1">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
