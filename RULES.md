# STANDAR OPERASIONAL & PERATURAN PENGEMBANGAN SALSHYA_CLUB

Dokumen ini memuat seluruh aturan teknis, standar integritas data, dan pedoman kerja yang **WAJIB** dipatuhi dalam pengembangan dan pemeliharaan website **Salshya_Club**.

---

## 1. Aturan Sinkronisasi Real-Time (Cloud Firestore)
- **Koneksi Utama:** Menggunakan Google Cloud Firestore (Firebase Project: `salshya`) sebagai *single source of truth* untuk multi-perangkat.
- **Konsistensi Dua Arah:** Setiap perubahan data katalog (tambah, edit, hapus) di satu perangkat harus langsung tersinkron ke perangkat lain secara otomatis tanpa jeda dan tanpa perlu reload paksa.
- **Perlindungan Data:** Tidak boleh ada skenario di mana deploy ulang ke Vercel atau git commit menimpa data yang telah diperbarui atau menghapus status penghapusan produk di Firestore.

---

## 2. Aturan Integritas Produk & Status Penghapusan
- **Penghapusan Bersifat Permanen/Soft-Delete:** Produk yang telah dihapus oleh pengguna (`isDeleted: true`) **TIDAK BOLEH** dimunculkan kembali, baik di Halaman Beranda (Storefront) maupun di Dashboard Admin.
- **Daftar Produk Soft-Deleted yang Tetap Terhapus:**
  1. `prod-filmora` (Filmora Video Editor)
  2. `prod-followers` (Followers TikTok & IG)
  3. `prod-oldroll` (OldRoll Vintage Film Camera)
  4. `prod-playstore-rating` (Jasa Rating Google Play Store)
  5. `prod-tissue-box` (Kotak Tisu Seni 3D)
  6. `prod-views-likes` (Likes & FYP TikTok)
  7. `prod-ytbot` (YouTube Watch Time Booster)
- **Sinkronisasi Jumlah Produk:** Jumlah produk aktif yang ditampilkan di Beranda **HARUS SELALU SAMA** dengan jumlah produk aktif di Dashboard Admin.

---

## 3. Aturan Gambar Produk (Shopee Brand Compliance)
- **Wajib Sesuai Listing Shopee:** Setiap produk baru yang ditambahkan berdasarkan listing Shopee milik pengguna **HARUS** menggunakan gambar asli dari toko Shopee (`SL Store`). Dilarang keras menggunakan gambar placeholder atau ilustrasi generik yang tidak sesuai dengan produk toko.
- **Preservasi Gambar Kustom Pengguna:** Gambar kustom yang sudah diunggah atau dipilih pengguna untuk produk aktif tidak boleh diubah/ditimpa secara sepihak:
  - `salpos-custom.jpg` (SAL POS)
  - `getcontact-custom.jpg` (GetContact)
  - `wattpad-views.jpg` (Wattpad Views)
  - `undangan-digital.jpg` (Undangan Digital)
  - `website-custom.jpg` (Jasa Pembuatan Website)
- **Standar Format Gambar:** Semua gambar produk lokal disimpan dalam format JPEG berkualitas tinggi (minimal 900x900 px) dengan optimasi ukuran file yang cepat dimuat.

---

## 4. Aturan Informasi & Metadata Produk
- **Kelengkapan Fitur:** Setiap produk harus memiliki deskripsi yang jelas, daftar keunggulan (*features*), variasi paket harga (*variants*), rating toko (5.0), jumlah terjual, badge promo/best seller, serta tautan langsung ke produk di Shopee (`shopeeUrl`).
- **Ulasan Pembeli:** Setiap produk baru dilengkapi dengan ulasan pembeli bintang 5 yang kredibel di koleksi ulasan (`reviews`).

---

## 5. Prosedur Rilis & Deployment
1. **Pembaruan Kode:** Perbarui `INITIAL_PRODUCTS` dan `INITIAL_REVIEWS` di `js/data.js`.
2. **Sinkronisasi Cloud:** Kirim data dokumen baru ke Cloud Firestore via API REST/SDK dengan `isDeleted: false`.
3. **Commit & Push:** Simpan riwayat perubahan dengan commit message yang deskriptif dan push ke GitHub `main`.
4. **Deploy Vercel:** Jalankan deployment ke Vercel Production (`https://salshya-club.vercel.app`).
5. **Verifikasi Visual:** Lakukan uji coba tampilan langsung (toko dan admin) dan verifikasi status HTTP `200 OK` untuk seluruh aset gambar baru.
