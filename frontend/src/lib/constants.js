/**
 * Konstanta Global FloverArts_
 * Berisi pemetaan status pesanan, role sistem, dan konfigurasi umum.
 */

// Peran Pengguna (2 Role terverifikasi dari Backend)
export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  OWNER_ADMIN: 'owner_admin',
});

// Istilah UI Peran Resmi (Bahasa Indonesia Konsisten)
export const ROLE_LABELS = Object.freeze({
  [ROLES.CUSTOMER]: 'Pelanggan',
  [ROLES.OWNER_ADMIN]: 'Admin / Pemilik Toko',
});

// 6 Status Baku Pesanan (SRS & PROJECT_PLAN)
export const ORDER_STATUS = Object.freeze({
  MENUNGGU_PEMBAYARAN: 'menunggu_pembayaran',
  DIKONFIRMASI: 'dikonfirmasi',
  DIPROSES: 'diproses',
  SIAP_DIAMBIL_DIKIRIM: 'siap_diambil_dikirim',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
});

// Pemetaan Status Pesanan ke Label UI Resmi
export const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS.MENUNGGU_PEMBAYARAN]: 'Menunggu Pembayaran',
  [ORDER_STATUS.DIKONFIRMASI]: 'Pembayaran Dikonfirmasi',
  [ORDER_STATUS.DIPROSES]: 'Diproses',
  [ORDER_STATUS.SIAP_DIAMBIL_DIKIRIM]: 'Siap Diambil/Dikirim',
  [ORDER_STATUS.SELESAI]: 'Selesai',
  [ORDER_STATUS.DIBATALKAN]: 'Dibatalkan',
});

// Warna Badge Status Pesanan (Tailwind class tokens)
export const ORDER_STATUS_BADGE_CLASSES = Object.freeze({
  [ORDER_STATUS.MENUNGGU_PEMBAYARAN]: 'bg-amber-100 text-amber-800 border-amber-300',
  [ORDER_STATUS.DIKONFIRMASI]: 'bg-blue-100 text-blue-800 border-blue-300',
  [ORDER_STATUS.DIPROSES]: 'bg-purple-100 text-purple-800 border-purple-300',
  [ORDER_STATUS.SIAP_DIAMBIL_DIKIRIM]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  [ORDER_STATUS.SELESAI]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  [ORDER_STATUS.DIBATALKAN]: 'bg-rose-100 text-rose-800 border-rose-300',
});

// Kunci Penyimpanan Sesi (PENTING: Hanya untuk sessionStorage, dilarang di localStorage)
export const STORAGE_KEYS = Object.freeze({
  REFRESH_TOKEN: 'flover_session_rt',
  USER: 'flover_session_user',
  LANGUAGE: 'flover_app_lang',
  GUEST_CART: 'flover_guest_cart',
});

// Helper untuk validasi dan konversi status pesanan ke label UI
export function getOrderStatusLabel(status) {
  if (!status || !ORDER_STATUS_LABELS[status]) {
    return 'Status Tidak Dikenali';
  }
  return ORDER_STATUS_LABELS[status];
}
