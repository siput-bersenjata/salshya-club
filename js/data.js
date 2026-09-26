/**
 * DATA AWAL SALSHYA_CLUB
 * Berisi katalog produk resmi Shopee, kategori, data ulasan pembeli, dan pengaturan toko.
 * Semua gambar produk menggunakan link CDN resmi Shopee langsung (tanpa perlu upload manual).
 */

const INITIAL_CATEGORIES = [
  { id: 'all', name: 'Semua Produk', icon: 'sparkles' },
  { id: 'software', name: 'Software & Aplikasi', icon: 'terminal' },
  { id: 'social', name: 'Layanan Digital & Sosmed', icon: 'trending' },
  { id: 'craft', name: 'Kerajinan Fisik', icon: 'box' }
];

const INITIAL_DELETED_PRODUCT_IDS = [
  'prod-filmora',
  'prod-followers',
  'prod-oldroll',
  'prod-playstore-rating',
  'prod-tissue-box',
  'prod-views-likes',
  'prod-ytbot'
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-salpos',
    name: 'SAL POS - Aplikasi Kasir Toko Online v3 (Point of Sales Lengkap)',
    category: 'software',
    price: 59000,
    originalPrice: 150000,
    rating: 5.0,
    soldCount: 842,
    badge: 'BEST SELLER',
    badgeType: 'hot',
    iconType: 'pos',
    image: 'salpos-custom.jpg',
    images: ['salpos-custom.jpg'],
    description: 'Aplikasi kasir pintar (Point of Sales) untuk semua jenis usaha (toko retail, kelontong, cafe, resto, laundry, dll). Tanpa biaya langganan bulanan (sekali bayar seumur hidup), mendukung mode offline tanpa kuota dan sinkronisasi laporan online.',
    features: [
      'Tanpa biaya bulanan (Lifetime License Aktif Selamanya)',
      'Support printer thermal Bluetooth & USB (58mm / 80mm)',
      'Manajemen stok otomatis & notifikasi stok menipis',
      'Laporan penjualan harian, bulanan & laba rugi otomatis',
      'Support cetak struk logo toko & QRIS dinamis',
      'Panduan video install lengkap + dibantu remote sampai bisa'
    ],
    variants: [
      { name: 'Versi Android (APK Full Unlocked)', price: 59000 },
      { name: 'Versi PC / Laptop Windows', price: 79000 },
      { name: 'Paket Combo (Android + PC Windows)', price: 110000 }
    ],
    tags: ['SAL POS', 'Aplikasi Kasir', 'Software Kasir', 'Toko Retail', 'UMKM', 'Point of Sales']
  },
  {
    id: 'prod-photoroom',
    name: 'PhotoRoom Pro AI Photo Editor Full Unlocked Lifetime (Android/PC)',
    category: 'software',
    price: 15000,
    originalPrice: 45000,
    rating: 4.9,
    soldCount: 1120,
    badge: 'AI EDITOR',
    badgeType: 'purple',
    iconType: 'image',
    image: 'https://cf.shopee.co.id/file/sg-11134201-7rbmv-m5nv52am1xzi6c',
    images: ['https://cf.shopee.co.id/file/sg-11134201-7rbmv-m5nv52am1xzi6c'],
    description: 'Aplikasi edit foto katalog produk berbasis AI nomor 1 di dunia. Hapus background otomatis sekejap, ganti background studio profesional, tambah bayangan realistis, dan buat foto jualan produk olshop terlihat mewah seketika.',
    features: [
      'Hapus background otomatis sekejap dengan kecerdasan AI',
      'Akses ribuan template background studio & e-commerce premium',
      'Fitur AI Shadow & Retouch otomatis untuk foto jualan',
      'Export resolusi tinggi (HD / 4K) tanpa watermark seumur hidup',
      'Full Unlocked Lifetime tanpa biaya langganan bulanan',
      'Aktivasi instan dan mudah digunakan di HP Android / PC'
    ],
    variants: [
      { name: 'Android APK Pro Fullpack (Lifetime)', price: 15000 },
      { name: 'PC Windows / Web Access VIP', price: 25000 },
      { name: 'Combo Android + PC Windows', price: 35000 }
    ],
    tags: ['PhotoRoom Pro', 'Edit Foto AI', 'Hapus Background', 'Foto Produk', 'Katalog Olshop', 'AI Photo']
  },
  {
    id: 'prod-telegram',
    name: 'Jasa Broadcast & Tambah Member Grup/Channel Telegram',
    category: 'social',
    price: 35000,
    originalPrice: 75000,
    rating: 4.8,
    soldCount: 650,
    badge: 'PROMO',
    badgeType: 'purple',
    iconType: 'send',
    image: 'https://cf.shopee.co.id/file/id-11134207-822wh-mng3v6s6lced6d',
    images: ['https://cf.shopee.co.id/file/id-11134207-822wh-mng3v6s6lced6d'],
    description: 'Layanan pertumbuhan komunitas grup dan channel Telegram untuk promosi bisnis online, affiliate marketing, sinyal trading, maupun komunitas lokal secara tertarget.',
    features: [
      'Tambah subscriber channel Telegram atau member grup',
      'Meningkatkan reputasi channel bisnis seketika',
      'Bisa broadcast pesan promosi massal sesuai permintaan',
      'Proses rapi, non-drop, dan bergaransi',
      'Laporan progres pengerjaan transparan'
    ],
    variants: [
      { name: '500 Member / Subscriber Telegram', price: 35000 },
      { name: '1.000 Member / Subscriber Telegram', price: 60000 },
      { name: '2.500 Member / Subscriber Telegram', price: 135000 }
    ],
    tags: ['Telegram Member', 'Broadcast Telegram', 'Jasa Telegram', 'Promosi Grup', 'Subscriber Telegram']
  },
  {
    id: 'prod-getcontact',
    name: 'Jasa Cek & Tambah Tag / Nama Kontak GetContact (GC) Instan',
    category: 'social',
    price: 5000,
    originalPrice: 15000,
    rating: 4.9,
    soldCount: 880,
    badge: 'KILAT',
    badgeType: 'cyan',
    iconType: 'tag',
    image: 'getcontact-custom.jpg',
    images: ['getcontact-custom.jpg'],
    description: 'Layanan tambah tag nama kontak GetContact (GC) untuk personal branding, bisnis, maupun keperluan profesional agar nomor telepon Anda terlihat kredibel, meyakinkan, dan terpercaya saat dicek oleh calon pelanggan.',
    features: [
      'Proses kilat hanya butuh 5 - 15 menit',
      'Bisa request kata-kata tag nama bebas sesuai keinginan',
      '100% aman dan privasi nomor telepon terjamin',
      'Tag langsung muncul dan terbaca di aplikasi GetContact',
      'Support semua nomor operator Indonesia maupun luar negeri'
    ],
    variants: [
      { name: 'Paket 3 Custom Tag Nama GC', price: 5000 },
      { name: 'Paket 7 Custom Tag Nama GC', price: 10000 },
      { name: 'Paket 15 Custom Tag Nama GC Super Lengkap', price: 20000 }
    ],
    tags: ['GetContact', 'Jasa Tag GC', 'Tambah Tag GetContact', 'Nama Kontak GC', 'Personal Branding']
  },
  {
    id: 'prod-web-polling',
    name: 'Jasa Vote / Polling Website Online & Survey Terverifikasi',
    category: 'social',
    price: 20000,
    originalPrice: 45000,
    rating: 5.0,
    soldCount: 410,
    badge: 'BERGARANSI',
    badgeType: 'blue',
    iconType: 'check-circle',
    image: 'https://cf.shopee.co.id/file/id-11134201-81ztf-mrp4l5li6juw27',
    images: ['https://cf.shopee.co.id/file/id-11134201-81ztf-mrp4l5li6juw27'],
    description: 'Layanan voting online cepat dan aman untuk polling website, survey Google Form, Strawpoll, pemilihan lomba/kompetisi, kontes media sosial, dan survei opini publik dengan IP unik Indonesia.',
    features: [
      'Menggunakan multi IP address & clean proxy unik Indonesia',
      'Lolos verifikasi captcha, cookie, dan browser fingerprinting',
      'Hasil vote masuk real-time, stabil, dan teratur',
      'Cocok untuk kompetisi, voting pemilihan figur/lomba & survey riset',
      'Kerahasiaan identitas dan tautan link dijamin 100% aman'
    ],
    variants: [
      { name: 'Paket 50 Vote / Suara Polling', price: 20000 },
      { name: 'Paket 100 Vote / Suara Polling', price: 35000 },
      { name: 'Paket 250 Vote / Suara Polling', price: 75000 },
      { name: 'Paket 500 Vote Polling Juara', price: 135000 }
    ],
    tags: ['Jasa Vote', 'Polling Website', 'Survey Online', 'Vote Lomba', 'Strawpoll Vote']
  },
  {
    id: 'prod-wattpad-views',
    name: 'Jual View Wattpad Versi Indonesia (Tingkatkan Pembaca Cerita Cepat & Aman)',
    category: 'social',
    price: 15000,
    originalPrice: 35000,
    rating: 5.0,
    soldCount: 940,
    badge: 'POPULER',
    badgeType: 'orange',
    iconType: 'book-open',
    image: 'wattpad-views.jpg',
    images: ['wattpad-views.jpg'],
    shopeeUrl: 'https://shopee.co.id/product/1173500385/45013637408/',
    description: 'Layanan jasa penambah view dan pembaca (reads) cerita Wattpad versi Indonesia nomor 1. Bantu dongkrak popularitas cerita novel Anda agar masuk jajaran trending ranking Wattpad, meningkatkan reputasi cerita, dan memikat lebih banyak pembaca organik tanpa ribet. 100% aman tanpa password akun, hanya memerlukan link/tautan cerita novel Wattpad Anda.',
    features: [
      'Real pembaca & traffic akun aktif Indonesia',
      '100% aman tanpa password (hanya butuh tautan link cerita)',
      'Meningkatkan algoritma rekomendasi & ranking cerita Wattpad',
      'Proses pengerjaan cepat dan masuk bertahap alami anti-drop',
      'Bergaransi refill jika ada penurunan (drop protection)',
      'Cocok untuk penulis baru maupun novelis yang mengejar monetisasi / penerbitan'
    ],
    variants: [
      { name: 'Paket 1.000 Views Cerita Wattpad Indonesia', price: 15000 },
      { name: 'Paket 3.000 Views Cerita Wattpad Indonesia', price: 35000 },
      { name: 'Paket 5.000 Views Cerita Wattpad Indonesia (Best Seller)', price: 55000 },
      { name: 'Paket 10.000 Views Cerita Wattpad Indonesia', price: 95000 },
      { name: 'Paket 25.000 Views Cerita Wattpad Indonesia Sultan', price: 199000 }
    ],
    tags: ['Wattpad', 'View Wattpad', 'Wattpad Indonesia', 'Jasa Wattpad', 'Pembaca Cerita', 'Trending Wattpad', 'Layanan Digital']
  },
  {
    id: 'prod-undangan-digital',
    name: 'Undangan Digital Online Bebas Revisi (Puluhan Tema Daerah, Foto & Video)',
    category: 'social',
    price: 25000,
    originalPrice: 75000,
    rating: 5.0,
    soldCount: 1280,
    badge: 'BEST SELLER',
    badgeType: 'hot',
    iconType: 'heart',
    image: 'undangan-digital.jpg',
    images: ['undangan-digital.jpg'],
    shopeeUrl: 'https://shopee.co.id/product/1173500385/46567802002/',
    description: 'Jasa pembuatan website undangan pernikahan & acara digital online kekinian yang mewah, praktis, dan hemat biaya. Bebas revisi sepuasnya sampai pas, didukung puluhan pilihan tema daerah (Jawa, Sunda, Minang, Bali, Batak, Melayu, dll) & modern minimalis, galeri foto & video, integrasi RSVP WhatsApp & ucapan, peta lokasi Google Maps, hitung mundur countdown, amplop digital cashless / QRIS, serta fitur nama tamu undangan tanpa batas (unlimited).',
    features: [
      'Bebas revisi sepuasnya sampai hasil benar-benar pas & sesuai impian',
      'Puluhan pilihan tema mewah: Adat Daerah & Modern / Rustic / Floral',
      'Galeri foto & video prewedding dengan tampilan responsif di semua HP',
      'Integrasi Buku Tamu digital, RSVP konfirmasi kehadiran WhatsApp & ucapan',
      'Navigasi rute peta lokasi acara via Google Maps interaktif',
      'Amplop digital cashless (rekening bank & QRIS) untuk kado praktis',
      'Fitur kirim undangan personal dengan nama tamu tak terbatas (unlimited tamu)',
      'Proses pengerjaan kilat dan dibantu langsung oleh admin ramah'
    ],
    variants: [
      { name: 'Paket Basic (Tema Modern + Foto + Musik + Maps)', price: 25000 },
      { name: 'Paket Premium (Bebas Tema Daerah + Foto + Video + RSVP)', price: 45000 },
      { name: 'Paket VIP Exclusive (Custom Desain Bebas Revisi + QRIS + Unlimited Tamu)', price: 65000 }
    ],
    tags: ['Undangan Digital', 'Undangan Pernikahan', 'Undangan Website', 'Tema Daerah', 'Bebas Revisi', 'Wedding Invitation', 'SL Store', 'Layanan Digital']
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'prod-salpos',
    userName: 'Rian Pratama (Owner Kedai Kopi)',
    rating: 5,
    date: '2026-08-25',
    comment: 'Aplikasi SAL POS mantap banget! Awalnya ragu karena murah dan tanpa biaya bulanan, ternyata fiturnya selengkap ini. Cetak struk bluetooth lancar jaya di printer mini saya. Sangat recommended buat UMKM!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rian'
  },
  {
    id: 'rev-2',
    productId: 'prod-salpos',
    userName: 'Siti Aminah',
    rating: 5,
    date: '2026-08-29',
    comment: 'Admin Salshya Club ramah banget dan fast respon pas diajarin cara input stok produk. Langsung jalan di toko sembako saya. Terima kasih banyak!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti'
  },
  {
    id: 'rev-3',
    productId: 'prod-photoroom',
    userName: 'Nabila Boutique',
    rating: 5,
    date: '2026-09-02',
    comment: 'PhotoRoom Pro nya asli mantep banget buat hapus background baju jualan online! Sekali klik langsung bersih rapi tanpa ribet, jualan di olshop kelihatan jauh lebih profesional.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nabila'
  },
  {
    id: 'rev-4',
    productId: 'prod-filmora',
    userName: 'Budi Santoso',
    rating: 5,
    date: '2026-09-01',
    comment: 'Filmora langsung aktif permanen, export video 4K lancar tanpa watermark sama sekali. Dikasih video panduan instalasi yang jelas banget.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi'
  },
  {
    id: 'rev-5',
    productId: 'prod-oldroll',
    userName: 'Clara Anindya',
    rating: 5,
    date: '2026-09-03',
    comment: 'Suka banget sama filter OldRoll vintage-nya! Hasil fotonya beneran aesthetic kayak kamera film analog 90an. Semua kamera ke-unlock tanpa ribet.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara'
  },
  {
    id: 'rev-6',
    productId: 'prod-followers',
    userName: 'Hendra Wijaya',
    rating: 5,
    date: '2026-09-05',
    comment: 'Order 1.000 followers TikTok buat syarat live streaming jualan baju, dalam hitungan jam langsung tembus dan aman banget tanpa minta password. Terpercaya!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hendra'
  },
  {
    id: 'rev-7',
    productId: 'prod-playstore-rating',
    userName: 'Agung Developer',
    rating: 5,
    date: '2026-09-06',
    comment: 'Review bintang 5 untuk aplikasi saya di Google Play masuk dengan rapi dari akun-akun real Indonesia. Rating aplikasi langsung naik dan unduhan organik meningkat pesat!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agung'
  },
  {
    id: 'rev-8',
    productId: 'prod-getcontact',
    userName: 'Kevin Pratama',
    rating: 5,
    date: '2026-09-07',
    comment: 'Tambah tag GetContact prosesnya beneran kilat, cuma butuh 10 menit nomor bisnis saya langsung ada tag nama profesional. Customer sekarang jadi lebih percaya transfer langsung.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin'
  },
  {
    id: 'rev-9',
    productId: 'prod-web-polling',
    userName: 'Maya Anggraini',
    rating: 5,
    date: '2026-09-08',
    comment: 'Bantu voting pemilihan lomba kampus kemarin, vote masuk stabil tanpa dicurigai bot sama sekali. Hasilnya berhasil juara 1! Terima kasih Salshya Club!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
  },
  {
    id: 'rev-10',
    productId: 'prod-tissue-box',
    userName: 'Dewi Lestari',
    rating: 5,
    date: '2026-09-09',
    comment: 'Kotak tisu kayu 3D nya beneran cakep dan estetik di meja ruang tamu. Pengerjaannya halus, packing rapi dan aman sampai Malang. Sukses selalu Salshya Club!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi'
  },
  {
    id: 'rev-11',
    productId: 'prod-wattpad-views',
    userName: 'Zahra Author (Novelis)',
    rating: 5,
    date: '2026-09-12',
    comment: 'View Wattpad Indonesia-nya beneran top markotop! Cerita novel saya yang tadinya sepi langsung naik rank dan pembaca organik mulai ramai berdatangan. Prosesnya aman tanpa minta password, recommended banget!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra'
  },
  {
    id: 'rev-12',
    productId: 'prod-undangan-digital',
    userName: 'Dimas & Anisa (Bride & Groom)',
    rating: 5,
    date: '2026-09-14',
    comment: 'Puas banget pesan undangan digital di Salshya Club! Desain temanya mewah, navigasi Google Maps akurat, dan fitur musiknya romantis. Revisi berkali-kali dilayani dengan sangat sabar dan cepat. Keluarga besar & tamu undangan banyak yang muji undangannya bagus banget!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anisa'
  }
];

// Pastikan setiap produk memiliki array images untuk dukungan multi-foto
INITIAL_PRODUCTS.forEach(p => {
  if (!p.images || !p.images.length) {
    p.images = p.image ? [p.image] : [];
  }
});

const INITIAL_SETTINGS = {
  storeName: 'Salshya_Club',
  storeTagline: 'Pusat Produk Digital, Software Lifetime & Layanan Media Sosial Terpercaya',
  shopeeUrl: 'https://shopee.co.id/salshya_club#product_list',
  whatsappNumber: '085194551311', // Default WhatsApp Salshya_Club
  adminUsername: 'admin',
  adminPassword: 'Amalia2125',
  storeLocation: 'Kab. Malang, Jawa Timur',
  storeRating: '4.9 / 5.0 (Shopee Verified)',
  welcomeMessage: 'Halo Admin Salshya Club! Saya ingin order produk berikut:',
  bankInfo: 'BCA / Mandiri / Dana / GoPay / ShopeePay / QRIS All Payment',
  announcement: '🔥 PROMO RESMI SHOPEE: Diskon s/d 70% untuk semua Software & Jasa Digital! Pesan langsung via WhatsApp 24 Jam Nonstop.',
  backgroundAnimation: 'confetti' // Default: Hujan Konfeti Pesta
};
