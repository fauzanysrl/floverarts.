import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import catalogApi from '../../../api/endpoints/catalog';
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

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', activeCategory, searchQuery],
    queryFn: async () => {
      const params = {};
      if (activeCategory) params.category_id = activeCategory;
      if (searchQuery)    params.search       = searchQuery;
      const res = await catalogApi.getProducts(params);
      return res.data || [];
    },
  });

  const categories = categoriesData || [];
  const products   = (productsData && productsData.length > 0) ? productsData : DEFAULT_FEATURED_PRODUCTS;

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
