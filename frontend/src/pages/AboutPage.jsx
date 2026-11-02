import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Sparkles, HeartHandshake } from 'lucide-react';
import catalogApi from '../api/endpoints/catalog';
import ProductCard from '../features/catalog/components/ProductCard';
import { DEFAULT_FEATURED_PRODUCTS } from '../features/home/constants/homeData';

/**
 * AboutPage - Halaman Tentang Kami FloverArts_
 * Desain Modern Editorial terinspirasi dari All Natural & floral atelier modern.
 * Memadukan fotografi resolusi tinggi, tipografi elegan (Poppins, Plus Jakarta Sans, Roboto),
 * dan komposisi seimbang dengan ruang bernapas (whitespace) yang lega.
 */
export function AboutPage() {
  // Query produk pilihan untuk Featured Collection
  const { data: productsData } = useQuery({
    queryKey: ['about-featured-products'],
    queryFn: async () => {
      try {
        const res = await catalogApi.getProducts({ limit: 4 });
        const items = res?.data?.products || res?.data || res || [];
        return Array.isArray(items) && items.length > 0 ? items.slice(0, 4) : DEFAULT_FEATURED_PRODUCTS.slice(0, 4);
      } catch {
        return DEFAULT_FEATURED_PRODUCTS.slice(0, 4);
      }
    },
    staleTime: 5 * 60 * 1000,
    initialData: DEFAULT_FEATURED_PRODUCTS.slice(0, 4),
  });

  const featuredList = Array.isArray(productsData) && productsData.length > 0 
    ? productsData.slice(0, 4) 
    : DEFAULT_FEATURED_PRODUCTS.slice(0, 4);

  return (
    <div className="w-full bg-white text-primaryText pt-6 sm:pt-10 pb-20 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            SECTION 1: HERO BANNER — Modern Editorial Statement & Expansive Image
            ========================================================================= */}
        <section className="pt-4 sm:pt-8 pb-12 sm:pb-16" aria-labelledby="about-hero-heading">
          <div className="max-w-4xl">
            <span className="inline-block text-xs font-sans uppercase tracking-[0.25em] text-secondaryText font-medium mb-4 sm:mb-6">
              About FloverArts
            </span>
            <h1
              id="about-hero-heading"
              className="font-heading text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-primaryText leading-[1.18] sm:leading-[1.15]"
            >
              Bunga untuk Setiap Cerita dan Perasaan.
            </h1>
          </div>

          {/* Expansive Hero Visual Banner */}
          <div className="mt-8 sm:mt-12 w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] rounded-2xl md:rounded-3xl overflow-hidden bg-[#FAF7FB] shadow-xs">
            <img
              src="/about us.jpg"
              alt="FloverArts Atelier Bouquet Presentation"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>

          {/* Stats Bar */}
          <div className="mt-10 sm:mt-14 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center border-t border-borderNeutral/60">
            <div>
              <span className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primaryText tracking-tight">
                15+
              </span>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-secondaryText font-sans">
                Pilihan Jenis Bunga
              </p>
            </div>
            <div>
              <span className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primaryText tracking-tight">
                500+
              </span>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-secondaryText font-sans">
                Buket Terangkai
              </p>
            </div>
            <div>
              <span className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primaryText tracking-tight">
                130+
              </span>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-secondaryText font-sans">
                Ulasan Pelanggan
              </p>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 2: BRAND STORY — Cerita & Filosofi FloverArts
            ========================================================================= */}
        <section className="py-12 sm:py-20 border-t border-gray-100" aria-labelledby="brand-story-heading">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Story Text */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="text-xs font-sans uppercase tracking-[0.2em] text-primary/80 font-semibold mb-3">
                Filosofi Kami
              </span>
              <h2
                id="brand-story-heading"
                className="font-heading text-2xl sm:text-3xl md:text-4xl font-medium sm:font-semibold text-primaryText tracking-tight mb-6"
              >
                Setiap Rangkaian Memiliki Suara
              </h2>
              <div className="space-y-4 font-sans text-secondaryText text-sm sm:text-base leading-relaxed">
                <p>
                  FloverArts hadir dari keyakinan sederhana bahwa bunga bukan sekadar hiasan visual,
                  melainkan medium komunikasi emosional yang berbicara saat kata-kata terasa tidak cukup.
                </p>
                <p>
                  Dari momen perayaan sukacita, permohonan maaf yang tulus, apresiasi kelulusan,
                  hingga ungkapan simpati terdalam, kami mendedikasikan ketelitian pada setiap helai kelopak,
                  harmoni warna, dan tekstur lembaran pembungkus.
                </p>
                <p>
                  Di atelier kami, setiap buket dikurasi dengan perhatian penuh terhadap kesegaran alami
                  dan estetika modern, menghadirkan keindahan yang hidup dan berkesan lama bagi mereka yang menerimanya.
                </p>
              </div>
            </div>

            {/* Story Image */}
            <div className="lg:col-span-7">
              <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[5/4] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#FAF7FB] shadow-sm">
                <img
                  src="/quality-dedication-bouquets.png"
                  alt="Proses Perangkaian Buket Artisan di FloverArts"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 3: OUR VALUES — Nilai & Komitmen FloverArts (Alternating Editorial)
            ========================================================================= */}
        <section className="py-12 sm:py-20 border-t border-gray-100" aria-labelledby="values-heading">
          <div className="mb-12 sm:mb-16">
            <span className="text-xs font-sans uppercase tracking-[0.2em] text-primary/80 font-semibold mb-3 block">
              Nilai Utama
            </span>
            <h2
              id="values-heading"
              className="font-heading text-2xl sm:text-3xl md:text-4xl font-medium sm:font-semibold text-primaryText tracking-tight"
            >
              Komitmen Kami untuk Setiap Tangkai
            </h2>
          </div>

          <div className="space-y-14 sm:space-y-24">
            {/* Value Block 1: Sourcing & Freshness (Image Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              <div className="lg:col-span-6">
                <div className="aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#FAF7FB] shadow-sm">
                  <img
                    src="/pink tulip.jpg"
                    alt="Pilihan Bunga Segar Pilihan FloverArts"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="w-10 h-10 rounded-full bg-softLavender text-primary flex items-center justify-center mb-5">
                  <Sparkles size={20} />
                </div>
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-secondaryText font-medium mb-2">
                  Kesegaran Alami
                </span>
                <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-medium sm:font-semibold text-primaryText mb-4">
                  Bunga Segar Terkurasi Ketat
                </h3>
                <p className="font-sans text-secondaryText text-sm sm:text-base leading-relaxed">
                  Kami mengutamakan kesegaran optimal dengan seleksi ketat pada kekuatan tangkai,
                  kemekaran kelopak, dan ketahanan bunga. Setiap buket dilengkapi hidrasi batang khusus
                  agar tetap mekar sempurna dan harum hingga ke tangan penerima.
                </p>
              </div>
            </div>

            {/* Value Block 2: Artisan Craftsmanship & Personal Touch (Text Left, Image Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col justify-center">
                <div className="w-10 h-10 rounded-full bg-softLavender text-primary flex items-center justify-center mb-5">
                  <HeartHandshake size={20} />
                </div>
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-secondaryText font-medium mb-2">
                  Artisan Handcrafted
                </span>
                <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-medium sm:font-semibold text-primaryText mb-4">
                  Sentuhan Personal di Setiap Rangkaian
                </h3>
                <p className="font-sans text-secondaryText text-sm sm:text-base leading-relaxed">
                  Tidak ada rangkaian yang diproduksi secara terburu-buru. Setiap karya dirangkai tangan
                  dengan teknik komposisi spiral seimbang, material kertas ramah lingkungan,
                  serta kartu ucapan personal yang dicetak rapi sesuai kata hati Anda.
                </p>
              </div>
              <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#FAF7FB] shadow-sm">
                  <img
                    src="/custom-bouquet-satin.png"
                    alt="Kerajinan Pita Satin dan Sentuhan Artisan FloverArts"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 4: OUR PROCESS — Tahapan Memilih Hingga Pesanan Disiapkan (4-Column Grid)
            ========================================================================= */}
        <section className="py-12 sm:py-20 border-t border-gray-100" aria-labelledby="process-heading">
          <div className="mb-10 sm:mb-14">
            <span className="text-xs font-sans uppercase tracking-[0.2em] text-primary/80 font-semibold mb-3 block">
              Bagaimana Kami Bekerja
            </span>
            <h2
              id="process-heading"
              className="font-heading text-2xl sm:text-3xl md:text-4xl font-medium sm:font-semibold text-primaryText tracking-tight"
            >
              Proses Pembuatan Rangkaian
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Step 01 */}
            <div className="flex flex-col group">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7FB] shadow-xs mb-4">
                <img
                  src="/bouquet-sunflower.jpg"
                  alt="Tahap 1: Pilih Koleksi Rangkaian"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="font-roboto text-xs font-semibold text-primary tracking-wider uppercase mb-1">
                01 / Eksplorasi Desain
              </span>
              <h3 className="font-heading text-base sm:text-lg font-medium text-primaryText mb-2">
                Pilih atau Rancang Sendiri
              </h3>
              <p className="font-sans text-xs sm:text-sm text-secondaryText leading-relaxed">
                Pilih tema dari katalog koleksi siap kirim kami atau buat buket impian melalui fitur Custom Bouquet interaktif.
              </p>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col group">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7FB] shadow-xs mb-4">
                <img
                  src="/bouquet-rose.jpg"
                  alt="Tahap 2: Perangkaian Bunga Segar"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="font-roboto text-xs font-semibold text-primary tracking-wider uppercase mb-1">
                02 / Perangkaian Artisan
              </span>
              <h3 className="font-heading text-base sm:text-lg font-medium text-primaryText mb-2">
                Dirangkai Teliti & Proporsional
              </h3>
              <p className="font-sans text-xs sm:text-sm text-secondaryText leading-relaxed">
                Florist kami menata tiap tangkai bunga segar dengan keseimbangan volume, warna wrapping, dan aksen pita yang anggun.
              </p>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col group">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7FB] shadow-xs mb-4">
                <img
                  src="/lily putih.jpg"
                  alt="Tahap 3: Kartu Ucapan Personal"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="font-roboto text-xs font-semibold text-primary tracking-wider uppercase mb-1">
                03 / Kartu Ucapan Khusus
              </span>
              <h3 className="font-heading text-base sm:text-lg font-medium text-primaryText mb-2">
                Pesan Tulus Disematkan
              </h3>
              <p className="font-sans text-xs sm:text-sm text-secondaryText leading-relaxed">
                Tuliskan isi hati Anda; kami mencetaknya pada kartu ucapan premium untuk memperkuat makna di balik setiap pemberian.
              </p>
            </div>

            {/* Step 04 */}
            <div className="flex flex-col group">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7FB] shadow-xs mb-4">
                <img
                  src="/bucket hbd.jpg"
                  alt="Tahap 4: Pengemasan dan Pengiriman Aman"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="font-roboto text-xs font-semibold text-primary tracking-wider uppercase mb-1">
                04 / Pengantaran Terjaga
              </span>
              <h3 className="font-heading text-base sm:text-lg font-medium text-primaryText mb-2">
                Aman Tiba di Tujuan
              </h3>
              <p className="font-sans text-xs sm:text-sm text-secondaryText leading-relaxed">
                Kemasan aman dengan proteksi kelembaban agar bunga tetap segar, tegap, dan siap memukau saat momen serah terima.
              </p>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 5: FEATURED COLLECTION — Menampilkan 3-4 Produk dari Katalog
            ========================================================================= */}
        <section className="py-12 sm:py-20 border-t border-gray-100" aria-labelledby="featured-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <span className="text-xs font-sans uppercase tracking-[0.2em] text-primary/80 font-semibold mb-2 block">
                Katalog Kami
              </span>
              <h2
                id="featured-heading"
                className="font-heading text-2xl sm:text-3xl md:text-4xl font-medium sm:font-semibold text-primaryText tracking-tight"
              >
                Koleksi Pilihan FloverArts
              </h2>
            </div>
            <Link
              to="/katalog"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover active:scale-[0.98] transition-all font-sans"
            >
              <span>Lihat Semua Katalog</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div
            data-testid="about-featured-grid"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {featuredList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>


        {/* =========================================================================
            SECTION 6: CLOSING CTA — Ajakan Menjelajahi Koleksi
            ========================================================================= */}
        <section className="pt-8 sm:pt-14 pb-8" aria-labelledby="closing-cta-heading">
          <div className="w-full bg-[#FAF7FB] rounded-2xl md:rounded-3xl p-8 sm:p-14 md:p-16 text-center flex flex-col items-center justify-center">
            <span className="text-xs font-sans uppercase tracking-[0.2em] text-primary/80 font-semibold mb-3">
              Momen Anda, Keahlian Kami
            </span>
            <h2
              id="closing-cta-heading"
              className="font-heading text-2xl sm:text-4xl md:text-5xl font-medium sm:font-semibold text-primaryText tracking-tight max-w-2xl leading-tight mb-4"
            >
              Hadirkan Kesan Mendalam Lewat Rangkaian Bunga Segar.
            </h2>
            <p className="font-sans text-secondaryText text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
              Jelajahi berbagai pilihan buket siap kirim untuk perayaan hari ini, atau konsultasikan buket impian Anda bersama florist FloverArts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/katalog"
                className="w-full sm:w-auto px-7 py-3.5 bg-primary text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-primary-hover active:scale-[0.97] transition-[background-color,transform] duration-fast shadow-button text-center"
              >
                Jelajahi Katalog Bunga
              </Link>
              <Link
                to="/buket-custom"
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-primary text-xs sm:text-sm font-semibold rounded-full hover:bg-softLavender/60 active:scale-[0.97] transition-[background-color,transform] duration-fast shadow-xs border border-gray-200 text-center"
              >
                Rangkai Buket Custom
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default AboutPage;
