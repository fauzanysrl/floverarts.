import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatIDR } from '../../../lib/formatters';

export function CartDrawer() {
  const {
    items,
    totalItems,
    totalAmount,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCart();

  const navigate = useNavigate();

  // Tutup drawer saat menekan tombol ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    closeCart();
    const katalogSection = document.getElementById('katalog');
    if (katalogSection) {
      katalogSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#katalog');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop Netral Bersih Tanpa Animasi Warna */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Kanan (Responsif Mobile & Desktop) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-full sm:max-w-md bg-white flex flex-col shadow-2xl border-l border-borderNeutral">
          {/* Header Drawer */}
          <div className="px-5 py-4 border-b border-borderNeutral flex items-center justify-between bg-white">
            <h2
              id="cart-drawer-title"
              className="font-heading text-base font-semibold text-primaryText"
            >
              {totalItems} Produk di Keranjang
            </h2>

            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-md text-secondaryText hover:text-primaryText hover:bg-bgSecondary transition-colors"
              aria-label="Tutup keranjang"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: Daftar Item / Empty State */}
          <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-4">
                  <ShoppingBag size={28} className="stroke-[1.5]" />
                </div>
                <h3 className="font-heading text-xl font-medium text-gray-900 mb-2">
                  Keranjang Masih Kosong
                </h3>
                <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
                  Belum ada buket bunga yang ditambahkan. Pilih rangkaian favorit Anda atau racik custom bouquet spesial.
                </p>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span>Mulai Belanja</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-5 pt-1">
                {items.map((item) => {
                  const isCustom = item.item_type === 'custom';
                  const itemImg = item.image_url || (isCustom ? '/custom-bouquet-satin.png' : '/hero-giant-bouquet.png');

                  return (
                    <div
                      key={item.id}
                      className="pt-5 first:pt-0 flex gap-4 items-start"
                    >
                      {/* Thumbnail Item Besar & Bersih */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/hero-giant-bouquet.png';
                          }}
                        />
                      </div>

                      {/* Detail Item & Kontrol Persis All Natural */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 pr-2">
                            <h4 className="font-heading text-sm font-medium text-gray-900 truncate">
                              {item.slug ? (
                                <Link
                                  to={`/produk/${item.slug}`}
                                  onClick={closeCart}
                                  className="hover:underline transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ) : (
                                item.name
                              )}
                            </h4>
                            <p className="font-sans text-xs text-gray-500 mt-0.5">
                              {item.custom_details?.arrangement_size
                                ? `Size: ${item.custom_details.arrangement_size}`
                                : isCustom
                                ? 'Custom Bouquet'
                                : 'Standard Bouquet'}
                            </p>
                          </div>

                          {/* Harga Satuan di Kanan Atas */}
                          <span className="font-roboto font-medium text-sm text-gray-900 shrink-0">
                            {formatIDR(item.unit_price)}
                          </span>
                        </div>

                        {/* Baris Bawah: Stepper Kuantitas Kiri & Tombol Hapus Kanan */}
                        <div className="flex items-center justify-between mt-3">
                          {/* Stepper Kuantitas Sesuai All Natural */}
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                              aria-label="Kurangi kuantitas"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-7 text-center text-xs font-roboto font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={(item.max_stock && item.quantity >= item.max_stock) || isLoading}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                              aria-label="Tambah kuantitas"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Tombol Hapus '×' di Kanan Bawah */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                            aria-label={`Hapus ${item.name} dari keranjang`}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Drawer Sesuai All Natural: Subtotal, Black Button Checkout, & Payment Logos */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-white flex flex-col gap-4 font-sans">
              {/* Ringkasan Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Subtotal</span>
                <span className="font-roboto text-xl font-bold text-gray-900">
                  {formatIDR(totalAmount)}
                </span>
              </div>

              {/* Tombol Solid Checkout */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3 px-5 rounded-md bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-hover active:scale-98 transition-all flex items-center justify-center gap-2"
                id="btn-cart-checkout"
              >
                <span>Bayar Sekarang</span>
                <ArrowRight size={15} />
              </button>

              {/* Logo Metode Pembayaran */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-gray-400">
                <ShieldCheck size={13} className="text-gray-500" />
                <span>Pembayaran Aman: QRIS, Transfer Bank, E-Wallet</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
