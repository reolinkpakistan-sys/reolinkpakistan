document.addEventListener('DOMContentLoaded', () => {
    // Prevent caching by appending a timestamp
    fetch(getBasePath() + 'cms_data.json?t=' + Date.now())
        .then(response => response.json())
        .then(data => {
            window.cmsData = data;
            applyCMS(data);
        })
        .catch(err => console.error('CMS load error:', err));
});

function applyCMS(data) {
    if (!data) return;

    // 1. Update marked elements dynamically
    const elements = document.querySelectorAll('[data-cms-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-cms-key');
        if (!key) return;

        const value = getNestedValue(data, key);
        if (value === undefined || value === null) return;

        const type = el.getAttribute('data-cms-type');

        if (el.tagName === 'A') {
            if (key === 'contact.phone') {
                el.href = `tel:${value.replace(/[-\s]+/g, '')}`;
                if (el.innerText.includes('0320') || el.innerText.includes('0322') || el.innerText.includes('03')) {
                    el.innerText = value;
                }
            } else if (key === 'contact.whatsapp') {
                // Keep the text query parameter if it exists
                let currentText = "";
                try {
                    const url = new URL(el.href);
                    currentText = url.searchParams.get('text') || "";
                } catch(e) {}
                
                const cleanNum = value.replace(/[-\s]+/g, '');
                // Convert leading 0 to 92 for international format
                const formattedNum = cleanNum.startsWith('0') ? '92' + cleanNum.substring(1) : cleanNum;
                el.href = `https://wa.me/${formattedNum}` + (currentText ? `?text=${encodeURIComponent(currentText)}` : "");
            } else if (key === 'contact.email') {
                el.href = `mailto:${value}`;
                el.innerText = value;
            }
        } else {
            if (type === 'price') {
                el.innerText = `Rs ${formatPrice(value)}`;
            } else if (type === 'price-raw') {
                el.innerText = formatPrice(value);
            } else {
                el.innerText = value;
            }
        }
    });

    // 2. Update dynamic forms in order checkout modal
    const optSolar = document.getElementById('optSolar');
    const optNoSolar = document.getElementById('optNoSolar');
    if (optSolar && data.prices && data.prices.solar) {
        optSolar.value = data.prices.solar;
        const label = optSolar.nextElementSibling;
        if (label) {
            const priceSpan = label.querySelector('span');
            if (priceSpan) priceSpan.textContent = `Rs ${formatPrice(data.prices.solar)}`;
        }
    }
    if (optNoSolar && data.prices && data.prices.no_solar) {
        optNoSolar.value = data.prices.no_solar;
        const label = optNoSolar.nextElementSibling;
        if (label) {
            const priceSpan = label.querySelector('span');
            if (priceSpan) priceSpan.textContent = `Rs ${formatPrice(data.prices.no_solar)}`;
        }
    }

    // Trigger price re-calculations on pages with checkout calculators
    if (typeof calculateTotal === 'function') {
        calculateTotal();
    }
    if (typeof updateCombo === 'function') {
        updateCombo();
    }

    // 3. Render Featured Gadgets Grid dynamically on Homepage
    const gadgetsGrid = document.querySelector('#smart-gadgets .store-grid');
    if (gadgetsGrid && data.gadgets) {
        // Show all products on the homepage grid
        renderGadgets(gadgetsGrid, data.gadgets, data.contact ? data.contact.whatsapp : null);
        attachCatalogSearch(gadgetsGrid, data.gadgets, data.contact ? data.contact.whatsapp : null);
    }

    // 4. Override Video Modal Player
    overrideVideoModal(data);

    // 5. Render & Synchronize Hero Slider dynamically
    if (data.hero_slider) {
        renderHeroSlider(data.hero_slider, data);
    }
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function formatPrice(num) {
    return Number(num).toLocaleString('en-PK');
}

function getTrustBadgeIcon(iconName, size = 11) {
    const icons = {
        'shield-checkmark': `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 16 10"/></svg>`,
        'cash': `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 12h.01M17 12h.01"/></svg>`,
        'car': `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`,
        'truck': `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
        'checkmark-circle': `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    };
    const key = String(iconName || '').replace(/-outline$/, '').trim();
    return icons[key] || '';
}

function getFallbackSVG(id) {
    if (id === 'mic') {
        return `<svg viewBox="0 0 100 100" width="80" height="80" style="color: #00f3ff; filter: drop-shadow(0 0 8px rgba(0,243,255,0.4));">
            <rect x="40" y="20" width="20" height="40" rx="10" fill="currentColor" opacity="0.8"/>
            <path d="M30 40C30 51 40 60 50 60C60 60 70 51 70 40" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/>
            <line x1="50" y1="60" x2="50" y2="75" stroke="currentColor" stroke-width="4"/>
            <line x1="35" y1="75" x2="65" y2="75" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        </svg>`;
    } else if (id === 'speaker') {
        return `<svg viewBox="0 0 100 100" width="80" height="80" style="color: #ff6b00; filter: drop-shadow(0 0 8px rgba(255,107,0,0.4));">
            <rect x="25" y="15" width="50" height="70" rx="12" fill="none" stroke="currentColor" stroke-width="4"/>
            <circle cx="50" cy="38" r="12" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
            <circle cx="50" cy="38" r="4" fill="currentColor"/>
            <circle cx="50" cy="68" r="16" fill="none" stroke="currentColor" stroke-width="3"/>
            <circle cx="50" cy="68" r="8" fill="currentColor" opacity="0.5"/>
        </svg>`;
    } else if (id === 'kit') {
        return `<svg viewBox="0 0 100 100" width="80" height="80" style="color: #25d366; filter: drop-shadow(0 0 8px rgba(37,211,102,0.4));">
            <path d="M20 25L45 15V45L20 35V25Z" fill="currentColor" opacity="0.7"/>
            <rect x="10" y="22" width="10" height="16" rx="2" fill="currentColor"/>
            <rect x="20" y="55" width="60" height="25" rx="4" fill="none" stroke="currentColor" stroke-width="4"/>
            <circle cx="35" cy="67" r="3" fill="currentColor"/>
            <circle cx="45" cy="67" r="3" fill="currentColor"/>
            <circle cx="55" cy="67" r="3" fill="currentColor"/>
            <path d="M80 25L55 15V45L80 35V25Z" fill="currentColor" opacity="0.4"/>
            <rect x="80" y="22" width="10" height="16" rx="2" fill="currentColor" opacity="0.6"/>
        </svg>`;
    } else {
        return `<svg viewBox="0 0 100 100" width="80" height="80" style="color: #cbd5e1; filter: drop-shadow(0 0 8px rgba(203,213,225,0.4));">
            <rect x="30" y="30" width="40" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="4"/>
            <circle cx="50" cy="50" r="8" fill="currentColor"/>
        </svg>`;
    }
}

function renderGadgets(container, gadgets, whatsappNum) {
    container.innerHTML = '';
    
    // Default fallback contact WhatsApp
    const waBase = (whatsappNum || "0320-6755555").replace(/[-\s]+/g, '');
    const waNum = waBase.startsWith('0') ? '92' + waBase.substring(1) : waBase;

    // Filter only visible items
    const visibleGadgets = gadgets.filter(g => g.visible !== false);
    
    visibleGadgets.forEach(g => {
        const card = document.createElement('div');
        card.className = 'rl-store-card';
        
        const badgeClass = g.tag && g.tag.toLowerCase().includes('outdoor') ? 'orange' : (g.tag && g.tag.toLowerCase().includes('kit') ? 'green' : '');
        const badgeHTML = g.tag ? `<span class="rl-card-badge ${badgeClass}">${g.tag}</span>` : '';
        
        let imgHTML = '';
        const isVideo = g.image && (g.image.endsWith('.mp4') || g.image.endsWith('.webm') || g.image.endsWith('.mov') || g.image.endsWith('.ogg') || g.image.endsWith('.quicktime'));
        
        if (g.image_type === 'svg' || !g.image) {
            imgHTML = getFallbackSVG(g.id);
        } else if (isVideo) {
            imgHTML = `<video src="${g.image}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>`;
        } else {
            imgHTML = `<img src="${g.image}" alt="${g.name}" loading="lazy" onerror="this.outerHTML=getFallbackSVG('${g.id}')">`;
        }

        // Features (show max 3)
        const features = (g.features || []).slice(0, 3);
        const featuresHTML = features.length ? `
            <ul class="rl-card-specs">
                ${features.map(f => `<li>${f}</li>`).join('')}
            </ul>` : '';

        const detailsLink = getBasePath() + `products/${g.id}`;
        const waMsg = encodeURIComponent(`Assalam-o-Alaikum S M Enterprises,\n\nMujhe yeh product order karna hai:\n- ${g.name}\n- Qeemat: Rs ${formatPrice(g.curr_price)}\n\nKindly confirm karein.`);

        card.innerHTML = `
            ${badgeHTML}
            <div class="rl-card-media" onclick="window.location.href='${detailsLink}'">
                ${imgHTML}
            </div>
            <div class="rl-card-content">
                <h3 class="rl-card-title" onclick="window.location.href='${detailsLink}'">${g.name}</h3>
                ${featuresHTML}
                <div class="rl-card-trust">
                    <span>${getTrustBadgeIcon('shield-checkmark')} PTA</span>
                    <span>${getTrustBadgeIcon('cash')} COD</span>
                    <span>${getTrustBadgeIcon('car')} Free Ship</span>
                </div>
                <div class="rl-card-footer">
                    <div class="rl-card-price-box">
                        ${g.orig_price ? `<span class="rl-price-orig">Rs ${formatPrice(g.orig_price)}</span>` : ''}
                        <span class="rl-price-curr">Rs ${formatPrice(g.curr_price)}</span>
                    </div>
                    <a href="#" class="rl-btn-buy btn-cms-order-now" data-id="${g.id}">
                        <ion-icon name="logo-whatsapp"></ion-icon> Order
                    </a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Attach click listeners to the dynamically created Order buttons
    container.querySelectorAll('.btn-cms-order-now').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const gadget = gadgets.find(p => p.id === id);
            if (gadget) {
                // Set the current dynamic gadget globally so script.js submit handler knows about it
                window.currentOrderProduct = gadget;
                
                const orderModal = document.getElementById('orderModal');
                if (orderModal) {
                    // Hide solar options since this is a dynamic product
                    const formOptions = orderModal.querySelector('.form-options');
                    if (formOptions) formOptions.style.display = 'none';
                    
                    // Set invoice summary details using window.updateInvoiceSummary
                    if (window.updateInvoiceSummary) {
                        window.updateInvoiceSummary(gadget.name, Number(gadget.curr_price));
                    } else {
                        const invoiceItemName = document.getElementById('invoiceItemName');
                        const summaryTotal = document.getElementById('summaryTotal');
                        if (invoiceItemName) invoiceItemName.textContent = gadget.name;
                        if (summaryTotal) summaryTotal.textContent = `Rs ${Number(gadget.curr_price).toLocaleString('en-PK')}`;
                    }
                    
                    // Show modal
                    orderModal.classList.add('show');
                }
            }
        });
    });
}

function attachCatalogSearch(container, gadgets, whatsappNum) {
    const input = document.getElementById('catalogSearch');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        if (!term) {
            renderGadgets(container, gadgets, whatsappNum);
            return;
        }
        const filtered = gadgets.filter(g => {
            const text = `${g.name} ${g.desc || ''} ${g.category || ''} ${g.tag || ''}`.toLowerCase();
            return text.includes(term);
        });
        renderGadgets(container, filtered, whatsappNum);
    });
}

function overrideVideoModal(data) {
    if (!data.videos) return;
    
    // Intercept when script.js defines openVideoModal or wraps it if already loaded
    const originalOpenVideoModal = window.openVideoModal;
    
    window.openVideoModal = function(type) {
        if (data.videos[type]) {
            const videoSrc = data.videos[type];
            const modal = document.getElementById('videoModal');
            const container = document.getElementById('videoContainer');
            if (container && modal) {
                container.innerHTML = '';
                if (type === 'warehouse') {
                    // Check if it's a youtube embed or normal iframe
                    if (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be') || videoSrc.includes('embed')) {
                        let embedSrc = videoSrc;
                        if (!videoSrc.includes('embed')) {
                            // Convert standard watch link to embed link
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                            const match = videoSrc.match(regExp);
                            if (match && match[2].length === 11) {
                                embedSrc = `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}`;
                            }
                        }
                        container.innerHTML = `<iframe width="100%" height="450" class="modal-video" src="${embedSrc}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
                    } else {
                        container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video"><source src="${videoSrc}" type="video/mp4"></video>`;
                    }
                } else if (type === 'farm') {
                    container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="${videoSrc}" type="video/mp4"></video><video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="go_pt_plus_night_vision.mp4" type="video/mp4"></video>`;
                } else {
                    container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video"><source src="${videoSrc}" type="video/mp4"></video>`;
                }
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
                return;
            }
        }
        
        // Fallback to original
        if (typeof originalOpenVideoModal === 'function') {
            originalOpenVideoModal(type);
        }
    };
}

function getBasePath() {
    const idxProducts = window.location.pathname.indexOf('/products/');
    if (idxProducts !== -1) {
        return window.location.pathname.substring(0, idxProducts + 1);
    }
    const idxBlog = window.location.pathname.indexOf('/blog/');
    if (idxBlog !== -1) {
        return window.location.pathname.substring(0, idxBlog + 1);
    }
    const pathname = window.location.pathname;
    const lastSlash = pathname.lastIndexOf('/');
    if (lastSlash !== -1) {
        return pathname.substring(0, lastSlash + 1);
    }
    return '/';
}

// ----------------------------------------------------
// Product Quick View / Stories Modal Controller
// ----------------------------------------------------
window.openProductQuickView = function(id) {
    const modal = document.getElementById('productQuickViewModal');
    const body = document.getElementById('quickViewBody');
    if (!modal || !body) return;

    function render(gadget) {
        if (!gadget) return;
        const origPrice = gadget.orig_price ? Number(gadget.orig_price) : null;
        const currPrice = Number(gadget.curr_price);
        const discount = origPrice && origPrice > currPrice ? Math.round(((origPrice - currPrice) / origPrice) * 100) : null;
        
        let categoryName = "Smart Security";
        if (gadget.category === "dashcams") categoryName = "🚗 4K Car Dashcam";
        else if (gadget.category === "4g-cameras") categoryName = "☀️ 4G Solar Security";
        else if (gadget.category === "wifi-cameras") categoryName = "🎥 4K PTZ CCTV";
        else if (gadget.category === "wireless-mics") categoryName = "🎙️ Wireless Audio";
        else if (gadget.category === "speakers") categoryName = "🔊 Bluetooth Speaker";
        else if (gadget.category === "accessories") categoryName = "🔋 Smart Accessories";

        const features = gadget.features || gadget.hero_bullets || [
            "Official PTA Approved & Genuine Stock",
            "100% Wire-Free / Plug & Play Setup",
            "1-Month Official Replacement Warranty"
        ];
        const featuresList = features.slice(0, 3).map(f => `<li><ion-icon name="checkmark-circle"></ion-icon> <span>${f}</span></li>`).join('');

        const whatsappNum = (window.cmsData && window.cmsData.contact && window.cmsData.contact.whatsapp) ? window.cmsData.contact.whatsapp : "0320-6755555";
        const cleanNum = whatsappNum.replace(/[-\s]+/g, '');
        const formattedNum = cleanNum.startsWith('0') ? '92' + cleanNum.substring(1) : cleanNum;
        const waMsg = encodeURIComponent(`Assalam-o-Alaikum S M Enterprises,\n\nMujhe website par yeh product pasand aayi hai:\n- *${gadget.name}*\n- Qeemat: Rs ${Number(currPrice).toLocaleString('en-PK')}\n\nKindly iska order confirm karein.`);

        const detailsLink = gadget.static_url || (gadget.category ? `/category/${gadget.category}` : '/#smart-gadgets');

        body.innerHTML = `
            <div class="qv-header">
                <span class="qv-cat-badge">${categoryName}</span>
                <span class="qv-stock-badge"><span class="qv-live-dot"></span> In Stock (Express COD)</span>
            </div>
            
            <div class="qv-media-row">
                <div class="qv-img-container">
                    <img src="${gadget.image}" alt="${gadget.name}" class="qv-product-img">
                    ${gadget.tag ? `<span class="qv-promo-tag">${gadget.tag}</span>` : ''}
                </div>
            </div>

            <div class="qv-content">
                <h3 class="qv-title">${gadget.name}</h3>
                
                <div class="qv-price-box">
                    ${origPrice ? `<span class="qv-price-orig">Rs ${origPrice.toLocaleString('en-PK')}</span>` : ''}
                    <span class="qv-price-curr">Rs ${currPrice.toLocaleString('en-PK')}</span>
                    ${discount ? `<span class="qv-discount-pill">Save ${discount}%</span>` : ''}
                </div>
                <p class="qv-tax-note"><ion-icon name="cash-outline"></ion-icon> Cash on Delivery (COD) Available Nationwide</p>

                <ul class="qv-features-list">
                    ${featuresList}
                </ul>

                <div class="qv-trust-pills">
                    <span><ion-icon name="shield-checkmark-outline"></ion-icon> PTA Approved</span>
                    <span><ion-icon name="ribbon-outline"></ion-icon> 1-Month Warranty</span>
                    <span><ion-icon name="flash-outline"></ion-icon> 24-48h Delivery</span>
                </div>

                <div class="qv-actions">
                    <button class="qv-btn-order" onclick="openOrderFromQuickView('${gadget.id}')">
                        <ion-icon name="bag-check-outline"></ion-icon> Order Now (Cash on Delivery)
                    </button>
                    <a href="https://wa.me/${formattedNum}?text=${waMsg}" target="_blank" class="qv-btn-whatsapp">
                        <ion-icon name="logo-whatsapp"></ion-icon> WhatsApp Inquiry
                    </a>
                </div>
                <div class="qv-footer-links">
                    <a href="${detailsLink}" class="qv-view-full-details">View Full Specs &amp; Details <ion-icon name="arrow-forward-outline"></ion-icon></a>
                </div>
            </div>
        `;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    if (window.cmsData && window.cmsData.gadgets) {
        const gadget = window.cmsData.gadgets.find(g => g.id === id);
        render(gadget);
    } else {
        fetch(getBasePath() + 'cms_data.json')
            .then(r => r.json())
            .then(data => {
                window.cmsData = data;
                const gadget = data.gadgets.find(g => g.id === id);
                render(gadget);
            });
    }
};

window.closeProductQuickView = function() {
    const modal = document.getElementById('productQuickViewModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
};

window.openOrderFromQuickView = function(id) {
    closeProductQuickView();
    if (!window.cmsData || !window.cmsData.gadgets) return;
    const gadget = window.cmsData.gadgets.find(g => g.id === id);
    if (!gadget) return;

    window.currentOrderProduct = gadget;
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        const formOptions = orderModal.querySelector('.form-options');
        if (formOptions) formOptions.style.display = 'none';

        if (window.updateInvoiceSummary) {
            window.updateInvoiceSummary(gadget.name, Number(gadget.curr_price));
        } else {
            const invoiceItemName = document.getElementById('invoiceItemName');
            const summaryTotal = document.getElementById('summaryTotal');
            if (invoiceItemName) invoiceItemName.textContent = gadget.name;
            if (summaryTotal) summaryTotal.textContent = `Rs ${Number(gadget.curr_price).toLocaleString('en-PK')}`;
        }
        setTimeout(() => {
            orderModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }, 150);
    }
};

// ==========================================================================
// DYNAMIC HERO SLIDER HYDRATION (From cms_data.json)
// ==========================================================================
function renderHeroSlider(sliderConfig, fullData) {
    const sliderSection = document.querySelector('.reo-hero-slider-section');
    if (!sliderSection) return;

    if (sliderConfig.enabled === false) {
        sliderSection.style.display = 'none';
        return;
    }

    sliderSection.style.display = '';

    const slides = (sliderConfig.slides || []).filter(s => s.enabled !== false);
    if (!slides || slides.length === 0) return;

    const wrapper = sliderSection.querySelector('#heroSliderWrapper') || sliderSection.querySelector('.hero-slider-wrapper');
    const controls = sliderSection.querySelector('#heroSliderControls') || sliderSection.querySelector('.hero-slider-controls');
    if (!wrapper) return;

    // Build dynamic slides HTML
    let slidesHtml = '';
    let pillsHtml = '';

    slides.forEach((slide, idx) => {
        const isActive = idx === 0 ? 'active' : '';
        const theme = slide.theme || 'reolink';
        const isJzones = theme === 'jzones';

        const titleGlowClass = isJzones ? 'hero-title-glow jzones-title-gradient' : 'hero-title-glow';
        const priceBlockClass = isJzones ? 'promo-price-block jzones-price-block' : 'promo-price-block';
        const badgeGlowClass = isJzones ? 'badge-save jzones-badge' : 'badge-save';
        const pulseClass = isJzones ? 'pulse-ring jzones-pulse' : 'pulse-ring';
        const glowClass = isJzones ? 'product-glow jzones-glow' : 'product-glow';
        const camWrapperClass = isJzones ? 'cam-wrapper jzones-cam-wrapper' : 'cam-wrapper';

        // Badges
        let badgesHtml = '';
        if (slide.badges && slide.badges.length > 0) {
            badgesHtml = slide.badges.map(b => {
                const bText = typeof b === 'string' ? b : b.text;
                const bClass = typeof b === 'object' && b.class ? b.class : (isJzones ? 'cyan-glow' : 'orange');
                const bIcon = typeof b === 'object' && b.icon ? `<ion-icon name="${b.icon}"></ion-icon>` : '';
                return `<span class="reo-badge ${bClass}">${bIcon} ${bText}</span>`;
            }).join('');
        }

        // Features list
        let featuresHtml = '';
        if (slide.features && slide.features.length > 0) {
            const iconAccent = isJzones ? 'jzones-icon-accent' : '';
            featuresHtml = `<ul class="hero-feature-list ${isJzones ? 'jzones-feature-list' : ''}">` + 
                slide.features.map(f => `<li><ion-icon name="checkmark-circle" class="${iconAccent}"></ion-icon> <span>${f}</span></li>`).join('') + 
                `</ul>`;
        }

        // Stat chips if any
        let statChipsHtml = '';
        if (slide.stat_chips && slide.stat_chips.length > 0) {
            statChipsHtml = `<div class="hero-stat-chips-row">` + 
                slide.stat_chips.map(c => `<div class="hero-stat-chip"><span class="chip-val">${c.val}</span><span class="chip-lbl">${c.lbl}</span></div>`).join('') + 
                `</div>`;
        }

        // Price calculations
        const origPriceFormatted = slide.orig_price ? Number(slide.orig_price).toLocaleString('en-PK') : '';
        const currPriceFormatted = slide.curr_price ? Number(slide.curr_price).toLocaleString('en-PK') : '';
        const saveText = slide.save_text || (slide.orig_price && slide.curr_price ? `Save ${Math.round(((slide.orig_price - slide.curr_price) / slide.orig_price) * 100)}%` : '');

        // CTA Buttons
        let buttonsHtml = '';
        if (slide.primary_btn_text) {
            buttonsHtml += `<a href="${slide.primary_btn_link || '#'}" class="${slide.primary_btn_class || 'btn-reo-primary'}">${slide.primary_btn_text}</a>`;
        }
        if (slide.secondary_btn_text) {
            buttonsHtml += `<a href="${slide.secondary_btn_link || '#'}" class="${slide.secondary_btn_class || 'btn-reo-secondary'}">${slide.secondary_btn_text}</a>`;
        }
        if (slide.tertiary_btn_text) {
            const onclickAttr = slide.tertiary_btn_onclick ? `onclick="${slide.tertiary_btn_onclick}"` : '';
            const tertiaryLink = slide.tertiary_btn_link || (isJzones ? '/products/jzones-v630' : 'javascript:void(0)');
            buttonsHtml += `<a href="${tertiaryLink}" class="btn-reo-secondary jzones-quick-btn" ${onclickAttr}>${slide.tertiary_btn_text}</a>`;
        }

        // Floating tags
        let floatingTagsHtml = '';
        if (slide.floating_tags && slide.floating_tags.length > 0) {
            const tagsList = slide.floating_tags.map((t, ti) => {
                const tagClass = isJzones ? `jz-${ti + 1}` : `ft-${ti + 1}`;
                let iconHtml = '';
                if (t.type === 'svg' || (t.icon && t.icon.startsWith('icon-'))) {
                    iconHtml = `<svg><use href="#${t.icon}"></use></svg>`;
                } else if (t.icon) {
                    iconHtml = `<ion-icon name="${t.icon}"></ion-icon>`;
                }
                return `<div class="float-tag ${tagClass}">${iconHtml} <span>${t.text}</span></div>`;
            }).join('');
            floatingTagsHtml = `<div class="mobile-tags-row ${isJzones ? 'jzones-tags-row' : ''}">${tagsList}</div>`;
        }

        // Rain canvas if enabled
        const rainCanvasHtml = slide.show_rain ? `<canvas id="rainCanvas" class="rain-canvas"></canvas>` : '';

        // Product visual
        let productVisualHtml = '';
        if (isJzones) {
            const jzonesLink = slide.image_link || slide.primary_btn_link || '/products/jzones-v630';
            productVisualHtml = `
                <div class="main-cam jzones-cam-stage">
                    <div class="weatherproof-badge reveal-up jzones-badge-overlay">
                        <ion-icon name="car-sport-outline"></ion-icon>
                        <span>3-Way Car Surveillance</span>
                    </div>
                    <a href="${jzonesLink}" class="jzones-product-mask" title="View ${slide.title || 'JZONES V630 4K Dash Cam'} Full Details">
                        <img src="${slide.image}" width="560" height="420" alt="${slide.image_alt || slide.title}" class="jzones-hero-main-img" loading="lazy">
                    </a>
                </div>`;
        } else {
            const isReolinkGoPtPlus = !slide.id || slide.id === 'reolink-go-pt-plus';
            const extraVariantHtml = isReolinkGoPtPlus ? `<img src="images/camera-no-solar.webp" width="1024" height="1014" alt="Reolink Go PT Plus 4G LTE Security Camera - PTA Approved" class="variant-img v2">` : '';
            productVisualHtml = `
                <div class="main-cam">
                    <div class="weatherproof-badge reveal-up">
                        <ion-icon name="water-outline"></ion-icon>
                        <span>Weatherproof IP66</span>
                    </div>
                    <div class="product-rain-mask">
                        <img src="${slide.image}" width="600" height="600" alt="${slide.image_alt || slide.title}" class="variant-img v1" fetchpriority="high" decoding="async">
                        ${extraVariantHtml}
                        ${rainCanvasHtml}
                    </div>
                </div>`;
        }

        slidesHtml += `
            <div class="hero-slide ${isActive}" data-slide-index="${idx}" data-theme="${theme}">
                <div class="hero-container ${isJzones ? 'hero-container-jzones' : ''}">
                    <div class="hero-content">
                        <div class="badge-group">${badgesHtml}</div>
                        <h1 class="${titleGlowClass}">${slide.title}</h1>
                        <p class="hero-subtitle">${slide.subtitle}</p>
                        ${featuresHtml}
                        ${statChipsHtml}
                        <div class="${priceBlockClass}">
                            <div class="price-current">
                                <span class="currency">Rs</span>
                                <span class="amount">${currPriceFormatted}</span>
                            </div>
                            ${origPriceFormatted ? `<div class="price-original">Rs ${origPriceFormatted}</div>` : ''}
                            ${saveText ? `<div class="${badgeGlowClass}"><span class="${pulseClass}"></span>${saveText}</div>` : ''}
                        </div>
                        <div class="hero-actions">${buttonsHtml}</div>
                    </div>
                    <div class="hero-visual">
                        <div class="${glowClass}"></div>
                        <div class="${camWrapperClass}">
                            ${productVisualHtml}
                            ${floatingTagsHtml}
                        </div>
                    </div>
                </div>
            </div>`;

        // Navigation Pill
        pillsHtml += `
            <button type="button" class="hero-pill-tab ${isActive}" data-slide-target="${idx}" onclick="goToHeroSlide(${idx})">
                <span class="tab-indicator-ring"></span>
                <span class="tab-meta">
                    <span class="tab-title"><ion-icon name="${slide.pill_icon || 'star-outline'}"></ion-icon> ${slide.pill_title || slide.title}</span>
                    <span class="tab-subtitle">${slide.pill_subtitle || ''}</span>
                </span>
                <div class="tab-progress-track">
                    <div class="tab-progress-fill ${isActive ? 'running' : ''}"></div>
                </div>
            </button>`;
    });

    wrapper.innerHTML = slidesHtml;

    if (controls && slides.length > 1) {
        controls.innerHTML = `
            <button type="button" class="hero-nav-arrow prev-arrow" onclick="changeHeroSlide(-1)" aria-label="Previous Flagship">
                <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            <div class="hero-slider-pills">${pillsHtml}</div>
            <button type="button" class="hero-nav-arrow next-arrow" onclick="changeHeroSlide(1)" aria-label="Next Flagship">
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>`;
        controls.style.display = 'flex';
    } else if (controls) {
        controls.style.display = 'none';
    }

    // Re-initialize slider engine with CMS-configured duration
    const duration = (sliderConfig.interval_seconds || 4.5) * 1000;
    if (typeof initHeroSlider === 'function') {
        initHeroSlider(duration);
    }
    if (typeof window.initRain === 'function') {
        window.initRain();
    }
}

