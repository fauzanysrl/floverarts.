import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import catalogApi from '../../../api/endpoints/catalog';
import { useProducts } from '../hooks/useProducts';
import { DEFAULT_FEATURED_PRODUCTS } from '../../home/constants/homeData';
import ProductGrid from '../components/ProductGrid';

// Grup 1: KOLEKSI BUNGA
const FLOWER_COLLECTIONS = [
  { id: '', name: 'Semua Koleksi' },
  { id: '1', name: 'Buket Bunga Segar', slug: 'buket-bunga-segar' },
  { id: '2', name: 'Buket Artificial & Kering', slug: 'buket-artificial-kering' },
  { id: 'wisuda', name: 'Buket Wisuda', slug: 'buket-wisuda' },
  { id: '4', name: 'Bunga Meja & Vas', slug: 'bunga-meja-vas' },
];

// Grup 2: PRODUK (Sesuai SRS & Produk Terbaru)
const PRODUCT_TYPES = [
  { id: 'terbaru', name: 'Terbaru', note: 'Produk 30 hari terakhir' },
  { id: 'hampers', name: 'Hampers' },
  { id: 'bloom-box', name: 'Bloom Box' },
  { id: 'gift-box', name: 'Gift Box' },
  { id: 'frame', name: 'Frame' },
  { id: 'glass-painting', name: 'Glass Painting' },
  { id: 'custom-gift', name: 'Custom Gift' },
];

// Grup 3: MOMEN & ACARA
const OCCASIONS = [
  { id: 'romance', name: 'Romance' },
  { id: 'anniversary', name: 'Anniversary' },
  { id: 'birthday', name: 'Birthday' },
  { id: 'celebration', name: 'Celebration' },
  { id: 'thank-you', name: 'Thank You' },
];

// Koleksi galeri karya lainnya di atas footer
const OTHER_GALLERY_IMAGES = [
  { src: '/mix flower.jpg', alt: 'Mix Flower Arrangement', label: 'Mix Blooms' },
  { src: '/bouquet graduation.jpg', alt: 'Graduation Bouquet FloverArts', label: 'Wisuda Series' },
  { src: '/bouquet-rose.jpg', alt: 'Red Rose Classic Bouquet', label: 'Classic Rose' },
  { src: '/bouquet-anniversary.jpg', alt: 'Anniversary Pastel Bouquet', label: 'Anniversary' },
  { src: '/bucket hbd.jpg', alt: 'Birthday Celebration Bouquet', label: 'Birthday Bloom' },
];

const ITEMS_PER_PAGE = 6;

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat') || '';
  const activeType = searchParams.get('type') || '';
  const activeOccasion = searchParams.get('occasion') || '';
  const searchQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || '';

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Ambil data kategori dari API (untuk sinkronisasi & uji integritas)
  const { data: _apiCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await catalogApi.getCategories();
      return res.data || [];
    },
  });

  // Parameter kueri backend
  const queryParams = useMemo(() => {
    const p = {};
    if (activeCategory && activeCategory !== 'wisuda') p.category_id = activeCategory;
    if (searchQuery) p.q = searchQuery;
    if (currentSort) p.sort = currentSort;
    return p;
  }, [activeCategory, searchQuery, currentSort]);

  const {
    data: apiProducts,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts(queryParams);

  // Filter & Urutkan fallback produk jika backend offline/belum seeded
  const filteredDefaultProducts = useMemo(() => {
    let result = [...DEFAULT_FEATURED_PRODUCTS];

    // 1. Filter Kategori Bunga
    if (activeCategory) {
      if (activeCategory === 'wisuda' || activeCategory === '3') {
        result = result.filter(
          (p) =>
            p.category_id?.toString() === '3' ||
            p.name.toLowerCase().includes('wisuda') ||
            (p.category_name && p.category_name.toLowerCase().includes('wisuda')) ||
            (p.description && p.description.toLowerCase().includes('wisuda'))
        );
      } else {
        result = result.filter((p) => p.category_id?.toString() === activeCategory.toString());
      }
    }

    // 2. Filter Tipe Produk (PRODUK)
    if (activeType === 'terbaru') {
      result.sort((a, b) => {
        if (b.created_at && a.created_at) {
          return b.created_at.localeCompare(a.created_at);
        }
        return (b.id || 0) - (a.id || 0);
      });
    } else if (activeType) {
      const typeKey = activeType.replace('-', ' ').toLowerCase();
      result = result.filter((p) => {
        const pType = (p.product_type || '').toLowerCase();
        const nameLower = (p.name || '').toLowerCase();
        const descLower = (p.description || '').toLowerCase();
        const catLower = (p.category_name || '').toLowerCase();
        return (
          pType === activeType ||
          pType.includes(typeKey) ||
          nameLower.includes(typeKey) ||
          descLower.includes(typeKey) ||
          catLower.includes(typeKey)
        );
      });
    }

    // 3. Filter Momen & Acara
    if (activeOccasion) {
      const occKey = activeOccasion.replace('-', ' ').toLowerCase();
      result = result.filter((p) => {
        const pOcc = (p.occasion || '').toLowerCase();
        const nameLower = (p.name || '').toLowerCase();
        const descLower = (p.description || '').toLowerCase();
        const catLower = (p.category_name || '').toLowerCase();
        return (
          pOcc === activeOccasion ||
          pOcc.includes(occKey) ||
          nameLower.includes(occKey) ||
          descLower.includes(occKey) ||
          catLower.includes(occKey)
        );
      });
    }

    // 4. Filter Pencarian Langsung
    if (searchQuery) {
      const qLower = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.category_name.toLowerCase().includes(qLower) ||
          (p.description && p.description.toLowerCase().includes(qLower))
      );
    }

    // 5. Pengurutan Harga
    if (currentSort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, activeType, activeOccasion, searchQuery, currentSort]);

  // Penentuan data produk final (Robust Fallback & Caching)
  const hasFilter = Boolean(activeCategory || activeType || activeOccasion || searchQuery || currentSort);

  const allProducts = useMemo(() => {
    // Jika backend mengembalikan produk yang valid, gunakan data backend
    if (apiProducts && apiProducts.length > 0) {
      let list = [...apiProducts];

      // Filter wisuda dari kategori api
      if (activeCategory === 'wisuda') {
        list = list.filter(
          (p) =>
            p.category_id?.toString() === '3' ||
            p.name.toLowerCase().includes('wisuda') ||
            (p.category_name && p.category_name.toLowerCase().includes('wisuda'))
        );
      }

      // Filter type produk
      if (activeType === 'terbaru') {
        list.sort((a, b) => {
          if (b.created_at && a.created_at) {
            return b.created_at.localeCompare(a.created_at);
          }
          return (b.id || 0) - (a.id || 0);
        });
      } else if (activeType) {
        const typeKey = activeType.replace('-', ' ').toLowerCase();
        list = list.filter((p) => {
          const pType = (p.product_type || '').toLowerCase();
          const nameLower = (p.name || '').toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          const catLower = (p.category_name || '').toLowerCase();
          return (
            pType === activeType ||
            pType.includes(typeKey) ||
            nameLower.includes(typeKey) ||
            descLower.includes(typeKey) ||
            catLower.includes(typeKey)
          );
        });
      }

      // Filter momen
      if (activeOccasion) {
        const occKey = activeOccasion.replace('-', ' ').toLowerCase();
        list = list.filter((p) => {
          const pOcc = (p.occasion || '').toLowerCase();
          const nameLower = (p.name || '').toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          const catLower = (p.category_name || '').toLowerCase();
          return (
            pOcc === activeOccasion ||
            pOcc.includes(occKey) ||
            nameLower.includes(occKey) ||
            descLower.includes(occKey) ||
            catLower.includes(occKey)
          );
        });
      }

      // Sort harga jika backend belum mengurutkan
      if (currentSort === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (currentSort === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      }

      return list;
    }

    // Jika pencarian eksplisit (q) tidak menghasilkan apa pun di backend, hormati hasil kosong
    if (searchQuery && Array.isArray(apiProducts)) {
      return [];
    }

    // Fallback cerdas: Tampilkan data default toko FloverArts yang sudah difilter & diurutkan
    return filteredDefaultProducts;
  }, [
    apiProducts,
    searchQuery,
    activeCategory,
    activeType,
    activeOccasion,
    currentSort,
    filteredDefaultProducts,
  ]);

  // Paginasi dinamis
  const totalItems = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return allProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [allProducts, safeCurrentPage]);

  // Handler Navigasi Kategori (Grup 1)
  const handleSelectCategory = (catId) => {
    const next = new URLSearchParams(searchParams);
    if (!catId || activeCategory === catId) {
      next.delete('cat');
    } else {
      next.set('cat', catId);
    }
    setSearchParams(next);
    setCurrentPage(1);
  };

  // Handler Navigasi Produk (Grup 2)
  const handleSelectType = (typeId) => {
    const next = new URLSearchParams(searchParams);
    if (activeType === typeId) {
      next.delete('type');
    } else {
      next.set('type', typeId);
    }
    setSearchParams(next);
    setCurrentPage(1);
  };

  // Handler Navigasi Momen & Acara (Grup 3)
  const handleSelectOccasion = (occId) => {
    const next = new URLSearchParams(searchParams);
    if (activeOccasion.toLowerCase() === occId.toLowerCase()) {
      next.delete('occasion');
    } else {
      next.set('occasion', occId);
    }
    setSearchParams(next);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (!val) next.delete('sort');
    else next.set('sort', val);
    setSearchParams(next);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    const trimmed = localSearch.trim();
    if (!trimmed) next.delete('q');
    else next.set('q', trimmed);
    setSearchParams(next);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setSearchParams({});
    setCurrentPage(1);
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Label resolusi untuk active filter chips
  const activeCategoryName = FLOWER_COLLECTIONS.find((c) => c.id === activeCategory)?.name;
  const activeTypeName = PRODUCT_TYPES.find((t) => t.id === activeType)?.name;
  const activeOccasionName = OCCASIONS.find((o) => o.id === activeOccasion)?.name;

  return (
    <div className="w-full bg-[#FAF7FB] text-primaryText min-h-screen">
      {/* Header Banner Katalog: Prolog di Kiri + Gambar Showcase di Kanan */}
      <section className="bg-[#FAF5F8] border-b border-[#EAE3E9] py-10 md:py-14">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-secondaryText mb-6">
            <Link to="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-primaryText font-medium">Katalog Produk</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 lg:gap-12">
            {/* Bagian Kiri: Prolog dan Judul */}
            <div className="flex-1 max-w-2xl">
              <span className="text-[11px] uppercase font-roboto tracking-[0.22em] text-secondaryText block mb-2 font-medium">
                Our Floral Collections
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[44px] font-medium text-primaryText tracking-tight leading-[1.15] mb-3">
                Katalog Rangkaian Bunga
              </h1>
              <p className="text-sm text-secondaryText leading-relaxed font-sans max-w-lg">
                Handcrafted bouquets, plants, and bespoke floral arrangements for every special occasion.
                Dirangkai dengan penuh cinta dan ketelitian oleh florist artisan Cilacap untuk menyempurnakan setiap momen berharga Anda.
              </p>

              {/* Kotak Pencarian Terpadu di Header */}
              <form onSubmit={handleSearchSubmit} className="mt-6 max-w-md relative flex items-center">
                <input
                  type="text"
                  placeholder="Cari buket (mawar, tulip, wisuda)..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-white border border-[#EAE3E9] rounded-full py-2.5 pl-10 pr-10 text-xs sm:text-sm text-primaryText placeholder-secondaryText outline-none focus:border-primary transition-all shadow-xs font-roboto"
                />
                <Search size={16} className="absolute left-3.5 text-secondaryText" />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      const next = new URLSearchParams(searchParams);
                      next.delete('q');
                      setSearchParams(next);
                      setCurrentPage(1);
                    }}
                    className="absolute right-3.5 text-secondaryText hover:text-primary"
                    aria-label="Hapus pencarian"
                  >
                    <X size={15} />
                  </button>
                )}
              </form>
            </div>

            {/* Bagian Kanan: Foto Presentasi Buket Autentik */}
            <div className="w-full md:w-[380px] lg:w-[440px] aspect-[16/11] rounded-2xl md:rounded-3xl overflow-hidden shadow-xs border-4 border-white bg-white shrink-0">
              <img
                src="/mix flower.jpg"
                alt="Presentasi Rangkaian Bunga FloverArts"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Sidebar Filter 3 Grup (Kiri) + Produk & Pagination (Tengah/Kanan) */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Sidebar Navigasi Kategori (Kiri): 3 Grup Terstruktur */}
          <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-28">
            <div className="space-y-6 lg:space-y-7 pr-0 lg:pr-2">
              {/* Grup 1: KOLEKSI BUNGA */}
              <div>
                <h3 className="text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-secondaryText mb-3">
                  Koleksi Bunga
                </h3>
                <ul className="flex lg:flex-col gap-3.5 lg:gap-2.5 text-xs sm:text-[13px] font-sans overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar border-b lg:border-b-0 border-[#EAE3E9]">
                  {FLOWER_COLLECTIONS.map((item) => {
                    const isSelected =
                      item.id === ''
                        ? !activeCategory && !activeType && !activeOccasion && !searchQuery
                        : activeCategory === item.id;
                    return (
                      <li key={item.id || 'all'}>
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(item.id)}
                          className={`whitespace-nowrap text-left transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs ${
                            isSelected
                              ? 'font-semibold text-primary'
                              : 'text-secondaryText hover:text-primaryText'
                          }`}
                        >
                          {isSelected && <span className="text-primary font-bold">•</span>}
                          <span>{item.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Grup 2: PRODUK (Terbaru, Hampers, Bloom Box, dll) */}
              <div>
                <h3 className="text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-secondaryText mb-3">
                  Produk
                </h3>
                <ul className="flex sm:flex-wrap lg:flex-col gap-2.5 text-xs sm:text-[13px] font-sans">
                  {PRODUCT_TYPES.map((type) => {
                    const isSelected = activeType === type.id;
                    return (
                      <li key={type.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectType(type.id)}
                          className={`whitespace-nowrap text-left transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs ${
                            isSelected
                              ? 'font-semibold text-primary'
                              : 'text-secondaryText hover:text-primaryText'
                          }`}
                        >
                          {isSelected && <span className="text-primary font-bold">•</span>}
                          <span>{type.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Grup 3: MOMEN & ACARA */}
              <div>
                <h3 className="text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-secondaryText mb-3">
                  Momen & Acara
                </h3>
                <ul className="flex sm:flex-wrap lg:flex-col gap-2.5 text-xs sm:text-[13px] font-sans">
                  {OCCASIONS.map((occ) => {
                    const isSelected = activeOccasion.toLowerCase() === occ.id.toLowerCase();
                    return (
                      <li key={occ.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectOccasion(occ.id)}
                          className={`whitespace-nowrap text-left transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs ${
                            isSelected
                              ? 'font-semibold text-primary'
                              : 'text-secondaryText hover:text-primaryText'
                          }`}
                        >
                          {isSelected && <span className="text-primary font-bold">•</span>}
                          <span>{occ.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Tombol Reset Filter jika ada filter aktif */}
              {hasFilter && (
                <div className="pt-2 border-t border-[#EAE3E9]">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primaryText transition-colors font-medium"
                  >
                    <RotateCcw size={12} />
                    <span>Reset Semua Filter</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Kolom Tengah/Kanan: Toolbar + Chips Filter Aktif + Grid Produk + Paginasi */}
          <main className="flex-1 min-w-0 w-full">
            {/* Toolbar Ringkas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#EAE3E9]">
              <div className="text-xs text-secondaryText font-sans">
                {isProductsLoading ? (
                  <span className="inline-flex items-center gap-2 font-medium text-primary animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    Memuat rangkaian bunga pilihan...
                  </span>
                ) : totalItems > 0 ? (
                  <span>
                    Menampilkan{' '}
                    <strong className="text-primaryText font-semibold">
                      {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems)}
                    </strong>{' '}
                    dari <strong className="text-primaryText font-semibold">{totalItems}</strong> rangkaian bunga
                  </span>
                ) : (
                  <span>0 rangkaian bunga ditemukan</span>
                )}
              </div>

              {/* Urutan Dropdown */}
              <div className="flex items-center gap-2 text-xs shrink-0">
                <label htmlFor="catalog-sort" className="text-secondaryText font-medium">
                  Urutan:
                </label>
                <select
                  id="catalog-sort"
                  value={currentSort}
                  onChange={handleSortChange}
                  className="bg-transparent text-xs font-semibold text-primary outline-none cursor-pointer pr-1 font-roboto border-b border-transparent hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                >
                  <option value="">Terbaru</option>
                  <option value="price_asc">Harga: Rendah ke Tinggi</option>
                  <option value="price_desc">Harga: Tinggi ke Rendah</option>
                </select>
              </div>
            </div>

            {/* Chips Filter Aktif (UX Feedback Langsung & Mudah Dibatalkan) */}
            {hasFilter && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[11px] uppercase tracking-wider text-secondaryText font-medium mr-1 font-sans">
                  Filter Aktif:
                </span>
                {activeCategory && (
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(activeCategory)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE3E9] text-xs text-primary font-medium hover:border-primary transition-colors shadow-2xs"
                    title="Hapus filter kategori"
                  >
                    <span>{activeCategoryName || activeCategory}</span>
                    <X size={12} />
                  </button>
                )}
                {activeType && (
                  <button
                    type="button"
                    onClick={() => handleSelectType(activeType)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE3E9] text-xs text-primary font-medium hover:border-primary transition-colors shadow-2xs"
                    title="Hapus filter tipe produk"
                  >
                    <span>{activeTypeName || activeType}</span>
                    <X size={12} />
                  </button>
                )}
                {activeOccasion && (
                  <button
                    type="button"
                    onClick={() => handleSelectOccasion(activeOccasion)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE3E9] text-xs text-primary font-medium hover:border-primary transition-colors shadow-2xs"
                    title="Hapus filter momen"
                  >
                    <span>Momen: {activeOccasionName || activeOccasion}</span>
                    <X size={12} />
                  </button>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      const next = new URLSearchParams(searchParams);
                      next.delete('q');
                      setSearchParams(next);
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE3E9] text-xs text-primary font-medium hover:border-primary transition-colors shadow-2xs"
                    title="Hapus kata kunci pencarian"
                  >
                    <span>Kata kunci: "{searchQuery}"</span>
                    <X size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-secondaryText hover:text-primary underline ml-1.5 transition-colors font-medium"
                >
                  Hapus Semua
                </button>
              </div>
            )}

            {/* Product Grid (3 Kolom pada Desktop dengan Animasi Stagger Anime.js) */}
            <ProductGrid
              products={paginatedProducts}
              isLoading={isProductsLoading && allProducts.length === 0}
              isError={isProductsError && allProducts.length === 0 && !hasFilter}
              error={productsError}
              onRetry={refetchProducts}
              onReset={handleClearFilters}
              skeletonCount={6}
              className="lg:grid-cols-3"
            />

            {/* Navigasi Paginasi (Next 1 2 3 >) */}
            {totalPages >= 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12 pt-6 border-t border-[#EAE3E9]">
                {/* Tombol Previous (<) */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  aria-label="Halaman Sebelumnya"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-secondaryText hover:text-primaryText hover:bg-white border border-[#EAE3E9] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Nomor Halaman: 1, 2, 3 */}
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-roboto font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-secondaryText hover:text-primaryText hover:bg-white border border-transparent hover:border-[#EAE3E9]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Tombol Next (>) */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Halaman Berikutnya"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-secondaryText hover:text-primaryText hover:bg-white border border-[#EAE3E9] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Section Di Atas Footer: Galeri Karya Lainnya & Instagram Florist */}
        <section className="mt-20 pt-12 border-t border-[#EAE3E9]">
          <div className="text-center mb-8">
            <span className="text-[11px] font-heading font-semibold uppercase tracking-[0.24em] text-secondaryText block mb-1">
              INSTAGRAM
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-medium text-primaryText">
              @floverarts_
            </h2>
            <p className="text-xs sm:text-sm text-secondaryText mt-1.5 font-sans">
              Intip inspirasi karya rangkaian bunga harian dan momen berharga pelanggan kami.
            </p>
          </div>

          {/* Galeri 5 Foto Autentik Rangkaian Lainnya */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {OTHER_GALLERY_IMAGES.map((item, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden bg-white shadow-xs border-2 border-white hover:scale-102 transition-transform duration-300"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                  <span className="text-white text-xs font-medium font-sans drop-shadow-xs">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter (Seamless Tanpa Card Box / Tanpa Border & Background) */}
          <div className="pt-10 pb-4 text-center max-w-2xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-secondaryText font-semibold block mb-2 font-heading">
              KABAR & PENAWARAN SPESIAL
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-medium text-primaryText mb-2.5">
              Dapatkan Informasi Koleksi Bunga Terbaru
            </h3>
            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed mb-6 font-sans max-w-lg mx-auto">
              Jadilah yang pertama mengetahui rangkaian musiman, promo hari spesial, dan inspirasi buket terkini.
            </p>

            {newsletterSubscribed ? (
              <div className="p-3 text-xs text-primary font-medium">
                Terima kasih! Anda telah terdaftar untuk menerima pembaruan koleksi kami.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Masukkan alamat email Anda..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white border border-[#EAE3E9] rounded-full py-2.5 px-4 text-xs text-primaryText placeholder-secondaryText outline-none focus:border-primary transition-all font-roboto shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs"
                >
                  Langganan
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CatalogPage;
