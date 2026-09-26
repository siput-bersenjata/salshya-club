/**
 * SALSHYA_CLUB MAIN APPLICATION LOGIC
 * Mengelola rendering produk, filter, keranjang, pemesanan WhatsApp,
 * autentikasi user, sistem rating/review, dan Dashboard Admin CMS.
 */

// Format mata uang Rupiah
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Generate representasi bintang
function renderStars(rating, max = 5) {
  let starsHtml = '';
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 1; i <= max; i++) {
    if (i <= fullStars) {
      starsHtml += `<svg class="star-icon fill-star" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i === fullStars + 1 && hasHalf) {
      starsHtml += `<svg class="star-icon half-star" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    } else {
      starsHtml += `<svg class="star-icon empty-star" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return starsHtml;
}

// Generate instant local SVG avatar (0 network request)
function getAvatarUrl(userName) {
  const initial = (userName || 'U').trim().charAt(0).toUpperCase();
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'];
  const charCode = (userName || 'U').charCodeAt(0);
  const bg = colors[charCode % colors.length];
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='20' fill='${encodeURIComponent(bg)}'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='bold' font-size='18'%3E${initial}%3C/text%3E%3C/svg%3E`;
}

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/* ==========================================================================
   APP CONTROLLER OBJECT
   ========================================================================== */
const App = {
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'popular',
  selectedDetailProduct: null,
  selectedDetailVariant: null,
  activeStarRating: 5,
  currentTheme: localStorage.getItem('salshya_theme') || 'dark',
  currentEditorImages: [],
  currentEditingProductId: null,
  adminLockoutTimer: null,

  init() {
    this.initTheme();
    this.initBackgroundAnimation();
    this.bindGlobalEvents();
    this.renderHeader();
    this.renderCategories();
    this.renderProducts();
    this.renderTestimonials();
    this.updateCartBadge();
    this.checkAdminView();
    this.checkAdminUrlHash();
  },

  /* Background Animation Initializer */
  initBackgroundAnimation() {
    const settings = Store.getSettings();
    if (window.AnimationsEngine) {
      AnimationsEngine.setMode(settings.backgroundAnimation || 'confetti', false);
    }
  },

  /* Theme Switcher (3 Mode: Terang ☀️, Gelap 🌙, Gelap AMOLED 🖤) */
  initTheme() {
    this.applyTheme(this.currentTheme, false);
  },

  toggleTheme() {
    const sequence = ['light', 'dark', 'amoled'];
    let currentIndex = sequence.indexOf(this.currentTheme);
    if (currentIndex === -1) currentIndex = 1; // default dark
    const nextIndex = (currentIndex + 1) % sequence.length;
    const nextTheme = sequence[nextIndex];
    this.applyTheme(nextTheme, true);
  },

  applyTheme(theme, notify = true) {
    if (!['light', 'dark', 'amoled'].includes(theme)) {
      theme = 'dark';
    }
    this.currentTheme = theme;
    localStorage.setItem('salshya_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const slot = document.getElementById('theme-icon-slot');
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const themeSelect = document.getElementById('set-store-theme');

    if (themeSelect && themeSelect.value !== theme) {
      themeSelect.value = theme;
    }

    let icon = '🌙';
    let title = 'Tema: Gelap (Klik untuk Gelap AMOLED)';
    let toastMsg = 'Mode Gelap diaktifkan 🌙';

    if (theme === 'light') {
      icon = '☀️';
      title = 'Tema: Terang (Klik untuk Mode Gelap)';
      toastMsg = 'Mode Terang diaktifkan ☀️';
    } else if (theme === 'amoled') {
      icon = '🖤';
      title = 'Tema: Gelap AMOLED (Klik untuk Mode Terang)';
      toastMsg = 'Mode Gelap AMOLED (Pure Black 100%) diaktifkan 🖤';
    }

    if (slot) slot.textContent = icon;
    if (toggleBtn) {
      toggleBtn.title = title;
      toggleBtn.setAttribute('aria-label', title);
    }

    if (notify) {
      showToast(toastMsg, 'success');
    }
  },

  /* Bind general events */
  bindGlobalEvents() {
    // Search input (Desktop & Mobile Sync)
    const searchInput = document.getElementById('global-search-input');
    const mobileSearch = document.getElementById('mobile-search-input');
    const clearBtn = document.getElementById('mobile-search-clear-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (mobileSearch && mobileSearch.value !== e.target.value) {
          mobileSearch.value = e.target.value;
        }
        if (clearBtn) {
          clearBtn.style.display = e.target.value ? 'inline-flex' : 'none';
        }
        this.renderProducts();
      });
    }

    if (mobileSearch) {
      mobileSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (searchInput && searchInput.value !== e.target.value) {
          searchInput.value = e.target.value;
        }
        if (clearBtn) {
          clearBtn.style.display = e.target.value ? 'inline-flex' : 'none';
        }
        this.renderProducts();
      });
    }

    // Keyboard shortcut '/' to search & 'Alt + A' / 'Ctrl + Shift + A' to open admin login
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput && searchInput.focus();
      }
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeCartDrawer();
      }
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        this.openAdminLoginModal();
      }
    });

    window.addEventListener('hashchange', () => {
      this.checkAdminUrlHash();
    });

    // Sort dropdown
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderProducts();
      });
    }

    // Floating WA button click
    const floatWa = document.getElementById('floating-wa-btn');
    if (floatWa) {
      floatWa.addEventListener('click', (e) => {
        e.preventDefault();
        this.openWhatsAppDirect('Halo Admin Salshya Club! Saya ingin konsultasi / bertanya seputar produk di toko Anda.');
      });
    }
  },

  /* Update header user info and cart */
  renderHeader() {
    const userBtn = document.getElementById('nav-user-btn');
    const currentUser = Store.getCurrentUser();
    if (userBtn) {
      if (currentUser) {
        userBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>${currentUser.name.split(' ')[0]}</span>
        `;
        userBtn.title = 'Klik untuk melihat profil / keluar';
        userBtn.onclick = () => this.openUserProfileModal();
      } else {
        userBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Masuk / Daftar</span>
        `;
        userBtn.onclick = () => this.openAuthModal('login');
      }
    }

    // Announcement text from settings
    const announcementEl = document.getElementById('header-announcement-text');
    const settings = Store.getSettings();
    if (announcementEl) {
      announcementEl.textContent = settings.announcement || '🔥 PROMO SPESIAL: Diskon s/d 70% untuk semua Software & Jasa Digital! Pesan langsung via WhatsApp 24 Jam Nonstop.';
    }
  },

  /* Render Category Pills */
  renderCategories() {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    container.innerHTML = INITIAL_CATEGORIES.map(cat => `
      <button 
        class="cat-pill-btn ${this.activeCategory === cat.id ? 'active' : ''}" 
        id="cat-btn-${cat.id}"
        onclick="App.setCategory('${cat.id}')"
      >
        <span>${cat.name}</span>
      </button>
    `).join('');
  },

  setCategory(catId) {
    this.activeCategory = catId;
    this.renderCategories();
    this.renderProducts();
  },

  resetFilters() {
    this.activeCategory = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    const mobileSearch = document.getElementById('mobile-search-input');
    if (mobileSearch) mobileSearch.value = '';
    const clearBtn = document.getElementById('mobile-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    this.renderCategories();
    this.renderProducts();
  },

  clearSearch() {
    this.searchQuery = '';
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    const mobileSearch = document.getElementById('mobile-search-input');
    if (mobileSearch) {
      mobileSearch.value = '';
      mobileSearch.focus();
    }
    const clearBtn = document.getElementById('mobile-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    this.renderProducts();
  },

  /* Filter and Sort Products */
  getFilteredProducts() {
    let list = Store.getProducts();

    // Category filter
    if (this.activeCategory !== 'all') {
      list = list.filter(p => p.category === this.activeCategory);
    }

    // Search query filter
    if (this.searchQuery) {
      const q = this.searchQuery;
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    if (this.sortBy === 'popular') {
      list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    } else if (this.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  },

  /* Render Catalog Products Grid */
  renderProducts() {
    const grid = document.getElementById('product-grid-container');
    const countInfo = document.getElementById('catalog-count-info');
    if (!grid) return;

    const products = this.getFilteredProducts();

    if (countInfo) {
      countInfo.innerHTML = `Menampilkan <span class="item-count-highlight">${products.length}</span> produk`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
          <p style="font-size: 1.2rem; font-weight: 700; margin-bottom: 8px;">Tidak ada produk yang cocok</p>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Coba kata kunci lain atau pilih kategori Semua Produk.</p>
          <button class="btn-pill btn-pill-primary" style="margin-top: 18px;" onclick="App.resetFilters()">Reset Filter</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(product => {
      const discountPercent = product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 0;

      const badgeClass = `badge-${product.badgeType || 'hot'}`;
      const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0].name : '';

      return `
        <article class="product-card" id="card-${product.id}">
          <div class="card-media-wrapper">
            <img src="${product.image}" alt="${product.name}" class="card-image" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80'" />
            ${product.badge ? `<span class="card-badge-tag ${badgeClass}">${product.badge}</span>` : ''}
            ${discountPercent > 0 ? `<span class="card-discount-tag">-${discountPercent}%</span>` : ''}
          </div>

          <div class="card-content">
            <div class="card-category-row">
              <span class="card-category-label">${this.getCategoryLabel(product.category)}</span>
              <div class="card-rating-inline">
                ${renderStars(product.rating || 5.0)}
                <span>${(product.rating || 5.0).toFixed(1)}</span>
              </div>
            </div>

            <h3 class="card-title" title="${product.name}">${product.name}</h3>
            <p class="card-description">${product.description || ''}</p>

            ${product.features && product.features.length > 0 ? `
              <div class="card-features-mini">
                <div class="card-feature-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${product.features[0]}</span>
                </div>
                ${product.features[1] ? `
                  <div class="card-feature-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>${product.features[1]}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <div class="card-pricing-block">
              <div class="pricing-left">
                ${product.originalPrice ? `<span class="price-original">${formatRupiah(product.originalPrice)}</span>` : ''}
                <span class="price-current">${formatRupiah(product.price)}</span>
              </div>
              <span class="card-sold-info">${product.soldCount || 0} terjual</span>
            </div>

            <div class="card-actions-row">
              <button 
                class="btn-order-wa" 
                id="btn-buy-wa-${product.id}"
                onclick="App.buyNowWhatsApp('${product.id}', '${encodeURIComponent(firstVariant)}')"
                title="Pesan langsung lewat WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.181-.076.355.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/></svg>
                <span>Pesan WA</span>
              </button>

              <button 
                class="btn-add-cart" 
                id="btn-cart-${product.id}"
                onclick="App.addToCartQuick('${product.id}', '${encodeURIComponent(firstVariant)}')"
                title="Masukkan ke keranjang"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </button>
            </div>

            <button 
              class="btn-view-detail" 
              id="btn-detail-${product.id}"
              onclick="App.openProductDetailModal('${product.id}')"
            >
              Lihat Detail & Ulasan &rarr;
            </button>
          </div>
        </article>
      `;
    }).join('');

    if (window.AnimationsEngine) {
      AnimationsEngine.init3DTilt();
      AnimationsEngine.initScrollAnimations();
    }
  },

  getCategoryLabel(catId) {
    const cat = INITIAL_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.name : 'Produk';
  },

  resetFilters() {
    this.activeCategory = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    this.renderCategories();
    this.renderProducts();
  },

  /* ================== ORDER PEMESANAN WHATSAPP ================== */
  openWhatsAppDirect(textMessage) {
    const settings = Store.getSettings();
    let phone = (settings.whatsappNumber || '085194551311').replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const encodedText = encodeURIComponent(textMessage);
    const waUrl = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(waUrl, '_blank');
  },

  // Tombol 1-Klik Beli Sekarang Langsung ke WA
  buyNowWhatsApp(productId, encodedVariantName) {
    const product = Store.getProductById(productId);
    if (!product) return;

    const variantName = decodeURIComponent(encodedVariantName || '');
    let finalPrice = product.price;

    if (variantName && product.variants) {
      const v = product.variants.find(item => item.name === variantName);
      if (v) finalPrice = v.price;
    }

    const settings = Store.getSettings();
    const currentUser = Store.getCurrentUser();

    // Template pesan WhatsApp
    const messageLines = [
      `*PESANAN BARU - ${settings.storeName.toUpperCase()}*`,
      `----------------------------------------`,
      `Halo Admin, saya ingin memesan produk berikut:`,
      ``,
      `📌 *Produk:* ${product.name}`,
      variantName ? `🔹 *Varian:* ${variantName}` : ``,
      `💵 *Harga:* ${formatRupiah(finalPrice)}`,
      `📦 *Jumlah:* 1 Pcs`,
      `----------------------------------------`,
      `*Total Tagihan:* ${formatRupiah(finalPrice)}`,
      `*Preferensi Pembayaran:* QRIS / Transfer Bank`,
      ``,
      currentUser ? `👤 *Nama Pemesan:* ${currentUser.name}\n📱 *No. Kontak:* ${currentUser.phone || '-'}` : `👤 *Nama Pemesan:* (Isi nama Anda di sini)\n📱 *No. Kontak:* -`,
      ``,
      `Mohon dibantu proses pesanan saya ya Admin. Terima kasih!`
    ].filter(line => line !== null);

    // Simpan ke log order internal untuk pelacakan toko
    Store.saveOrder({
      customerName: currentUser ? currentUser.name : 'Tamu Website',
      customerPhone: currentUser ? currentUser.phone : '-',
      items: [
        {
          name: product.name,
          variant: variantName || 'Standar',
          qty: 1,
          price: finalPrice
        }
      ],
      totalAmount: finalPrice,
      paymentPreference: 'QRIS / Transfer Bank'
    });

    this.openWhatsAppDirect(messageLines.join('\n'));
    showToast('Membuka WhatsApp untuk konfirmasi pesanan...', 'success');
  },

  // Checkout Multi-produk dari Keranjang
  checkoutCartWhatsApp() {
    const cart = Store.getCart();
    if (cart.length === 0) {
      showToast('Keranjang belanja Anda masih kosong!', 'error');
      return;
    }

    const nameInput = document.getElementById('checkout-buyer-name');
    const phoneInput = document.getElementById('checkout-buyer-phone');
    const notesInput = document.getElementById('checkout-buyer-notes');
    const paymentSelect = document.getElementById('checkout-payment-method');

    const buyerName = nameInput ? nameInput.value.trim() : '';
    const buyerPhone = phoneInput ? phoneInput.value.trim() : '';
    const buyerNotes = notesInput ? notesInput.value.trim() : '';
    const paymentMethod = paymentSelect ? paymentSelect.value : 'QRIS All Payment';

    if (!buyerName) {
      showToast('Mohon masukkan nama pemesan terlebih dahulu', 'error');
      if (nameInput) nameInput.focus();
      return;
    }

    const settings = Store.getSettings();
    const totalAmount = Store.getCartTotal();

    const itemsText = cart.map((item, index) => {
      const itemSubtotal = item.unitPrice * item.qty;
      return `${index + 1}. *${item.productName}*\n   Varian: ${item.variantName}\n   Qty: ${item.qty}x @ ${formatRupiah(item.unitPrice)} = ${formatRupiah(itemSubtotal)}`;
    }).join('\n\n');

    const messageLines = [
      `*PESANAN KERANJANG - ${settings.storeName.toUpperCase()}*`,
      `----------------------------------------`,
      `Halo Admin, saya ingin memesan produk berikut:`,
      ``,
      itemsText,
      `----------------------------------------`,
      `💰 *Total Pembayaran:* ${formatRupiah(totalAmount)}`,
      `💳 *Metode Pembayaran:* ${paymentMethod}`,
      ``,
      `*Data Pembeli:*`,
      `👤 Nama: ${buyerName}`,
      buyerPhone ? `📱 No. WhatsApp: ${buyerPhone}` : ``,
      buyerNotes ? `📝 Catatan: ${buyerNotes}` : ``,
      ``,
      `Mohon segera diproses dan kirimkan info pembayarannya ya Admin, terima kasih!`
    ].filter(Boolean);

    // Catat pesanan di store
    Store.saveOrder({
      customerName: buyerName,
      customerPhone: buyerPhone || '-',
      items: cart.map(i => ({
        name: i.productName,
        variant: i.variantName,
        qty: i.qty,
        price: i.unitPrice * i.qty
      })),
      totalAmount: totalAmount,
      paymentPreference: paymentMethod,
      notes: buyerNotes
    });

    // Kosongkan keranjang setelah order dikirim
    Store.clearCart();
    this.updateCartBadge();
    this.closeCartDrawer();
    this.closeAllModals();

    this.openWhatsAppDirect(messageLines.join('\n'));
    showToast('Pesanan berhasil dibuat & dialihkan ke WhatsApp!', 'success');
  },

  /* ================== KERANJANG BELANJA (CART DRAWER) ================== */
  addToCartQuick(productId, encodedVariantName) {
    const variantName = decodeURIComponent(encodedVariantName || '');
    Store.addToCart(productId, variantName, 1);
    this.updateCartBadge();
    showToast('Produk ditambahkan ke keranjang!', 'success');
    this.openCartDrawer();
  },

  updateCartBadge() {
    const badge = document.getElementById('cart-counter-badge');
    const count = Store.getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
      badge.style.transform = 'scale(1.25)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    }
  },

  openCartDrawer() {
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (backdrop) {
      backdrop.classList.add('open');
      this.renderCartItems();
    }
  },

  closeCartDrawer() {
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  },

  renderCartItems() {
    const container = document.getElementById('cart-drawer-items');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const totalEl = document.getElementById('cart-total-val');
    const footerActions = document.getElementById('cart-drawer-footer');

    if (!container) return;

    const cart = Store.getCart();
    const total = Store.getCartTotal();

    if (subtotalEl) subtotalEl.textContent = formatRupiah(total);
    if (totalEl) totalEl.textContent = formatRupiah(total);

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p style="font-weight: 700; font-size: 1.05rem;">Keranjang Anda Masih Kosong</p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Pilih software atau layanan digital favorit Anda dan klik pesan!</p>
          <button class="btn-pill btn-pill-primary" onclick="App.closeCartDrawer()">Mulai Belanja</button>
        </div>
      `;
      if (footerActions) footerActions.style.display = 'none';
      return;
    }

    if (footerActions) footerActions.style.display = 'block';

    // Autofill user details jika login
    const currentUser = Store.getCurrentUser();
    const nameInput = document.getElementById('checkout-buyer-name');
    const phoneInput = document.getElementById('checkout-buyer-phone');
    if (currentUser) {
      if (nameInput && !nameInput.value) nameInput.value = currentUser.name;
      if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone;
    }

    container.innerHTML = cart.map(item => `
      <div class="cart-item-row" id="cart-item-${encodeURIComponent(item.itemKey)}">
        <img src="${item.image}" alt="${item.productName}" class="cart-item-thumb" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80'" />
        <div class="cart-item-info">
          <span class="cart-item-title" title="${item.productName}">${item.productName}</span>
          <span class="cart-item-variant">${item.variantName}</span>
          <span class="cart-item-price">${formatRupiah(item.unitPrice)}</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <div class="cart-qty-controller">
            <button class="btn-qty" onclick="App.changeCartQty('${encodeURIComponent(item.itemKey)}', ${item.qty - 1})">-</button>
            <span class="cart-qty-num">${item.qty}</span>
            <button class="btn-qty" onclick="App.changeCartQty('${encodeURIComponent(item.itemKey)}', ${item.qty + 1})">+</button>
          </div>
          <button class="cart-item-delete" onclick="App.removeCartItem('${encodeURIComponent(item.itemKey)}')" title="Hapus item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  changeCartQty(encodedKey, newQty) {
    const key = decodeURIComponent(encodedKey);
    Store.updateCartQty(key, newQty);
    this.updateCartBadge();
    this.renderCartItems();
  },

  removeCartItem(encodedKey) {
    const key = decodeURIComponent(encodedKey);
    Store.removeFromCart(key);
    this.updateCartBadge();
    this.renderCartItems();
    showToast('Item dihapus dari keranjang', 'success');
  },

  /* ================== MODAL DETAIL PRODUK & RATING ================== */
  openProductDetailModal(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;

    this.selectedDetailProduct = product;
    this.selectedDetailVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;

    const nameEl = document.getElementById('modal-product-name');
    const catEl = document.getElementById('modal-product-cat');
    const imgEl = document.getElementById('modal-product-img');
    const descEl = document.getElementById('modal-product-desc');
    const priceEl = document.getElementById('modal-product-price');
    const origPriceEl = document.getElementById('modal-product-origprice');
    const ratingSummaryEl = document.getElementById('modal-rating-summary');
    const featuresContainer = document.getElementById('modal-features-container');
    const variantsContainer = document.getElementById('modal-variants-container');
    const shopeeLinkEl = document.getElementById('modal-shopee-link');

    if (nameEl) nameEl.textContent = product.name;
    if (catEl) catEl.textContent = this.getCategoryLabel(product.category);
    
    // Multi-image gallery in modal
    const prodImages = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);

    if (imgEl) {
      imgEl.src = prodImages[0] || product.image || '';
      imgEl.alt = product.name;
    }

    const thumbsStrip = document.getElementById('modal-thumbnails-strip');
    if (thumbsStrip) {
      if (prodImages.length > 1) {
        thumbsStrip.style.display = 'flex';
        thumbsStrip.innerHTML = prodImages.map((src, i) => `
          <div class="modal-thumb-item ${i === 0 ? 'active' : ''}" onclick="App.previewModalImage('${src}', this)">
            <img src="${src}" alt="Thumbnail ${i+1}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80'" />
          </div>
        `).join('');
      } else {
        thumbsStrip.style.display = 'none';
        thumbsStrip.innerHTML = '';
      }
    }
    if (descEl) descEl.textContent = product.description;

    const currentPrice = this.selectedDetailVariant ? this.selectedDetailVariant.price : product.price;
    if (priceEl) priceEl.textContent = formatRupiah(currentPrice);
    if (origPriceEl) {
      origPriceEl.textContent = product.originalPrice ? formatRupiah(product.originalPrice) : '';
      origPriceEl.style.display = product.originalPrice ? 'inline' : 'none';
    }

    const reviews = Store.getReviewsByProduct(productId);
    if (ratingSummaryEl) {
      ratingSummaryEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px; color: var(--accent-amber);">
          ${renderStars(product.rating || 5.0)}
          <span style="font-weight: 800; font-size: 0.95rem; margin-left: 4px;">${(product.rating || 5.0).toFixed(1)}</span>
        </div>
        <span style="color: var(--text-muted); font-size: 0.82rem;">(${reviews.length} ulasan pembeli | ${product.soldCount || 0} terjual)</span>
      `;
    }

    // Shopee Link
    if (shopeeLinkEl) {
      const settings = Store.getSettings();
      shopeeLinkEl.href = settings.shopeeUrl;
    }

    // Features list
    if (featuresContainer) {
      featuresContainer.innerHTML = (product.features || []).map(f => `
        <div class="modal-feature-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${f}</span>
        </div>
      `).join('');
    }

    // Variants chips
    if (variantsContainer) {
      if (product.variants && product.variants.length > 0) {
        variantsContainer.innerHTML = `
          <div class="form-label" style="margin-bottom: 6px;">Pilih Varian / Lisensi:</div>
          <div class="variant-chips-row">
            ${product.variants.map((v, i) => `
              <button 
                class="variant-chip ${i === 0 ? 'active' : ''}" 
                id="var-chip-${i}"
                onclick="App.selectProductVariant('${v.name}', ${v.price}, ${i})"
              >
                ${v.name} (${formatRupiah(v.price)})
              </button>
            `).join('')}
          </div>
        `;
      } else {
        variantsContainer.innerHTML = '';
      }
    }

    // Modal action buttons
    const btnBuyWa = document.getElementById('modal-btn-buy-wa');
    const btnAddCart = document.getElementById('modal-btn-add-cart');
    if (btnBuyWa) {
      btnBuyWa.onclick = () => {
        const varName = this.selectedDetailVariant ? this.selectedDetailVariant.name : '';
        this.buyNowWhatsApp(product.id, encodeURIComponent(varName));
      };
    }
    if (btnAddCart) {
      btnAddCart.onclick = () => {
        const varName = this.selectedDetailVariant ? this.selectedDetailVariant.name : '';
        this.addToCartQuick(product.id, encodeURIComponent(varName));
      };
    }

    // Render Reviews for this product
    this.renderProductReviewsList(productId);

    // Reset star picker
    this.activeStarRating = 5;
    this.updateStarPickerUI(5);

    // Autofill user name in review form if logged in
    const reviewerNameInput = document.getElementById('review-input-name');
    const currentUser = Store.getCurrentUser();
    if (reviewerNameInput && currentUser) {
      reviewerNameInput.value = currentUser.name;
    }

    modal.classList.add('open');
  },

  selectProductVariant(name, price, chipIndex) {
    this.selectedDetailVariant = { name, price };
    const priceEl = document.getElementById('modal-product-price');
    if (priceEl) priceEl.textContent = formatRupiah(price);

    document.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('active'));
    const activeChip = document.getElementById(`var-chip-${chipIndex}`);
    if (activeChip) activeChip.classList.add('active');
  },

  renderProductReviewsList(productId) {
    const listContainer = document.getElementById('modal-reviews-list');
    if (!listContainer) return;

    const reviews = Store.getReviewsByProduct(productId);
    if (reviews.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 0.88rem;">
          Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan penilaian bintang 5!
        </div>
      `;
      return;
    }

    listContainer.innerHTML = reviews.map(r => `
      <div class="review-card" style="margin-bottom: 12px; padding: 16px;">
        <div class="review-header-row">
          <img src="${r.avatar || getAvatarUrl(r.userName)}" alt="${r.userName}" class="review-avatar" style="width: 38px; height: 38px;" loading="lazy" decoding="async" />
          <div class="review-user-info">
            <span class="review-user-name">${r.userName}</span>
            <span class="review-date-str">${r.date}</span>
          </div>
          <div class="review-stars">
            ${renderStars(r.rating)}
          </div>
        </div>
        <p class="review-comment-body" style="font-size: 0.84rem;">"${r.comment}"</p>
      </div>
    `).join('');
  },

  setReviewStar(rating) {
    this.activeStarRating = rating;
    this.updateStarPickerUI(rating);
  },

  updateStarPickerUI(rating) {
    const stars = document.querySelectorAll('.star-picker-btn');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
        star.style.color = '#f59e0b';
      } else {
        star.classList.remove('active');
        star.style.color = '#475569';
      }
    });
    const label = document.getElementById('star-rating-label');
    if (label) {
      const labels = ['', '1 - Kurang Puas', '2 - Cukup', '3 - Standar', '4 - Bagus & Puas', '5 - Luar Biasa & Rekomendasi!'];
      label.textContent = labels[rating] || '';
    }
  },

  submitProductReview(e) {
    if (e) e.preventDefault();
    if (!this.selectedDetailProduct) return;

    const nameInput = document.getElementById('review-input-name');
    const commentInput = document.getElementById('review-input-comment');

    const name = nameInput ? nameInput.value.trim() : '';
    const comment = commentInput ? commentInput.value.trim() : '';

    if (!name) {
      showToast('Silakan isi nama Anda untuk memberikan ulasan', 'error');
      nameInput && nameInput.focus();
      return;
    }

    if (!comment) {
      showToast('Silakan tulis ulasan atau pengalaman Anda menggunakan produk ini', 'error');
      commentInput && commentInput.focus();
      return;
    }

    const currentUser = Store.getCurrentUser();
    const avatar = currentUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}` : null;

    Store.addReview({
      productId: this.selectedDetailProduct.id,
      userName: name,
      rating: this.activeStarRating,
      comment: comment,
      avatar: avatar
    });

    if (commentInput) commentInput.value = '';
    showToast('Terima kasih! Ulasan dan rating Anda berhasil disimpan.', 'success');

    // Re-render reviews and product rating
    this.renderProductReviewsList(this.selectedDetailProduct.id);
    this.renderProducts();
    this.renderTestimonials();

    // Update modal rating summary
    const updatedProd = Store.getProductById(this.selectedDetailProduct.id);
    const ratingSummaryEl = document.getElementById('modal-rating-summary');
    const reviews = Store.getReviewsByProduct(this.selectedDetailProduct.id);
    if (ratingSummaryEl && updatedProd) {
      ratingSummaryEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px; color: var(--accent-amber);">
          ${renderStars(updatedProd.rating || 5.0)}
          <span style="font-weight: 800; font-size: 0.95rem; margin-left: 4px;">${(updatedProd.rating || 5.0).toFixed(1)}</span>
        </div>
        <span style="color: var(--text-muted); font-size: 0.82rem;">(${reviews.length} ulasan pembeli | ${updatedProd.soldCount || 0} terjual)</span>
      `;
    }
  },

  /* ================== TESTIMONIALS SECTION ================== */
  renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    const reviews = Store.getReviews();
    const products = Store.getProducts();

    container.innerHTML = reviews.slice(0, 6).map(r => {
      const prod = products.find(p => p.id === r.productId);
      const prodName = prod ? prod.name : 'Produk Salshya Club';

      return `
        <div class="review-card">
          <div class="review-header-row">
            <img src="${r.avatar || getAvatarUrl(r.userName)}" alt="${r.userName}" class="review-avatar" loading="lazy" decoding="async" />
            <div class="review-user-info">
              <span class="review-user-name">${r.userName}</span>
              <span class="review-date-str">${r.date}</span>
            </div>
            <div class="review-stars">
              ${renderStars(r.rating)}
            </div>
          </div>
          <p class="review-comment-body">"${r.comment}"</p>
          <span class="review-product-tag">🛒 ${prodName}</span>
        </div>
      `;
    }).join('');
  },

  /* ================== USER AUTHENTICATION ================== */
  openAuthModal(defaultTab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('open');
      this.switchAuthTab(defaultTab);
      // Auto pre-fill remembered identity if available
      const identityInput = document.getElementById('login-identity');
      if (identityInput && !identityInput.value) {
        const remembered = Store.getRememberedUser();
        if (remembered) identityInput.value = remembered;
      }
      const remBox = document.getElementById('user-remember-me');
      if (remBox) remBox.checked = true;
    }
  },

  switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');

    if (tab === 'login') {
      loginForm && (loginForm.style.display = 'block');
      registerForm && (registerForm.style.display = 'none');
      tabLogin && tabLogin.classList.add('active');
      tabRegister && tabRegister.classList.remove('active');
    } else {
      loginForm && (loginForm.style.display = 'none');
      registerForm && (registerForm.style.display = 'block');
      tabLogin && tabLogin.classList.remove('active');
      tabRegister && tabRegister.classList.add('active');
    }
  },

  handleUserLogin(e) {
    if (e) e.preventDefault();
    const identityInput = document.getElementById('login-identity');
    const passInput = document.getElementById('login-password');
    const remBox = document.getElementById('user-remember-me');

    const identity = identityInput ? identityInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const rememberMe = remBox ? remBox.checked : true;

    if (!identity || !password) {
      showToast('Mohon isi email/nomor HP dan password', 'error');
      return;
    }

    try {
      const user = Store.loginUser(identity, password, rememberMe);
      const remText = rememberMe ? ' (Sesi aktif 30 hari)' : '';
      showToast(`Selamat datang kembali, ${user.name}!${remText}`, 'success');
      this.closeAllModals();
      this.renderHeader();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  handleUserRegister(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('reg-name');
    const phoneInput = document.getElementById('reg-phone');
    const emailInput = document.getElementById('reg-email');
    const passInput = document.getElementById('reg-password');
    const remBox = document.getElementById('user-reg-remember-me');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const rememberMe = remBox ? remBox.checked : true;

    if (!name || !phone || !password) {
      showToast('Nama lengkap, nomor WhatsApp, dan password wajib diisi', 'error');
      return;
    }

    try {
      const user = Store.registerUser({ name, phone, email, password, rememberMe });
      const remText = rememberMe ? ' (Sesi aktif 30 hari)' : '';
      showToast(`Akun berhasil dibuat! Selamat bergabung, ${user.name}!${remText}`, 'success');
      this.closeAllModals();
      this.renderHeader();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  openUserProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    const currentUser = Store.getCurrentUser();
    if (!currentUser) {
      this.openAuthModal('login');
      return;
    }

    const nameEl = document.getElementById('profile-name');
    const phoneEl = document.getElementById('profile-phone');
    const emailEl = document.getElementById('profile-email');
    const ordersListEl = document.getElementById('profile-orders-list');

    if (nameEl) nameEl.textContent = currentUser.name;
    if (phoneEl) phoneEl.textContent = currentUser.phone || '-';
    if (emailEl) emailEl.textContent = currentUser.email || '-';

    // Orders by this user
    const orders = Store.getOrders().filter(o => 
      o.customerPhone === currentUser.phone || o.customerName.toLowerCase() === currentUser.name.toLowerCase()
    );

    if (ordersListEl) {
      if (orders.length === 0) {
        ordersListEl.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">Belum ada riwayat pesanan.</p>`;
      } else {
        ordersListEl.innerHTML = orders.map(o => `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">
              <span>${o.id}</span>
              <span style="color: #34d399;">${formatRupiah(o.totalAmount)}</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">${o.items.map(i => `${i.name} (${i.qty}x)`).join(', ')}</p>
            <span style="font-size: 0.72rem; color: var(--text-dim);">${o.dateFormatted}</span>
          </div>
        `).join('');
      }
    }

    if (modal) modal.classList.add('open');
  },

  logoutUser() {
    Store.logoutUser();
    this.closeAllModals();
    this.renderHeader();
    showToast('Anda berhasil keluar dari akun', 'success');
  },

  /* ================== ADMIN CMS & AUTH ================== */
  openAdminLoginModal() {
    if (Store.isAdminLoggedIn()) {
      this.showAdminDashboard();
      return;
    }
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
      modal.classList.add('open');
      const userIn = document.getElementById('admin-username-input');
      if (userIn && !userIn.value) {
        userIn.value = Store.getRememberedAdmin();
      }
      const remBox = document.getElementById('admin-remember-me');
      if (remBox) remBox.checked = true;

      // Update status lockout & countdown
      this.updateAdminLockoutUI();
    }
  },

  updateAdminLockoutUI() {
    const banner = document.getElementById('admin-login-lockout-banner');
    const userIn = document.getElementById('admin-username-input');
    const passIn = document.getElementById('admin-password-input');
    const remBox = document.getElementById('admin-remember-me');
    const submitBtn = document.getElementById('admin-login-submit-btn');

    if (!banner) return;

    const status = Store.getAdminLockoutStatus();

    if (status.isLocked) {
      banner.style.display = 'block';
      banner.className = `admin-lockout-banner locked-level-${status.lockoutLevel}`;

      const digitalTime = Store.formatTimeDigital(status.remainingMs);
      const humanTime = Store.formatDuration(status.remainingMs);
      const levelTitle = status.lockoutLevel === 2 
        ? 'Akses Terkunci Hingga Besok (Gagal 5x)' 
        : 'Akses Terkunci Sementara 30 Menit (Gagal 2x)';
      
      let unlockDesc = '';
      if (status.lockoutLevel === 2) {
        const unlockDate = new Date(status.lockedUntil);
        const timeFormatted = unlockDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const dateFormatted = unlockDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        unlockDesc = `Anda telah gagal login 5 kali. Demi keamanan toko, akses admin dibatasi hingga besok (${dateFormatted}, pukul ${timeFormatted} WIB). Silakan kembali setelah waktu tunggu berakhir.`;
      } else {
        unlockDesc = `Anda telah gagal login 2 kali berturut-turut. Akses login admin dibekukan selama 30 menit demi keamanan sistem.`;
      }

      banner.innerHTML = `
        <div class="lockout-header danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>${levelTitle}</span>
        </div>
        <div class="lockout-timer-box">
          <div class="lockout-timer-display">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span id="lockout-timer-digits">${digitalTime}</span>
          </div>
          <div class="lockout-timer-human">Waktu Tunggu: ${humanTime}</div>
        </div>
        <p class="lockout-desc">${unlockDesc}</p>
      `;

      if (userIn) userIn.disabled = true;
      if (passIn) passIn.disabled = true;
      if (remBox) remBox.disabled = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>🔒 Akun Terkunci (${digitalTime})</span>`;
      }

      if (!this.adminLockoutTimer) {
        this.adminLockoutTimer = setInterval(() => {
          const freshStatus = Store.getAdminLockoutStatus();
          if (!freshStatus.isLocked) {
            this.clearAdminLockoutTimer();
            this.updateAdminLockoutUI();
            showToast('Waktu tunggu selesai! Anda dapat mencoba login kembali.', 'success');
          } else {
            const digitsEl = document.getElementById('lockout-timer-digits');
            const humanEl = banner.querySelector('.lockout-timer-human');
            const freshDigital = Store.formatTimeDigital(freshStatus.remainingMs);
            const freshHuman = Store.formatDuration(freshStatus.remainingMs);
            if (digitsEl) digitsEl.textContent = freshDigital;
            if (humanEl) humanEl.textContent = `Waktu Tunggu: ${freshHuman}`;
            if (submitBtn) submitBtn.innerHTML = `<span>🔒 Akun Terkunci (${freshDigital})</span>`;
          }
        }, 1000);
      }
    } else {
      this.clearAdminLockoutTimer();

      if (userIn) userIn.disabled = false;
      if (passIn) passIn.disabled = false;
      if (remBox) remBox.disabled = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Masuk ke Dashboard CMS</span>';
      }

      if (status.failedAttempts > 0) {
        banner.style.display = 'block';
        banner.className = 'admin-lockout-banner warning-level';

        let warnTitle = '';
        let warnMsg = '';

        if (status.failedAttempts === 1) {
          warnTitle = 'Peringatan Keamanan (1x Gagal)';
          warnMsg = 'Tersisa <strong>1 kesempatan</strong> sebelum akses login admin dikunci selama 30 menit!';
        } else if (status.failedAttempts === 2) {
          warnTitle = 'Kunci 30 Menit Telah Selesai';
          warnMsg = 'Anda dapat mencoba login kembali. Perhatian: Jika gagal mencapai 5 kali, akses akan dikunci hingga besok!';
        } else if (status.failedAttempts === 3) {
          warnTitle = 'Peringatan Keamanan (3x Gagal)';
          warnMsg = 'Tersisa <strong>2 kesempatan</strong> sebelum akses login admin dikunci hingga besok!';
        } else if (status.failedAttempts === 4) {
          warnTitle = '⚠️ PERINGATAN TERAKHIR (4x Gagal!)';
          warnMsg = 'Tersisa <strong>1 kesempatan terakhir</strong> sebelum akses admin dikunci hingga besok!';
        } else {
          warnTitle = 'Waktu Tunggu Selesai';
          warnMsg = 'Silakan masukkan username dan password admin yang benar.';
        }

        banner.innerHTML = `
          <div class="lockout-header warning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>${warnTitle}</span>
          </div>
          <p class="lockout-desc">${warnMsg}</p>
        `;
      } else {
        banner.style.display = 'none';
        banner.innerHTML = '';
      }
    }
  },

  clearAdminLockoutTimer() {
    if (this.adminLockoutTimer) {
      clearInterval(this.adminLockoutTimer);
      this.adminLockoutTimer = null;
    }
  },

  handleAdminLogin(e) {
    if (e) e.preventDefault();

    // Pastikan tidak sedang terkunci
    const lockoutStatus = Store.getAdminLockoutStatus();
    if (lockoutStatus.isLocked) {
      const waitStr = Store.formatDuration(lockoutStatus.remainingMs);
      showToast(`Akses admin sedang dikunci! Tunggu ${waitStr}.`, 'error');
      this.updateAdminLockoutUI();
      return;
    }

    const userIn = document.getElementById('admin-username-input');
    const passIn = document.getElementById('admin-password-input');
    const remBox = document.getElementById('admin-remember-me');

    const user = userIn ? userIn.value.trim() : '';
    const pass = passIn ? passIn.value : '';
    const rememberMe = remBox ? remBox.checked : true;

    try {
      Store.adminLogin(user, pass, rememberMe);
      const sessInfo = Store.getAdminSessionInfo();
      const remNotice = rememberMe ? ` (Sesi ${sessInfo.daysLeft} hari aktif)` : '';
      showToast(`Login Admin Berhasil!${remNotice} Membuka Dashboard CMS...`, 'success');
      this.clearAdminLockoutTimer();
      this.closeAllModals();
      this.checkAdminView();
      this.showAdminDashboard();
    } catch (err) {
      showToast(err.message, 'error');
      this.updateAdminLockoutUI();
      if (passIn) {
        passIn.value = '';
        if (!Store.getAdminLockoutStatus().isLocked) {
          passIn.focus();
        }
      }
    }
  },

  adminLogout() {
    Store.adminLogout();
    this.hideAdminDashboard();
    this.checkAdminView();
    showToast('Logout Admin berhasil. Sesi login telah diakhiri.', 'success');
  },

  checkAdminUrlHash() {
    if (window.location.hash === '#admin' || window.location.hash === '#login-admin') {
      if (Store.isAdminLoggedIn()) {
        this.showAdminDashboard();
      } else {
        this.openAdminLoginModal();
      }
    }
  },

  checkAdminView() {
    const adminNavBtn = document.getElementById('admin-portal-btn');
    const sessionBadge = document.getElementById('admin-session-badge');
    const sessionText = document.getElementById('admin-session-text');
    const floatingAdminBar = document.getElementById('admin-logged-in-floating-bar');

    if (Store.isAdminLoggedIn()) {
      const info = Store.getAdminSessionInfo();
      if (adminNavBtn) {
        adminNavBtn.style.display = 'inline-flex';
        adminNavBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Dashboard Toko</span>
        `;
        adminNavBtn.title = `Admin Aktif: ${info.label}`;
      }
      if (floatingAdminBar) {
        floatingAdminBar.style.display = 'flex';
      }
      if (sessionBadge && sessionText) {
        sessionBadge.style.display = 'inline-flex';
        sessionText.textContent = info.label;
      }
      if (window.location.hash === '#admin') {
        this.showAdminDashboard();
      }
    } else {
      if (adminNavBtn) {
        adminNavBtn.style.display = 'none';
      }
      if (floatingAdminBar) {
        floatingAdminBar.style.display = 'none';
      }
      if (sessionBadge) {
        sessionBadge.style.display = 'none';
      }
    }
  },

  showAdminDashboard() {
    const storefront = document.getElementById('storefront-wrapper');
    const adminPanel = document.getElementById('admin-panel-wrapper');

    if (storefront) storefront.style.display = 'none';
    if (adminPanel) {
      adminPanel.style.display = 'block';
      this.renderAdminOverview();
      this.switchAdminTab('products');
    }
    const sessionText = document.getElementById('admin-session-text');
    if (sessionText) {
      sessionText.textContent = Store.getAdminSessionInfo().label;
    }
    window.location.hash = 'admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  hideAdminDashboard() {
    const storefront = document.getElementById('storefront-wrapper');
    const adminPanel = document.getElementById('admin-panel-wrapper');

    if (adminPanel) adminPanel.style.display = 'none';
    if (storefront) storefront.style.display = 'block';
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    this.renderProducts();
    this.renderHeader();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  switchAdminTab(tab) {
    this.adminActiveTab = tab;
    document.querySelectorAll('.admin-tab-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`admin-tab-btn-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');

    const sections = ['products', 'reviews', 'orders', 'settings'];
    sections.forEach(s => {
      const el = document.getElementById(`admin-section-${s}`);
      if (el) el.style.display = s === tab ? 'block' : 'none';
    });

    if (tab === 'products') this.renderAdminProductsTable();
    if (tab === 'reviews') this.renderAdminReviewsList();
    if (tab === 'orders') this.renderAdminOrdersTable();
    if (tab === 'settings') this.renderAdminSettingsForm();
  },

  renderAdminOverview() {
    const products = Store.getProducts();
    const reviews = Store.getReviews();
    const orders = Store.getOrders();

    const elProd = document.getElementById('metric-total-products');
    const elOrders = document.getElementById('metric-total-orders');
    const elReviews = document.getElementById('metric-total-reviews');
    const elRating = document.getElementById('metric-avg-rating');

    if (elProd) elProd.textContent = products.length;
    if (elOrders) elOrders.textContent = orders.length;
    if (elReviews) elReviews.textContent = reviews.length;

    if (elRating) {
      const avg = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0';
      elRating.textContent = `${avg} ⭐`;
    }
  },

  /* Admin: Products Table */
  renderAdminProductsTable() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    const products = Store.getProducts();

    tbody.innerHTML = products.map(p => `
      <tr id="admin-row-${p.id}">
        <td>
          <div class="table-product-cell">
            <img src="${p.image}" alt="${p.name}" class="table-product-thumb" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80'" />
            <div>
              <div class="table-product-name">${p.name}</div>
              <span class="table-product-cat">${this.getCategoryLabel(p.category)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="table-price-val">${formatRupiah(p.price)}</span>
          ${p.originalPrice ? `<div style="font-size: 0.72rem; color: var(--text-dim); text-decoration: line-through;">${formatRupiah(p.originalPrice)}</div>` : ''}
        </td>
        <td>${p.variants ? p.variants.length : 1} Varian</td>
        <td>${p.soldCount || 0}</td>
        <td>⭐ ${(p.rating || 5.0).toFixed(1)}</td>
        <td>
          <div class="table-actions-cell">
            <button class="btn-table-action btn-action-edit" onclick="App.openProductEditor('${p.id}')" title="Edit Produk di Halaman Terpisah">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-table-action btn-action-delete" onclick="App.confirmDeleteProduct('${p.id}')" title="Hapus Produk">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  /* ================== DEDICATED PRODUCT EDITOR (HALAMAN TERPISAH) ================== */
  initDropzone() {
    const dropzone = document.getElementById('editor-dropzone');
    if (!dropzone || dropzone.dataset.initialized) return;
    dropzone.dataset.initialized = 'true';

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length) {
        this.handleImageFilesSelect({ target: { files } });
      }
    });
  },

  compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async handleImageFilesSelect(e) {
    const files = e.target.files;
    if (!files || !files.length) return;

    showToast(`Memproses ${files.length} foto dari file lokal...`, 'info');
    let addedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressedBase64 = await this.compressImage(file);
        this.currentEditorImages.push(compressedBase64);
        addedCount++;
      } catch (err) {
        console.error('Gagal memproses gambar lokal:', err);
      }
    }

    this.renderEditorGallery();
    if (addedCount > 0) {
      showToast(`${addedCount} foto lokal berhasil ditambahkan!`, 'success');
    }
    e.target.value = '';
  },

  addImageFromUrlInput() {
    const input = document.getElementById('editor-image-url-input');
    if (!input) return;
    const url = input.value.trim();
    if (!url) {
      showToast('Mohon masukkan tautan URL gambar', 'error');
      return;
    }
    this.currentEditorImages.push(url);
    input.value = '';
    this.renderEditorGallery();
    showToast('Tautan gambar berhasil ditambahkan ke galeri!', 'success');
  },

  setPrimaryImage(index) {
    if (index <= 0 || index >= this.currentEditorImages.length) return;
    const img = this.currentEditorImages.splice(index, 1)[0];
    this.currentEditorImages.unshift(img);
    this.renderEditorGallery();
    showToast('Foto berhasil dipindahkan menjadi Cover Utama (#1)!', 'success');
  },

  removeEditorImage(index) {
    if (index < 0 || index >= this.currentEditorImages.length) return;
    this.currentEditorImages.splice(index, 1);
    this.renderEditorGallery();
    showToast('Foto dihapus dari galeri', 'info');
  },

  renderEditorGallery() {
    const container = document.getElementById('editor-gallery-container');
    const badge = document.getElementById('editor-photo-count-badge');
    if (badge) {
      badge.textContent = `${this.currentEditorImages.length} Foto Terpilih`;
    }
    if (!container) return;

    if (this.currentEditorImages.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-muted); background: rgba(255,255,255,0.02); border: 1px dashed var(--border-subtle); border-radius: 10px;">
          Belum ada foto yang dipilih. Silakan unggah foto dari komputer/HP atau masukkan tautan URL di atas.
        </div>
      `;
      return;
    }

    container.innerHTML = this.currentEditorImages.map((imgUrl, i) => {
      const isCover = i === 0;
      return `
        <div class="gallery-thumb-card ${isCover ? 'is-cover' : ''}">
          <img src="${imgUrl}" alt="Foto ${i+1}" class="gallery-thumb-img" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80'" />
          ${isCover ? `<span class="gallery-thumb-badge">★ COVER UTAMA</span>` : `<span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.7); color: #94a3b8; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; z-index: 2;">#${i+1}</span>`}
          <div class="gallery-thumb-overlay">
            ${!isCover ? `
              <button type="button" class="gallery-btn-action gallery-btn-cover" onclick="App.setPrimaryImage(${i})" title="Pindahkan ke posisi pertama sebagai cover">
                ⭐ Jadikan Cover
              </button>
            ` : ''}
            <button type="button" class="gallery-btn-action gallery-btn-delete" onclick="App.removeEditorImage(${i})" title="Hapus foto ini">
              🗑️ Hapus
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openProductEditor(productId = null) {
    this.currentEditingProductId = productId;
    this.currentEditorImages = [];
    this.initDropzone();

    const editorView = document.getElementById('admin-product-editor-view');
    const adminPanel = document.getElementById('admin-panel-wrapper');
    const storefront = document.getElementById('storefront-wrapper');

    if (storefront) storefront.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
    if (editorView) editorView.style.display = 'block';

    const breadcrumbTitle = document.getElementById('editor-breadcrumb-title');
    const heading = document.getElementById('editor-page-heading');

    if (productId) {
      const product = Store.getProductById(productId);
      if (!product) return;

      if (breadcrumbTitle) breadcrumbTitle.textContent = `Edit: ${product.name}`;
      if (heading) heading.textContent = `Edit Rincian Produk: "${product.name}"`;

      document.getElementById('editor-product-id').value = product.id;
      document.getElementById('editor-prod-name').value = product.name;
      document.getElementById('editor-prod-category').value = product.category;
      document.getElementById('editor-prod-badge').value = product.badge || '';
      document.getElementById('editor-prod-price').value = product.price;
      document.getElementById('editor-prod-origprice').value = product.originalPrice || '';
      document.getElementById('editor-prod-rating').value = product.rating || 5.0;
      document.getElementById('editor-prod-sold').value = product.soldCount || 0;
      document.getElementById('editor-prod-desc').value = product.description || '';
      document.getElementById('editor-prod-features').value = (product.features || []).join('\n');

      const variantsText = (product.variants || []).map(v => `${v.name}:${v.price}`).join('\n');
      document.getElementById('editor-prod-variants').value = variantsText;

      // Ambil array multi-foto
      if (Array.isArray(product.images) && product.images.length > 0) {
        this.currentEditorImages = [...product.images];
      } else if (product.image) {
        this.currentEditorImages = [product.image];
      }
    } else {
      if (breadcrumbTitle) breadcrumbTitle.textContent = 'Tambah Produk Baru';
      if (heading) heading.textContent = 'Tambah Produk Baru ke Katalog';

      document.getElementById('editor-product-id').value = '';
      document.getElementById('editor-prod-name').value = '';
      document.getElementById('editor-prod-category').value = 'software';
      document.getElementById('editor-prod-badge').value = '';
      document.getElementById('editor-prod-price').value = '';
      document.getElementById('editor-prod-origprice').value = '';
      document.getElementById('editor-prod-rating').value = '5.0';
      document.getElementById('editor-prod-sold').value = '0';
      document.getElementById('editor-prod-desc').value = '';
      document.getElementById('editor-prod-features').value = '';
      document.getElementById('editor-prod-variants').value = '';
    }

    this.renderEditorGallery();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  closeProductEditor() {
    const editorView = document.getElementById('admin-product-editor-view');
    const adminPanel = document.getElementById('admin-panel-wrapper');

    if (editorView) editorView.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  handleSaveProductFromEditor() {
    const id = document.getElementById('editor-product-id').value;
    const name = document.getElementById('editor-prod-name').value.trim();
    const category = document.getElementById('editor-prod-category').value;
    const price = Number(document.getElementById('editor-prod-price').value) || 0;
    const origPrice = Number(document.getElementById('editor-prod-origprice').value) || 0;
    const badge = document.getElementById('editor-prod-badge').value.trim();
    const rating = Number(document.getElementById('editor-prod-rating').value) || 5.0;
    const soldCount = Number(document.getElementById('editor-prod-sold').value) || 0;
    const description = document.getElementById('editor-prod-desc').value.trim();
    const featuresRaw = document.getElementById('editor-prod-features').value.trim();
    const variantsRaw = document.getElementById('editor-prod-variants').value.trim();

    if (!name || !price) {
      showToast('Nama produk dan harga wajib diisi!', 'error');
      return;
    }

    const features = featuresRaw ? featuresRaw.split('\n').map(f => f.trim()).filter(Boolean) : [];

    let variants = [];
    if (variantsRaw) {
      variants = variantsRaw.split('\n').map(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          return {
            name: parts[0].trim(),
            price: Number(parts[1].trim()) || price
          };
        }
        return { name: line.trim(), price: price };
      }).filter(v => v.name);
    }

    // Ambil daftar gambar (minimal placeholder jika belum ada)
    const images = this.currentEditorImages.length > 0 
      ? [...this.currentEditorImages] 
      : ['https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80'];
    const image = images[0];

    const payload = {
      name,
      category,
      price,
      originalPrice: origPrice > price ? origPrice : null,
      badge,
      rating,
      soldCount,
      images,
      image,
      description,
      features,
      variants
    };

    if (id) {
      Store.updateProduct(id, payload);
      showToast(`Produk "${name}" berhasil diperbarui!`, 'success');
    } else {
      Store.addProduct(payload);
      showToast(`Produk "${name}" berhasil ditambahkan ke katalog!`, 'success');
    }

    this.closeProductEditor();
    this.renderAdminProductsTable();
    this.renderAdminOverview();
    this.renderProducts();
  },

  // Alias untuk kompatibilitas
  openAddProductModal() {
    this.openProductEditor(null);
  },

  openEditProductModal(productId) {
    this.openProductEditor(productId);
  },

  previewModalImage(src, el) {
    const mainImg = document.getElementById('modal-product-img');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.modal-thumb-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');
  },

  confirmDeleteProduct(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;

    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      Store.deleteProduct(productId);
      this.renderAdminProductsTable();
      this.renderAdminOverview();
      this.renderProducts();
      showToast('Produk berhasil dihapus', 'success');
    }
  },

  /* Admin: Reviews List */
  renderAdminReviewsList() {
    const container = document.getElementById('admin-reviews-container');
    if (!container) return;

    const reviews = Store.getReviews();
    const products = Store.getProducts();

    if (reviews.length === 0) {
      container.innerHTML = `<p style="padding: 24px; color: var(--text-muted);">Belum ada ulasan dari pembeli.</p>`;
      return;
    }

    container.innerHTML = reviews.map(r => {
      const prod = products.find(p => p.id === r.productId);
      const prodName = prod ? prod.name : 'Produk telah dihapus';

      return `
        <div class="admin-review-item" id="admin-rev-${r.id}">
          <div class="admin-review-info">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: #fff;">${r.userName}</span>
              <span style="font-size: 0.75rem; color: var(--text-dim);">${r.date}</span>
              <div style="display: flex; gap: 2px;">${renderStars(r.rating)}</div>
            </div>
            <p style="font-size: 0.85rem; color: #cbd5e1; margin: 4px 0;">"${r.comment}"</p>
            <span style="font-size: 0.72rem; color: var(--primary-light);">Produk: ${prodName}</span>
          </div>
          <button class="btn-table-action btn-action-delete" onclick="App.deleteReviewByAdmin('${r.id}')" title="Hapus Ulasan Ini">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;
    }).join('');
  },

  deleteReviewByAdmin(reviewId) {
    if (confirm('Hapus ulasan ini?')) {
      Store.deleteReview(reviewId);
      this.renderAdminReviewsList();
      this.renderAdminOverview();
      this.renderTestimonials();
      showToast('Ulasan berhasil dihapus', 'success');
    }
  },

  /* Admin: Orders Table */
  renderAdminOrdersTable() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    const orders = Store.getOrders();
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">Belum ada pesanan yang masuk melalui WhatsApp.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>
          <span style="font-weight: 700; color: #a5b4fc;">${o.id}</span>
          <div style="font-size: 0.72rem; color: var(--text-dim);">${o.dateFormatted}</div>
        </td>
        <td>
          <div style="font-weight: 700;">${o.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${o.customerPhone}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem;">
            ${o.items.map(i => `<div>• ${i.name} (${i.variant || 'Default'}) x${i.qty}</div>`).join('')}
          </div>
        </td>
        <td style="font-weight: 700; color: #34d399;">${formatRupiah(o.totalAmount)}</td>
        <td>
          <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; background: rgba(37,211,102,0.15); color: #34d399;">
            Dialihkan ke WhatsApp
          </span>
        </td>
      </tr>
    `).join('');
  },

  /* Admin: Settings Form */
  renderAdminSettingsForm() {
    const settings = Store.getSettings();
    document.getElementById('set-store-name').value = settings.storeName || '';
    document.getElementById('set-store-tagline').value = settings.storeTagline || '';
    document.getElementById('set-store-wa').value = settings.whatsappNumber || '';
    document.getElementById('set-store-shopee').value = settings.shopeeUrl || '';
    document.getElementById('set-store-announcement').value = settings.announcement || '';
    document.getElementById('set-store-bank').value = settings.bankInfo || '';
    document.getElementById('set-admin-pass').value = settings.adminPassword || '';

    const themeSelect = document.getElementById('set-store-theme');
    if (themeSelect) {
      themeSelect.value = this.currentTheme || 'dark';
    }

    const bgSelect = document.getElementById('set-store-bg-anim');
    if (bgSelect) {
      bgSelect.value = settings.backgroundAnimation || 'confetti';
      this.updateAdminBgAnimInfo(settings.backgroundAnimation || 'confetti');
    }
  },

  updateAdminBgAnimInfo(mode) {
    const tagEl = document.getElementById('admin-bg-active-tag');
    if (!tagEl) return;

    if (mode === 'confetti') {
      tagEl.className = 'badge-tag badge-amber';
      tagEl.textContent = 'Aktif: 🎉 Konfeti (Default)';
    } else if (mode === 'stars') {
      tagEl.className = 'badge-tag badge-cyan';
      tagEl.textContent = 'Aktif: ✨ Bintang Kosmik';
    } else if (mode === 'none') {
      tagEl.className = 'badge-tag';
      tagEl.textContent = 'Status: 🚫 Polos (Nonaktif)';
    } else {
      tagEl.className = 'badge-tag badge-amber';
      tagEl.textContent = 'Aktif: 🎉 Konfeti';
    }
  },

  handleBackgroundAnimChange(mode) {
    this.updateAdminBgAnimInfo(mode);
    if (window.AnimationsEngine) {
      AnimationsEngine.setMode(mode, false);
    }
  },

  previewBackgroundAnim() {
    const sel = document.getElementById('set-store-bg-anim');
    if (!sel) return;
    const mode = sel.value;
    if (window.AnimationsEngine) {
      AnimationsEngine.setMode(mode, false);
      const modeName = mode === 'confetti' 
        ? '🎉 Hujan Konfeti Pesta (Default)' 
        : (mode === 'stars' ? '✨ Kosmik Bintang & Meteor' : '🚫 Polos / Nonaktif');
      showToast(`Animasi latar belakang diuji: ${modeName}`, 'success');
    }
  },

  handleSaveSettings(e) {
    if (e) e.preventDefault();
    const bgSelect = document.getElementById('set-store-bg-anim');
    const bgMode = bgSelect ? bgSelect.value : 'confetti';

    const themeSelect = document.getElementById('set-store-theme');
    if (themeSelect && themeSelect.value) {
      this.applyTheme(themeSelect.value, false);
    }

    const newSettings = {
      storeName: document.getElementById('set-store-name').value.trim(),
      storeTagline: document.getElementById('set-store-tagline').value.trim(),
      whatsappNumber: document.getElementById('set-store-wa').value.trim(),
      shopeeUrl: document.getElementById('set-store-shopee').value.trim(),
      announcement: document.getElementById('set-store-announcement').value.trim(),
      bankInfo: document.getElementById('set-store-bank').value.trim(),
      adminPassword: document.getElementById('set-admin-pass').value || 'Amalia2125',
      backgroundAnimation: bgMode
    };

    Store.updateSettings(newSettings);
    if (window.AnimationsEngine) {
      AnimationsEngine.setMode(bgMode, true);
    }
    showToast('Pengaturan toko, tema & animasi background berhasil disimpan!', 'success');
    this.renderHeader();
  },

  resetStoreDemo() {
    if (confirm('Apakah Anda yakin ingin me-reset seluruh katalog produk, ulasan, dan pengaturan ke data awal bawaan Salshya Club?')) {
      Store.resetDemoData();
      showToast('Data berhasil di-reset ke pengaturan awal', 'success');
      this.hideAdminDashboard();
      this.renderProducts();
      this.renderTestimonials();
    }
  },

  /* ================== DATA BACKUP & RESTORE ACTIONS ================== */
  downloadBackupJson() {
    try {
      const data = Store.exportBackupData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `salshya-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Cadangan data berhasil diunduh sebagai file JSON!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Gagal mengunduh file cadangan: ' + e.message, 'error');
    }
  },

  handleRestoreJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (confirm(`Apakah Anda yakin ingin memulihkan data dari file "${file.name}"? Ini akan memperbarui data produk dan ulasan saat ini.`)) {
          Store.importBackupData(parsed);
          showToast('Data berhasil dipulihkan dari file cadangan!', 'success');
          this.renderProducts();
          this.renderTestimonials();
          this.renderAdminOverview();
          this.renderAdminProductsTable();
          this.renderAdminReviewsList();
          this.renderAdminOrdersTable();
          this.renderAdminSettingsForm();
        }
      } catch (err) {
        alert('File JSON tidak valid atau rusak: ' + err.message);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  },

  copyDataJsSnippet() {
    try {
      const snippet = Store.generateDataJsCode();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(snippet).then(() => {
          showToast('Kode katalog data.js disalin ke clipboard! Buka js/data.js dan paste.', 'success');
        }).catch(() => {
          this.fallbackCopyText(snippet);
        });
      } else {
        this.fallbackCopyText(snippet);
      }
    } catch (e) {
      showToast('Gagal menyalin kode: ' + e.message, 'error');
    }
  },

  fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Kode katalog data.js disalin ke clipboard!', 'success');
    } catch (e) {
      prompt('Salin kode ini secara manual:', text);
    }
    document.body.removeChild(ta);
  },

  /* ================== FIREBASE CLOUD REALTIME SYNC HANDLERS ================== */
  onProductsRemoteSync(products) {
    this.renderCategories();
    this.renderProducts();
    if (this.selectedDetailProduct) {
      const freshProd = Store.getProductById(this.selectedDetailProduct.id);
      if (freshProd) {
        this.selectedDetailProduct = freshProd;
      }
    }
    if (Store.isAdminLoggedIn()) {
      this.renderAdminProductsTable();
      this.renderAdminOverview();
    }
  },

  onSettingsRemoteSync(settings) {
    this.renderHeader();
    if (settings.backgroundAnimation && window.AnimationsEngine) {
      AnimationsEngine.setMode(settings.backgroundAnimation, false);
    }
    if (Store.isAdminLoggedIn()) {
      this.renderAdminSettingsForm();
      this.renderAdminOverview();
    }
  },

  onReviewsRemoteSync(reviews) {
    this.renderTestimonials();
    if (this.selectedDetailProduct) {
      this.renderProductReviewsList(this.selectedDetailProduct.id);
    }
    if (Store.isAdminLoggedIn()) {
      this.renderAdminReviewsList();
      this.renderAdminOverview();
    }
  },

  /* Helper to close all modals */
  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('open');
    });
    this.clearAdminLockoutTimer();
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
