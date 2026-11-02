import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Share2,
  Heart,
  Star,
  Mail,
} from 'lucide-react';
import catalogApi from '../../../api/endpoints/catalog';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../../cart/hooks/useCart';
import { formatIDR } from '../../../lib/formatters';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import ErrorState from '../../../components/feedback/ErrorState';
import { DEFAULT_FEATURED_PRODUCTS } from '../../home/constants/homeData';

// Pilihan Ukuran Rangkaian
const ARRANGEMENT_SIZES = [
  {
    id: 'standard',
    name: 'Standard',
    extraPrice: 0,
    stems: '5 Stems',
  },
  {
    id: 'deluxe',
    name: 'Deluxe',
    extraPrice: 50000,
    stems: '8 Stems',
  },
  {
    id: 'premium',
    name: 'Premium',
    extraPrice: 90000,
    stems: '12 Stems',
  },
];

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart, closeCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(ARRANGEMENT_SIZES[0]);
  const [giftNote, setGiftNote] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedThumbIndex, setSelectedThumbIndex] = useState(0);

  const [addedNotification, setAddedNotification] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Ambil data detail produk berdasarkan slug
  const {
    data: productResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const res = await catalogApi.getProductBySlug(slug);
        return res?.data ?? res;
      } catch (err) {
        const fallback = DEFAULT_FEATURED_PRODUCTS.find((p) => p.slug === slug);
        if (fallback) return fallback;
        throw err;
      }
    },
    enabled: !!slug,
  });

  const product = productResponse;

  // Galeri foto produk (foto utama + sudut buket tambahan)
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    const base = product.image_url || '/bouquet-rose.jpg';
    return [
      base,
      '/bouquet-rose.jpg',
      '/pink tulip.jpg',
      '/bouquet-anniversary.jpg',
    ];
  }, [product]);

  const activeImage = galleryImages[selectedThumbIndex] || product?.image_url;

  // Rekomendasi produk lainnya (pastikan selalu ada 4 produk dalam grid)
  const { data: relatedData } = useProducts(
    product?.category_id ? { category_id: product.category_id, limit: 8 } : { limit: 8 },
    { enabled: !!product }
  );

  const filteredFromApi = (relatedData || []).filter(
    (p) => p.slug !== slug && p.id !== product?.id
  );
  const fallbackList = (DEFAULT_FEATURED_PRODUCTS || []).filter(
    (p) => p.slug !== slug && p.id !== product?.id && !filteredFromApi.some((f) => f.id === p.id)
  );
  const relatedProducts = [...filteredFromApi, ...fallbackList].slice(0, 4);

  // Kalkulasi harga satuan berdasarkan ukuran yang dipilih
  const currentUnitPrice = (product?.price || 0) + (selectedSize?.extraPrice || 0);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      const maxStock = product?.stock ?? 99;
      if (next < 1) return 1;
      if (next > maxStock) return maxStock;
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addItem({
        product_id: product.id,
        name: `${product.name}`,
        price: currentUnitPrice,
        image_url: activeImage,
        stock: product.stock,
        slug: product.slug,
        quantity,
        item_type: 'standard',
        custom_details: {
          arrangement_size: selectedSize.name,
          gift_note: giftNote.trim() || undefined,
        },
      });
      setAddedNotification(true);
      setTimeout(() => setAddedNotification(false), 3500);
    } catch {
      // Ditangani oleh context
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addItem(
        {
          product_id: product.id,
          name: `${product.name}`,
          price: currentUnitPrice,
          image_url: activeImage,
          stock: product.stock,
          slug: product.slug,
          quantity,
          item_type: 'standard',
          custom_details: {
            arrangement_size: selectedSize.name,
            gift_note: giftNote.trim() || undefined,
          },
        },
        { openDrawer: false }
      );
      if (closeCart) {
        closeCart();
      }
      navigate('/checkout');
    } catch {
      // Ditangani oleh context
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'FloverArts_ Bouquet',
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  // 1. Loading Skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-6 aspect-square bg-[#FAF7FB] rounded-2xl animate-pulse" />
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="h-5 w-32 bg-[#FAF7FB] rounded-full animate-pulse" />
            <div className="h-10 w-3/4 bg-[#FAF7FB] rounded-md animate-pulse" />
            <div className="h-7 w-1/3 bg-[#FAF7FB] rounded-md animate-pulse" />
            <div className="h-20 w-full bg-[#FAF7FB] rounded-xl animate-pulse mt-4" />
            <div className="h-11 w-1/2 bg-[#FAF7FB] rounded-full animate-pulse mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <ErrorState
            title="Buket Tidak Ditemukan"
            message={
              error?.message ||
              'Rangkaian bunga yang Anda cari mungkin telah dinonaktifkan atau tautan tidak valid.'
            }
            onRetry={refetch}
          />
          <div className="mt-6">
            <Link
              to="/produk"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-softLavender text-primary text-xs font-medium hover:bg-accentLavender/50 transition-colors uppercase tracking-wider font-sans"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Katalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.min_stock || 3);

  return (
    <div className="w-full bg-white text-gray-900 selection:bg-softLavender selection:text-primary animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Breadcrumb Navigation Sesuai UI Asli */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 font-sans text-xs text-gray-500 font-normal mb-6 overflow-x-auto no-scrollbar animate-fade-in"
        >
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/produk" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <span className="text-gray-400">/</span>
          <span className="hover:text-primary transition-colors cursor-pointer">
            {product.category_name || 'Bouquets'}
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-normal truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Master Product Grid: Dua Kolom Sesuai Persis UI Asli */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* KOLOM KIRI: Galeri Foto Utama + 4 Thumbnail Horizontal */}
          <div className="lg:col-span-6 flex flex-col items-center animate-fade-in-up">
            {/* Foto Utama Poster/Card */}
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 transition-all">
              <ResponsiveImage
                src={activeImage}
                alt={`Rangkaian buket ${product.name} FloverArts_`}
                aspectRatio="aspect-[4/5]"
                priority={true}
                objectPosition="object-center"
                fallbackLabel={product.name}
                slug={product.slug}
              />

              {/* Tombol Bagikan di Pojok Kanan Atas Foto */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Bagikan link produk"
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
              >
                <Share2 size={14} />
              </button>
            </div>

            {/* 4 Thumbnail Horizontal di Bawah Foto Utama */}
            <div className="grid grid-cols-4 gap-3 w-full mt-3">
              {galleryImages.map((thumbSrc, idx) => {
                const isActive = selectedThumbIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedThumbIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                      isActive
                        ? 'border-2 border-[#3B122D] shadow-xs'
                        : 'border border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumbSrc}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {copiedNotification && (
              <span className="text-xs text-primary font-roboto font-normal bg-softLavender px-3 py-1 rounded-full mt-3 animate-fade-in">
                Tautan disalin ke clipboard!
              </span>
            )}
          </div>

          {/* KOLOM KANAN: Detail Informasi Produk Clean & Minimalis */}
          <div className="lg:col-span-6 flex flex-col items-start text-left animate-fade-in-up [animation-delay:120ms]">
            {/* Kategori & Status Stok */}
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-[#756A73] font-medium">
                {product.category_name || 'Buket Bunga'}
              </span>

              <div>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    Stok Habis
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Sisa {product.stock} buket
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EAF6ED] text-[#1D8348] border border-[#D5ECD9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D8348]" />
                    Stok Tersedia ({product.stock} buket)
                  </span>
                )}
              </div>
            </div>

            {/* Judul Produk */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#241B22] tracking-tight mb-2">
              {product.name}
            </h1>

            {/* Harga Produk */}
            <div className="mb-4">
              <span className="font-serif font-bold text-2xl sm:text-3xl text-[#3B122D]">
                {formatIDR(currentUnitPrice)}
              </span>
            </div>

            {/* Deskripsi Singkat */}
            <p className="text-xs sm:text-sm text-[#756A73] leading-relaxed mb-6">
              {product.description ||
                'Rangkaian buket bunga segar istimewa dari FloverArts Atelier, dirangkai secara hand-tied dengan sentuhan estetik dan bahan pembungkus premium.'}
            </p>

            {/* Pilihan Ukuran Rangkaian */}
            <div className="w-full mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#756A73] mb-2.5">
                Pilihan Ukuran Buket
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {ARRANGEMENT_SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-2 sm:px-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#3B122D] bg-[#FAF7F8] ring-1 ring-[#3B122D] text-[#3B122D] shadow-xs'
                          : 'border-[#E8E0E5] hover:border-gray-300 bg-white text-[#241B22]'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-semibold">{size.name}</div>
                      <div className="text-[11px] text-[#756A73] mt-0.5">
                        {size.extraPrice === 0 ? 'Included' : `+${formatIDR(size.extraPrice)}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pesan Kartu Ucapan (Opsional) */}
            <div className="w-full mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#756A73] mb-2">
                Pesan Kartu Ucapan <span className="text-gray-400 font-normal lowercase">(opsional)</span>
              </label>
              <textarea
                rows={2}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="Tulis pesan untuk penerima buket bunga..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition"
              />
            </div>

            {/* Baris Tombol Aksi: Kuantitas, Tambah ke Keranjang, Beli Sekarang, Wishlist */}
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              {/* Stepper Kuantitas */}
              <div className="flex items-center justify-between sm:justify-start border border-[#E8E0E5] rounded-xl bg-[#FAF7F8] px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-7 h-7 flex items-center justify-center text-[#241B22] hover:bg-white rounded-lg disabled:opacity-30 transition text-base"
                  aria-label="Kurangi jumlah"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs sm:text-sm font-semibold text-[#241B22]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-7 h-7 flex items-center justify-center text-[#241B22] hover:bg-white rounded-lg disabled:opacity-30 transition text-base"
                  aria-label="Tambah jumlah"
                >
                  +
                </button>
              </div>

              {/* Tombol Tambah ke Keranjang */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-4 rounded-xl border border-[#D9B7CC] bg-white text-[#3B122D] hover:bg-[#FAF7F8] text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-40"
              >
                <ShoppingBag size={15} />
                <span>Tambah ke Keranjang</span>
              </button>

              {/* Tombol Beli Sekarang (Langsung Checkout) */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-4 rounded-xl bg-[#3B122D] text-white hover:bg-[#4D183B] active:bg-[#2B0C20] text-xs sm:text-sm font-medium transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>Beli Sekarang</span>
              </button>

              {/* Tombol Wishlist Love */}
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Wishlist"
                className={`w-11 h-11 rounded-xl border border-[#E8E0E5] flex items-center justify-center transition-colors shrink-0 ${
                  isWishlisted ? 'text-red-500 bg-red-50 border-red-200' : 'text-gray-400 hover:text-red-500 hover:bg-white'
                }`}
              >
                <Heart size={16} className={isWishlisted ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* Feedback Berhasil Tambah */}
            {addedNotification && (
              <div className="w-full mb-5 p-3 rounded-xl bg-[#EAF6ED] border border-[#D5ECD9] flex items-center justify-between text-xs text-[#1D8348] animate-fade-in font-sans font-normal">
                <span className="flex items-center gap-2">
                  <Check size={15} />
                  <span>{quantity}x {product.name} dimasukkan ke keranjang!</span>
                </span>
                <button
                  type="button"
                  onClick={openCart}
                  className="font-medium underline ml-2 hover:text-[#1D8348]/80"
                >
                  Lihat Keranjang
                </button>
              </div>
            )}

            {/* Metadata Footer: SKU, Categories, Share */}
            <div className="w-full pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1 font-roboto font-normal">
              <div>
                <span className="font-medium text-gray-700">SKU:</span> FLWR-{product.id || '87424'}-NBC
              </div>
              <div>
                <span className="font-medium text-gray-700">Categories:</span>{' '}
                <span className="font-sans">
                  {product.category_name || 'Bouquets'}, Fresh Hand-tied Flowers, 100% Compostable
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-medium text-gray-700">Share:</span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <Share2 size={13} />
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(window.location.href)}`}
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <Mail size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* TAB INFORMASI PRODUK CLEAN & MINIMALIS (3 Tabs: Description, Additional Information, Reviews) */}
        <section className="mt-16 sm:mt-20 pt-6 border-t border-gray-100">
          {/* Tab Headers */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 pb-3 mb-8 text-sm border-b border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`font-serif text-sm transition-all pb-3 relative ${
                activeTab === 'description'
                  ? 'text-[#3B122D] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#3B122D]'
                  : 'text-[#756A73] hover:text-[#241B22]'
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('additional')}
              className={`font-serif text-sm transition-all pb-3 relative ${
                activeTab === 'additional'
                  ? 'text-[#3B122D] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#3B122D]'
                  : 'text-[#756A73] hover:text-[#241B22]'
              }`}
            >
              Additional Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`font-serif text-sm transition-all pb-3 relative ${
                activeTab === 'reviews'
                  ? 'text-[#3B122D] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#3B122D]'
                  : 'text-[#756A73] hover:text-[#241B22]'
              }`}
            >
              Reviews
            </button>
          </div>

          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="max-w-2xl mx-auto text-center space-y-4 animate-fade-in text-xs sm:text-sm text-[#756A73] leading-relaxed">
              <p>
                Setiap buket bunga di FloverArts Atelier dirangkai secara hand-tied oleh artisan florist profesional menggunakan bunga potong pilihan dengan kualitas terbaik dan wrapping kertas premium.
              </p>
              <p>
                Rangkaian ini cocok untuk perayaan wisuda, ulang tahun, anniversary, maupun momen spesial lainnya bersama orang tersayang.
              </p>
            </div>
          )}

          {/* TAB 2: ADDITIONAL INFORMATION */}
          {activeTab === 'additional' && (
            <div className="max-w-2xl mx-auto animate-fade-in text-xs sm:text-sm text-[#756A73]">
              <div className="rounded-xl border border-[#E8E0E5] divide-y divide-[#E8E0E5] bg-white overflow-hidden shadow-xs">
                <div className="grid grid-cols-3 p-3.5 bg-[#FAF7F8]">
                  <span className="font-semibold text-[#241B22]">Dimensi Buket</span>
                  <span className="col-span-2 text-[#756A73]">Tinggi ±45–50 cm, Lebar ±35 cm (Hand-tied)</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-white">
                  <span className="font-semibold text-[#241B22]">Material Wrapping</span>
                  <span className="col-span-2 text-[#756A73]">Korean Waterproof Matte Film & Double-faced Silk Satin Ribbon</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-[#FAF7F8]">
                  <span className="font-semibold text-[#241B22]">Komposisi Bunga</span>
                  <span className="col-span-2 text-[#756A73]">Fresh cut flowers pilihan artisan florist & Baby's Breath pendukung</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-white">
                  <span className="font-semibold text-[#241B22]">Daya Tahan</span>
                  <span className="col-span-2 text-[#756A73]">3–5 hari dengan perawatan air bersih dan ruangan sejuk</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-[#FAF7F8]">
                  <span className="font-semibold text-[#241B22]">Bonus Pembelian</span>
                  <span className="col-span-2 text-[#756A73]">Gratis Kartu Ucapan Pesan Khusus (Complimentary Atelier Gift Card)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="max-w-2xl mx-auto animate-fade-in space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-serif font-bold text-[#3B122D]">4.9</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  100% Pembeli Puas
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#FAF7F8] border border-[#E8E0E5] text-xs sm:text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#241B22]">Clarissa Aurelia</span>
                    <span className="text-[10px] text-gray-400">Terverifikasi</span>
                  </div>
                  <p className="text-[#756A73] leading-relaxed">
                    Bunganya sangat segar dan harum semerbak! Wrapping rapi sekali dan kartu ucapannya dicetak dengan font yang elegan.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF7F8] border border-[#E8E0E5] text-xs sm:text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#241B22]">Nadia Salsabila</span>
                    <span className="text-[10px] text-gray-400">Terverifikasi</span>
                  </div>
                  <p className="text-[#756A73] leading-relaxed">
                    Pilihan ukuran Deluxe pas banget untuk acara wisuda sahabat. Bunga tidak layu sama sekali meski dipakai foto seharian.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* EXPLORE RELATED PRODUCTS (Sesuai Persis UI Gambar 3) */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="font-roboto text-[11px] uppercase tracking-widest text-[#756A73] font-semibold block mb-1">
                CURATED COMPLEMENTS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#241B22] mb-2">
                Explore Related Products
              </h2>
              <p className="font-sans text-xs font-normal text-gray-500">
                Hand-arranged seasonal stems designed to match the poise of your selected botanical centerpieces.
              </p>
            </div>

            {/* Grid 4 Kartu Produk Sesuai Persis Layout Gambar 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProd) => (
                <Link
                  key={relProd.id}
                  to={`/produk/${relProd.slug}`}
                  className="group flex flex-col text-left transition-all"
                >
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs">
                    <img
                      src={relProd.image_url || '/bouquet-rose.jpg'}
                      alt={relProd.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="font-sans text-[11px] font-normal text-gray-400 mt-3">
                    {relProd.category_name || 'Bouquets'}
                  </span>
                  <h3 className="font-heading text-sm font-bold text-gray-900 group-hover:text-primary transition-colors mt-0.5 line-clamp-1">
                    {relProd.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-roboto text-sm font-medium text-gray-800">
                      {formatIDR(relProd.price)}
                    </span>
                    <span className="font-roboto text-xs font-normal text-gray-500 flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      4.9
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* OUR BOTANICAL NEWSLETTER (Sesuai Persis Gambar 3, Dengan Spacing Lega Sebelum Footer) */}
        <section className="mt-20 sm:mt-28 mb-16 sm:mb-24 text-center max-w-2xl mx-auto px-4">
          <span className="font-roboto text-[11px] uppercase tracking-widest text-[#756A73] font-semibold block mb-2">
            OUR BOTANICAL NEWSLETTER
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#241B22] tracking-tight mb-3">
            Subscribe to Our Newsletter to Get<br className="hidden sm:inline" /> Updates on Our Latest Offers
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#756A73] leading-relaxed mb-8 max-w-xl mx-auto">
            Receive 20% off your premier seasonal order, plus invitations to private flower foraging salons and care releases.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNewsletterSubscribed(true);
              setNewsletterEmail('');
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter Email Address"
              className="w-full sm:flex-1 px-4 py-3 bg-white border border-[#E8E0E5] rounded-xl text-xs sm:text-sm text-[#241B22] placeholder:text-gray-400 focus:outline-none focus:border-[#3B122D] focus:ring-1 focus:ring-[#3B122D] transition shadow-xs"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#3B122D] hover:bg-[#2A0D20] text-white rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition shadow-xs cursor-pointer"
            >
              Subscribe
            </button>
          </form>

          {newsletterSubscribed && (
            <p className="text-xs text-emerald-700 font-medium mt-3 animate-fade-in">
              Terima kasih! Anda telah terdaftar dalam buletin eksklusif kami.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}

export default ProductDetailPage;
