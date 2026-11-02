import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { userApi } from '../api/endpoints/user';
import { ROLE_LABELS } from '../lib/constants';

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    role: user?.role || 'customer',
  });
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      userApi
        .getProfile()
        .then((res) => {
          if (isMounted) {
            const data = res.data?.data || res.data || {};
            setProfile({
              name: data.name || user?.name || '',
              email: data.email || user?.email || '',
              phone: data.phone || '',
              address: data.address || '',
              role: data.role || user?.role || 'customer',
            });
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await userApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      setMessage('Profil berhasil diperbarui.');
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F8] py-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-lg border border-borderNeutral p-8 shadow-xs">
            <User size={40} className="mx-auto text-secondaryText/60 mb-3" />
            <h2 className="text-lg font-heading font-bold text-primaryText mb-2">
              Akses Profil
            </h2>
            <p className="text-xs text-secondaryText mb-6">
              Silakan masuk ke akun Anda terlebih dahulu untuk melihat dan mengelola profil.
            </p>
            <Link
              to="/masuk"
              className="inline-block w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors"
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F8] py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-secondaryText mb-2">
            <Link to="/" className="hover:text-primary">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">Profil Akun</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-primaryText">
            Profil Akun
          </h1>
          <p className="text-xs text-secondaryText mt-1">
            Kelola informasi data diri Anda untuk kemudahan pemesanan bunga.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-borderNeutral p-6 sm:p-8 shadow-xs">
          {message && (
            <div className="mb-5 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-xs text-secondaryText">
              Memuat profil...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role badge */}
              <div className="flex items-center justify-between pb-4 border-b border-borderNeutral">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-softLavender text-primary font-bold text-base flex items-center justify-center border border-borderNeutral">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-primaryText">
                      {profile.name || 'Pengguna'}
                    </h2>
                    <p className="text-xs text-secondaryText">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-softLavender text-primary text-xs font-semibold rounded-full border border-borderNeutral">
                  <Shield size={12} />
                  <span>{ROLE_LABELS[profile.role] || 'Pelanggan'}</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-primaryText mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm border border-borderNeutral rounded-md outline-none focus:border-primary"
                  />
                  <User
                    size={15}
                    className="absolute left-3 top-2.5 text-secondaryText"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-medium text-primaryText mb-1">
                  Alamat Email (Akun)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm border border-borderNeutral bg-bgSecondary text-secondaryText rounded-md cursor-not-allowed"
                  />
                  <Mail
                    size={15}
                    className="absolute left-3 top-2.5 text-secondaryText"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-primaryText mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm border border-borderNeutral rounded-md outline-none focus:border-primary"
                  />
                  <Phone
                    size={15}
                    className="absolute left-3 top-2.5 text-secondaryText"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-primaryText mb-1">
                  Alamat Pengiriman Default
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Alamat lengkap (nama jalan, nomor rumah, kelurahan, kecamatan, kota)..."
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, address: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm border border-borderNeutral rounded-md outline-none focus:border-primary"
                  />
                  <MapPin
                    size={15}
                    className="absolute left-3 top-3 text-secondaryText"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
