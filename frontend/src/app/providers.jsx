import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { CartProvider } from '../features/cart/context/CartContext';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

export function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
