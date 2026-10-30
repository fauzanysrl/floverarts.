import { Flower2, Truck, Scissors, Gift } from 'lucide-react';

export const OCCASIONS = [
  { name: 'Birthday',        label: 'Ulang Tahun',    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80' },
  { name: 'Anniversary',     label: 'Anniversary',    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
  { name: 'Wedding',         label: 'Pernikahan',     image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80' },
  { name: 'Graduation',      label: 'Wisuda',         image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80' },
  { name: 'Congratulations', label: 'Selamat & Sukses',image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sympathy',        label: 'Duka Cita',      image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80' },
];

export const DEFAULT_FEATURED_PRODUCTS = [
  { id: 101, name: 'Classic Sunset Bouquet',  category_name: 'Warm Blooms',     slug: 'classic-sunset-bouquet',  price: 350000, stock: 12, image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80' },
  { id: 102, name: 'Midnight Velvet Roses',   category_name: 'Luxury Rose',     slug: 'midnight-velvet-roses',   price: 420000, stock: 8,  image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
  { id: 103, name: 'Blushing Petals Bouquet', category_name: 'Pastel Floral',   slug: 'blushing-petals-bouquet', price: 380000, stock: 15, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80' },
  { id: 104, name: 'Lavender Dream Bouquet',  category_name: 'Signature Satin', slug: 'lavender-dream-bouquet',  price: 400000, stock: 10, image_url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80' },
];

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS DATA
   - Avatar menggunakan inisial (lingkaran desain token)
   - Hanya memuat ulasan terverifikasi
   ═══════════════════════════════════════════════════════════ */
export const TESTIMONIALS = [
  // TODO(konfirmasi): Cocokkan teks kutipan persis dengan review asli Google Maps FloverArts_ Cilacap
  {
    name: 'Irma Rofingatun',
    initials: 'IR',
    role: 'Google Review',
    stars: 5,
    quote: '"rekomendddd produknya 🌸."',
  },
  // TODO(konfirmasi): Cocokkan teks kutipan persis dengan review asli Google Maps FloverArts_ Cilacap
  {
    name: 'Nur Hayati',
    initials: 'NH',
    role: 'Google Review',
    stars: 5,
    quote: '"produknya bagus pwoll,"',
    highlight: true,
  },
  // TODO(konfirmasi): Cocokkan teks kutipan persis dengan review asli Google Maps FloverArts_ Cilacap
  {
    name: 'RIZAL DWI ANGGORO',
    initials: 'RD',
    role: 'Google Review',
    stars: 5,
    quote: '"Wort it guyss beli disini sumpahh kalian harus coba."',
  },
  /*
  // REVIEW BELUM TERKONFIRMASI (Disimpan sebagai komentar sampai diverifikasi keasliannya):
  {
    name: 'Anisa Rahmawati',
    initials: 'AR',
    role: 'Review Pelanggan',
    stars: 5,
    quote: '"Buket wisudanya luar biasa cantik! Rangkaian bunga mawarnya segar. Tepat waktu sampai lokasi."',
    disabled: true,
  },
  {
    name: 'Dimas Pratama',
    initials: 'DP',
    role: 'Review Pelanggan',
    stars: 5,
    quote: '"Fitur Custom Bouquet sangat membantu. Hasilnya sangat memuaskan!"',
    highlight: true,
    disabled: true,
  },
  */
];

export const PROMISES = [
  {
    icon: Flower2,
    title: 'Fresh Flowers',
    desc: 'Every bouquet is handcrafted using carefully selected seasonal flowers to ensure freshness and lasting beauty.',
  },
  {
    icon: Truck,
    title: 'Same-Day Delivery',
    desc: 'Same-day local delivery available on selected orders, so your flowers arrive fresh and beautifully presented.',
  },
  {
    icon: Scissors,
    title: 'Handcrafted With Care',
    desc: 'Each arrangement is thoughtfully designed by experienced florists, making every bouquet truly unique.',
  },
  {
    icon: Gift,
    title: 'Personalized Touch',
    desc: 'Every bouquet can be personalized with a handwritten message or custom touches for any special occasion.',
  },
];

export const ORDER_STEPS = [
  { num: '1', title: 'Explore the Collection', desc: 'Browse our catalog or start building your own custom bouquet.' },
  { num: '2', title: 'Choose Your Bouquet',    desc: 'Select size, wrapping accents, and personalized greeting card message.' },
  { num: '3', title: 'Complete Your Order',    desc: 'Provide delivery details and pay safely with Midtrans Snap.' },
  { num: '4', title: 'Track Your Order',       desc: 'Monitor real-time preparation and delivery updates directly on the web.' },
];

export const FAQS = [
  {
    id: 1,
    question: 'Bagaimana cara memesan buket bunga?',
    answer:
      'Pilih buket favorit Anda dari katalog atau gunakan fitur Custom Bouquet, klik "Detail / Pesan", tambahkan ke keranjang, dan lakukan checkout dengan mengisi alamat penerima serta tanggal pengiriman.',
  },
  {
    id: 2,
    question: 'Bisakah saya merakit buket custom sendiri?',
    answer:
      'Ya! Floverarts menyediakan fitur Custom Bouquet di mana Anda dapat memilih sendiri jenis bunga segar, warna kertas pembungkus (wrapping), pita, serta menuliskan pesan personal pada kartu ucapan.',
  },
  {
    id: 3,
    question: 'Metode pembayaran apa saja yang didukung?',
    answer:
      'Seluruh pembayaran diproses otomatis dan aman melalui Midtrans Snap. Kami menerima QRIS (GoPay, OVO, ShopeePay, DANA), Virtual Account Bank (BCA, Mandiri, BNI, BRI), dan Kartu Kredit.',
  },
  {
    id: 4,
    question: 'Bagaimana cara melacak status pesanan saya?',
    answer:
      'Setelah pembayaran terkonfirmasi, Anda dapat memantau status pesanan (dikonfirmasi → diproses → siap dikirim → selesai) dan nomor resi kurir secara real-time melalui menu "Pesanan Saya".',
  },
  {
    id: 5,
    question: 'Bisakah saya menentukan tanggal dan waktu pengiriman?',
    answer:
      'Tentu saja. Pada saat checkout, Anda dapat memilih tanggal pengiriman yang diinginkan, baik untuk pengiriman di hari yang sama (Same-Day) maupun pemesanan terjadwal untuk hari ulang tahun atau wisuda mendatang.',
  },
];


