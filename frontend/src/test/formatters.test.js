import { describe, it, expect } from 'vitest';
import { formatIDR, formatDateID, formatDateTime } from '../lib/formatters';
import { ORDER_STATUS, getOrderStatusLabel, ROLES, ROLE_LABELS } from '../lib/constants';

describe('Formatters & Constants', () => {
  it('harus memformat nominal angka menjadi format Rupiah Indonesia', () => {
    const formatted = formatIDR(150000);
    expect(formatted).toMatch(/Rp\s*150\.000/);
    expect(formatIDR(0)).toMatch(/Rp\s*0/);
    expect(formatIDR(null)).toBe('Rp 0');
  });

  it('harus memformat tanggal ke format Indonesia', () => {
    const formattedDate = formatDateID('2026-10-28T07:00:00Z');
    expect(formattedDate).toContain('2026');
    expect(formattedDate).toContain('Oktober');

    const formattedWithTime = formatDateID('2026-10-28T07:00:00Z', true);
    expect(formattedWithTime).toContain('WIB');
    expect(formatDateTime('2026-10-28T07:00:00Z')).toContain('WIB');
    expect(formatDateID(null)).toBe('-');
  });

  it('harus memvalidasi 6 status baku pesanan dan label resminya', () => {
    expect(getOrderStatusLabel(ORDER_STATUS.MENUNGGU_PEMBAYARAN)).toBe('Menunggu Pembayaran');
    expect(getOrderStatusLabel(ORDER_STATUS.DIKONFIRMASI)).toBe('Pembayaran Dikonfirmasi');
    expect(getOrderStatusLabel(ORDER_STATUS.DIPROSES)).toBe('Diproses');
    expect(getOrderStatusLabel(ORDER_STATUS.SIAP_DIAMBIL_DIKIRIM)).toBe('Siap Diambil/Dikirim');
    expect(getOrderStatusLabel(ORDER_STATUS.SELESAI)).toBe('Selesai');
    expect(getOrderStatusLabel(ORDER_STATUS.DIBATALKAN)).toBe('Dibatalkan');
    expect(getOrderStatusLabel('status_palsu')).toBe('Status Tidak Dikenali');
  });

  it('harus memiliki pemetaan istilah peran Indonesia resmi', () => {
    expect(ROLE_LABELS[ROLES.CUSTOMER]).toBe('Pelanggan');
    expect(ROLE_LABELS[ROLES.OWNER_ADMIN]).toBe('Admin / Pemilik Toko');
  });
});
