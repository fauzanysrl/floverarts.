import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Package,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCart } from '../../features/cart/hooks/useCart';
import { ROLES, ROLE_LABELS } from '../../lib/constants';

export function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/?q=${encodeURIComponent(query)}#katalog`);
    } else {
      navigate('/#katalog');
    }
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src="/logo.png"
            alt="floverarts_"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-heading text-xl font-bold tracking-tight text-primaryText">
            floverarts_
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) - Consistent Font Weights */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-secondaryText">
          <Link
            to="/"
            className={`transition-colors py-1 ${
              location.pathname === '/' && !location.hash
                ? 'text-primary font-semibold'
                : 'text-secondaryText font-medium hover:text-primary'
            }`}
          >
            Beranda
          </Link>
          <Link
            to="/produk"
            className={`transition-colors py-1 ${
              location.pathname === '/produk' || location.pathname === '/katalog' || location.hash === '#katalog'
                ? 'text-primary font-semibold'
                : 'text-secondaryText font-medium hover:text-primary'
            }`}
          >
            Katalog Bunga
          </Link>
          <Link
            to="/buket-custom"
            className={`transition-colors py-1 ${
              location.pathname === '/buket-custom'
                ? 'text-primary font-semibold'
                : 'text-secondaryText font-medium hover:text-primary'
            }`}
          >
            Custom Bouquet
          </Link>
          <Link
            to="/about"
            className={`transition-colors py-1 ${
              location.pathname === '/about' || location.pathname === '/tentang-kami' || location.hash === '#tentang-kami'
                ? 'text-primary font-semibold'
                : 'text-secondaryText font-medium hover:text-primary'
            }`}
          >
            Tentang Kami
          </Link>
          {user?.role === ROLES.OWNER_ADMIN && (
            <Link
              to="/admin"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-primary text-white font-semibold'
                  : 'text-primary bg-softLavender font-medium hover:bg-accentLavender/50'
              }`}
            >
              <ShieldAlert size={14} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Action Icons (Search, Cart, User) */}
        <div className="flex items-center gap-3">
          {/* Search Toggle Icon Button (Clean & Collision-Free) */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Pencarian"
            className={`p-2 rounded-full transition-all duration-150 active:scale-95 ${
              searchOpen
                ? 'bg-softLavender text-primary'
                : 'text-secondaryText hover:text-primaryText hover:bg-bgSecondary'
            }`}
          >
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>

          {/* Cart Icon with Counter Badge (Opens Slide-over Drawer) */}
          <button
            type="button"
            onClick={openCart}
            aria-label="Keranjang Belanja"
            className="relative p-2 text-secondaryText hover:text-primaryText hover:bg-bgSecondary active:scale-95 rounded-full transition-all duration-150"
            id="btn-navbar-cart"
          >
            <ShoppingBag size={19} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary text-white text-[10px] font-roboto font-bold rounded-full flex items-center justify-center animate-cart-bounce">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* User Account Icon / Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-bgSecondary transition-colors"
                aria-label="Menu Akun Pelanggan"
              >
                <div className="w-8 h-8 rounded-full bg-softLavender text-primary font-bold text-xs flex items-center justify-center border border-borderNeutral">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User size={15} />}
                </div>
                <ChevronDown size={13} className="text-secondaryText hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-card border border-borderNeutral py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-borderNeutral">
                    <p className="text-xs font-semibold text-primaryText truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-secondaryText truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-softLavender px-2 py-0.5 rounded-xs">
                      {ROLE_LABELS[user.role] || 'Pelanggan'}
                    </span>
                  </div>

                  <Link
                    to="/pesanan"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-primaryText hover:bg-bgSecondary transition-colors"
                  >
                    <Package size={14} className="text-secondaryText" />
                    <span>Pesanan Saya</span>
                  </Link>

                  <Link
                    to="/profil"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-primaryText hover:bg-bgSecondary transition-colors"
                  >
                    <User size={14} className="text-secondaryText" />
                    <span>Profil Akun</span>
                  </Link>

                  {user.role === ROLES.OWNER_ADMIN && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-primary hover:bg-softLavender transition-colors"
                    >
                      <ShieldAlert size={14} />
                      <span>Panel Admin</span>
                    </Link>
                  )}

                  <div className="border-t border-borderNeutral my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-semantic-error hover:bg-semantic-errorBg transition-colors text-left"
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/masuk"
              aria-label="Masuk ke Akun"
              className="p-2 text-secondaryText hover:text-primaryText hover:bg-bgSecondary rounded-sm transition-colors"
              title="Masuk ke Akun"
            >
              <User size={19} />
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-primaryText hover:bg-bgSecondary rounded-sm"
            aria-label="Menu Navigasi Mobile"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer (Collision-Free, directly below header) */}
      {searchOpen && (
        <div className="w-full bg-white/98 backdrop-blur-md shadow-md border-t border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto flex items-center bg-[#FAF7FB] rounded-full px-4 py-2 gap-3 shadow-xs"
          >
            <Search size={16} className="text-secondaryText shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Cari buket bunga (contoh: mawar, wisuda, pastel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchOpen(false);
              }}
              className="w-full text-xs sm:text-sm text-primaryText outline-none bg-transparent placeholder-secondaryText"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-secondaryText hover:text-primaryText p-0.5 rounded-full"
                aria-label="Hapus kata kunci"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary-hover active:scale-95 transition-all shrink-0 shadow-button"
            >
              Cari
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-borderNeutral bg-white px-4 pt-3 pb-6 flex flex-col gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Cari buket bunga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bgSecondary text-primaryText placeholder-secondaryText text-xs px-3.5 py-2.5 pl-9 rounded-sm border border-borderNeutral outline-none"
            />
            <Search size={14} className="absolute left-3 top-3 text-secondaryText" />
          </form>

          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-sm hover:bg-bgSecondary transition-colors ${
                location.pathname === '/' && !location.hash
                  ? 'text-primary font-semibold'
                  : 'text-secondaryText font-medium'
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/produk"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-sm hover:bg-bgSecondary transition-colors ${
                location.pathname === '/produk' || location.pathname === '/katalog' || location.hash === '#katalog'
                  ? 'text-primary font-semibold'
                  : 'text-secondaryText font-medium'
              }`}
            >
              Katalog Bunga
            </Link>
            <Link
              to="/buket-custom"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-sm hover:bg-bgSecondary transition-colors ${
                location.pathname === '/buket-custom'
                  ? 'text-primary font-semibold'
                  : 'text-secondaryText font-medium'
              }`}
            >
              Custom Bouquet
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-sm hover:bg-bgSecondary transition-colors ${
                location.pathname === '/about' || location.pathname === '/tentang-kami' || location.hash === '#tentang-kami'
                  ? 'text-primary font-semibold'
                  : 'text-secondaryText font-medium'
              }`}
            >
              Tentang Kami
            </Link>
            {user ? (
              <>
                <Link
                  to="/pesanan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-sm hover:bg-bgSecondary text-primaryText"
                >
                  Pesanan Saya
                </Link>
                <Link
                  to="/profil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-sm hover:bg-bgSecondary text-primaryText"
                >
                  Profil Akun
                </Link>
                {user.role === ROLES.OWNER_ADMIN && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-sm hover:bg-softLavender text-primary font-medium"
                  >
                    Panel Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-2 rounded-sm text-left text-semantic-error hover:bg-semantic-errorBg"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/masuk"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-sm bg-primary text-white text-center font-medium mt-2"
              >
                Masuk / Daftar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
