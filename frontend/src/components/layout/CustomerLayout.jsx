import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../../features/cart/components/CartDrawer';

export function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-bgPage text-primaryText">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default CustomerLayout;
