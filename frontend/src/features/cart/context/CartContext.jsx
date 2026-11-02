import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CartContext } from './CartContextInstance';
import { useAuth } from '../../auth/hooks/useAuth';
import cartApi from '../../../api/endpoints/cart';
import { STORAGE_KEYS } from '../../../lib/constants';
import { logger } from '../../../lib/logger';

function getInitialGuestCart() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.GUEST_CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(getInitialGuestCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const isCustomer = user?.role === 'customer';

  // Sinkronisasi dan pemuatan data keranjang
  const refreshCart = useCallback(async () => {
    if (!isCustomer) {
      setItems(getInitialGuestCart());
      return;
    }

    setIsLoading(true);
    setCartError(null);
    try {
      const res = await cartApi.getCart();
      const cartData = res.data || res;
      setItems(cartData.items || []);
    } catch (err) {
      logger.error('Gagal memuat keranjang belanja dari server', err);
      setCartError(err.message || 'Gagal memuat keranjang belanja.');
    } finally {
      setIsLoading(false);
    }
  }, [isCustomer]);

  // Muat ulang keranjang saat status autentikasi berubah
  useEffect(() => {
    let isMounted = true;

    async function initializeCart() {
      if (!isCustomer) {
        const guestItems = getInitialGuestCart();
        if (isMounted) setItems(guestItems);
        return;
      }

      setIsLoading(true);
      setCartError(null);
      try {
        // Cek apakah ada keranjang guest untuk disinkronkan ke backend
        const guestItems = getInitialGuestCart();
        if (guestItems.length > 0) {
          logger.info(`Sinkronisasi ${guestItems.length} item guest ke keranjang pelanggan...`);
          for (const gItem of guestItems) {
            try {
              await cartApi.addItem({
                item_type: gItem.item_type || 'standard',
                product_id: gItem.product_id,
                quantity: gItem.quantity,
                custom_details: gItem.custom_details,
              });
            } catch (err) {
              logger.warn('Gagal sinkronisasi salah satu item guest ke server', err);
            }
          }
          sessionStorage.removeItem(STORAGE_KEYS.GUEST_CART);
        }

        const res = await cartApi.getCart();
        if (isMounted) {
          const cartData = res.data || res;
          setItems(cartData.items || []);
        }
      } catch (err) {
        if (isMounted) {
          logger.error('Gagal memuat keranjang belanja dari server', err);
          setCartError(err.message || 'Gagal memuat keranjang belanja.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeCart();

    return () => {
      isMounted = false;
    };
  }, [isCustomer]);

  // Simpan keranjang guest ke sessionStorage jika status guest berubah
  useEffect(() => {
    if (!isCustomer) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(items));
      } catch (err) {
        logger.warn('Gagal menyimpan keranjang guest ke sessionStorage', err);
      }
    }
  }, [items, isCustomer]);

  // Drawer Controls
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Tambah Item ke Keranjang
  const addItem = useCallback(
    async (itemData, options = { openDrawer: true }) => {
      const {
        product_id,
        quantity = 1,
        item_type = 'standard',
        custom_details,
        name,
        price,
        image_url,
        stock = 99,
        slug,
      } = itemData;

      const shouldOpenDrawer = options?.openDrawer !== false;
      const qty = Math.max(1, parseInt(quantity, 10) || 1);

      if (isCustomer) {
        setIsLoading(true);
        try {
          await cartApi.addItem({
            item_type,
            product_id: item_type === 'standard' ? product_id : undefined,
            quantity: qty,
            custom_details: item_type === 'custom' ? custom_details : undefined,
          });
          await refreshCart();
          if (shouldOpenDrawer) {
            setIsOpen(true);
          }
          return { success: true };
        } catch (err) {
          logger.error('Gagal menambahkan item ke keranjang server', err);
          throw err;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Logika Guest Cart
        setItems((prevItems) => {
          let updated = [...prevItems];
          if (item_type === 'standard' && product_id) {
            const existingIdx = updated.findIndex(
              (it) => it.item_type === 'standard' && it.product_id === product_id
            );
            if (existingIdx >= 0) {
              const currentQty = updated[existingIdx].quantity;
              const newQty = Math.min(currentQty + qty, stock);
              updated[existingIdx] = {
                ...updated[existingIdx],
                quantity: newQty,
                subtotal: (updated[existingIdx].unit_price || price) * newQty,
              };
            } else {
              const unitPrice = parseFloat(price || 0);
              updated.unshift({
                id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                item_type: 'standard',
                product_id,
                name: name || 'Buket Bunga',
                slug: slug || '',
                image_url: image_url || '/public/hero-giant-bouquet.png',
                unit_price: unitPrice,
                quantity: qty,
                subtotal: unitPrice * qty,
                max_stock: stock,
                is_available: true,
              });
            }
          } else {
            // Custom item
            const unitPrice = parseFloat(
              custom_details?.calculated_total_price || price || 0
            );
            updated.unshift({
              id: `guest-custom-${Date.now()}`,
              item_type: 'custom',
              product_id: null,
              name: custom_details?.title || name || 'Custom Bouquet Spesial',
              slug: null,
              image_url: image_url || '/public/custom-bouquet-satin.png',
              unit_price: unitPrice,
              quantity: qty,
              subtotal: unitPrice * qty,
              max_stock: 99,
              is_available: true,
              custom_details,
            });
          }
          return updated;
        });
        if (shouldOpenDrawer) {
          setIsOpen(true);
        }
        return { success: true };
      }
    },
    [isCustomer, refreshCart]
  );

  // Perbarui Kuantitas Item
  const updateQuantity = useCallback(
    async (itemId, newQuantity) => {
      const qty = parseInt(newQuantity, 10);
      if (isNaN(qty) || qty < 1) return;

      if (isCustomer) {
        setIsLoading(true);
        try {
          await cartApi.updateQuantity(itemId, qty);
          await refreshCart();
        } catch (err) {
          logger.error(`Gagal mengubah kuantitas item ${itemId}`, err);
          throw err;
        } finally {
          setIsLoading(false);
        }
      } else {
        setItems((prevItems) =>
          prevItems.map((it) => {
            if (it.id === itemId) {
              const safeQty = Math.min(qty, it.max_stock || 999);
              return {
                ...it,
                quantity: safeQty,
                subtotal: (it.unit_price || 0) * safeQty,
              };
            }
            return it;
          })
        );
      }
    },
    [isCustomer, refreshCart]
  );

  // Hapus Item dari Keranjang
  const removeItem = useCallback(
    async (itemId) => {
      if (isCustomer) {
        setIsLoading(true);
        try {
          await cartApi.removeItem(itemId);
          await refreshCart();
        } catch (err) {
          logger.error(`Gagal menghapus item ${itemId}`, err);
          throw err;
        } finally {
          setIsLoading(false);
        }
      } else {
        setItems((prevItems) => prevItems.filter((it) => it.id !== itemId));
      }
    },
    [isCustomer, refreshCart]
  );

  // Kosongkan Seluruh Keranjang
  const clearCart = useCallback(async () => {
    if (isCustomer) {
      setIsLoading(true);
      try {
        await cartApi.clearCart();
        setItems([]);
      } catch (err) {
        logger.error('Gagal mengosongkan keranjang belanja', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems([]);
      sessionStorage.removeItem(STORAGE_KEYS.GUEST_CART);
    }
  }, [isCustomer]);

  // Perhitungan Ringkasan Total
  const { totalItems, totalAmount } = useMemo(() => {
    let count = 0;
    let amount = 0;
    items.forEach((it) => {
      const q = it.quantity || 1;
      const price = it.unit_price || 0;
      count += q;
      amount += it.subtotal ? it.subtotal : price * q;
    });
    return { totalItems: count, totalAmount: amount };
  }, [items]);

  const value = {
    items,
    totalItems,
    totalAmount,
    isOpen,
    isLoading,
    cartError,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
