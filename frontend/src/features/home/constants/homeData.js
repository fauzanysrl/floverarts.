import { Flower2, Truck, Scissors, Gift } from 'lucide-react';

export const OCCASIONS = [
  { name: 'Birthday',        label: 'Ulang Tahun',    image: '/bucket hbd.jpg' },
  { name: 'Anniversary',     label: 'Anniversary',    image: '/bouquet-anniversary.jpg' },
  { name: 'Wedding',         label: 'Pernikahan',     image: '/lily putih.jpg' },
  { name: 'Graduation',      label: 'Wisuda',         image: '/bouquet graduation.jpg' },
  { name: 'Congratulations', label: 'Selamat & Sukses',image: '/bouquet-sunflower.jpg' },
  { name: 'Sympathy',        label: 'Duka Cita',      image: '/bouquet-rose.jpg' },
];

export const STORE_CATEGORIES = [
  { id: 1, name: 'Anniversary', slug: 'anniversary' },
  { id: 2, name: 'Romance', slug: 'romance' },
  { id: 3, name: 'Thank you', slug: 'thank-you' },
  { id: 4, name: 'Celebration', slug: 'celebration' },
  { id: 5, name: 'Birthday', slug: 'birthday' },
];

export const DEFAULT_FEATURED_PRODUCTS = [
  {
    id: 101,
    name: 'Classic Sunset Bouquet',
    category_id: 1,
    category_name: 'Buket Bunga Segar',
    product_type: 'bouquet',
    occasion: 'celebration',
    slug: 'classic-sunset-bouquet',
    price: 350000,
    stock: 12,
    image_url: '/bouquet-sunflower.jpg',
    description: 'Rangkaian bunga matahari mekar segar penuh kehangatan, dipadukan dedaunan hijau segar dan wrapping premium bernuansa hangat.',
    created_at: '2026-10-25T10:00:00Z',
  },
  {
    id: 102,
    name: 'Midnight Velvet Roses',
    category_id: 1,
    category_name: 'Buket Bunga Segar',
    product_type: 'bouquet',
    occasion: 'romance',
    slug: 'midnight-velvet-roses',
    price: 420000,
    stock: 8,
    image_url: '/bouquet-rose.jpg',
    description: 'Kemewahan bunga mawar merah beludru pilihan artisan dengan aksen pita satin eksklusif dan kertas wrapping elegan.',
    created_at: '2026-10-26T11:00:00Z',
  },
  {
    id: 103,
    name: 'Pure White Lily Bouquet',
    category_id: 1,
    category_name: 'Buket Bunga Segar',
    product_type: 'bouquet',
    occasion: 'thank-you',
    slug: 'pure-white-lily-bouquet',
    price: 380000,
    stock: 10,
    image_url: '/lily putih.jpg',
    description: 'Keanggunan bunga lily putih segar yang harum memikat, melambangkan ketulusan dan kemurnian untuk momen berharga.',
    created_at: '2026-10-27T09:00:00Z',
  },
  {
    id: 104,
    name: 'Blushing Pink Tulips',
    category_id: 1,
    category_name: 'Buket Bunga Segar',
    product_type: 'bouquet',
    occasion: 'romance',
    slug: 'blushing-pink-tulips',
    price: 390000,
    stock: 9,
    image_url: '/pink tulip.jpg',
    description: 'Pesona lembut bunga tulip merah muda yang manis dan memikat hati, dirangkai dengan wrapping pastel minimalis.',
    created_at: '2026-10-28T14:00:00Z',
  },
  {
    id: 105,
    name: 'Artisan Glass Painting Floral',
    category_id: 3,
    category_name: 'Buket Wisuda & Hadiah',
    product_type: 'glass-painting',
    occasion: 'anniversary',
    slug: 'artisan-glass-painting-floral',
    price: 180000,
    stock: 7,
    image_url: '/bouquet-tulip.jpg',
    description: 'Lukisan kaca estetik bertema bunga abadi dan kaligrafi personal dengan bingkai kayu natural elegan.',
    created_at: '2026-10-29T15:00:00Z',
  },
  {
    id: 106,
    name: 'Sweet Pastel Daisy Bouquet',
    category_id: 2,
    category_name: 'Buket Artificial & Kering',
    product_type: 'bouquet',
    occasion: 'thank-you',
    slug: 'sweet-pastel-daisy-bouquet',
    price: 245000,
    stock: 15,
    image_url: '/bucket daisy.jpg',
    description: 'Rangkaian bunga daisy ceria penuh pesona kasual, memberikan nuansa segar dan menyenangkan bagi penerimanya.',
    created_at: '2026-10-24T08:00:00Z',
  },
  {
    id: 107,
    name: 'Special Graduation Teddy Bouquet',
    category_id: 3,
    category_name: 'Buket Wisuda & Hadiah',
    product_type: 'gift-box',
    occasion: 'celebration',
    slug: 'special-graduation-teddy-bouquet',
    price: 275000,
    stock: 16,
    image_url: '/bouquet graduation.jpg',
    description: 'Buket wisuda boneka teddy toga premium dengan aksen bunga awet dan pita satin perayaan kelulusan.',
    created_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 108,
    name: 'Romantic Anniversary Bloom Box',
    category_id: 2,
    category_name: 'Buket Artificial & Kering',
    product_type: 'bloom-box',
    occasion: 'anniversary',
    slug: 'romantic-anniversary-bloom-box',
    price: 450000,
    stock: 6,
    image_url: '/bouquet-anniversary.jpg',
    description: 'Bloom box mewah berisi preserved roses dan everlasting foliage dengan kotak bundar berbalut beludru plum.',
    created_at: '2026-10-23T11:00:00Z',
  },
  {
    id: 109,
    name: 'Happy Birthday Surprise Hampers',
    category_id: 3,
    category_name: 'Buket Wisuda & Hadiah',
    product_type: 'hampers',
    occasion: 'birthday',
    slug: 'happy-birthday-surprise-hampers',
    price: 320000,
    stock: 11,
    image_url: '/bucket hbd.jpg',
    description: 'Hampers kado ulang tahun semarak berisi buket mini, cokelat premium, dan kartu ucapan lilin aromaterapi.',
    created_at: '2026-10-22T13:00:00Z',
  },
  {
    id: 110,
    name: 'Vase Lily & Table Bloom Orchid',
    category_id: 4,
    category_name: 'Bunga Meja & Vas',
    product_type: 'custom-gift',
    occasion: 'celebration',
    slug: 'vase-lily-table-bloom-orchid',
    price: 365000,
    stock: 14,
    image_url: '/mix flower.jpg',
    description: 'Komposisi bunga meja dalam vas keramik estetik, cocok untuk dekorasi meja kantor, ruang tamu, atau ucapan selamat.',
    created_at: '2026-10-21T12:00:00Z',
  },
  {
    id: 111,
    name: 'Memories Floral Photo Frame 3D',
    category_id: 3,
    category_name: 'Buket Wisuda & Hadiah',
    product_type: 'frame',
    occasion: 'birthday',
    slug: 'memories-floral-photo-frame-3d',
    price: 215000,
    stock: 10,
    image_url: '/pink tulip.jpg',
    description: 'Bingkai foto kayu 3D berhias bunga kering awet dan lampu LED fairy lights yang hangat.',
    created_at: '2026-10-28T16:00:00Z',
  },
  {
    id: 112,
    name: 'Rustic Dried Sunflower Jar',
    category_id: 2,
    category_name: 'Buket Artificial & Kering',
    product_type: 'custom-gift',
    occasion: 'thank-you',
    slug: 'rustic-dried-sunflower-jar',
    price: 195000,
    stock: 18,
    image_url: '/bouquet-sunflower.jpg',
    description: 'Rangkaian bunga matahari kering awet dipadukan gandum dan baby breath rustic dalam kemasan vintage.',
    created_at: '2026-10-20T09:00:00Z',
  },
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
    title: 'Bunga Segar Terpilih',
    desc: 'Setiap buket dirangkai menggunakan bunga segar alami pilihan untuk memastikan ketahanan dan keindahan mekar yang tahan lama.',
  },
  {
    icon: Truck,
    title: 'Pengiriman Terjaga',
    desc: 'Pengiriman lokal area Cilacap dan sekitarnya dengan kemasan pelindung agar rangkaian tiba dalam kondisi prima.',
  },
  {
    icon: Scissors,
    title: 'Sentuhan Tangan Artisan',
    desc: 'Setiap rangkaian dikerjakan secara teliti oleh florist berpengalaman, menciptakan buket yang otentik dan bermakna.',
  },
  {
    icon: Gift,
    title: 'Personalisasi Kartu Ucapan',
    desc: 'Setiap pesanan dapat dilengkapi kartu ucapan dengan pesan personal yang dicetak rapi untuk orang terkasih.',
  },
];

export const ORDER_STEPS = [
  { num: '1', title: 'Pilih Koleksi Bunga', desc: 'Jelajahi katalog buket atau gunakan fitur buket custom untuk memilih kombinasi bunga impian.' },
  { num: '2', title: 'Tentukan Rangkaian', desc: 'Pilih ukuran, warna kertas wrapping, aksen pita, serta tulis pesan kartu ucapan.' },
  { num: '3', title: 'Selesaikan Pembayaran', desc: 'Isi detail alamat penerima atau ambil di toko, lalu bayar instan via QRIS atau Transfer Bank BCA.' },
  { num: '4', title: 'Lacak Pesanan', desc: 'Pantau pemrosesan buket hingga siap diambil atau sampai di tujuan melalui halaman pesanan.' },
];

export const FAQS = [
  {
    id: 1,
    question: 'Bagaimana cara memesan buket bunga?',
    answer:
      'Pilih buket favorit Anda dari katalog atau gunakan fitur Custom Bouquet, klik "Detail / Pesan", tambahkan ke keranjang, dan lakukan checkout dengan mengisi alamat penerima atau memilih ambil di toko.',
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
      'Pembayaran diproses otomatis dan aman melalui Midtrans. Kami menerima pembayaran via QRIS (GoPay, OVO, ShopeePay, DANA) dan Transfer Bank BCA.',
  },
  {
    id: 4,
    question: 'Bagaimana cara melacak status pesanan saya?',
    answer:
      'Setelah pembayaran terkonfirmasi, Anda dapat memantau status pesanan (dikonfirmasi, diproses, siap diambil/dikirim, hingga selesai) secara real-time melalui menu "Pesanan Saya".',
  },
  {
    id: 5,
    question: 'Apakah bisa diambil langsung di toko (pick-up)?',
    answer:
      'Ya, saat checkout Anda dapat memilih opsi "Ambil di Toko" (Gratis) di Flagship Atelier FloverArts Cilacap atau opsi "Antar ke Alamat".',
  },
];


