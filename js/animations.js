/**
 * SALSHYA_CLUB ADVANCED ANIMATION ENGINE v3.0
 * 1. Mode Background Partikel Halus & Elegan:
 *    - Hujan Konfeti Pesta (Default Toko - Ceria, Berwarna-warni, Pita Berputar)
 *    - Kosmik Bintang & Meteor (Bintang Berkelap-kelip & Komet Melintas)
 *    - Polos / Nonaktifkan (Tampilan Bersih & Minimalis)
 * 2. Interaksi Mouse (Wind physics, Click burst, Mouse trail, 3D card tilt)
 * 3. Animasi Scroll ke Atas & Bawah (Scroll-driven reveal, Parallax wind reaction)
 */

(function () {
  'use strict';

  /* ==========================================================================
     DAFTAR MODE ANIMASI RESMI TOKO
     ========================================================================== */
  const AVAILABLE_MODES = [
    { id: 'confetti', name: 'Hujan Konfeti Pesta', icon: '🎉', desc: 'Warna-warni ceria & pita berputar jatuh (Default Toko)' },
    { id: 'stars', name: 'Kosmik Bintang & Meteor', icon: '✨', desc: 'Bintang berkelap-kelip & komet melintas di langit malam' },
    { id: 'none', name: 'Tanpa Animasi (Polos)', icon: '🚫', desc: 'Nonaktifkan partikel untuk tampilan minimalis' }
  ];

  /* ==========================================================================
     CANVAS & SETUP
     ========================================================================== */
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.prepend(canvas);
  }
  canvas.className = 'bg-animation-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.9';

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    reinitCurrentModeParticles();
  });

  // State mouse global
  const mouse = {
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    lastX: -1000,
    lastY: -1000,
    isHovering: false
  };

  // Scroll velocity untuk reaksi paralaks angin
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = (currentScrollY - lastScrollY) * 0.4;
    lastScrollY = currentScrollY;
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.vx = (mouse.x - mouse.lastX) * 0.25;
    mouse.vy = (mouse.y - mouse.lastY) * 0.25;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.isHovering = true;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.vx = 0;
    mouse.vy = 0;
    mouse.isHovering = false;
  });

  /* ==========================================================================
     SISTEM PARTIKEL ANIMASI & DEFINISI KELAS
     ========================================================================== */
  let currentSettingMode = 'confetti';
  let activeRenderMode = 'confetti';
  let particles = [];
  let burstParticles = [];
  let meteors = [];

  /* --- 1. Mode Confetti (Hujan Konfeti Pesta - Default) --- */
  const CONFETTI_COLORS = [
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
    '#06b6d4', '#10b981', '#f59e0b', '#3b82f6', '#fbbf24'
  ];

  class ConfettiPiece {
    constructor(isBurst = false, burstX = 0, burstY = 0) {
      this.isBurst = isBurst;
      if (isBurst) {
        this.x = burstX;
        this.y = burstY;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
      } else {
        this.reset();
        this.y = Math.random() * height;
      }
      this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      this.width = Math.random() * 8 + 6;
      this.height = Math.random() * 5 + 4;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.tilt = Math.random() * 360;
      this.tiltSpeed = Math.random() * 0.1 + 0.05;
      this.shape = Math.random() > 0.4 ? 'rect' : 'ribbon';
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -60 - 20;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = Math.random() * 2.2 + 1.2;
      this.alpha = Math.random() * 0.35 + 0.65;
    }

    update() {
      this.rotation += this.rotationSpeed;
      this.tilt += this.tiltSpeed;

      // Reaksi kecepatan scroll (paralaks angin)
      this.y += this.vy + (scrollVelocity * 0.15);
      this.x += this.vx + Math.sin(this.tilt) * 1.2;

      // Interaksi hembusan angin kursor mouse
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140 && dist > 0) {
        const force = (1 - dist / 140) * 4.5;
        this.x += (dx / dist) * force + mouse.vx * 0.3;
        this.y += (dy / dist) * force + mouse.vy * 0.3;
      }

      if (this.isBurst) {
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.vy += 0.25; // gravitasi
        this.alpha -= this.decay;
      } else {
        // Daur ulang jatuh dari atas
        if (this.y > height + 30) {
          this.reset();
        }
        if (this.x < -30) this.x = width + 30;
        if (this.x > width + 30) this.x = -30;
      }
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.scale(Math.cos((this.tilt * Math.PI) / 180), 1);
      ctx.fillStyle = this.color;
      if (this.shape === 'rect') {
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, -this.height / 2);
        ctx.quadraticCurveTo(0, 0, this.width / 2, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.quadraticCurveTo(0, 0, -this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* --- 2. Mode Stars & Meteors (Kosmik Bintang) --- */
  class Star {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -20;
      this.radius = Math.random() * 1.8 + 0.6;
      this.baseAlpha = Math.random() * 0.5 + 0.3;
      this.twinkleSpeed = Math.random() * 0.04 + 0.015;
      this.twinkleAngle = Math.random() * Math.PI * 2;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = Math.random() * 0.3 + 0.1;
      const starColors = ['#ffffff', '#e0f2fe', '#bae6fd', '#fef08a', '#e9d5ff'];
      this.color = starColors[Math.floor(Math.random() * starColors.length)];
    }
    update() {
      this.twinkleAngle += this.twinkleSpeed;
      this.x += this.vx;
      this.y += this.vy + (scrollVelocity * 0.05);

      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100 && dist > 0) {
        const force = (1 - dist / 100) * 1.5;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }

      if (this.y > height + 10) this.reset();
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
    }
    draw(ctx) {
      const alpha = Math.min(1, Math.max(0.1, this.baseAlpha + Math.sin(this.twinkleAngle) * 0.35));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tambahkan kilau silang untuk bintang yang lebih besar
      if (this.radius > 1.8 && alpha > 0.6) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 2.5, this.y);
        ctx.lineTo(this.x + this.radius * 2.5, this.y);
        ctx.moveTo(this.x, this.y - this.radius * 2.5);
        ctx.lineTo(this.x, this.y + this.radius * 2.5);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  class Meteor {
    constructor() {
      this.x = Math.random() * width + 100;
      this.y = Math.random() * (height * 0.4) - 50;
      this.length = Math.random() * 120 + 80;
      this.speed = Math.random() * 10 + 12;
      this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2;
      this.vx = -Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      const tailX = this.x - this.vx * (this.length / this.speed);
      const tailY = this.y - this.vy * (this.length / this.speed);

      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* --- Universal Click Burst Particle --- */
  class UniversalBurstParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.03 + 0.02;
      this.size = Math.random() * 5 + 2.5;
      this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ==========================================================================
     INISIALISASI PARTIKEL & LOOP
     ========================================================================== */
  function reinitCurrentModeParticles() {
    particles = [];
    burstParticles = [];
    meteors = [];

    const mode = activeRenderMode || 'confetti';
    if (mode === 'confetti') {
      const count = Math.min(90, Math.max(35, Math.floor((width * height) / 13000)));
      for (let i = 0; i < count; i++) {
        const p = new ConfettiPiece(false);
        p.y = Math.random() * height;
        particles.push(p);
      }
    } else if (mode === 'stars') {
      const count = Math.min(130, Math.max(50, Math.floor((width * height) / 9000)));
      for (let i = 0; i < count; i++) {
        particles.push(new Star());
      }
    }
  }

  // Populate immediately on script load
  reinitCurrentModeParticles();

  // Click handler untuk efek ledakan klik
  window.addEventListener('click', (e) => {
    if (activeRenderMode === 'none') return;
    const burstCount = 25;
    for (let i = 0; i < burstCount; i++) {
      if (activeRenderMode === 'confetti') {
        burstParticles.push(new ConfettiPiece(true, e.clientX, e.clientY));
      } else {
        burstParticles.push(new UniversalBurstParticle(e.clientX, e.clientY));
      }
    }
  });

  /* ==========================================================================
     LOOP ANIMASI UTAMA
     ========================================================================== */
  function animate() {
    ctx.clearRect(0, 0, width, height);

    if (activeRenderMode !== 'none') {
      // Auto recovery if particles list is empty
      if (particles.length === 0) {
        reinitCurrentModeParticles();
      }

      // 1. Update & Gambar Partikel Utama
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }

      // 2. Khusus mode stars: spawn meteor sesekali
      if (activeRenderMode === 'stars') {
        if (Math.random() < 0.008 && meteors.length < 3) {
          meteors.push(new Meteor());
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          meteors[i].update();
          meteors[i].draw(ctx);
          if (meteors[i].alpha <= 0) {
            meteors.splice(i, 1);
          }
        }
      }

      // 3. Update & Gambar Burst Klik
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        burstParticles[i].update();
        burstParticles[i].draw(ctx);
        if (burstParticles[i].alpha <= 0) {
          burstParticles.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  /* ==========================================================================
     RESOLUSI MODE & MANAJEMEN STATE
     ========================================================================== */
  function resolveMode(modeSetting) {
    if (modeSetting === 'stars' || modeSetting === 'none') {
      return modeSetting;
    }
    return 'confetti';
  }

  function applyMode(modeSetting, saveToStorage = false) {
    currentSettingMode = modeSetting || 'confetti';
    const targetRenderMode = resolveMode(currentSettingMode);

    if (saveToStorage && window.Store) {
      window.Store.updateSettings({ backgroundAnimation: currentSettingMode });
    }

    activeRenderMode = targetRenderMode;
    reinitCurrentModeParticles();

    document.documentElement.setAttribute('data-bg-anim', activeRenderMode);
  }

  /* ==========================================================================
     MOUSE SPOTLIGHT, 3D TILT & SCROLL REVEAL
     ========================================================================== */
  let mouseSpotlight = document.getElementById('mouse-spotlight');
  if (!mouseSpotlight) {
    mouseSpotlight = document.createElement('div');
    mouseSpotlight.id = 'mouse-spotlight';
    mouseSpotlight.style.position = 'fixed';
    mouseSpotlight.style.width = '420px';
    mouseSpotlight.style.height = '420px';
    mouseSpotlight.style.borderRadius = '50%';
    mouseSpotlight.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.05) 45%, transparent 70%)';
    mouseSpotlight.style.pointerEvents = 'none';
    mouseSpotlight.style.transform = 'translate(-50%, -50%)';
    mouseSpotlight.style.zIndex = '1';
    mouseSpotlight.style.transition = 'opacity 0.3s ease';
    mouseSpotlight.style.opacity = '0';
    document.body.appendChild(mouseSpotlight);
  }

  window.addEventListener('mousemove', (e) => {
    if (mouseSpotlight) {
      mouseSpotlight.style.left = `${e.clientX}px`;
      mouseSpotlight.style.top = `${e.clientY}px`;
      mouseSpotlight.style.opacity = '1';
    }
  });

  // 3D Card Tilt Effect
  function init3DTilt() {
    const cards = document.querySelectorAll('.product-card, .hero-featured-card, .metric-card');
    cards.forEach(card => {
      card.removeEventListener('mousemove', handleCardMouseMove);
      card.removeEventListener('mouseleave', handleCardMouseLeave);
      card.addEventListener('mousemove', handleCardMouseMove);
      card.addEventListener('mouseleave', handleCardMouseLeave);
    });
  }

  function handleCardMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-12px) scale(1.02)`;
  }

  function handleCardMouseLeave(e) {
    const card = e.currentTarget;
    card.style.transform = '';
  }

  // Scroll Reveal Animations
  function initScrollAnimations() {
    const targets = [
      { selector: '.product-card', className: 'reveal-card' },
      { selector: '.section-header-wrap', className: 'reveal-header' },
      { selector: '.feature-card', className: 'reveal-feature' },
      { selector: '.hero-badge-pill', className: 'reveal-hero' },
      { selector: '.hero-main-title', className: 'reveal-hero' }
    ];

    targets.forEach(({ selector, className }) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        if (!el.classList.contains('scroll-reveal-item')) {
          el.classList.add('scroll-reveal-item', className);
          el.style.transitionDelay = `${(index % 4) * 0.1}s`;
        }
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove('in-view');
          }
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.scroll-reveal-item').forEach(el => {
      observer.observe(el);
    });
  }

  // Hook into lifecycle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init3DTilt();
      initScrollAnimations();
      if (window.Store) {
        const settings = window.Store.getSettings();
        applyMode(settings.backgroundAnimation || 'confetti', false);
      } else {
        applyMode('confetti', false);
      }
    });
  } else {
    init3DTilt();
    initScrollAnimations();
    if (window.Store) {
      const settings = window.Store.getSettings();
      applyMode(settings.backgroundAnimation || 'confetti', false);
    } else {
      applyMode('confetti', false);
    }
  }

  /* ==========================================================================
     GLOBAL PUBLIC API
     ========================================================================== */
  window.AnimationsEngine = {
    setMode: applyMode,
    getMode: () => currentSettingMode,
    getActiveRenderMode: () => activeRenderMode,
    AVAILABLE_MODES,
    init3DTilt,
    initScrollAnimations
  };

})();
