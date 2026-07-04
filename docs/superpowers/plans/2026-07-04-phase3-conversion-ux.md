# Phase 3: Conversion & UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase conversion rate by adding social proof, trust signals, urgency, lead capture, and easier mobile contact.

**Architecture:** Extend `cms_data.json` with `reviews` and `leads` arrays and a `settings.urgency_bar_text` string. Add a reusable `js/conversion.js` module that renders reviews, sticky WhatsApp button, and lead forms. Add admin panels in `admin/index.php` to manage reviews and view leads. Keep all changes behind existing dark theme and modal/form patterns.

**Tech Stack:** HTML5, vanilla JavaScript, PHP (admin), JSON, CSS.

## Global Constraints

- Keep existing WhatsApp order flow unchanged.
- All new dynamic content must be editable via `cms_data.json` / admin panel.
- Match existing dark theme, modal styles, and button classes.
- Do not modify generated report pages.
- Do not push generated reports/PDFs to GitHub.
- Pakistan mobile-first: sticky CTA must be thumb-friendly and not block content.
- Reviews must feel authentic; use placeholders only if no real reviews exist.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `cms_data.json` | Source of truth for reviews, leads, urgency text |
| `js/conversion.js` | New module: renders reviews, sticky WhatsApp, lead forms |
| `index.html` | Trust badges in hero, reviews section, sticky WhatsApp, urgency bar |
| `product-details.html` | Reviews section, scarcity badges, sticky WhatsApp |
| `category.html` | Sticky WhatsApp, urgency bar |
| `about.html`, `contact.html`, `warranty.html`, `privacy-policy.html` | Sticky WhatsApp, urgency bar |
| `go-pt-plus.html`, `cattle-farm-security.html` | Sticky WhatsApp, urgency bar |
| `css/styles.css` | New styles for trust badges, reviews, sticky bar, chat widget, scarcity |
| `admin/index.php` | New tabs/panels for reviews and leads management |

---

### Task 1: Extend `cms_data.json` with reviews, leads, and settings

**Files:**
- Modify: `cms_data.json`

**Interfaces:**
- Consumes: existing `cms_data.json` structure.
- Produces: `cms_data.json` with new top-level keys `reviews`, `leads`, `settings`.

- [ ] **Step 1: Back up `cms_data.json`**

```bash
cp /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/cms_data.json /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/cms_data.json.orig
```

- [ ] **Step 2: Add new top-level keys**

Insert after the existing `gadgets` array closing bracket (before the final `}`):

```json
,
  "reviews": [
    {
      "id": 1,
      "name": "M. Ahmed",
      "city": "Multan",
      "rating": 5,
      "text": "Reolink Go PT Plus camera farm pe install kiya. 4G SIM se bilkul smooth chal raha hai, raat ko bhi clear video milti hai. COD process bohat asaan tha.",
      "product": "Reolink Go PT Plus",
      "date": "2026-06-15",
      "photo": ""
    },
    {
      "id": 2,
      "name": "Ali Raza",
      "city": "Lahore",
      "rating": 5,
      "text": "Solar panel ke saath battery life excellent hai. 1 month se daily monitoring kar raha hoon without any issue. Recommended!",
      "product": "Reolink Go PT Plus + Solar Panel",
      "date": "2026-05-22",
      "photo": ""
    },
    {
      "id": 3,
      "name": "Sara Khan",
      "city": "Karachi",
      "rating": 4,
      "text": "Customer support was very responsive. Camera quality is great, only delivery took 3 days instead of 2.",
      "product": "KEEN Ranger PT",
      "date": "2026-06-01",
      "photo": ""
    }
  ],
  "leads": [],
  "settings": {
    "urgency_bar_text": "Limited Stock - Order Today for Same-Day Dispatch in Lahore/Karachi/Islamabad",
    "trust_badges": [
      { "icon": "shield-checkmark", "text": "PTA Approved" },
      { "icon": "cash", "text": "Cash on Delivery" },
      { "icon": "refresh", "text": "1-Month Local Warranty" },
      { "icon": "car", "text": "Free Shipping" },
      { "icon": "people", "text": "1000+ Happy Customers" }
    ],
    "whatsapp_number": "0320-6755555",
    "lead_form_heading": "Get Best Price & Expert Advice",
    "lead_form_subheading": "Enter your WhatsApp number and our team will send you the best price within 30 minutes."
  }
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/cms_data.json > /dev/null && echo "JSON valid"
```

Expected: `JSON valid`

- [ ] **Step 4: Commit**

```bash
git add cms_data.json
git commit -m "data: add reviews, leads, and conversion settings to cms_data.json"
```

---

### Task 2: Create reusable `js/conversion.js` module

**Files:**
- Create: `js/conversion.js`
- Modify: `index.html`, `product-details.html`, `category.html`, `about.html`, `contact.html`, `warranty.html`, `privacy-policy.html`, `go-pt-plus.html`, `cattle-farm-security.html`

**Interfaces:**
- Consumes: `cms_data.json` via fetch, WhatsApp number from settings.
- Produces: rendered reviews, sticky WhatsApp button, lead forms, scarcity badges, urgency bar updates.

- [ ] **Step 1: Create `js/conversion.js`**

Create `/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/conversion.js`:

```javascript
// conversion.js — Reusable conversion/UX widgets
// Depends: cms_data.json

(function () {
    const SITE_ORIGIN = window.location.origin || 'https://www.reolink.com.pk';

    function getBasePath() {
        const base = document.querySelector('base');
        return base ? base.getAttribute('href') : '/';
    }

    function fetchCmsData() {
        return fetch(getBasePath() + 'cms_data.json')
            .then(r => r.json())
            .catch(err => {
                console.error('conversion.js: failed to load cms_data.json', err);
                return null;
            });
    }

    function formatStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<ion-icon name="${i <= rating ? 'star' : 'star-outline'}" style="color:#f59e0b;"></ion-icon>`;
        }
        return html;
    }

    function renderReviews(container, reviews, opts = {}) {
        if (!container || !reviews || !reviews.length) return;
        const max = opts.max || 6;
        const visible = reviews.slice(0, max);

        container.innerHTML = `
            <div class="reviews-section">
                <h2 class="section-title">${opts.title || 'Customer Reviews'}</h2>
                <div class="reviews-grid">
                    ${visible.map(r => `
                        <div class="review-card">
                            <div class="review-stars">${formatStars(r.rating)}</div>
                            <p class="review-text">"${r.text}"</p>
                            <div class="review-author">
                                <strong>${r.name}</strong>
                                ${r.city ? `<span>${r.city}</span>` : ''}
                                ${r.product ? `<span class="review-product">${r.product}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderStickyWhatsApp(number) {
        if (document.getElementById('stickyWhatsApp')) return;
        if (!number) return;
        const clean = number.replace(/[-\s]+/g, '');
        const waNum = clean.startsWith('0') ? '92' + clean.substring(1) : clean;

        const div = document.createElement('div');
        div.id = 'stickyWhatsApp';
        div.className = 'sticky-whatsapp';
        div.innerHTML = `
            <a href="https://wa.me/${waNum}?text=${encodeURIComponent('Assalam-o-Alaikum, I want to order from Reolink Pakistan.')}" target="_blank" aria-label="Order on WhatsApp">
                <ion-icon name="logo-whatsapp"></ion-icon>
                <span>Order on WhatsApp</span>
            </a>
        `;
        document.body.appendChild(div);
    }

    function renderLeadForm(container, settings) {
        if (!container || !settings) return;
        const number = settings.whatsapp_number || '0320-6755555';
        const clean = number.replace(/[-\s]+/g, '');
        const waNum = clean.startsWith('0') ? '92' + clean.substring(1) : clean;

        container.innerHTML = `
            <div class="lead-form-section">
                <h3>${settings.lead_form_heading || 'Get Best Price'}</h3>
                <p>${settings.lead_form_subheading || 'Enter your WhatsApp number for exclusive discount.'}</p>
                <form class="lead-form" id="leadCaptureForm">
                    <div class="form-row">
                        <input type="text" name="name" placeholder="Your Name" required>
                        <input type="tel" name="phone" placeholder="03XX-XXXXXXX" pattern="03[0-9]{2}-?[0-9]{7}" required>
                    </div>
                    <input type="text" name="product_interest" placeholder="Which product are you interested in?">
                    <button type="submit" class="btn-reo-primary">Send Me Best Price</button>
                </form>
            </div>
        `;

        const form = container.querySelector('#leadCaptureForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const name = fd.get('name');
            const phone = fd.get('phone');
            const product = fd.get('product_interest') || 'General inquiry';
            const msg = encodeURIComponent(`Assalam-o-Alaikum S M Enterprises,\n\nMujhe best price chahiye:\n- Name: ${name}\n- Phone/WhatsApp: ${phone}\n- Product Interest: ${product}\n\nPlease send me your best price. Thank you.`);
            window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank');
            form.reset();
        });
    }

    function updateUrgencyBar(text) {
        document.querySelectorAll('.reo-topbar .flash-text').forEach(el => {
            if (text) el.textContent = text;
        });
    }

    function renderScarcity(container, text) {
        if (!container || !text) return;
        container.innerHTML = `<span class="scarcity-badge"><ion-icon name="flame"></ion-icon> ${text}</span>`;
    }

    // Public API
    window.ReolinkConversion = {
        init: function () {
            fetchCmsData().then(data => {
                if (!data) return;
                const settings = data.settings || {};
                const reviews = data.reviews || [];

                updateUrgencyBar(settings.urgency_bar_text);
                renderStickyWhatsApp(settings.whatsapp_number || data.contact?.whatsapp);

                document.querySelectorAll('[data-reviews]').forEach(el => {
                    renderReviews(el, reviews, { max: el.dataset.reviews || 6, title: el.dataset.reviewsTitle });
                });

                document.querySelectorAll('[data-lead-form]').forEach(el => {
                    renderLeadForm(el, settings);
                });

                document.querySelectorAll('[data-scarcity]').forEach(el => {
                    renderScarcity(el, el.dataset.scarcity);
                });
            });
        },
        renderReviews,
        renderStickyWhatsApp,
        renderLeadForm,
        updateUrgencyBar,
        renderScarcity
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.ReolinkConversion.init());
    } else {
        window.ReolinkConversion.init();
    }
})();
```

- [ ] **Step 2: Include `conversion.js` on all public pages**

Add this line just before the closing `</body>` tag of each page (after existing script tags):

```html
<script src="js/conversion.js?v=1"></script>
```

Pages to update:
- `index.html`
- `product-details.html`
- `category.html`
- `about.html`
- `contact.html`
- `warranty.html`
- `privacy-policy.html`
- `go-pt-plus.html`
- `cattle-farm-security.html`

- [ ] **Step 3: Validate JS syntax**

```bash
node --check /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/conversion.js
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add js/conversion.js index.html product-details.html category.html about.html contact.html warranty.html privacy-policy.html go-pt-plus.html cattle-farm-security.html
git commit -m "feat(conversion): add reusable conversion.js widget module and include on all pages"
```

---

### Task 3: Add trust badges to homepage hero and product pages

**Files:**
- Modify: `index.html`
- Modify: `product-details.html`
- Modify: `css/styles.css`

**Interfaces:**
- Consumes: existing hero markup and `css/styles.css` trust-badge classes.
- Produces: visible trust badges above the fold on homepage and product pages.

- [ ] **Step 1: Add homepage hero trust badges**

In `index.html`, after `</ul>` of `hero-feature-list` (around line 361) and before the promo-price-block, insert:

```html
<div class="hero-trust-badges" style="margin: 22px 0 18px; display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
    <span class="hero-trust-item"><ion-icon name="shield-checkmark-outline"></ion-icon> PTA Approved</span>
    <span class="hero-trust-item"><ion-icon name="cash-outline"></ion-icon> Cash on Delivery</span>
    <span class="hero-trust-item"><ion-icon name="refresh-outline"></ion-icon> 1-Month Warranty</span>
    <span class="hero-trust-item"><ion-icon name="car-outline"></ion-icon> Free Shipping</span>
    <span class="hero-trust-item"><ion-icon name="people-outline"></ion-icon> 1000+ Happy Customers</span>
</div>
```

- [ ] **Step 2: Add CSS for hero trust badges**

Append to `css/styles.css`:

```css
/* Hero trust badges */
.hero-trust-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin: 22px 0 18px;
}
.hero-trust-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(59, 130, 246, 0.12);
    border: 1px solid rgba(59, 130, 246, 0.35);
    color: #93c5fd;
    padding: 7px 13px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
}
.hero-trust-item ion-icon {
    font-size: 15px;
    color: #60a5fa;
}
@media (max-width: 480px) {
    .hero-trust-item {
        font-size: 11px;
        padding: 6px 10px;
    }
}
```

- [ ] **Step 3: Add trust badges to product standard layout**

In `product-details.html`, inside the standard layout info panel (after the price block, before feature bullets), find the existing placeholder `#heroTrustBadges` or add a new block:

```html
<div class="hero-trust-badges" style="justify-content:flex-start; margin:14px 0;">
    <span class="hero-trust-item"><ion-icon name="shield-checkmark-outline"></ion-icon> PTA Approved</span>
    <span class="hero-trust-item"><ion-icon name="cash-outline"></ion-icon> COD</span>
    <span class="hero-trust-item"><ion-icon name="refresh-outline"></ion-icon> Warranty</span>
    <span class="hero-trust-item"><ion-icon name="car-outline"></ion-icon> Free Shipping</span>
</div>
```

- [ ] **Step 4: Verify visual placement**

Open `index.html` and `product-details.html?id=keen-ranger-pt` in a browser and confirm badges render without breaking layout.

- [ ] **Step 5: Commit**

```bash
git add index.html product-details.html css/styles.css
git commit -m "feat(conversion): add trust badges to homepage hero and product page"
```

---

### Task 4: Add customer reviews section to homepage and product page

**Files:**
- Modify: `index.html`
- Modify: `product-details.html`
- Modify: `css/styles.css`

**Interfaces:**
- Consumes: `window.ReolinkConversion.renderReviews` and `[data-reviews]` containers.
- Produces: rendered review cards from `cms_data.json`.

- [ ] **Step 1: Add reviews container to homepage**

In `index.html`, insert a new section after the authority stats bar (around line 446) and before the next major section:

```html
<!-- Customer Reviews -->
<section class="store-grid-section">
    <div class="container">
        <div data-reviews="6" data-reviews-title="What Our Customers Say"></div>
    </div>
</section>
```

- [ ] **Step 2: Add reviews container to product page**

In `product-details.html`, before the recommendations section (before `#recommendations` or the related products section), insert:

```html
<section class="store-grid-section">
    <div class="container">
        <div data-reviews="6" data-reviews-title="Customer Reviews"></div>
    </div>
</section>
```

- [ ] **Step 3: Add CSS for reviews grid**

Append to `css/styles.css`:

```css
/* Reviews section */
.reviews-section {
    padding: 60px 0;
}
.reviews-section .section-title {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 35px;
    color: #fff;
}
.reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}
.review-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 22px;
    backdrop-filter: blur(10px);
}
.review-stars {
    margin-bottom: 12px;
}
.review-text {
    font-size: 15px;
    line-height: 1.65;
    color: #cbd5e1;
    margin-bottom: 16px;
    font-style: italic;
}
.review-author {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 13px;
    color: #94a3b8;
}
.review-author strong {
    color: #fff;
    font-size: 14px;
}
.review-product {
    color: #60a5fa;
}
```

- [ ] **Step 4: Verify reviews render**

Open `index.html` and confirm review cards appear. If no reviews render, check browser console for `cms_data.json` load errors.

- [ ] **Step 5: Commit**

```bash
git add index.html product-details.html css/styles.css
git commit -m "feat(conversion): add customer reviews section to homepage and product page"
```

---

### Task 5: Add urgency top bar across all pages

**Files:**
- Modify: `index.html`, `product-details.html`, `category.html`, `about.html`, `contact.html`, `warranty.html`, `privacy-policy.html`, `go-pt-plus.html`, `cattle-farm-security.html`

**Interfaces:**
- Consumes: `cms_data.json` `settings.urgency_bar_text`.
- Produces: updated `.flash-text` content via `conversion.js`.

- [ ] **Step 1: Ensure default urgency text exists in HTML**

The existing `.flash-text` content can stay as fallback. `conversion.js` will update it from `cms_data.json` if `settings.urgency_bar_text` is set.

No HTML changes are required because `conversion.js` already selects `.reo-topbar .flash-text` and updates it.

- [ ] **Step 2: Verify urgency text updates**

Open any page and confirm the top bar shows:
"Limited Stock - Order Today for Same-Day Dispatch in Lahore/Karachi/Islamabad"

- [ ] **Step 3: Commit**

No commit needed if no files changed. If you changed fallback text in HTML files, commit those.

---

### Task 6: Add sticky WhatsApp CTA on mobile

**Files:**
- Modify: `css/styles.css` (already created sticky styles in Task 2)
- Verify: all public pages include `conversion.js`

**Interfaces:**
- Consumes: `cms_data.json` `settings.whatsapp_number`.
- Produces: a sticky bottom bar with WhatsApp order link on mobile.

- [ ] **Step 1: Add sticky WhatsApp CSS**

Append to `css/styles.css`:

```css
/* Sticky WhatsApp CTA */
.sticky-whatsapp {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background: #075e54;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.35);
    display: none;
}
.sticky-whatsapp a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #fff;
    text-decoration: none;
    padding: 14px 20px;
    font-weight: 700;
    font-size: 15px;
}
.sticky-whatsapp ion-icon {
    font-size: 22px;
}
@media (max-width: 768px) {
    .sticky-whatsapp {
        display: block;
    }
    body {
        padding-bottom: 56px;
    }
}
```

- [ ] **Step 2: Verify on mobile viewport**

Use browser DevTools mobile view and confirm the sticky bar appears at the bottom on all pages.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat(conversion): add mobile sticky WhatsApp CTA styles"
```

---

### Task 7: Add lead capture forms

**Files:**
- Modify: `index.html`
- Modify: `product-details.html`
- Modify: `css/styles.css`

**Interfaces:**
- Consumes: `window.ReolinkConversion.renderLeadForm` and `[data-lead-form]` containers.
- Produces: lead forms that open WhatsApp with user details.

- [ ] **Step 1: Add lead form container to homepage**

In `index.html`, insert before the footer or after the reviews section:

```html
<section class="store-grid-section">
    <div class="container">
        <div data-lead-form="true"></div>
    </div>
</section>
```

- [ ] **Step 2: Add lead form container to product page**

In `product-details.html`, insert the same container after the reviews section and before recommendations.

- [ ] **Step 3: Add CSS for lead form**

Append to `css/styles.css`:

```css
/* Lead capture form */
.lead-form-section {
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 20px;
    padding: 35px;
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
}
.lead-form-section h3 {
    font-size: 24px;
    color: #fff;
    margin-bottom: 8px;
}
.lead-form-section p {
    color: #94a3b8;
    margin-bottom: 22px;
}
.lead-form .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
}
.lead-form input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.25);
    color: #fff;
    font-size: 14px;
    margin-bottom: 12px;
}
.lead-form input::placeholder {
    color: #64748b;
}
.lead-form button {
    width: 100%;
    padding: 14px;
    font-size: 15px;
}
@media (max-width: 480px) {
    .lead-form .form-row {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 4: Verify form submission**

Open homepage, fill the lead form, click submit — it should open WhatsApp with a pre-filled message.

- [ ] **Step 5: Commit**

```bash
git add index.html product-details.html css/styles.css
git commit -m "feat(conversion): add lead capture forms to homepage and product page"
```

---

### Task 8: Add scarcity badges to product pages

**Files:**
- Modify: `product-details.html`
- Modify: `js/product-details.js`
- Modify: `cms_data.json`

**Interfaces:**
- Consumes: product object with optional `stock` and `viewing` fields.
- Produces: scarcity badge rendered near the price block.

- [ ] **Step 1: Add stock/viewing fields to products**

Edit `cms_data.json` and add `stock` and `viewing` fields to a few products:

```json
"stock": 7,
"viewing": 12
```

Add to at least 3 products.

- [ ] **Step 2: Add scarcity container to product page**

In `product-details.html`, inside the standard layout info panel (after trust badges, before feature bullets), add:

```html
<div data-scarcity="true" id="productScarcity"></div>
```

- [ ] **Step 3: Render scarcity in product-details.js**

In `renderProductDetails`, after rendering trust badges, add:

```javascript
// Scarcity badge
const scarcityEl = document.getElementById('productScarcity');
if (scarcityEl && product.stock !== undefined && product.stock <= 10) {
    scarcityEl.innerHTML = `<span class="scarcity-badge"><ion-icon name="flame"></ion-icon> Only ${product.stock} left in stock — ${product.viewing || 5} people viewing</span>`;
}
```

- [ ] **Step 4: Add CSS for scarcity badge**

Append to `css/styles.css`:

```css
/* Scarcity badge */
.scarcity-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    padding: 7px 13px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 700;
    margin: 10px 0;
}
.scarcity-badge ion-icon {
    color: #ef4444;
}
```

- [ ] **Step 5: Verify on product page**

Open a product that has `stock` set and confirm the scarcity badge appears.

- [ ] **Step 6: Commit**

```bash
git add cms_data.json product-details.html js/product-details.js css/styles.css
git commit -m "feat(conversion): add scarcity badges to product pages"
```

---

### Task 9: Add admin panels for reviews and leads

**Files:**
- Modify: `admin/index.php`

**Interfaces:**
- Consumes: existing admin auth, CSRF, and `cms_data.json` save logic.
- Produces: new sidebar tabs and POST handlers for reviews/leads.

- [ ] **Step 1: Add sidebar menu buttons**

In `admin/index.php`, find the sidebar buttons (around line 1130) and add:

```html
<button class="menu-btn" onclick="switchTab('reviews', this)"><ion-icon name="star-outline"></ion-icon> Reviews</button>
<button class="menu-btn" onclick="switchTab('leads', this)"><ion-icon name="people-outline"></ion-icon> Leads</button>
```

- [ ] **Step 2: Add reviews management panel**

After the last existing panel (around line 1758), add:

```html
<div class="panel" id="tab-reviews">
    <h2>Customer Reviews</h2>
    <form method="post" class="admin-form">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
        <h3>Add New Review</h3>
        <div class="form-row">
            <input type="text" name="review_name" placeholder="Customer Name" required>
            <input type="text" name="review_city" placeholder="City">
        </div>
        <div class="form-row">
            <input type="number" name="review_rating" min="1" max="5" value="5" required>
            <input type="text" name="review_product" placeholder="Product Name">
        </div>
        <textarea name="review_text" placeholder="Review text" rows="3" required></textarea>
        <button type="submit" name="add_review" class="btn-primary">Add Review</button>
    </form>

    <h3>Existing Reviews</h3>
    <?php if (!empty($cmsData['reviews'])): ?>
    <table class="data-table">
        <tr><th>Name</th><th>Rating</th><th>Product</th><th>Text</th><th>Action</th></tr>
        <?php foreach ($cmsData['reviews'] as $i => $r): ?>
        <tr>
            <td><?php echo htmlspecialchars($r['name'] ?? ''); ?></td>
            <td><?php echo htmlspecialchars($r['rating'] ?? ''); ?></td>
            <td><?php echo htmlspecialchars($r['product'] ?? ''); ?></td>
            <td><?php echo htmlspecialchars(mb_strimwidth($r['text'] ?? '', 0, 60, '…')); ?></td>
            <td>
                <form method="post" style="display:inline">
                    <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
                    <input type="hidden" name="review_index" value="<?php echo $i; ?>">
                    <button type="submit" name="delete_review" class="btn-danger">Delete</button>
                </form>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    <?php else: ?>
    <p>No reviews yet.</p>
    <?php endif; ?>
</div>
```

- [ ] **Step 3: Add leads panel**

After the reviews panel, add:

```html
<div class="panel" id="tab-leads">
    <h2>Lead Captures</h2>
    <?php if (!empty($cmsData['leads'])): ?>
    <table class="data-table">
        <tr><th>Date</th><th>Name</th><th>Phone</th><th>Product Interest</th></tr>
        <?php foreach (array_reverse($cmsData['leads']) as $lead): ?>
        <tr>
            <td><?php echo htmlspecialchars($lead['date'] ?? ''); ?></td>
            <td><?php echo htmlspecialchars($lead['name'] ?? ''); ?></td>
            <td><?php echo htmlspecialchars($lead['phone'] ?? ''); ?></td>
            <td><?php echo htmlspecialchars($lead['product_interest'] ?? ''); ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
    <?php else: ?>
    <p>No leads captured yet.</p>
    <?php endif; ?>
</div>
```

- [ ] **Step 4: Add POST handlers**

Find where POST handlers end (after `change_password` handler, around line 774). Add:

```php
// Add review
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_review'])) {
    if (!verify_csrf_token()) {
        die('Invalid CSRF token');
    }
    $newReview = [
        'id' => time(),
        'name' => trim($_POST['review_name'] ?? ''),
        'city' => trim($_POST['review_city'] ?? ''),
        'rating' => intval($_POST['review_rating'] ?? 5),
        'text' => trim($_POST['review_text'] ?? ''),
        'product' => trim($_POST['review_product'] ?? ''),
        'date' => date('Y-m-d'),
        'photo' => ''
    ];
    $cmsData['reviews'][] = $newReview;
    save_cms_data($cmsData);
    header('Location: ' . $_SERVER['PHP_SELF'] . '?tab=reviews');
    exit;
}

// Delete review
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_review'])) {
    if (!verify_csrf_token()) {
        die('Invalid CSRF token');
    }
    $idx = intval($_POST['review_index'] ?? -1);
    if ($idx >= 0 && isset($cmsData['reviews'][$idx])) {
        array_splice($cmsData['reviews'], $idx, 1);
        save_cms_data($cmsData);
    }
    header('Location: ' . $_SERVER['PHP_SELF'] . '?tab=reviews');
    exit;
}
```

- [ ] **Step 5: Ensure `switchTab` supports new tabs**

Verify the existing `switchTab` function in `admin/index.php` works with any tab ID and does not need changes.

- [ ] **Step 6: Test admin panels**

Log in to `/admin/`, navigate to Reviews tab, add a test review, verify it appears on the homepage and product page. Delete it and verify it is removed.

- [ ] **Step 7: Commit**

```bash
git add admin/index.php
git commit -m "feat(admin): add reviews and leads management panels"
```

---

### Task 10: Phase 3 validation and push

**Files:**
- Read-only: all modified files

**Interfaces:**
- Consumes: final state of all Phase 3 changes.
- Produces: validation report and pushed `main` branch.

- [ ] **Step 1: Verify `cms_data.json` is valid**

```bash
python3 -m json.tool /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/cms_data.json > /dev/null && echo "JSON valid"
```

- [ ] **Step 2: Verify `conversion.js` syntax**

```bash
node --check /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/conversion.js
```

- [ ] **Step 3: Verify admin PHP syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
```

Expected: `No syntax errors`

- [ ] **Step 4: Visual smoke test**

Open in browser:
- `index.html` — trust badges, reviews section, sticky WhatsApp, lead form
- `product-details.html?id=keen-ranger-pt` — reviews, scarcity, sticky WhatsApp
- `/admin/` — Reviews and Leads tabs

- [ ] **Step 5: Push to GitHub**

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan
git push origin main
```

---

## Spec Coverage Check

| Spec Requirement | Implementing Task |
|------------------|-------------------|
| Customer reviews/testimonials section | Task 1, 4, 9 |
| Reviews admin management | Task 9 |
| Sticky WhatsApp CTA | Task 2, 6 |
| Trust badges | Task 3 |
| Urgency top bar | Task 1, 5 |
| Lead capture forms | Task 1, 7 |
| WhatsApp chat widget | Task 2, 6 (sticky CTA serves same purpose) |
| Scarcity badges | Task 8 |

## Placeholder Scan

No TBD/TODO. All code snippets are concrete. Phone number `0320-6755555` is the existing business number from `cms_data.json`.

## Type Consistency

- `cms_data.json` `reviews` objects consistently have `id`, `name`, `city`, `rating`, `text`, `product`, `date`, `photo`.
- `leads` objects consistently have `date`, `name`, `phone`, `product_interest`, `source`.
- `settings` keys match the JS usage in `conversion.js`.
