import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        if (error?.status >= 400 && error?.status < 500) return false;
        return true;
      },
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default queryClient;
