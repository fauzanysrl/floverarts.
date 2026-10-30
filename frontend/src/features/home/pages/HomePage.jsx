import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import catalogApi from '../../../api/endpoints/catalog';
import { useProducts } from '../../catalog/hooks/useProducts';
import { DEFAULT_FEATURED_PRODUCTS } from '../constants/homeData';

import HeroSection from '../components/HeroSection';
import FeaturedBouquetSection from '../components/FeaturedBouquetSection';
import BestSellingSection from '../components/BestSellingSection';
import GalleryMarqueeSection from '../components/GalleryMarqueeSection';
import CustomBouquetSection from '../components/CustomBouquetSection';
import OccasionsSection from '../components/OccasionsSection';
import OurPromiseSection from '../components/OurPromiseSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FaqSection from '../components/FaqSection';
import FinalCtaSection from '../components/FinalCtaSection';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat') || '';
  const searchQuery    = searchParams.get('q') || '';

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await catalogApi.getCategories();
      return res.data || [];
    },
  });

  // Parameter pencarian & filter sesuai kontrak backend API: category_id & q
  const productQueryParams = {};
  if (activeCategory) productQueryParams.category_id = activeCategory;
  if (searchQuery)    productQueryParams.q           = searchQuery;

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts(productQueryParams);

  const categories = categoriesData || [];

  // Logika Penanganan Produk:
  // 1. Jika filter atau pencarian aktif: SELALU gunakan data hasil API (jika kosong, tampilkan empty state)
  // 2. Jika tanpa filter dan data API tersedia: tampilkan data API
  // 3. Jika tanpa filter dan data awal belum tersedia (offline / DB belum seeded) serta tidak error: gunakan fallback default
  const hasActiveFilter = Boolean(activeCategory || searchQuery);
  let products = [];
  if (hasActiveFilter) {
    products = productsData || [];
  } else if (productsData && productsData.length > 0) {
    products = productsData;
  } else if (!isProductsLoading && !isProductsError) {
    products = DEFAULT_FEATURED_PRODUCTS;
  }

  const handleSelectCategory = (categoryId) => {
    const newParams = new URLSearchParams(searchParams);
    if (!categoryId) newParams.delete('cat');
    else newParams.set('cat', categoryId);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => setSearchParams({});

  return (
    <div className="w-full bg-bgPage text-primaryText selection:bg-softLavender selection:text-primary">
      <HeroSection />
      <FeaturedBouquetSection />
      <BestSellingSection
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        products={products}
        isProductsLoading={isProductsLoading}
        isProductsError={isProductsError}
        productsError={productsError}
        refetchProducts={refetchProducts}
        onSelectCategory={handleSelectCategory}
        onClearFilters={handleClearFilters}
      />
      <GalleryMarqueeSection />
      <CustomBouquetSection />
      <OccasionsSection />
      <OurPromiseSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}

export default HomePage;

