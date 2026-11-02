/**
 * Pemetaan gambar fallback buket FloverArts_
 * Memastikan setiap buket selalu menampilkan foto asli berkualitas tinggi
 * baik saat membaca dari backend /uploads/ maupun saat offline / fallback.
 */

export function findMatchingFallback(slug = '', name = '') {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (s.includes('mawar') || n.includes('mawar') || s.includes('rose')) return '/bouquet-rose.jpg';
  if (s.includes('lily') || n.includes('lily')) return '/lily putih.jpg';
  if (s.includes('sunflower') || s.includes('matahari') || n.includes('matahari')) return '/bouquet-sunflower.jpg';
  if (
    s.includes('wisuda') ||
    n.includes('wisuda') ||
    s.includes('teddy') ||
    s.includes('graduation')
  ) {
    return '/bouquet graduation.jpg';
  }
  if (s.includes('anniversary') || n.includes('anniversary')) return '/bouquet-anniversary.jpg';
  if (s.includes('daisy') || n.includes('daisy')) return '/bucket daisy.jpg';
  if (
    s.includes('hbd') ||
    s.includes('ulang-tahun') ||
    n.includes('ulang tahun') ||
    s.includes('birthday')
  ) {
    return '/bucket hbd.jpg';
  }
  if (s.includes('pink-tulip') || (n.includes('tulip') && n.includes('pink'))) {
    return '/pink tulip.jpg';
  }
  if (s.includes('tulip') || n.includes('tulip')) return '/bouquet-tulip.jpg';
  if (s.includes('mix') || n.includes('campur') || n.includes('harmony')) {
    return '/mix flower.jpg';
  }

  return '/bouquet-rose.jpg';
}

export default findMatchingFallback;

