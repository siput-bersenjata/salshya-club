/**
 * SALSHYA_CLUB STORE MANAGEMENT
 * Mengatur LocalStorage, state reaktif, CRUD produk, autentikasi user & admin, ulasan, serta keranjang belanja.
 */

const Store = {
  // Key penyimpanan LocalStorage
  KEYS: {
    PRODUCTS: 'salshya_products_v1',
    REVIEWS: 'salshya_reviews_v1',
    SETTINGS: 'salshya_settings_v1',
    CART: 'salshya_cart_v1',
    USERS: 'salshya_users_v1',
    CURRENT_USER: 'salshya_current_user_v1',
    ADMIN_SESSION: 'salshya_admin_session_v1',
    ORDERS: 'salshya_orders_v1',
    REMEMBERED_ADMIN: 'salshya_remembered_admin_v1',
    REMEMBERED_USER: 'salshya_remembered_user_v1',
    ADMIN_LOCKOUT: 'salshya_admin_lockout_v1',
    DELETED_PRODUCTS: 'salshya_deleted_products_v1',
    DELETED_REVIEWS: 'salshya_deleted_reviews_v1'
  },

  // Durasi sesi 30 hari dalam milidetik (30 * 24 * 60 * 60 * 1000)
  SESSION_30_DAYS_MS: 2592000000,

  /* ================== BLACKLIST HAPUS (ANTI-RESURRECTION) ================== */
  getDeletedProductIds() {
    try {
      const raw = localStorage.getItem(this.KEYS.DELETED_PRODUCTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  addDeletedProductId(id) {
    if (!id) return;
    const list = this.getDeletedProductIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(this.KEYS.DELETED_PRODUCTS, JSON.stringify(list));
    }
  },

  getDeletedReviewIds() {
    try {
      const raw = localStorage.getItem(this.KEYS.DELETED_REVIEWS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  addDeletedReviewId(id) {
    if (!id) return;
    const list = this.getDeletedReviewIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(this.KEYS.DELETED_REVIEWS, JSON.stringify(list));
    }
  },

  // Inisialisasi awal jika LocalStorage masih kosong
  init() {
    // 1. Inisialisasi Produk
    let existingProducts = [];
    try {
      const raw = localStorage.getItem(this.KEYS.PRODUCTS);
      if (raw) existingProducts = JSON.parse(raw);
    } catch (e) {
      existingProducts = [];
    }

    const deletedProductIds = new Set(this.getDeletedProductIds());

    if (!Array.isArray(existingProducts) || existingProducts.length === 0) {
      // Pertama kali berkunjung: muat produk awal tapi kecualikan yang ada di daftar hapus
      const initialFiltered = INITIAL_PRODUCTS.filter(p => !deletedProductIds.has(p.id));
      localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(initialFiltered));
    } else {
      // LocalStorage sudah punya data produk pengguna:
      // JANGAN PERNAH menimpa ulang produk secara paksa dengan INITIAL_PRODUCTS!
      // Cukup pastikan produk yang sudah dihapus tidak tersisa
      const cleanProducts = existingProducts.filter(p => !deletedProductIds.has(p.id));
      if (cleanProducts.length !== existingProducts.length) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(cleanProducts));
      }
    }

    // 2. Inisialisasi Ulasan
    const deletedReviewIds = new Set(this.getDeletedReviewIds());
    let existingReviews = null;
    try {
      const rawRev = localStorage.getItem(this.KEYS.REVIEWS);
      if (rawRev) existingReviews = JSON.parse(rawRev);
    } catch (e) {
      existingReviews = null;
    }

    if (!Array.isArray(existingReviews) || existingReviews.length === 0) {
      const initialReviews = INITIAL_REVIEWS.filter(r => !deletedReviewIds.has(r.id));
      localStorage.setItem(this.KEYS.REVIEWS, JSON.stringify(initialReviews));
    } else {
      // Jangan timpa ulang ulasan yang telah dihapus
      const cleanReviews = existingReviews.filter(r => !deletedReviewIds.has(r.id));
      if (cleanReviews.length !== existingReviews.length) {
        localStorage.setItem(this.KEYS.REVIEWS, JSON.stringify(cleanReviews));
      }
    }

    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    } else {
      try {
        const curr = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
        let changed = false;
        if (curr && (!curr.shopeeUrl || curr.shopeeUrl.includes('itemId=40360364493'))) {
          curr.shopeeUrl = 'https://shopee.co.id/salshya_club#product_list';
          changed = true;
        }
        if (curr && (!curr.whatsappNumber || curr.whatsappNumber === '6281234567890')) {
          curr.whatsappNumber = '085194551311';
          changed = true;
        }
        if (curr && (!curr.backgroundAnimation || ['auto_daily', 'hacker_matrix', 'cyber_security', 'cyber_grid', 'snow', 'fireflies', 'bubbles'].includes(curr.backgroundAnimation))) {
          curr.backgroundAnimation = 'confetti';
          changed = true;
        }
        if (curr && (curr.adminPassword === 'salshya123' || !curr.adminPassword)) {
          curr.adminPassword = 'Amalia2125';
          changed = true;
        }
        if (curr && !curr.adminUsername) {
          curr.adminUsername = 'admin';
          changed = true;
        }
        if (changed) {
          localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(curr));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(this.KEYS.CART)) {
      localStorage.setItem(this.KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.USERS)) {
      // Default dummy registered user
      const defaultUsers = [
        {
          id: 'user-demo-1',
          name: 'Pelanggan Setia',
          phone: '081298765432',
          email: 'pelanggan@gmail.com',
          password: 'user123',
          createdAt: '2026-09-01'
        }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(this.KEYS.ORDERS)) {
      localStorage.setItem(this.KEYS.ORDERS, JSON.stringify([]));
    }
  },

  /* ================== PRODUK CRUD ================== */
  getProducts() {
    try {
      const data = localStorage.getItem(this.KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error('Failed to parse products', e);
      return INITIAL_PRODUCTS;
    }
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  },

  addProduct(productData) {
    const products = this.getProducts();
    const images = Array.isArray(productData.images) && productData.images.length 
      ? productData.images 
      : (productData.image ? [productData.image] : []);
    const newProduct = {
      ...productData,
      id: 'prod-' + Date.now(),
      images,
      image: images[0] || productData.image || '',
      rating: Number(productData.rating) || 5.0,
      soldCount: Number(productData.soldCount) || 0,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));

    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.saveProduct) {
      FirebaseSync.saveProduct(newProduct);
    }

    return newProduct;
  },

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      let images = updatedData.images;
      if (!images && updatedData.image) {
        images = [updatedData.image];
      } else if (!images) {
        images = products[index].images || (products[index].image ? [products[index].image] : []);
      }
      products[index] = { 
        ...products[index], 
        ...updatedData,
        images,
        image: images[0] || updatedData.image || products[index].image || '',
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));

      if (typeof FirebaseSync !== 'undefined' && FirebaseSync.saveProduct) {
        FirebaseSync.saveProduct(products[index]);
      }

      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    this.addDeletedProductId(id);
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    // Juga hapus dari cart jika ada
    this.removeProductFromCartCompletely(id);

    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.deleteProduct) {
      FirebaseSync.deleteProduct(id);
    }

    return true;
  },

  /* ================== ULASAN & RATING ================== */
  getReviews() {
    try {
      const data = localStorage.getItem(this.KEYS.REVIEWS);
      return data ? JSON.parse(data) : INITIAL_REVIEWS;
    } catch (e) {
      return INITIAL_REVIEWS;
    }
  },

  getReviewsByProduct(productId) {
    const reviews = this.getReviews();
    return reviews.filter(r => r.productId === productId);
  },

  addReview({ productId, userName, rating, comment, avatar }) {
    const reviews = this.getReviews();
    const newReview = {
      id: 'rev-' + Date.now(),
      productId,
      userName: userName.trim() || 'Pengguna Salshya',
      rating: Number(rating) || 5,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`
    };
    reviews.unshift(newReview);
    localStorage.setItem(this.KEYS.REVIEWS, JSON.stringify(reviews));

    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.saveReview) {
      FirebaseSync.saveReview(newReview);
    }

    // Update rata-rata rating produk
    this.recalculateProductRating(productId);
    return newReview;
  },

  deleteReview(reviewId) {
    this.addDeletedReviewId(reviewId);
    let reviews = this.getReviews();
    const target = reviews.find(r => r.id === reviewId);
    if (target) {
      reviews = reviews.filter(r => r.id !== reviewId);
      localStorage.setItem(this.KEYS.REVIEWS, JSON.stringify(reviews));

      if (typeof FirebaseSync !== 'undefined' && FirebaseSync.deleteReview) {
        FirebaseSync.deleteReview(reviewId);
      }

      this.recalculateProductRating(target.productId);
      return true;
    }
    return false;
  },

  recalculateProductRating(productId) {
    const reviews = this.getReviewsByProduct(productId);
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const roundedAvg = Math.round(avg * 10) / 10;
      this.updateProduct(productId, { rating: roundedAvg });
    }
  },

  /* ================== PENGATURAN TOKO ================== */
  getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? { ...INITIAL_SETTINGS, ...JSON.parse(data) } : INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));

    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.saveSettings) {
      FirebaseSync.saveSettings(updated);
    }

    return updated;
  },

  /* ================== KERANJANG BELANJA (CART) ================== */
  getCart() {
    try {
      const data = localStorage.getItem(this.KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
  },

  addToCart(productId, variantName, qty = 1) {
    const product = this.getProductById(productId);
    if (!product) return false;

    let cart = this.getCart();
    let selectedPrice = product.price;

    if (variantName && product.variants) {
      const variantObj = product.variants.find(v => v.name === variantName);
      if (variantObj) selectedPrice = variantObj.price;
    } else if (product.variants && product.variants.length > 0) {
      variantName = product.variants[0].name;
      selectedPrice = product.variants[0].price;
    }

    const itemKey = `${productId}__${variantName || 'default'}`;
    const existingIndex = cart.findIndex(item => item.itemKey === itemKey);

    if (existingIndex !== -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        itemKey,
        productId,
        productName: product.name,
        category: product.category,
        image: product.image,
        variantName: variantName || 'Standar',
        unitPrice: selectedPrice,
        qty: qty
      });
    }

    this.saveCart(cart);
    return true;
  },

  updateCartQty(itemKey, qty) {
    let cart = this.getCart();
    const index = cart.findIndex(item => item.itemKey === itemKey);
    if (index !== -1) {
      if (qty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].qty = qty;
      }
      this.saveCart(cart);
    }
  },

  removeFromCart(itemKey) {
    let cart = this.getCart();
    cart = cart.filter(item => item.itemKey !== itemKey);
    this.saveCart(cart);
  },

  removeProductFromCartCompletely(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.productId !== productId);
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.qty, 0);
  },

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.unitPrice * item.qty), 0);
  },

  /* ================== AUTENTIKASI PENGGUNA (USER) ================== */
  getUsers() {
    try {
      const data = localStorage.getItem(this.KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getCurrentUser() {
    // 1. Cek sessionStorage (sesi sementara)
    try {
      const sess = sessionStorage.getItem(this.KEYS.CURRENT_USER);
      if (sess) return JSON.parse(sess);
    } catch (e) {}

    // 2. Cek localStorage (sesi persisten 30 hari)
    try {
      const data = localStorage.getItem(this.KEYS.CURRENT_USER);
      if (!data) return null;
      const user = JSON.parse(data);
      if (user) {
        // Cek masa kadaluarsa 30 hari
        if (user.expiresAt && Date.now() > user.expiresAt) {
          this.logoutUser();
          return null;
        }
        return user;
      }
    } catch (e) {
      return null;
    }
    return null;
  },

  registerUser({ name, phone, email, password, rememberMe = true }) {
    const users = this.getUsers();
    // Validasi apakah email / phone sudah terdaftar
    const exists = users.find(u => 
      (email && u.email && u.email.toLowerCase() === email.toLowerCase()) ||
      (phone && u.phone && u.phone === phone)
    );

    if (exists) {
      throw new Error('Email atau nomor WhatsApp ini sudah terdaftar. Silakan login.');
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      password: password,
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));

    // Otomatis login setelah registrasi
    const sessionData = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      rememberMe: !!rememberMe,
      expiresAt: rememberMe ? (Date.now() + this.SESSION_30_DAYS_MS) : null,
      loginAt: Date.now()
    };

    if (rememberMe) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(sessionData));
      localStorage.setItem(this.KEYS.REMEMBERED_USER, email || phone || newUser.name);
      try { sessionStorage.removeItem(this.KEYS.CURRENT_USER); } catch (e) {}
    } else {
      try { sessionStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(sessionData)); } catch (e) {}
      localStorage.removeItem(this.KEYS.CURRENT_USER);
    }
    return sessionData;
  },

  loginUser(identity, password, rememberMe = true) {
    const users = this.getUsers();
    const user = users.find(u => 
      (u.email && u.email.toLowerCase() === identity.toLowerCase() && u.password === password) ||
      (u.phone && u.phone === identity && u.password === password) ||
      (u.name.toLowerCase() === identity.toLowerCase() && u.password === password)
    );

    if (!user) {
      throw new Error('Username/Email/No. HP atau Password salah!');
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      rememberMe: !!rememberMe,
      expiresAt: rememberMe ? (Date.now() + this.SESSION_30_DAYS_MS) : null,
      loginAt: Date.now()
    };

    if (rememberMe) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(sessionData));
      localStorage.setItem(this.KEYS.REMEMBERED_USER, identity);
      try { sessionStorage.removeItem(this.KEYS.CURRENT_USER); } catch (e) {}
    } else {
      try { sessionStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(sessionData)); } catch (e) {}
      localStorage.removeItem(this.KEYS.CURRENT_USER);
    }
    return sessionData;
  },

  logoutUser() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
    try { sessionStorage.removeItem(this.KEYS.CURRENT_USER); } catch (e) {}
  },

  /* ================== AUTENTIKASI ADMIN ================== */
  isAdminLoggedIn() {
    // 1. Cek sessionStorage (sesi sementara browser)
    try {
      const sess = sessionStorage.getItem(this.KEYS.ADMIN_SESSION);
      if (sess === 'true') return true;
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed && parsed.loggedIn) return true;
      }
    } catch (e) {}

    // 2. Cek localStorage (sesi persisten 30 hari dengan Remember Me)
    try {
      const raw = localStorage.getItem(this.KEYS.ADMIN_SESSION);
      if (!raw) return false;

      // Kompatibilitas jika sebelumnya disimpan string 'true'
      if (raw === 'true') {
        const upgraded = {
          loggedIn: true,
          rememberMe: true,
          expiresAt: Date.now() + this.SESSION_30_DAYS_MS,
          loginAt: Date.now(),
          username: 'admin'
        };
        localStorage.setItem(this.KEYS.ADMIN_SESSION, JSON.stringify(upgraded));
        return true;
      }

      const session = JSON.parse(raw);
      if (session && session.loggedIn) {
        // Periksa apakah masa aktif 30 hari sudah lewat
        if (session.expiresAt && Date.now() > session.expiresAt) {
          this.adminLogout();
          return false;
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  },

  /* ================== PROGRESSIVE LOCKOUT SYSTEM ADMIN ================== */
  /**
   * Aturan Progressive Lockout:
   * - Gagal 2 kali: Kunci selama 30 menit
   * - Gagal 5 kali: Kunci hingga besok lagi (24 jam)
   */
  getAdminLockoutStatus() {
    try {
      const raw = localStorage.getItem(this.KEYS.ADMIN_LOCKOUT);
      if (!raw) {
        return { isLocked: false, remainingMs: 0, failedAttempts: 0, lockoutLevel: 0, lockedUntil: null };
      }
      const data = JSON.parse(raw);
      const now = Date.now();
      const failedAttempts = Number(data.failedAttempts) || 0;
      const lockedUntil = data.lockedUntil ? Number(data.lockedUntil) : null;
      const lockoutLevel = Number(data.lockoutLevel) || 0;

      if (lockedUntil && lockedUntil > now) {
        return {
          isLocked: true,
          remainingMs: lockedUntil - now,
          failedAttempts,
          lockoutLevel: lockoutLevel || (failedAttempts >= 5 ? 2 : 1),
          lockedUntil
        };
      }

      // Waktu kunci sudah berakhir
      return {
        isLocked: false,
        remainingMs: 0,
        failedAttempts,
        lockoutLevel: 0,
        lockedUntil: null
      };
    } catch (e) {
      return { isLocked: false, remainingMs: 0, failedAttempts: 0, lockoutLevel: 0, lockedUntil: null };
    }
  },

  recordAdminLoginFailure() {
    const raw = localStorage.getItem(this.KEYS.ADMIN_LOCKOUT);
    let data = { failedAttempts: 0, lockedUntil: null, lockoutLevel: 0, lastFailedAt: 0 };
    if (raw) {
      try {
        data = { ...data, ...JSON.parse(raw) };
      } catch (e) {}
    }

    const currentAttempts = (Number(data.failedAttempts) || 0) + 1;
    data.failedAttempts = currentAttempts;
    data.lastFailedAt = Date.now();

    const now = Date.now();
    if (currentAttempts >= 5) {
      // Gagal 5x atau lebih: Kunci hingga besok lagi (24 jam)
      data.lockoutLevel = 2;
      data.lockedUntil = now + (24 * 60 * 60 * 1000);
    } else if (currentAttempts === 2) {
      // Gagal 2x: Kunci selama 30 menit
      data.lockoutLevel = 1;
      data.lockedUntil = now + (30 * 60 * 1000);
    } else {
      data.lockoutLevel = 0;
      data.lockedUntil = null;
    }

    localStorage.setItem(this.KEYS.ADMIN_LOCKOUT, JSON.stringify(data));
    return this.getAdminLockoutStatus();
  },

  resetAdminLockout() {
    localStorage.removeItem(this.KEYS.ADMIN_LOCKOUT);
  },

  formatDuration(ms) {
    if (ms <= 0) return '0 detik';
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`);
    return parts.join(' ');
  },

  formatTimeDigital(ms) {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  },

  adminLogin(username, password, rememberMe = true) {
    // 1. Validasi status lockout terlebih dahulu
    const lockout = this.getAdminLockoutStatus();
    if (lockout.isLocked) {
      const waitStr = this.formatDuration(lockout.remainingMs);
      const levelNotice = lockout.lockoutLevel === 2 ? 'hingga besok lagi' : 'selama 30 menit';
      throw new Error(`Akses login admin sedang dikunci ${levelNotice}! Silakan tunggu ${waitStr} sebelum mencoba kembali.`);
    }

    const settings = this.getSettings();
    if (username === settings.adminUsername && password === settings.adminPassword) {
      // Berhasil login: bersihkan riwayat kegagalan dan status lockout
      this.resetAdminLockout();

      const sessionData = {
        loggedIn: true,
        rememberMe: !!rememberMe,
        expiresAt: rememberMe ? (Date.now() + this.SESSION_30_DAYS_MS) : null,
        loginAt: Date.now(),
        username: username
      };

      if (rememberMe) {
        localStorage.setItem(this.KEYS.ADMIN_SESSION, JSON.stringify(sessionData));
        localStorage.setItem(this.KEYS.REMEMBERED_ADMIN, username);
        try { sessionStorage.removeItem(this.KEYS.ADMIN_SESSION); } catch (e) {}
      } else {
        try { sessionStorage.setItem(this.KEYS.ADMIN_SESSION, JSON.stringify(sessionData)); } catch (e) {}
        localStorage.removeItem(this.KEYS.ADMIN_SESSION);
      }
      return true;
    }

    // Jika salah: rekam kegagalan login
    const failResult = this.recordAdminLoginFailure();
    if (failResult.isLocked) {
      const waitStr = this.formatDuration(failResult.remainingMs);
      if (failResult.lockoutLevel === 2) {
        throw new Error(`Gagal login 5 kali! Akses admin dikunci hingga besok lagi (${waitStr}).`);
      } else {
        throw new Error(`Gagal login 2 kali! Akses admin dikunci selama 30 menit (${waitStr}).`);
      }
    } else {
      if (failResult.failedAttempts === 1) {
        throw new Error('Username atau Password Admin salah! (Gagal 1x. Peringatan: Gagal 2x akan dikunci 30 menit)');
      } else if (failResult.failedAttempts === 3) {
        throw new Error('Username atau Password Admin salah! (Gagal 3x. Tersisa 2x kesempatan sebelum dikunci hingga besok)');
      } else if (failResult.failedAttempts === 4) {
        throw new Error('Username atau Password Admin salah! (Gagal 4x. PERINGATAN TERAKHIR: 1x lagi akan dikunci hingga besok!)');
      } else {
        throw new Error(`Username atau Password Admin salah! (Percobaan gagal: ${failResult.failedAttempts}x)`);
      }
    }
  },

  adminLogout() {
    localStorage.removeItem(this.KEYS.ADMIN_SESSION);
    try { sessionStorage.removeItem(this.KEYS.ADMIN_SESSION); } catch (e) {}
  },

  getAdminSessionInfo() {
    try {
      const raw = localStorage.getItem(this.KEYS.ADMIN_SESSION);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.expiresAt) {
          const daysLeft = Math.max(1, Math.ceil((parsed.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
          return {
            rememberMe: true,
            daysLeft,
            label: `Sesi 30 Hari Aktif (${daysLeft} hari lagi)`
          };
        }
      }
      const sess = sessionStorage.getItem(this.KEYS.ADMIN_SESSION);
      if (sess) {
        return {
          rememberMe: false,
          daysLeft: 0,
          label: 'Sesi Sesaat (Non-Persistent)'
        };
      }
    } catch (e) {}
    return {
      rememberMe: false,
      daysLeft: 0,
      label: 'Belum Login'
    };
  },

  getRememberedAdmin() {
    return localStorage.getItem(this.KEYS.REMEMBERED_ADMIN) || 'admin';
  },

  getRememberedUser() {
    return localStorage.getItem(this.KEYS.REMEMBERED_USER) || '';
  },

  /* ================== RIWAYAT PESANAN ================== */
  getOrders() {
    try {
      const data = localStorage.getItem(this.KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveOrder(order) {
    const orders = this.getOrders();
    const newOrder = {
      ...order,
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      dateFormatted: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
    };
    orders.unshift(newOrder);
    localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));

    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.saveOrder) {
      FirebaseSync.saveOrder(newOrder);
    }

    return newOrder;
  },

  /* ================== RESET DEMO DATA ================== */
  resetDemoData() {
    localStorage.removeItem(this.KEYS.DELETED_PRODUCTS);
    localStorage.removeItem(this.KEYS.DELETED_REVIEWS);
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(this.KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(this.KEYS.CART, JSON.stringify([]));
    localStorage.removeItem(this.KEYS.ADMIN_SESSION);

    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.resetToDefault) {
      FirebaseSync.resetToDefault();
    }
  },

  /* ================== BACKUP, RESTORE & EXPORT ================== */
  exportBackupData() {
    return {
      version: '1.0',
      appName: 'Salshya_Club',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      reviews: this.getReviews(),
      settings: this.getSettings(),
      orders: this.getOrders(),
      deletedProductIds: this.getDeletedProductIds(),
      deletedReviewIds: this.getDeletedReviewIds()
    };
  },

  importBackupData(backupData) {
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Format file cadangan (backup) tidak valid.');
    }
    if (!Array.isArray(backupData.products)) {
      throw new Error('File backup harus memiliki daftar produk.');
    }

    // Simpan produk
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(backupData.products));

    // Simpan ulasan jika ada
    if (Array.isArray(backupData.reviews)) {
      localStorage.setItem(this.KEYS.REVIEWS, JSON.stringify(backupData.reviews));
    }

    // Simpan pengaturan jika ada
    if (backupData.settings && typeof backupData.settings === 'object') {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(backupData.settings));
    }

    // Simpan riwayat pesanan jika ada
    if (Array.isArray(backupData.orders)) {
      localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(backupData.orders));
    }

    // Simpan daftar item yang pernah dihapus
    if (Array.isArray(backupData.deletedProductIds)) {
      localStorage.setItem(this.KEYS.DELETED_PRODUCTS, JSON.stringify(backupData.deletedProductIds));
    }
    if (Array.isArray(backupData.deletedReviewIds)) {
      localStorage.setItem(this.KEYS.DELETED_REVIEWS, JSON.stringify(backupData.deletedReviewIds));
    }

    return true;
  },

  generateDataJsCode() {
    const products = this.getProducts();
    const jsonStr = JSON.stringify(products, null, 2);
    return `// Salin dan ganti variabel INITIAL_PRODUCTS di file js/data.js dengan kode berikut:\nconst INITIAL_PRODUCTS = ${jsonStr};`;
  }
};

// Inisialisasi store saat file dimuat
Store.init();
