import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppProviders from './app/providers';
import AppRouter from './app/router';
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
}
