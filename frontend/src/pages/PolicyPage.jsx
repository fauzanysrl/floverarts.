import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Store, AlertCircle, Clock, MessageCircle } from 'lucide-react';

export function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F8] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-secondaryText mb-3">
          <Link to="/" className="hover:text-primary">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-primary font-medium">Kebijakan & Garansi Bunga</span>
        </div>

        {/* Header */}
        <div className="mb-10 text-left">
          <span className="text-[11px] font-roboto uppercase tracking-[0.2em] text-secondaryText font-semibold mb-2 block">
            KEBIJAKAN ATELIER &amp; JAMINAN MUTU
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primaryText">
            Kebijakan Layanan & Garansi Bunga Segar
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-1.5 leading-relaxed max-w-2xl">
            Komitmen FloverArts Cilacap dalam menghadirkan rangkaian bunga potong terbaik dengan standar kebersihan, kesegaran terkurasi, dan perlindungan kepuasan pelanggan.
          </p>
        </div>

        {/* 4 Cards Section */}
        <div className="space-y-6">
          {/* 1. Garansi Kesegaran */}
          <section className="bg-white rounded-xl border border-borderNeutral p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-primaryText">
                  1. Garansi Kesegaran Bunga & Komplain
                </h2>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  Setiap buket dirangkai dari bunga potong pilihan yang masih segar dengan hidrasi batang khusus saat pengiriman.
                </p>
                <div className="bg-[#FAF7FB] p-3.5 rounded-lg border border-borderNeutral text-xs text-primaryText space-y-1.5 mt-2">
                  <p>
                    <strong>Batas Waktu Pengajuan:</strong> Maksimal <strong>2 jam</strong> setelah buket bunga diterima di alamat tujuan.
                  </p>
                  <p>
                    <strong>Syarat Klaim:</strong> Menyertakan foto/video kondisi tangkai atau wrapping yang rusak sebelum dipakai, lalu kirimkan ke WhatsApp layanan pelanggan kami.
                  </p>
                  <p>
                    <strong>Penyelesaian:</strong> Jika kerusakan terbukti akibat kelalaian kurir atelier, kami akan mengganti tangkai yang rusak atau merangkai ulang bunga Anda.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Panduan Perawatan */}
          <section className="bg-white rounded-xl border border-borderNeutral p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-softLavender text-primary flex items-center justify-center shrink-0">
                <Heart size={20} />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-primaryText">
                  2. Panduan Merawat Buket agar Tahan Mekar (3–5 Hari)
                </h2>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  Ikuti langkah sederhana ini untuk menjaga bunga tetap harum dan kelopak mekar tahan lama:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-secondaryText space-y-1.5">
                  <li>
                    <strong>Potong Tangkai Diagonal:</strong> Buka ikatan pembungkus bawah dan potong ujung batang 1–2 cm secara menyerong (sudut 45°) agar penyerapan air maksimal.
                  </li>
                  <li>
                    <strong>Gunakan Air Bersih:</strong> Masukkan ke dalam vas berisi air bersih dingin. Ganti air vas setiap hari atau maksimal 2 hari sekali.
                  </li>
                  <li>
                    <strong>Hindari Paparan Panas:</strong> Letakkan rangkaian di ruangan sejuk dan jauhkan dari hembusan AC langsung, sinar matahari terik, maupun buah matang (gas etilen).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Pengambilan di Toko */}
          <section className="bg-white rounded-xl border border-borderNeutral p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Store size={20} />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-primaryText">
                  3. Pengambilan di Toko (Flagship Studio Pick-Up)
                </h2>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  Layanan pengambilan langsung di studio atelier tersedia tanpa biaya tambahan (Gratis Ongkir):
                </p>
                <div className="bg-[#FAF7FB] p-3.5 rounded-lg border border-borderNeutral text-xs text-secondaryText space-y-1">
                  <p className="text-primaryText font-semibold">Flagship Atelier FloverArts Cilacap</p>
                  <p>Jl. R.E. Martadinata No. 10, Cilacap Selatan, Jawa Tengah</p>
                  <p className="flex items-center gap-1.5 pt-1 text-primary">
                    <Clock size={13} />
                    <span>Buka Setiap Hari: 08.00 – 21.00 WIB</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Pembayaran & Pembatalan */}
          <section className="bg-white rounded-xl border border-borderNeutral p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-primaryText">
                  4. Pembayaran & Pembatalan Pesanan
                </h2>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-secondaryText space-y-1.5">
                  <li>
                    <strong>Sistem Pembayaran Otomatis:</strong> Pembayaran diproses melalui gerbang resmi Midtrans (QRIS dan Transfer Bank BCA) dan terverifikasi secara instan.
                  </li>
                  <li>
                    <strong>Batas Waktu Pembayaran:</strong> Pesanan yang tidak diselesaikan dalam batas waktu transfer otomatis dibatalkan oleh sistem.
                  </li>
                  <li>
                    <strong>Pesanan Custom:</strong> Pesanan buket custom yang statusnya telah memasuki tahap <em>Diproses</em> (sedang dirangkai atau bahan telah dipotong oleh florist) tidak dapat dibatalkan.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Contact Help */}
        <div className="mt-10 p-6 rounded-xl bg-white border border-borderNeutral shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-sm font-bold text-primaryText">Butuh Bantuan Khusus Rangkaian Bunga?</h3>
            <p className="text-xs text-secondaryText mt-0.5">Tim floral concierge FloverArts siap membantu konsultasi desain Anda.</p>
          </div>
          <a
            href="https://wa.me/6281330535664?text=Halo%20FloverArts%2C%20saya%20ingin%20konsultasi%20mengenai%20pesanan%20bunga"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition flex items-center gap-2 shadow-xs shrink-0"
          >
            <MessageCircle size={15} />
            <span>Chat WhatsApp Florist</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default PolicyPage;

