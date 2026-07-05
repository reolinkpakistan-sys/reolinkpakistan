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
            const lead = { name, phone, product_interest: product, source: 'lead_form' };

            // Persist lead to cms_data.json via backend endpoint
            fetch(getBasePath() + 'api/capture-lead.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead)
            }).catch(err => console.error('Failed to save lead:', err));

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

    function renderTrustBadges(container, badges, layout) {
        if (!container || !badges || !badges.length) return;
        const items = badges.map(b =>
            `<span class="hero-trust-item"><ion-icon name="${b.icon}-outline"></ion-icon> ${b.text}</span>`
        ).join('');

        if (layout === 'compact') {
            container.innerHTML = `<div class="hero-trust-badges" style="justify-content:flex-start; margin:14px 0;">${items}</div>`;
        } else {
            container.innerHTML = `<div class="hero-trust-badges" style="margin:22px 0 18px; display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">${items}</div>`;
        }
    }

    // Public API
    window.ReolinkConversion = {
        init: function () {
            fetchCmsData().then(data => {
                if (!data) return;
                const settings = data.settings || {};
                const reviews = data.reviews || [];

                // Urgency bar text is now hardcoded in HTML per business preference
                // updateUrgencyBar(settings.urgency_bar_text);
                renderStickyWhatsApp(settings.whatsapp_number || data.contact?.whatsapp);

                document.querySelectorAll('[data-reviews]').forEach(el => {
                    renderReviews(el, reviews, { max: el.dataset.reviews || 6, title: el.dataset.reviewsTitle });
                });

                document.querySelectorAll('[data-lead-form]').forEach(el => {
                    renderLeadForm(el, settings);
                });

                document.querySelectorAll('[data-scarcity]').forEach(el => {
                    if (el.dataset.scarcity === 'true') return; // handled by product-details.js
                    renderScarcity(el, el.dataset.scarcity);
                });

                document.querySelectorAll('[data-trust-badges]').forEach(el => {
                    renderTrustBadges(el, settings.trust_badges, el.dataset.trustBadges);
                });
            });
        },
        renderReviews,
        renderStickyWhatsApp,
        renderLeadForm,
        updateUrgencyBar,
        renderScarcity,
        renderTrustBadges
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.ReolinkConversion.init());
    } else {
        window.ReolinkConversion.init();
    }
})();
