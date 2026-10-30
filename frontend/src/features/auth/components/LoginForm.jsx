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

// SVG Icon Google Multicolored
function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Bilingual dictionaries for login page
const translations = {
  ID: {
    brandName: 'floverarts_',
    welcomeTitle: 'Selamat Datang',
    welcomeSubtitle: 'Masuk ke akun floverarts_ untuk melacak pesanan, melihat favorit, dan melanjutkan belanja.',
    emailLabel: 'Alamat Email',
    emailPlaceholder: 'nama@gmail.com',
    passwordLabel: 'Kata Sandi',
    passwordPlaceholder: 'Masukkan kata sandi',
    forgotPassword: 'Lupa kata sandi?',
    submitBtn: 'Masuk',
    submittingBtn: 'Memproses Masuk...',
    dividerText: 'Atau masuk dengan',
    googleBtn: 'Masuk dengan Google',
    noAccount: 'Belum punya akun?',
    registerLink: 'Daftar sekarang',
    copyright: '© 2026 floverarts_ . All rights reserved.',
    errorEmptyEmail: 'Silakan masukkan alamat email Anda.',
    errorEmptyPassword: 'Silakan masukkan kata sandi Anda.',
    errorDefault: 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.',
    successDefault: 'Login berhasil! Mengalihkan ke beranda...',
    alertErrorTitle: 'Gagal Masuk',
    alertSuccessTitle: 'Berhasil!',
    forgotAlertMsg: 'Silakan hubungi customer support atau gunakan nomor WhatsApp FloverArts untuk pemulihan kata sandi.',
    googleAlertMsg: 'Fitur login Google SSO sedang disinkronkan dengan kredensial sistem.',
    heroBadge: 'Exclusive Artisan Bouquet',
  },
  EN: {
    brandName: 'floverarts_',
    welcomeTitle: 'Welcome Back',
    welcomeSubtitle: 'Sign in to floverarts_ to track your orders, view favorites, and continue shopping.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    submitBtn: 'Sign In',
    submittingBtn: 'Signing In...',
    dividerText: 'Or continue with',
    googleBtn: 'Sign in with Google',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up now',
    copyright: '© 2026 floverarts_ . All rights reserved.',
    errorEmptyEmail: 'Please enter your email address.',
    errorEmptyPassword: 'Please enter your password.',
    errorDefault: 'Invalid email or password. Please try again.',
    successDefault: 'Login successful! Redirecting to home...',
    alertErrorTitle: 'Sign In Failed',
    alertSuccessTitle: 'Success!',
    forgotAlertMsg: 'Please reach out to customer support or WhatsApp to recover your password.',
    googleAlertMsg: 'Google SSO integration is currently being set up.',
    heroBadge: 'Exclusive Artisan Bouquet',
  },
};

export function LoginForm() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg(t.errorEmptyEmail);
      return;
    }
    if (!password) {
      setErrorMsg(t.errorEmptyPassword);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        email: cleanEmail.toLowerCase(),
        password,
      });

      login(response);
      setSuccessMsg(response.message || t.successDefault);

      // Langsung redirect ke Beranda (atau rute sebelumnya)
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
            LEFT PANE: Form & Autentikasi
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
                  className="lang-pill-btn"
                  onClick={() => setLangOpen(!langOpen)}
                  aria-label="Pilih Bahasa / Select Language"
                  id="lang-selector-btn"
                >
                  <span className="lang-current-code">{lang}</span>
                  <ChevronDown size={14} className={`lang-chevron ${langOpen ? 'open' : ''}`} />
                </button>

                {langOpen && (
                  <div className="lang-dropdown">
                    <button
                      type="button"
                      className={`lang-option ${lang === 'ID' ? 'active' : ''}`}
                      onClick={() => handleSelectLanguage('ID')}
                    >
                      <span className="lang-option-label">🇮🇩 Bahasa Indonesia</span>
                      {lang === 'ID' && <Check size={14} className="lang-check-icon" />}
                    </button>
                    <button
                      type="button"
                      className={`lang-option ${lang === 'EN' ? 'active' : ''}`}
                      onClick={() => handleSelectLanguage('EN')}
                    >
                      <span className="lang-option-label">🇬🇧 English</span>
                      {lang === 'EN' && <Check size={14} className="lang-check-icon" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">{t.welcomeTitle}</h1>
              <p className="welcome-subtitle">{t.welcomeSubtitle}</p>
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="alert-banner error" role="alert" id="login-error-alert">
                <AlertCircle size={18} className="alert-icon" />
                <div className="alert-content">
                  <strong>{t.alertErrorTitle}</strong>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="alert-banner success" role="status" id="login-success-alert">
                <CheckCircle2 size={18} className="alert-icon" />
                <div className="alert-content">
                  <strong>{t.alertSuccessTitle}</strong>
                  <span>{successMsg}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Email Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="email-input">
                  {t.emailLabel}
                </label>
                <div className="input-container">
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="form-input"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="password-input">
                  {t.passwordLabel}
                </label>
                <div className="input-container">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    className="form-input"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="input-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options Row (Forgot Password Link) */}
              <div className="form-options-row">
                <a
                  href="#forgot-password"
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(t.forgotAlertMsg);
                  }}
                >
                  {t.forgotPassword}
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
                id="btn-login-submit"
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

            {/* Divider */}
            <div className="auth-divider">
              <span className="divider-text">{t.dividerText}</span>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="btn-google"
              onClick={() => {
                alert(t.googleAlertMsg);
              }}
              id="btn-google-login"
            >
              <GoogleIcon />
              <span>{t.googleBtn}</span>
            </button>
          </div>

          {/* Footer Section */}
          <footer className="card-footer">
            <p className="register-prompt">
              {t.noAccount}{' '}
              <Link to="/daftar" className="register-link">
                {t.registerLink}
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

export default LoginForm;
