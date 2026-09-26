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
    image: 'https://cf.shopee.co.id/file/id-11134207-7rase-m554qhfvfyxk68',
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
    id: 'prod-oldroll',
    name: 'OldRoll Vintage Film Camera FullPack Lifetime (Android/iOS)',
    category: 'software',
    price: 29000,
    originalPrice: 69000,
    rating: 4.9,
    soldCount: 970,
    badge: 'TRENDING',
    badgeType: 'purple',
    iconType: 'camera',
    image: 'https://cf.shopee.co.id/file/sg-11134201-8258v-mqa6dcgh4c8w37',
    description: 'Aplikasi kamera retro analog vintage estetik untuk smartphone. Unlock semua preset lensa dan kamera film legendaris seperti Classic M, Toy F, PR PS, CCD, Rollei, dan efek grain retro khas 90-an tanpa iklan.',
    features: [
      'Unlock semua kamera & filter retro (FullPack seumur hidup)',
      'Bebas iklan mengganggu dan bebas watermark',
      'Hasil foto langsung estetik khas kamera analog klasik',
      'Support kamera depan & belakang + flash estetik',
      'Tersedia untuk Android & iOS Apple ID',
      'Garansi aktivasi instan & tutorial pemasangan lengkap'
    ],
    variants: [
      { name: 'Android FullPack Lifetime (APK)', price: 29000 },
      { name: 'iOS Apple ID FullPack Lifetime', price: 35000 }
    ],
    tags: ['OldRoll', 'Kamera Analog', 'Aplikasi Estetik', 'Filter Retro', 'Android iOS', 'Vintage Camera']
  },
  {
    id: 'prod-filmora',
    name: 'Filmora Video Editor Lifetime Full Version (Win/Mac/Android)',
    category: 'software',
    price: 35000,
    originalPrice: 89000,
    rating: 4.9,
    soldCount: 1520,
    badge: 'POPULER',
    badgeType: 'blue',
    iconType: 'video',
    image: 'https://cf.shopee.co.id/file/sg-11134201-7rdwc-lzu8r0lvtx7m8c',
    description: 'Software video editing paling digemari konten kreator YouTube, TikTok & Reels. Full version bebas watermark selamanya, unlock semua filter sinematik, efek transisi, sound effect, dan text animation.',
    features: [
      'Bebas watermark selamanya (No Watermark 100%)',
      'Unlock ratusan efek video, transisi, dan filter premium',
      'Lifetime license (instal di PC/Laptop sekali bayar)',
      'Tersedia untuk Windows 10/11, macOS, dan Android',
      'File aman bebas virus & panduan instalasi step-by-step',
      'Garansi instalasi dipandu remote jika ada kendala'
    ],
    variants: [
      { name: 'Filmora Versi 12 (Windows 64-bit)', price: 35000 },
      { name: 'Filmora Versi 13 Terbaru (Windows 64-bit)', price: 45000 },
      { name: 'Filmora Versi Mac (Apple Silicon / Intel)', price: 49000 },
      { name: 'Filmora Android Pro APK Fullpack', price: 29000 }
    ],
    tags: ['Filmora', 'Video Editor', 'Software PC', 'Edit Video', 'Tanpa Watermark', 'Wondershare']
  },
  {
    id: 'prod-ytbot',
    name: 'YouTube Watch Time Booster & Viewer Bot (4.000 Jam Tayang)',
    category: 'software',
    price: 49000,
    originalPrice: 125000,
    rating: 4.8,
    soldCount: 430,
    badge: 'HOT TOOL',
    badgeType: 'orange',
    iconType: 'bot',
    image: 'https://cf.shopee.co.id/file/id-11134207-7ra0i-mcvlbpo3u3vbcb',
    description: 'Tools otomatisasi viewer dan jam tayang YouTube untuk mempercepat syarat 4.000 Jam Tayang monetisasi channel YouTube secara aman dengan proxy rotation dan user-agent acak.',
    features: [
      'Otomatisasi pemutaran video dengan multi-thread',
      'Mendukung custom playlist dan durasi tonton fleksibel',
      'Dilengkapi fitur rotasi proxy & user agent agar natural',
      'Membantu mengejar target 4.000 jam tayang Adsense',
      'Ringan dijalankan di PC / Laptop Windows',
      'Dilengkapi panduan optimasi agar views tidak drop'
    ],
    variants: [
      { name: 'Lisensi 1 PC (Full Tools + Tutorial)', price: 49000 },
      { name: 'Lisensi Unlimited PC + Bonus Proxy Fresh', price: 85000 }
    ],
    tags: ['YouTube Bot', 'Jam Tayang YouTube', 'Monetisasi YouTube', 'Viewer Bot', 'Tools YouTube']
  },
  {
    id: 'prod-followers',
    name: 'Jasa Tambah Followers TikTok & Instagram Bergaransi',
    category: 'social',
    price: 25000,
    originalPrice: 50000,
    rating: 5.0,
    soldCount: 3410,
    badge: 'REKOMENDASI',
    badgeType: 'green',
    iconType: 'users',
    image: 'https://cf.shopee.co.id/file/id-11134207-7rbk1-ma2ai28uznzn6d',
    description: 'Layanan suntik followers akun media sosial untuk menaikkan kredibilitas toko online, influencer, dan personal branding. 100% aman tanpa password, hanya butuh username/link akun saja.',
    features: [
      'Tanpa password akun (hanya butuh username/link profil)',
      'Proses cepat masuk bertahap secara alami',
      'Bergaransi refill (drop protection 30 hari)',
      'Akun terlihat profesional & terpercaya untuk jualan',
      'Privasi aman dan akun tetap aman dari banned'
    ],
    variants: [
      { name: '500 Followers (TikTok / IG)', price: 25000 },
      { name: '1.000 Followers (TikTok / IG) + Garansi Refill', price: 45000 },
      { name: '2.500 Followers (TikTok / IG) + Garansi Refill', price: 99000 },
      { name: '5.000 Followers (TikTok / IG) Paket Sultan', price: 180000 }
    ],
    tags: ['Followers TikTok', 'Followers Instagram', 'Jasa Sosmed', 'Suntik Followers', 'Followers Indo']
  },
  {
    id: 'prod-views-likes',
    name: 'Jasa Tambah Likes & FYP Views TikTok Instan',
    category: 'social',
    price: 15000,
    originalPrice: 35000,
    rating: 4.9,
    soldCount: 2890,
    badge: 'MURAH & CEPAT',
    badgeType: 'cyan',
    iconType: 'heart',
    image: 'https://cf.shopee.co.id/file/id-11134207-7rbkb-m9pdh6gmbpcd70',
    description: 'Tingkatkan engagement rate video TikTok Anda agar berpeluang masuk FYP (For You Page) dan viral lebih cepat. Meningkatkan skor algoritma video dan interaksi penonton.',
    features: [
      'Proses hitungan menit setelah pembayaran diverifikasi',
      'Cukup kirimkan link video TikTok (tanpa password)',
      'Membantu memancing algoritma FYP penonton organik',
      'Cocok untuk konten kreator, affiliate, dan jualan produk',
      'Aman 100% dari shadowban'
    ],
    variants: [
      { name: '5.000 Views + 200 Likes TikTok', price: 15000 },
      { name: '20.000 Views + 500 Likes TikTok', price: 35000 },
      { name: '50.000 Views + 1.200 Likes TikTok', price: 69000 },
      { name: '100.000 Views FYP Booster Super', price: 95000 }
    ],
    tags: ['Views TikTok', 'Likes TikTok', 'FYP Booster', 'Jasa TikTok', 'Viral TikTok']
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
    id: 'prod-playstore-rating',
    name: 'Jasa Download, Rating Bintang 5 & Review Google Play Store',
    category: 'social',
    price: 15000,
    originalPrice: 35000,
    rating: 5.0,
    soldCount: 520,
    badge: 'ASO BOOSTER',
    badgeType: 'green',
    iconType: 'star',
    image: 'https://cf.shopee.co.id/file/id-11134207-7ra0m-mbcrcg7r0roec4',
    description: 'Layanan optimasi rating ASO (App Store Optimization) aplikasi Google Play Store dengan ulasan positif bintang 5 dari akun real manusia aktif Indonesia untuk mendongkrak reputasi dan kepercayaan calon pengguna aplikasi Anda.',
    features: [
      'Real device & akun aktif Indonesia (bukan bot)',
      'Ulasan bintang 5 custom sesuai request kata-kata Anda',
      'Bergaransi non-drop & aman dari banned sistem Google Play',
      'Meningkatkan ranking ASO pencarian kata kunci Play Store',
      'Proses pengerjaan cepat dan bertahap secara alami'
    ],
    variants: [
      { name: 'Paket 10 Review + Rating Bintang 5', price: 15000 },
      { name: 'Paket 25 Review + Rating Bintang 5', price: 35000 },
      { name: 'Paket 50 Review + Rating Bintang 5', price: 65000 },
      { name: 'Paket 100 Review Bintang 5 Sultan', price: 120000 }
    ],
    tags: ['Review Play Store', 'Rating Bintang 5', 'Jasa ASO', 'Download Playstore', 'Review Aplikasi']
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
    image: 'https://cf.shopee.co.id/file/id-11134207-7ra0p-md51lroso0c8a5',
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
    id: 'prod-tissue-box',
    name: 'Kotak Tisu Motif Seni 3D Kayu Solid Kontemporer',
    category: 'craft',
    price: 45000,
    originalPrice: 85000,
    rating: 4.9,
    soldCount: 380,
    badge: 'HANDMADE',
    badgeType: 'orange',
    iconType: 'box',
    image: 'https://cf.shopee.co.id/file/id-11134207-8224q-mghk6fqaud5a1d',
    description: 'Produk fisik kotak tisu kayu dengan motif ukiran seni kontemporer 3D. Dibuat dengan presisi tinggi dari kayu solid pilihan, finishing halus anti-rayap pelindung melamin awet, sangat cantik memperindah meja ruang tamu, kafe, kantor, atau souvenir spesial.',
    features: [
      'Bahan kayu solid ramah lingkungan, kokoh, dan berbobot',
      'Motif relief 3D artistik modern minimalis',
      'Finishing halus pelindung melamin awet tahan lama & anti-rayap',
      'Muat untuk ukuran isi ulang tisu standar pasaran',
      'Pengemasan ekstra aman dengan bubble wrap tebal berlapis',
      'Bisa custom grafir nama / logo pesanan jumlah banyak'
    ],
    variants: [
      { name: 'Motif Kayu Natural Oak 3D', price: 45000 },
      { name: 'Motif Kayu Dark Walnut 3D', price: 49000 },
      { name: 'Custom Grafir Nama / Tulisan', price: 59000 }
    ],
    tags: ['Kotak Tisu', 'Kerajinan Kayu', 'Motif 3D', 'Dekorasi Meja', 'Produk Fisik', 'Kayu Solid']
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
