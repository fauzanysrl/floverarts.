import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authApi from '../../../api/endpoints/auth';
import { STORAGE_KEYS } from '../../../lib/constants';
import '../styles/login.css';

// Bilingual translations for register page
const translations = {
  ID: {
    brandName: 'floverarts_',
    welcomeTitle: 'Buat Akun Baru',
    welcomeSubtitle: 'Bergabunglah bersama floverarts_ untuk menikmati kemudahan pemesanan, kustomisasi buket, dan pelacakan pesanan.',
    nameLabel: 'Nama Lengkap',
    namePlaceholder: 'cth. Annisa Larasati',
    emailLabel: 'Alamat Email',
    emailPlaceholder: 'nama@gmail.com',
    passwordLabel: 'Kata Sandi',
    passwordPlaceholder: 'Minimal 6 karakter',
    phoneLabel: 'Nomor WhatsApp / Telepon (Opsional)',
    phonePlaceholder: '081234567890',
    addressLabel: 'Alamat Pengiriman (Opsional)',
    addressPlaceholder: 'Alamat lengkap pengiriman bunga',
    submitBtn: 'Daftar Sekarang',
    submittingBtn: 'Mendaftarkan Akun...',
    hasAccount: 'Sudah punya akun?',
    loginLink: 'Masuk di sini',
    copyright: '© 2026 floverarts_ . All rights reserved.',
    errorEmptyName: 'Silakan masukkan nama lengkap Anda.',
    errorEmptyEmail: 'Silakan masukkan alamat email Anda.',
    errorInvalidEmail: 'Format alamat email tidak valid.',
    errorShortPassword: 'Kata sandi minimal terdiri dari 6 karakter.',
    errorDefault: 'Pendaftaran gagal. Silakan periksa kembali data Anda.',
    successDefault: 'Akun berhasil dibuat! Mengalihkan ke beranda...',
    alertErrorTitle: 'Gagal Mendaftar',
    alertSuccessTitle: 'Berhasil!',
    heroBadge: 'Exclusive Artisan Bouquet',
  },
  EN: {
    brandName: 'floverarts_',
    welcomeTitle: 'Create an Account',
    welcomeSubtitle: 'Join floverarts_ to enjoy seamless bouquet ordering, customization, and real-time order tracking.',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. Annisa Larasati',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    phoneLabel: 'Phone / WhatsApp Number (Optional)',
    phonePlaceholder: '081234567890',
    addressLabel: 'Delivery Address (Optional)',
    addressPlaceholder: 'Default flower delivery address',
    submitBtn: 'Sign Up Now',
    submittingBtn: 'Creating Account...',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign in here',
    copyright: '© 2026 floverarts_ . All rights reserved.',
    errorEmptyName: 'Please enter your full name.',
    errorEmptyEmail: 'Please enter your email address.',
    errorInvalidEmail: 'Please enter a valid email address.',
    errorShortPassword: 'Password must be at least 6 characters.',
    errorDefault: 'Registration failed. Please check your information.',
    successDefault: 'Account created successfully! Redirecting...',
    alertErrorTitle: 'Registration Failed',
    alertSuccessTitle: 'Success!',
    heroBadge: 'Exclusive Artisan Bouquet',
  },
};

export function RegisterForm() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Jika sudah terautentikasi, otomatis redirect ke target / Beranda
  useEffect(() => {
    if (user) {
      const returnTo = location.state?.from?.pathname || (user.role === 'owner_admin' ? '/admin' : '/');
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, location]);

  // Language state
  const [lang, setLang] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'ID';
  });
  const [langOpen, setLangOpen] = useState(false);

  const t = translations[lang] || translations.ID;

  const handleSelectLanguage = (selectedLang) => {
    setLang(selectedLang);
    sessionStorage.setItem(STORAGE_KEYS.LANGUAGE, selectedLang);
    setLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langOpen && !e.target.closest('.lang-selector-container')) {
        setLangOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [langOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password;

    if (!cleanName) {
      setErrorMsg(t.errorEmptyName);
      return;
    }
    if (!cleanEmail) {
      setErrorMsg(t.errorEmptyEmail);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErrorMsg(t.errorInvalidEmail);
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMsg(t.errorShortPassword);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      const response = await authApi.register(payload);

      // Otomatis login dengan payload respon registrasi
      login(response);
      setSuccessMsg(response.message || t.successDefault);

      // Redirect ke beranda atau target sebelumnya
      const targetUser = response.data?.user || response.user;
      const targetPath = location.state?.from?.pathname || (targetUser?.role === 'owner_admin' ? '/admin' : '/');
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || t.errorDefault);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-wrapper">
      <div className="login-card">
        {/* ================================================================
            LEFT PANE: Form & Registrasi
            ================================================================ */}
        <section className="login-pane">
          <div className="pane-inner-top">
            {/* Top Brand & Language Bar */}
            <div className="brand-header">
              <Link to="/" className="brand-badge" title="floverarts_ Official">
                <img
                  src="/logo.png"
                  alt="floverarts_"
                  className="w-7 h-7 rounded-lg object-cover shadow-xs"
                />
                <span className="brand-title">floverarts_</span>
              </Link>

              {/* Language Selector Dropdown */}
              <div className="lang-selector-container">
                <button
                  type="button"
                  className="lang-toggle-btn"
                  onClick={() => setLangOpen(!langOpen)}
                  aria-label="Pilih Bahasa"
                  aria-expanded={langOpen}
                >
                  <span className="flag-icon">{lang === 'ID' ? '🇮🇩' : '🇬🇧'}</span>
                  <span className="lang-code">{lang}</span>
                  <ChevronDown
                    size={13}
                    className={`lang-chevron ${langOpen ? 'rotate' : ''}`}
                  />
                </button>

                {langOpen && (
                  <div className="lang-dropdown">
                    <button
                      type="button"
                      className={`lang-option ${lang === 'ID' ? 'active' : ''}`}
                      onClick={() => handleSelectLanguage('ID')}
                    >
                      <span>🇮🇩 Bahasa Indonesia</span>
                      {lang === 'ID' && <Check size={14} className="check-icon" />}
                    </button>
                    <button
                      type="button"
                      className={`lang-option ${lang === 'EN' ? 'active' : ''}`}
                      onClick={() => handleSelectLanguage('EN')}
                    >
                      <span>🇬🇧 English</span>
                      {lang === 'EN' && <Check size={14} className="check-icon" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title Section */}
            <header className="login-title-section">
              <h1 className="welcome-title">{t.welcomeTitle}</h1>
              <p className="welcome-subtitle">{t.welcomeSubtitle}</p>
            </header>

            {/* Error / Success Alerts */}
            {errorMsg && (
              <div className="alert-banner error" role="alert">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="alert-content">
                  <strong>{t.alertErrorTitle}</strong>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="alert-banner success" role="status">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div className="alert-content">
                  <strong>{t.alertSuccessTitle}</strong>
                  <span>{successMsg}</span>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {/* Full Name Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">
                  {t.nameLabel} <span className="text-red-500">*</span>
                </label>
                <div className="input-container">
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t.namePlaceholder}
                    className="form-input"
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Address Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-email">
                  {t.emailLabel} <span className="text-red-500">*</span>
                </label>
                <div className="input-container">
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.emailPlaceholder}
                    className="form-input"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-password">
                  {t.passwordLabel} <span className="text-red-500">*</span>
                </label>
                <div className="input-container">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t.passwordPlaceholder}
                    className="form-input"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Phone Field (Optional) */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-phone">
                  {t.phoneLabel}
                </label>
                <div className="input-container">
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.phonePlaceholder}
                    className="form-input"
                    disabled={isSubmitting}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Address Field (Optional) */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-address">
                  {t.addressLabel}
                </label>
                <div className="input-container">
                  <textarea
                    id="register-address"
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t.addressPlaceholder}
                    className="form-input resize-none"
                    disabled={isSubmitting}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-submit mt-2"
                disabled={isSubmitting}
                id="btn-register-submit"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    <span>{t.submittingBtn}</span>
                  </>
                ) : (
                  <span>{t.submitBtn}</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <footer className="card-footer mt-4">
            <p className="register-prompt">
              {t.hasAccount}{' '}
              <Link to="/masuk" className="register-link">
                {t.loginLink}
              </Link>
            </p>
            <p className="copyright-text">{t.copyright}</p>
          </footer>
        </section>

        {/* ================================================================
            RIGHT PANE: Visual Showcase Banner (Foto Login Bouquet)
            ================================================================ */}
        <aside className="visual-pane" aria-label="FloverArts Featured Bouquet">
          <img
            src="/foto-login.png"
            alt="Round Bouquet Satin FloverArts"
            className="visual-image"
          />
          <div className="visual-soft-vignette" />
          <div className="visual-floating-badge">
            <Sparkles size={13} className="badge-sparkle-icon" />
            <span>{t.heroBadge}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default RegisterForm;

