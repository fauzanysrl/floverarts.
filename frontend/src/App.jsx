import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Flower2
} from 'lucide-react';
import './App.css';

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

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Language state
  const [lang, setLang] = useState('ID');
  const [langOpen, setLangOpen] = useState(false);

  // Check persisted session on load
  useEffect(() => {
    const savedToken = localStorage.getItem('flover_token') || sessionStorage.getItem('flover_token');
    const savedUser = localStorage.getItem('flover_user') || sessionStorage.getItem('flover_user');
    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setLoggedInUser(JSON.parse(savedUser));
      } catch (e) {
        // invalid data, ignore
      }
    }
  }, []);

  // Quick fill demo user
  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg(null);
  };

  // Submit Handler connected to backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Silakan masukkan alamat email Anda.');
      return;
    }
    if (!password) {
      setErrorMsg('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    try {
      // Prioritize Vite proxy `/api/auth/login`, fallback to direct backend URL if needed
      const endpoints = ['/api/auth/login', 'http://localhost:5000/api/auth/login'];
      let response = null;
      let data = null;
      let lastNetworkError = null;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password: password
            })
          });

          // Check if response is JSON
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            response = res;
            data = await res.json();
            break;
          }
        } catch (netErr) {
          lastNetworkError = netErr;
        }
      }

      if (!response && lastNetworkError) {
        throw new Error(
          'Tidak dapat terhubung ke server backend (port 5000). Pastikan backend Node.js telah dijalankan (npm run dev / npm start).'
        );
      }

      if (response && response.ok && data) {
        // Success
        const user = data.data?.user || { email };
        const token = data.token || data.data?.token;

        setLoggedInUser(user);
        setAuthToken(token);
        setSuccessMsg(data.message || 'Login berhasil! Selamat datang kembali.');

        // Persist session
        const storage = rememberMe ? localStorage : sessionStorage;
        if (token) storage.setItem('flover_token', token);
        if (user) storage.setItem('flover_user', JSON.stringify(user));

      } else {
        // Error returned from API
        const errMsg =
          data?.error?.message ||
          data?.message ||
          'Email atau kata sandi tidak sesuai. Silakan periksa kembali.';
        setErrorMsg(errMsg);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menghubungi backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('flover_token');
    localStorage.removeItem('flover_user');
    sessionStorage.removeItem('flover_token');
    sessionStorage.removeItem('flover_user');
    setLoggedInUser(null);
    setAuthToken(null);
    setSuccessMsg(null);
    setErrorMsg(null);
    setPassword('');
  };

  return (
    <main className="login-wrapper">
      <div className="login-card">
        {/* ================================================================
            LEFT PANE: Form & Autentikasi
            ================================================================ */}
        <section className="login-pane">
          <div>
            {/* Top Brand & Language Bar */}
            <div className="brand-header">
              <a href="#" className="brand-badge" title="FloverArts Official">
                <div className="brand-icon-box">
                  <img src="/logo.svg" alt="FloverArts Logo" />
                </div>
                <span className="brand-title">floverarts_</span>
              </a>

              {/* Language Selector */}
              <div className="lang-selector-container">
                <button
                  type="button"
                  className="lang-pill-btn"
                  onClick={() => setLangOpen(!langOpen)}
                  aria-label="Pilih Bahasa"
                  id="lang-selector-btn"
                >
                  <span>{lang}</span>
                  <ChevronDown size={13} />
                </button>

                {langOpen && (
                  <div className="lang-dropdown">
                    <button
                      type="button"
                      className={`lang-option ${lang === 'ID' ? 'active' : ''}`}
                      onClick={() => {
                        setLang('ID');
                        setLangOpen(false);
                      }}
                    >
                      <span>Indonesia</span>
                      {lang === 'ID' && <Check size={14} />}
                    </button>
                    <button
                      type="button"
                      className={`lang-option ${lang === 'EN' ? 'active' : ''}`}
                      onClick={() => {
                        setLang('EN');
                        setLangOpen(false);
                      }}
                    >
                      <span>English</span>
                      {lang === 'EN' && <Check size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* If user is already authenticated */}
            {loggedInUser ? (
              <div className="logged-in-pane">
                <div className="user-avatar-circle">
                  {loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="welcome-title" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
                    Halo, {loggedInUser.name || 'Pengguna'}!
                  </h2>
                  <span className={`logged-badge badge-${loggedInUser.role}`}>
                    {loggedInUser.role === 'owner_admin' ? 'Owner / Admin' : 'Pelanggan Setia'}
                  </span>
                </div>

                <div className="logged-details-box">
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{loggedInUser.email}</span>
                  </div>
                  {loggedInUser.phone && (
                    <div className="detail-row">
                      <span className="detail-label">Telepon:</span>
                      <span className="detail-value">{loggedInUser.phone}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Status Akun:</span>
                    <span className="detail-value" style={{ color: '#178044', fontWeight: 'bold' }}>
                      ● {loggedInUser.status || 'Active'}
                    </span>
                  </div>
                  {authToken && (
                    <div className="detail-row">
                      <span className="detail-label">Access Token:</span>
                      <span className="token-preview" title={authToken}>
                        {authToken.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleLogout}
                  style={{ background: '#4e2238' }}
                  id="btn-logout"
                >
                  <LogOut size={16} />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </div>
            ) : (
              /* Regular Login Form View */
              <>
                {/* Welcome Title */}
                <header className="welcome-section">
                  <h1 className="welcome-title">Selamat Datang</h1>
                  <p className="welcome-subtitle">
                    Masuk ke akun floverarts_ untuk melacak pesanan, melihat favorit, dan melanjutkan belanja.
                  </p>
                </header>

                {/* Feedback Banners */}
                {errorMsg && (
                  <div className="alert-banner error" role="alert" id="login-error-alert">
                    <AlertCircle size={18} className="alert-icon" />
                    <div className="alert-content">
                      <strong>Gagal Masuk</strong>
                      <span>{errorMsg}</span>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="alert-banner success" role="status" id="login-success-alert">
                    <CheckCircle2 size={18} className="alert-icon" />
                    <div className="alert-content">
                      <strong>Berhasil!</strong>
                      <span>{successMsg}</span>
                    </div>
                  </div>
                )}

                {/* Quick Demo Fill Bar for Easy Testing */}
                <div className="demo-accounts-bar">
                  <div className="demo-title">
                    <span>⚡ Uji Cepat Kredensial Demo:</span>
                  </div>
                  <div className="demo-pills">
                    <button
                      type="button"
                      className="demo-pill-btn"
                      onClick={() => handleDemoFill('siti@example.com', 'Password123!')}
                      title="Pelanggan: siti@example.com"
                    >
                      <User size={12} />
                      <span>Akun Pelanggan (siti@example.com)</span>
                    </button>
                    <button
                      type="button"
                      className="demo-pill-btn"
                      onClick={() => handleDemoFill('owner@example.com', 'Password123!')}
                      title="Owner/Admin: owner@example.com"
                    >
                      <ShieldCheck size={12} />
                      <span>Akun Admin (owner@example.com)</span>
                    </button>
                  </div>
                </div>

                {/* Login Form */}
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                  {/* Email Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="email-input">
                      Alamat Email
                    </label>
                    <div className="input-container">
                      <input
                        id="email-input"
                        type="email"
                        name="email"
                        autoComplete="email"
                        className="form-input"
                        placeholder="nama@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="password-input">
                      Kata Sandi
                    </label>
                    <div className="input-container">
                      <input
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="current-password"
                        className="form-input"
                        placeholder="Masukkan kata sandi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Options Row: Remember Me & Forgot Password */}
                  <div className="form-options-row">
                    <label className="remember-label" htmlFor="remember-checkbox">
                      <input
                        id="remember-checkbox"
                        type="checkbox"
                        className="remember-checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Ingat saya</span>
                    </label>

                    <a
                      href="#forgot-password"
                      className="forgot-password-link"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Silakan hubungi customer service atau gunakan fitur lupa sandi.');
                      }}
                    >
                      Lupa kata sandi?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isLoading}
                    id="btn-login-submit"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner" />
                        <span>Memproses Masuk...</span>
                      </>
                    ) : (
                      <span>Masuk</span>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                  <span className="divider-text">Atau masuk dengan</span>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  className="btn-google"
                  onClick={() => {
                    alert('Autentikasi Single Sign-On (SSO) Google siap dikonfigurasi dengan Google Cloud OAuth Client ID.');
                  }}
                  id="btn-google-login"
                >
                  <GoogleIcon />
                  <span>Masuk dengan Google</span>
                </button>
              </>
            )}
          </div>

          {/* Footer Section */}
          <footer className="card-footer">
            {!loggedInUser && (
              <p className="register-prompt">
                Belum punya akun?{' '}
                <a
                  href="#daftar"
                  className="register-link"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Halaman registrasi pelanggan FloverArts dapat diakses di menu pendaftaran.');
                  }}
                >
                  Daftar
                </a>
              </p>
            )}
            <p className="copyright-text">© 2025 floverarts_ . All rights reserved.</p>
          </footer>
        </section>

        {/* ================================================================
            RIGHT PANE: Visual Showcase Banner (Buket Satin Mewah)
            ================================================================ */}
        <aside className="visual-pane" aria-label="Katalog Unggulan FloverArts">
          <img
            src="/bouquet-banner.jpg"
            alt="Round Bouquet Satin FloverArts"
            className="visual-image"
            onError={(e) => {
              // Fallback jika gambar statis belum termuat
              e.target.src = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80';
            }}
          />
          <div className="visual-gradient-overlay" />

          {/* Text Overlay matching screenshot */}
          <div className="visual-content-overlay">
            <h2 className="visual-title-script">Round Bouquet Satin</h2>
            <div className="visual-brand-tag">FLOVERARTS</div>
            <div className="visual-description-box">
              <p className="visual-description">
                Looking for an aesthetic gift? Explore our handmade satin projects. Each rose is delicately handcrafted so celebrations feel truly special. You can request any custom bouquet model you want.
              </p>
              <div className="visual-badge">AESTHETIC PROJECTS</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
