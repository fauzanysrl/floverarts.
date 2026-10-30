import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../../api/endpoints/catalog';

/**
 * Hook TanStack Query untuk mengambil daftar produk katalog
 * Mengacu pada docs/BACKEND_API_CONTRACT.md dan backend/src/controllers/productController.js
 * 
 * @param {Object} [params={}] - Parameter filter query (category_id, q, sort, page, limit)
 * @param {Object} [options={}] - Opsi TanStack Query tambahan
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useProducts(params = {}, options = {}) {
  // Normalisasi search -> q agar kompatibel dengan backend controller
  const normalizedParams = { ...params };
  if (normalizedParams.search && !normalizedParams.q) {
    normalizedParams.q = normalizedParams.search;
  }

  return useQuery({
    queryKey: ['products', normalizedParams],
    queryFn: async () => {
      const response = await catalogApi.getProducts(normalizedParams);
      // Response envelope backend: { success: true, data: [...], message: '...' }
      if (Array.isArray(response)) {
        return response;
      }
      return response?.data ?? [];
    },
    ...options,
  });
}

export default useProducts;
