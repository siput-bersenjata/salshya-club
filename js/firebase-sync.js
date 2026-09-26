/**
 * SALSHYA_CLUB FIREBASE CLOUD REALTIME SYNC
 * Mengelola sinkronisasi real-time multi-perangkat via Google Cloud Firestore.
 * Memastikan setiap penambahan, perubahan, dan penghapusan produk, ulasan,
 * serta pengaturan toko otomatis tersinkron ke semua perangkat (HP, laptop, tablet).
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB0Gm7gWsubCfRPgQkdKbS5-pUUinJOkOc",
  authDomain: "salshya.firebaseapp.com",
  projectId: "salshya",
  storageBucket: "salshya.firebasestorage.app",
  messagingSenderId: "700945480316",
  appId: "1:700945480316:web:cfa114fcd1904b633967f9",
  measurementId: "G-2F0MX58JXK"
};

const FirebaseSync = {
  db: null,
  isInitialized: false,
  status: 'connecting', // 'connecting' | 'online' | 'offline' | 'error'
  listeners: [],
  hasInitialProductsSync: false,

  /**
   * Helper: Bersihkan objek dari nilai undefined agar tidak ditolak Firestore
   */
  cleanData(obj) {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanData(item)).filter(item => item !== undefined);
    }
    if (typeof obj === 'object') {
      const clean = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          clean[key] = this.cleanData(value);
        }
      }
      return clean;
    }
    return obj;
  },

  /**
   * Inisialisasi Firebase & Firestore
   */
  init() {
    if (this.isInitialized) return;

    if (typeof firebase === 'undefined') {
      console.warn('[FirebaseSync] Firebase SDK belum dimuat. Menggunakan penyimpanan lokal.');
      this.status = 'offline';
      this.updateStatusBadge();
      return;
    }

    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      this.db = firebase.firestore();

      // Aktifkan offline persistence jika didukung browser
      try {
        this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
          // Abaikan jika tab ganda atau browser tidak mendukung IndexedDB
          console.log('[FirebaseSync] Multi-tab/offline persistence note:', err.code);
        });
      } catch (persErr) {
        // Safe ignore
      }

      this.isInitialized = true;
      console.log('⚡ [FirebaseSync] Cloud Firestore terhubung ke proyek: salshya');

      // Mulai mendengarkan data real-time dari Firestore
      this.startRealtimeListeners();
    } catch (err) {
      console.error('[FirebaseSync] Gagal inisialisasi Firebase:', err);
      this.status = 'error';
      this.updateStatusBadge();
    }
  },

  /**
   * Mengatur status koneksi dan memperbarui badge UI
   */
  setStatus(newStatus) {
    this.status = newStatus;
    this.updateStatusBadge();
  },

  updateStatusBadge() {
    const badgeEl = document.getElementById('cloud-sync-status-badge');
    const adminBadgeEl = document.getElementById('admin-cloud-sync-badge');
    
    let text = '☁️ Cloud Sync Aktif';
    let iconClass = 'online';

    if (this.status === 'connecting') {
      text = '🔄 Menghubungkan Cloud...';
      iconClass = 'connecting';
    } else if (this.status === 'offline') {
      text = '⚠️ Mode Offline (Lokal)';
      iconClass = 'offline';
    } else if (this.status === 'error') {
      text = '⚠️ Cloud Bermasalah';
      iconClass = 'error';
    }

    if (badgeEl) {
      badgeEl.className = `cloud-sync-pill ${iconClass}`;
      badgeEl.innerHTML = `<span class="sync-dot"></span><span>${text}</span>`;
      badgeEl.title = `Status sinkronisasi multi-perangkat: ${this.status}`;
    }

    if (adminBadgeEl) {
      adminBadgeEl.className = `admin-sync-tag ${iconClass}`;
      adminBadgeEl.innerHTML = `<span class="sync-dot"></span> <b>Real-time Cloud:</b> ${text}`;
    }
  },

  /**
   * Listener Real-time untuk Sinkronisasi Otomatis Antar-Perangkat
   */
  startRealtimeListeners() {
    if (!this.db) return;

    // 1. Sinkronisasi PRODUK
    this.db.collection('products').onSnapshot(
      snapshot => {
        this.setStatus('online');
        if (snapshot.empty) {
          // Jika di Firestore masih kosong, auto-seed dari produk awal
          console.log('[FirebaseSync] Koleksi produk di Cloud kosong. Menjalankan auto-seed...');
          this.seedInitialProducts();
          return;
        }

        const remoteProducts = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (!data.isDeleted) {
            remoteProducts.push({ id: doc.id, ...data });
          }
        });

        const initialOrderMap = {};
        if (typeof INITIAL_PRODUCTS !== 'undefined' && Array.isArray(INITIAL_PRODUCTS)) {
          INITIAL_PRODUCTS.forEach((p, idx) => {
            initialOrderMap[p.id] = idx;
          });
        }

        // Urutkan produk: produk baru (createdAt) di atas, produk awal sesuai urutan katalog
        remoteProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (a.createdAt && !b.createdAt) return -1;
          if (!a.createdAt && b.createdAt) return 1;

          const orderA = initialOrderMap[a.id] !== undefined ? initialOrderMap[a.id] : 999;
          const orderB = initialOrderMap[b.id] !== undefined ? initialOrderMap[b.id] : 999;
          return orderA - orderB;
        });

        console.log(`☁️ [FirebaseSync] Menerima ${remoteProducts.length} produk dari Cloud Firestore.`);
        this.applyRemoteProducts(remoteProducts);
      },
      error => {
        console.error('[FirebaseSync] Error listener produk:', error);
        this.setStatus('offline');
      }
    );

    // 2. Sinkronisasi PENGATURAN TOKO (WhatsApp, Pengumuman, dll)
    this.db.collection('settings').doc('general').onSnapshot(
      doc => {
        if (doc.exists) {
          const settings = doc.data();
          console.log('☁️ [FirebaseSync] Menerima pembaruan pengaturan toko dari Cloud.');
          this.applyRemoteSettings(settings);
        }
      },
      error => {
        console.error('[FirebaseSync] Error listener pengaturan:', error);
      }
    );

    // 3. Sinkronisasi ULASAN & TESTIMONI
    this.db.collection('reviews').onSnapshot(
      snapshot => {
        if (!snapshot.empty) {
          const remoteReviews = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.isDeleted) {
              remoteReviews.push({ id: doc.id, ...data });
            }
          });

          // Urutkan review berdasarkan tanggal terbaru
          remoteReviews.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          console.log(`☁️ [FirebaseSync] Menerima ${remoteReviews.length} ulasan dari Cloud.`);
          this.applyRemoteReviews(remoteReviews);
        }
      },
      error => {
        console.error('[FirebaseSync] Error listener ulasan:', error);
      }
    );

    // 4. Sinkronisasi ORDER PESANAN
    this.db.collection('orders').orderBy('createdAt', 'desc').limit(100).onSnapshot(
      snapshot => {
        if (!snapshot.empty) {
          const remoteOrders = [];
          snapshot.forEach(doc => {
            remoteOrders.push({ id: doc.id, ...doc.data() });
          });
          this.applyRemoteOrders(remoteOrders);
        }
      },
      error => {
        // Orders mungkin memerlukan index khusus createdAt, fallback tangani error
        console.log('[FirebaseSync] Order listener note:', error.message);
      }
    );
  },

  /**
   * Terapkan produk dari Cloud ke LocalStorage dan Refresh Tampilan
   */
  applyRemoteProducts(products) {
    if (!Array.isArray(products)) return;

    const prodKey = (typeof Store !== 'undefined' && Store.KEYS && Store.KEYS.PRODUCTS)
      ? Store.KEYS.PRODUCTS
      : 'salshya_products_v1';

    try {
      localStorage.setItem(prodKey, JSON.stringify(products));
      localStorage.setItem('salshya_synced_with_cloud', 'true');
    } catch (e) {
      console.warn('LocalStorage save error in applyRemoteProducts', e);
    }

    // Refresh UI jika App sudah siap
    if (window.App) {
      if (typeof App.onProductsRemoteSync === 'function') {
        App.onProductsRemoteSync(products);
      } else {
        App.renderProducts();
        App.renderCategories();
        if (typeof Store !== 'undefined' && Store.isAdminLoggedIn && Store.isAdminLoggedIn()) {
          App.renderAdminProductsTable();
          App.renderAdminOverview();
        }
      }
    }
  },

  /**
   * Terapkan pengaturan toko dari Cloud ke LocalStorage dan Refresh Tampilan
   */
  applyRemoteSettings(settings) {
    if (!settings || typeof settings !== 'object') return;

    try {
      const current = Store.getSettings();
      const merged = { ...current, ...settings };
      localStorage.setItem(Store.KEYS.SETTINGS, JSON.stringify(merged));
    } catch (e) {
      console.warn('LocalStorage save error in applyRemoteSettings', e);
    }

    if (window.App) {
      if (typeof App.onSettingsRemoteSync === 'function') {
        App.onSettingsRemoteSync(settings);
      } else {
        App.renderHeader();
        if (Store.isAdminLoggedIn()) {
          App.renderAdminSettingsForm();
          App.renderAdminOverview();
        }
      }
    }
  },

  /**
   * Terapkan ulasan dari Cloud ke LocalStorage dan Refresh Tampilan
   */
  applyRemoteReviews(reviews) {
    if (!Array.isArray(reviews)) return;

    try {
      localStorage.setItem(Store.KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn('LocalStorage save error in applyRemoteReviews', e);
    }

    if (window.App) {
      if (typeof App.onReviewsRemoteSync === 'function') {
        App.onReviewsRemoteSync(reviews);
      } else {
        App.renderTestimonials();
        if (App.selectedDetailProduct) {
          App.renderProductReviewsList(App.selectedDetailProduct.id);
        }
        if (Store.isAdminLoggedIn()) {
          App.renderAdminReviewsList();
          App.renderAdminOverview();
        }
      }
    }
  },

  /**
   * Terapkan order dari Cloud ke LocalStorage
   */
  applyRemoteOrders(orders) {
    if (!Array.isArray(orders)) return;

    try {
      localStorage.setItem(Store.KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage save error in applyRemoteOrders', e);
    }

    if (window.App && Store.isAdminLoggedIn()) {
      App.renderAdminOrdersTable();
      App.renderAdminOverview();
    }
  },

  /* ================= OPERASI WRITE KE CLOUD ================= */

  /**
   * Simpan atau Perbarui Produk ke Cloud Firestore
   */
  async saveProduct(product) {
    if (!product || !product.id) return;
    if (!this.db) {
      console.warn('[FirebaseSync] Firestore belum siap, produk hanya tersimpan lokal.');
      return;
    }

    try {
      const cleanProd = this.cleanData({
        ...product,
        isDeleted: false,
        updatedAt: new Date().toISOString()
      });
      await this.db.collection('products').doc(product.id).set(cleanProd, { merge: true });
      console.log(`✅ [FirebaseSync] Produk tersimpan di Cloud: ${product.id}`);
    } catch (err) {
      console.error(`❌ [FirebaseSync] Gagal menyimpan produk ${product.id} ke Cloud:`, err);
    }
  },

  /**
   * Hapus Produk dari Cloud Firestore (Soft Delete Permanen)
   * Menggunakan isDeleted: true agar produk tidak pernah dibangkitkan kembali
   */
  async deleteProduct(productId) {
    if (!productId || !this.db) return;

    try {
      await this.db.collection('products').doc(productId).set({
        isDeleted: true,
        deletedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`🗑️ [FirebaseSync] Produk berhasil ditandai terhapus (soft delete) di Cloud: ${productId}`);
    } catch (err) {
      console.error(`❌ [FirebaseSync] Gagal menghapus produk ${productId} dari Cloud:`, err);
    }
  },

  /**
   * Simpan Pengaturan Toko ke Cloud Firestore
   */
  async saveSettings(settings) {
    if (!settings || !this.db) return;

    try {
      const cleanSettings = this.cleanData({
        ...settings,
        updatedAt: new Date().toISOString()
      });
      await this.db.collection('settings').doc('general').set(cleanSettings, { merge: true });
      console.log('✅ [FirebaseSync] Pengaturan toko berhasil disimpan ke Cloud!');
    } catch (err) {
      console.error('❌ [FirebaseSync] Gagal menyimpan pengaturan ke Cloud:', err);
    }
  },

  /**
   * Simpan Ulasan ke Cloud Firestore
   */
  async saveReview(review) {
    if (!review || !review.id || !this.db) return;

    try {
      const cleanReview = this.cleanData({
        ...review,
        isDeleted: false,
        updatedAt: new Date().toISOString()
      });
      await this.db.collection('reviews').doc(review.id).set(cleanReview, { merge: true });
      console.log(`✅ [FirebaseSync] Ulasan tersimpan di Cloud: ${review.id}`);
    } catch (err) {
      console.error(`❌ [FirebaseSync] Gagal menyimpan ulasan ${review.id} ke Cloud:`, err);
    }
  },

  /**
   * Hapus Ulasan dari Cloud Firestore (Soft Delete)
   */
  async deleteReview(reviewId) {
    if (!reviewId || !this.db) return;

    try {
      await this.db.collection('reviews').doc(reviewId).set({
        isDeleted: true,
        deletedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`🗑️ [FirebaseSync] Ulasan berhasil ditandai terhapus di Cloud: ${reviewId}`);
    } catch (err) {
      console.error(`❌ [FirebaseSync] Gagal menghapus ulasan ${reviewId} dari Cloud:`, err);
    }
  },

  /**
   * Simpan Order ke Cloud Firestore
   */
  async saveOrder(order) {
    if (!order || !order.id || !this.db) return;

    try {
      const cleanOrder = this.cleanData({
        ...order,
        updatedAt: new Date().toISOString()
      });
      await this.db.collection('orders').doc(order.id).set(cleanOrder, { merge: true });
      console.log(`✅ [FirebaseSync] Order pesanan tersimpan di Cloud: ${order.id}`);
    } catch (err) {
      console.error(`❌ [FirebaseSync] Gagal menyimpan order ke Cloud:`, err);
    }
  },

  /**
   * Auto-seed produk awal HANYA jika database Firestore kosong dan BELUM pernah diinisialisasi
   */
  async seedInitialProducts() {
    if (!this.db || typeof INITIAL_PRODUCTS === 'undefined') return;

    try {
      const existingSnap = await this.db.collection('products').limit(1).get();
      if (!existingSnap.empty) {
        console.log('[FirebaseSync] Koleksi produk sudah ada di Cloud. Skip auto-seed.');
        return;
      }

      console.log('🌱 [FirebaseSync] Memulai auto-seeding katalog ke Cloud Firestore...');
      const batch = this.db.batch();

      INITIAL_PRODUCTS.forEach(p => {
        const ref = this.db.collection('products').doc(p.id);
        batch.set(ref, this.cleanData({ ...p, isDeleted: false, createdAt: new Date().toISOString() }));
      });

      if (typeof INITIAL_SETTINGS !== 'undefined') {
        const settingsRef = this.db.collection('settings').doc('general');
        batch.set(settingsRef, this.cleanData(INITIAL_SETTINGS));
      }

      if (typeof INITIAL_REVIEWS !== 'undefined') {
        INITIAL_REVIEWS.forEach(r => {
          const revRef = this.db.collection('reviews').doc(r.id);
          batch.set(revRef, this.cleanData({ ...r, isDeleted: false, createdAt: new Date().toISOString() }));
        });
      }

      await batch.commit();
      console.log('✅ [FirebaseSync] Auto-seeding ke Cloud Firestore berhasil!');
    } catch (err) {
      console.error('❌ [FirebaseSync] Gagal auto-seeding ke Cloud:', err);
    }
  },

  /**
   * Reset data Cloud ke data awal Shopee
   */
  async resetToDefault() {
    if (!this.db) return;
    try {
      // Hapus produk lama di Firestore
      const snapshot = await this.db.collection('products').get();
      const deleteBatch = this.db.batch();
      snapshot.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();

      // Seed ulang
      await this.seedInitialProducts();
      console.log('🔄 [FirebaseSync] Reset Cloud ke default berhasil!');
    } catch (err) {
      console.error('❌ [FirebaseSync] Error reset Cloud:', err);
    }
  }
};

// Inisialisasi otomatis saat script dimuat di browser
if (typeof window !== 'undefined') {
  window.FirebaseSync = FirebaseSync;
  document.addEventListener('DOMContentLoaded', () => {
    FirebaseSync.init();
  });
}
