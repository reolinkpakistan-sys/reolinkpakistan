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
    }

    // 4. Override Video Modal Player
    overrideVideoModal(data);
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function formatPrice(num) {
    return Number(num).toLocaleString('en-PK');
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
                    <span><ion-icon name="shield-checkmark-outline"></ion-icon> PTA</span>
                    <span><ion-icon name="cash-outline"></ion-icon> COD</span>
                    <span><ion-icon name="car-outline"></ion-icon> Free Ship</span>
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
