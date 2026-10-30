import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '../features/home/pages/HomePage';

beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = MockIntersectionObserver;

  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  };
});

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('HomePage Component', () => {
  it('harus render seluruh section utama tanpa error', () => {
    renderHomePage();

    // 1. Hero headline tampil
    expect(screen.getByText(/Flowers Made/i)).toBeInTheDocument();

    // 2. Featured Bouquets heading tampil
    expect(screen.getByText(/You'll Love/i)).toBeInTheDocument();

    // 3. Best-Selling Bouquets section tampil
    expect(screen.getByText('Best-Selling Bouquets')).toBeInTheDocument();

    // 4. Bouquet Gallery heading tampil
    expect(screen.getByText('Bouquet Gallery')).toBeInTheDocument();

    // 5. Custom Bouquet section headline tampil
    expect(screen.getByText('Made Especially for You')).toBeInTheDocument();

    // 6. Occasions heading tampil
    expect(screen.getByText('Flowers for Every Moment')).toBeInTheDocument();

    // 7. Our Promise heading tampil
    expect(screen.getByText('Our Promise')).toBeInTheDocument();

    // 8. How It Works heading tampil
    expect(screen.getByText('Ordering Is Simple')).toBeInTheDocument();

    // 9. Testimonials heading tampil
    expect(screen.getByText('Customer Testimonials')).toBeInTheDocument();

    // 10. FAQ heading tampil
    expect(screen.getByText('Pertanyaan yang Sering Diajukan')).toBeInTheDocument();

    // 11. Final CTA heading tampil
    expect(screen.getByText(/Find The Perfect/i)).toBeInTheDocument();
  });
});
