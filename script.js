/* ═══════════════════════════════════════════════════════════
   SR. & SRA. COUTINHO — JAVASCRIPT
   Módulos: Header, Nav Mobile, Reveal, Slider, Stats,
            Cart, Size Modal, Sizes, Wishlist
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── UTILITIES ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── DOM READY ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initReveal();
  initTestimonials();
  initStats();
  initCart();
  initSizeModal();
  initSizes();
  initWishlist();
  initSizeSelector();
});

// ── 1. HEADER SCROLL EFFECT ────────────────────────────────
function initHeader() {
  const header = $('#header');
  if (!header) return;

  let lastScroll = 0;
  const onScroll = () => {
    const current = window.scrollY;
    header.classList.toggle('scrolled', current > 60);
    lastScroll = current;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── 2. MOBILE NAV ──────────────────────────────────────────
function initMobileNav() {
  const hamburger = $('#hamburger');
  const nav = $('#nav');
  const overlay = $('#navOverlay');
  if (!hamburger || !nav || !overlay) return;

  const close = () => {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    hamburger.classList.add('active');
    nav.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('active') ? close() : open();
  });

  overlay.addEventListener('click', close);

  // Close nav when a link is clicked
  $$('.nav__link', nav).forEach(link => {
    link.addEventListener('click', close);
  });

  // Keyboard: ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) close();
  });
}

// ── 3. SCROLL REVEAL ───────────────────────────────────────
function initReveal() {
  if ('IntersectionObserver' in window === false) {
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}

// ── 4. TESTIMONIALS SLIDER ─────────────────────────────────
function initTestimonials() {
  const cards = $$('.testimonial-card');
  const dots = $$('.dot');
  if (!cards.length || !dots.length) return;

  let current = 0;
  let timer = null;

  const goTo = (index) => {
    cards[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + cards.length) % cards.length;

    cards[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  };

  const startTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      startTimer();
    });
  });

  // Swipe support
  const slider = $('#testimonialsSlider');
  if (slider) {
    let startX = 0;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        goTo(dx < 0 ? current + 1 : current - 1);
        startTimer();
      }
    }, { passive: true });
  }

  startTimer();
}

// ── 5. ANIMATED STATS ──────────────────────────────────────
function initStats() {
  const stats = $$('.stat-number');
  if (!stats.length) return;

  const animateNumber = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
  } else {
    stats.forEach(animateNumber);
  }
}

// ── 6. CART ────────────────────────────────────────────────
function initCart() {
  let cart = JSON.parse(localStorage.getItem('sc_cart') || '[]');

  const cartBtn = $('#cartBtn');
  const cartSidebar = $('#cartSidebar');
  const cartOverlay = $('#cartOverlay');
  const closeCart = $('#closeCart');
  const cartCount = $('#cartCount');
  const cartItems = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartFooter = $('#cartFooter');
  const cartTotal = $('#cartTotal');
  const clearCartBtn = $('#clearCart');

  if (!cartBtn || !cartSidebar) return;

  const saveCart = () => localStorage.setItem('sc_cart', JSON.stringify(cart));

  const formatPrice = (price) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const updateCartUI = () => {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Counter badge
    cartCount.textContent = count;
    cartCount.dataset.empty = count === 0 ? 'true' : 'false';

    // Empty / filled state
    const isEmpty = cart.length === 0;
    cartEmpty.style.display = isEmpty ? 'flex' : 'none';
    cartItems.style.display = isEmpty ? 'none' : 'flex';
    cartFooter.style.display = isEmpty ? 'none' : 'flex';

    if (!isEmpty) {
      cartTotal.textContent = formatPrice(total);
      cartItems.innerHTML = cart.map((item, i) => `
        <li class="cart-item" data-index="${i}">
          <div class="cart-item__thumb">
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" stroke-width="1" width="28" height="28" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
          <div class="cart-item__info">
            <p class="cart-item__name">${item.name}</p>
            <p class="cart-item__price">${formatPrice(item.price)} × ${item.qty}</p>
          </div>
          <button class="cart-item__remove" data-index="${i}" aria-label="Remover ${item.name} da sacola">✕</button>
        </li>
      `).join('');

      // Remove item buttons
      $$('.cart-item__remove', cartItems).forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          cart.splice(idx, 1);
          saveCart();
          updateCartUI();
        });
      });
    }
  };

  const openCart = () => {
    cartSidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
    cartSidebar.setAttribute('aria-hidden', 'false');
  };

  const closeCartFn = () => {
    cartSidebar.classList.remove('open');
    document.body.style.overflow = '';
    cartSidebar.setAttribute('aria-hidden', 'true');
  };

  cartBtn.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartFn);
  cartOverlay.addEventListener('click', closeCartFn);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cartSidebar.classList.contains('open')) closeCartFn();
  });

  clearCartBtn?.addEventListener('click', () => {
    cart = [];
    saveCart();
    updateCartUI();
  });

  // Add to cart buttons
  $$('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);

      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ name, price, qty: 1 });
      }

      saveCart();
      updateCartUI();

      // Feedback animation
      btn.textContent = '✓ Adicionado!';
      btn.style.background = '#25D366';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.textContent = 'Adicionar à Sacola';
        btn.style.background = '';
        btn.style.color = '';
      }, 1800);

      // Open cart after short delay
      setTimeout(openCart, 300);
    });
  });

  // Init
  updateCartUI();
}

// ── 7. SIZE MODAL ──────────────────────────────────────────
function initSizeModal() {
  const modal = $('#sizeModal');
  const overlay = $('#sizeModalOverlay');
  const closeBtn = $('#closeSizeModal');
  const openBtns = ['#openSizeGuide', '#openSizeGuide2'].map(s => $(s)).filter(Boolean);

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden', 'true');
  };

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

// ── 8. SIZE SELECTOR ───────────────────────────────────────
function initSizes() {
  $$('.product-card').forEach(card => {
    const sizes = $$('.size', card);
    sizes.forEach(size => {
      size.addEventListener('click', () => {
        sizes.forEach(s => s.classList.remove('active'));
        size.classList.add('active');
      });
      size.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sizes.forEach(s => s.classList.remove('active'));
          size.classList.add('active');
        }
      });
    });
  });
}

// ── 9. WISHLIST ────────────────────────────────────────────
function initWishlist() {
  let wishlist = JSON.parse(localStorage.getItem('sc_wishlist') || '[]');

  $$('.product-card__wishlist').forEach((btn, i) => {
    // Restore state
    if (wishlist.includes(i)) {
      btn.textContent = '♥';
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      const idx = wishlist.indexOf(i);
      if (idx === -1) {
        wishlist.push(i);
        btn.textContent = '♥';
        btn.classList.add('active');
        btn.style.color = '#e74c3c';
      } else {
        wishlist.splice(idx, 1);
        btn.textContent = '♡';
        btn.classList.remove('active');
        btn.style.color = '';
      }
      localStorage.setItem('sc_wishlist', JSON.stringify(wishlist));
    });
  });
}

// ── 10. SIZE SELECTOR (EXTRA STANDALONE) ───────────────────
function initSizeSelector() {
  // Allow keyboard navigation between size buttons
  $$('.product-card__sizes').forEach(group => {
    const sizes = $$('.size', group);
    sizes.forEach((size, i) => {
      size.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          sizes[(i + 1) % sizes.length].focus();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          sizes[(i - 1 + sizes.length) % sizes.length].focus();
        }
      });
    });
  });
}

// ── 11. SMOOTH SCROLL OFFSET ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerHeight = document.querySelector('#header')?.offsetHeight || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── 12. PREVENT SCROLL RESTORE ON BACK NAV ─────────────────
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}