/* ============================================================
   Harvest Deli — shared logic
   Product catalog + cart state + drawer + menu wiring
   ============================================================ */
(function () {
  'use strict';

  // ---------- Product catalog ----------
  const PRODUCTS = {
    'chestnut': {
      name: 'Chestnut Honey',
      edition: 'Edition I',
      region: 'Pelion · Greece',
      altitude: '950m',
      price: 68,
      hue: 'amber',
      notes: 'Warm resin, sun-baked herb, mineral finish.',
      texture: 'Liquid, slow-pouring',
      weight: '250g',
      tags: ['mountain', 'forest', 'raw', 'cold-extracted', 'dark'],
      badges: ['Raw', 'Mountain Honey'],
      slug: 'chestnut',
      url: 'product.html'
    },
    'wild-thyme': {
      name: 'Wild Thyme',
      edition: 'Edition II',
      region: 'Lakonia · Greece',
      altitude: '750m',
      price: 58,
      hue: 'straw',
      notes: 'Bright herb, citrus blossom, honeycomb wax.',
      texture: 'Light, fluid',
      weight: '250g',
      tags: ['floral', 'mountain', 'cold-extracted', 'light'],
      badges: ['Estate Batch', 'Spring Harvest'],
      slug: 'wild-thyme',
      url: 'product.html?p=wild-thyme'
    },
    'pine-heather': {
      name: 'Pine & Heather',
      edition: 'Edition III',
      region: 'Halkidiki · Greece',
      altitude: '1200m',
      price: 72,
      hue: 'bronze',
      notes: 'Smoked pine, dried fig, dark woodland.',
      texture: 'Set, almost waxy',
      weight: '250g',
      tags: ['forest', 'raw', 'dark', 'mountain'],
      badges: ['Raw', 'Forest Honey'],
      slug: 'pine-heather',
      url: 'product.html?p=pine-heather'
    },
    'spring-wildflower': {
      name: 'Spring Wildflower',
      edition: 'Edition IV',
      region: 'Pelion · Greece',
      altitude: '600m',
      price: 54,
      hue: 'pale',
      notes: 'Apple blossom, soft pollen, fresh meadow.',
      texture: 'Smooth, creamy',
      weight: '250g',
      tags: ['wildflower', 'floral', 'light', 'cold-extracted'],
      badges: ['Spring Harvest', 'Creamy'],
      slug: 'spring-wildflower',
      url: 'product.html?p=spring-wildflower'
    },
    'mountain-reserve': {
      name: 'Mountain Reserve',
      edition: 'Reserve · 2025',
      region: 'Mt Olympus · Greece',
      altitude: '1400m',
      price: 148,
      hue: 'deep',
      notes: 'Black walnut, slate, long mineral echo.',
      texture: 'Dense, dark, viscous',
      weight: '250g',
      tags: ['mountain', 'forest', 'limited', 'raw', 'dark'],
      badges: ['Limited 48', 'Estate Batch'],
      slug: 'mountain-reserve',
      url: 'product.html?p=mountain-reserve'
    },
    'orange-blossom': {
      name: 'Orange Blossom',
      edition: 'Edition V',
      region: 'Peloponnese · Greece',
      altitude: '200m',
      price: 52,
      hue: 'pale',
      notes: 'Neroli, orange peel, warm vanilla.',
      texture: 'Liquid, perfumed',
      weight: '250g',
      tags: ['floral', 'wildflower', 'light', 'cold-extracted'],
      badges: ['Spring Harvest', 'Floral'],
      slug: 'orange-blossom',
      url: 'product.html?p=orange-blossom'
    }
  };
  window.HD_PRODUCTS = PRODUCTS;

  // ---------- Cart state ----------
  const STORAGE = 'hd-cart-v1';
  const cart = {
    items: [],
    load() {
      try {
        this.items = JSON.parse(localStorage.getItem(STORAGE) || '[]');
        if (!Array.isArray(this.items)) this.items = [];
        // sanitize unknown slugs
        this.items = this.items.filter(i => PRODUCTS[i.slug]);
      } catch (e) { this.items = []; }
    },
    save() { try { localStorage.setItem(STORAGE, JSON.stringify(this.items)); } catch (e) {} },
    add(slug, qty) {
      if (!PRODUCTS[slug]) return;
      qty = qty || 1;
      const existing = this.items.find(i => i.slug === slug);
      if (existing) existing.qty += qty;
      else this.items.push({ slug: slug, qty: qty });
      this.save(); render();
    },
    remove(slug) {
      this.items = this.items.filter(i => i.slug !== slug);
      this.save(); render();
    },
    setQty(slug, qty) {
      const item = this.items.find(i => i.slug === slug);
      if (!item) return;
      if (qty < 1) return this.remove(slug);
      item.qty = qty;
      this.save(); render();
    },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    total() { return this.items.reduce((s, i) => s + i.qty * PRODUCTS[i.slug].price, 0); }
  };
  cart.load();
  window.HD_CART = cart;

  // ---------- Render helpers ----------
  function formatPrice(n) { return '€' + n.toFixed(0); }

  function render() {
    // Cart counts in nav buttons
    document.querySelectorAll('.nav-cart').forEach(btn => {
      const count = cart.count();
      const countEl = btn.querySelector('.cart-count');
      if (countEl) countEl.textContent = count;
      btn.classList.toggle('has-items', count > 0);
    });

    // Drawer items
    const itemsWrap = document.getElementById('cartItems');
    if (itemsWrap) {
      if (cart.items.length === 0) {
        itemsWrap.innerHTML = `
          <div class="cart-empty">
            <h4>Your cellar is quiet.</h4>
            <p>Begin the collection. Each jar is numbered, sealed in wax, and shipped from Pelion within the week.</p>
            <a href="shop.html" class="cart-empty-cta">View the collection</a>
          </div>
        `;
      } else {
        itemsWrap.innerHTML = cart.items.map(i => {
          const p = PRODUCTS[i.slug];
          return `
            <div class="cart-line" data-slug="${i.slug}">
              <a class="thumb" href="${p.url}"><span class="mini-jar ${p.hue}"></span></a>
              <div class="meta">
                <a class="name" href="${p.url}" style="text-decoration:none;color:inherit;">${p.name}</a>
                <div class="edition">${p.edition}</div>
                <div class="qty">
                  <button data-act="dec" aria-label="Decrease">&minus;</button>
                  <span class="val">${i.qty}</span>
                  <button data-act="inc" aria-label="Increase">+</button>
                </div>
              </div>
              <div class="price-col">
                <div class="price">${formatPrice(p.price * i.qty)}</div>
                <button class="remove" data-act="remove">Remove</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Totals
    const total = document.getElementById('cartTotal');
    if (total) total.textContent = formatPrice(cart.total());

    // Checkout-page reflection
    const summary = document.getElementById('checkoutSummary');
    if (summary) renderCheckoutSummary();
  }

  // ---------- Drawer toggle ----------
  function openCart() {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  window.HD_openCart = openCart;
  window.HD_closeCart = closeCart;

  // ---------- Toast ----------
  let toastT;
  function toast(msg) {
    let el = document.getElementById('cartToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cartToast';
      el.className = 'cart-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 2400);
  }
  window.HD_toast = toast;

  // ---------- Checkout summary ----------
  function renderCheckoutSummary() {
    const wrap = document.getElementById('checkoutSummary');
    if (!wrap) return;
    if (cart.items.length === 0) {
      wrap.innerHTML = `
        <div class="checkout-empty">
          <h3>Your cellar is empty.</h3>
          <p>Add a jar from the collection to begin checkout.</p>
          <a href="shop.html" class="checkout-empty-cta">View the collection</a>
        </div>
      `;
      return;
    }
    const subtotal = cart.total();
    const shipping = subtotal >= 120 ? 0 : 9;
    const total = subtotal + shipping;
    const lines = cart.items.map(i => {
      const p = PRODUCTS[i.slug];
      return `
        <div class="ck-line">
          <span class="thumb-mini"><span class="mini-jar ${p.hue}"></span></span>
          <div class="ck-meta">
            <div class="ck-name">${p.name}</div>
            <div class="ck-edition">${p.edition} &middot; ${p.weight} &middot; ×${i.qty}</div>
          </div>
          <div class="ck-line-price">${formatPrice(p.price * i.qty)}</div>
        </div>
      `;
    }).join('');
    wrap.innerHTML = `
      <div class="ck-lines">${lines}</div>
      <div class="ck-totals">
        <div class="ck-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="ck-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span></div>
        <div class="ck-row ck-grand"><span>Total</span><span>${formatPrice(total)}</span></div>
      </div>
    `;
  }

  // ---------- Wire up after DOM ready ----------
  function init() {
    // Cart buttons in nav
    document.querySelectorAll('.nav-cart').forEach(btn => {
      btn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    });

    // Drawer interactions (delegated, since drawer content re-renders)
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.querySelector('.cart-backdrop').addEventListener('click', closeCart);
      drawer.querySelector('.cart-close').addEventListener('click', closeCart);
      drawer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act], a');
        if (!btn) return;
        const line = e.target.closest('.cart-line');
        if (!line) return;
        const slug = line.dataset.slug;
        const act = btn.dataset.act;
        if (act === 'inc') {
          const it = cart.items.find(i => i.slug === slug);
          if (it) cart.setQty(slug, it.qty + 1);
        } else if (act === 'dec') {
          const it = cart.items.find(i => i.slug === slug);
          if (it) cart.setQty(slug, it.qty - 1);
        } else if (act === 'remove') {
          cart.remove(slug);
        }
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCart();
    });

    // Universal add-to-cart buttons
    document.body.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add-to-cart]');
      if (!addBtn) return;
      e.preventDefault();
      const slug = addBtn.dataset.addToCart;
      const qty = parseInt(addBtn.dataset.qty || '1', 10) || 1;
      if (!PRODUCTS[slug]) return;
      cart.add(slug, qty);
      toast('Added — ' + PRODUCTS[slug].name);
      if (addBtn.dataset.openCart !== 'false') {
        setTimeout(openCart, 240);
      }
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
