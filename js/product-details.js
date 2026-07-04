document.addEventListener('DOMContentLoaded', () => {
    // 1. Get product ID from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');

    if (!productId) {
        const path = window.location.pathname;
        const productsIndex = path.indexOf('/products/');
        if (productsIndex !== -1) {
            const afterProducts = path.substring(productsIndex + '/products/'.length);
            productId = afterProducts.replace(/\/$/, '');
        }
    }

    if (!productId) {
        // Redirect to homepage if no ID is found
        window.location.href = getBasePath() + 'index.html';
        return;
    }

    // 2. Fetch configurations from cms_data.json
    fetch(getBasePath() + 'cms_data.json')
        .then(response => response.json())
        .then(data => {
            const gadgets = data.gadgets || [];
            const product = gadgets.find(g => g.id === productId);

            if (!product) {
                // If product doesn't exist, redirect back
                window.location.href = getBasePath() + 'index.html';
                return;
            }

            // 3. Inject details into template DOM
            renderProductDetails(product, data.contact);
            renderRelatedProducts(gadgets, productId, data.contact);
        })
        .catch(err => {
            console.error('Error loading product config database:', err);
            window.location.href = getBasePath() + 'index.html';
        });
});

function formatPrice(num) {
    return Number(num).toLocaleString('en-PK');
}

function setElementTagName(id, newTagName) {
    const el = document.getElementById(id);
    if (!el || el.tagName.toLowerCase() === newTagName.toLowerCase()) return el;
    const parent = el.parentNode;
    const newEl = document.createElement(newTagName);
    for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        newEl.setAttribute(attr.name, attr.value);
    }
    while (el.firstChild) {
        newEl.appendChild(el.firstChild);
    }
    parent.replaceChild(newEl, el);
    return newEl;
}

function getFallbackSVG(id) {
    if (id === 'mic') {
        return `<svg viewBox="0 0 100 100" width="160" height="160" style="color: #00f3ff; filter: drop-shadow(0 0 15px rgba(0,243,255,0.4));">
            <rect x="40" y="20" width="20" height="40" rx="10" fill="currentColor" opacity="0.8"/>
            <path d="M30 40C30 51 40 60 50 60C60 60 70 51 70 40" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/>
            <line x1="50" y1="60" x2="50" y2="75" stroke="currentColor" stroke-width="4"/>
            <line x1="35" y1="75" x2="65" y2="75" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        </svg>`;
    } else if (id === 'speaker') {
        return `<svg viewBox="0 0 100 100" width="160" height="160" style="color: #ff6b00; filter: drop-shadow(0 0 15px rgba(255,107,0,0.4));">
            <rect x="25" y="15" width="50" height="70" rx="12" fill="none" stroke="currentColor" stroke-width="4"/>
            <circle cx="50" cy="38" r="12" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
            <circle cx="50" cy="38" r="4" fill="currentColor"/>
            <circle cx="50" cy="68" r="16" fill="none" stroke="currentColor" stroke-width="3"/>
            <circle cx="50" cy="68" r="8" fill="currentColor" opacity="0.5"/>
        </svg>`;
    } else if (id === 'kit') {
        return `<svg viewBox="0 0 100 100" width="160" height="160" style="color: #25d366; filter: drop-shadow(0 0 15px rgba(37,211,102,0.4));">
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
        return `<svg viewBox="0 0 100 100" width="160" height="160" style="color: #cbd5e1; filter: drop-shadow(0 0 15px rgba(203,213,225,0.4));">
            <rect x="30" y="30" width="40" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="4"/>
            <circle cx="50" cy="50" r="8" fill="currentColor"/>
        </svg>`;
    }
}

const SITE_ORIGIN = 'https://www.reolink.com.pk';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/images/camera.webp`;

function setMetaContent(id, content) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('content', content);
}

function setLinkHref(id, href) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('href', href);
}

function absoluteImageUrl(imagePath) {
    if (!imagePath) return DEFAULT_OG_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${SITE_ORIGIN}${imagePath}`;
    return `${SITE_ORIGIN}/${imagePath}`;
}

function injectBreadcrumbSchema(product) {
    const oldSchema = document.getElementById('dynamicBreadcrumbSchema');
    if (oldSchema) oldSchema.remove();

    const categoryMap = {
        '4g-cameras': '4G SIM Cameras',
        'solar-cameras': 'Solar Cameras',
        'wifi-cameras': 'WiFi Cameras',
        'cctv-systems': 'CCTV Systems',
        'wireless-mics': 'Wireless Microphones',
        'speakers': 'Bluetooth Speakers',
        'accessories': 'Accessories'
    };

    const categoryName = categoryMap[product.category] || 'Products';
    const categoryUrl = `${SITE_ORIGIN}/category/${product.category}`;
    const productUrl = `${SITE_ORIGIN}${product.static_url || `/products/${product.id}`}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": SITE_ORIGIN
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": categoryName,
                "item": categoryUrl
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": productUrl
            }
        ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamicBreadcrumbSchema';
    script.text = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}

function injectProductSchema(product) {
    const oldSchema = document.getElementById('dynamicProductSchema');
    if (oldSchema) oldSchema.remove();

    const productUrl = SITE_ORIGIN + (product.static_url || `/products/${product.id}`);
    const imageUrl = absoluteImageUrl(product.image);

    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [imageUrl],
        "description": product.desc,
        "brand": {
            "@type": "Brand",
            "name": product.brand || "Reolink"
        },
        "sku": product.sku || product.id.toUpperCase(),
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "PKR",
            "price": String(product.curr_price || 0),
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "LocalBusiness",
                "name": "S M Enterprises"
            }
        }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamicProductSchema';
    script.text = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}

function renderProductDetails(product, contactInfo) {
    // Page Title & Meta Tags (SEO)
    document.title = product.meta_title || `${product.name} | S M Enterprises Tech Store`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', product.meta_desc || `Buy ${product.name} in Pakistan from S M Enterprises. High quality products with 1 month official warranty and express delivery.`);

    if (product.focus_keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', product.focus_keywords);
    }

    // Canonical, Open Graph & Twitter dynamic injection
    const productUrl = SITE_ORIGIN + (product.static_url || `/products/${product.id}`);
    const imageUrl = absoluteImageUrl(product.image);
    const displayTitle = product.meta_title || `${product.name} | S M Enterprises Tech Store`;
    const displayDesc = product.meta_desc || `Buy ${product.name} in Pakistan from S M Enterprises. High quality products with 1 month official warranty and express delivery.`;

    setLinkHref('pdCanonical', productUrl);
    setMetaContent('pdOgType', 'product');
    setMetaContent('pdOgTitle', displayTitle);
    setMetaContent('pdOgDesc', displayDesc);
    setMetaContent('pdOgImage', imageUrl);
    setMetaContent('pdOgUrl', productUrl);
    setMetaContent('pdOgPriceAmount', String(product.curr_price || 0));
    setMetaContent('pdTwitterTitle', displayTitle);
    setMetaContent('pdTwitterDesc', displayDesc);
    setMetaContent('pdTwitterImage', imageUrl);

    // Inject Product Schema JSON-LD dynamically
    injectProductSchema(product);
    injectBreadcrumbSchema(product);

    // Toggle Stitch design theme class for Alvoxcon Microphone
    if (product.id === 'alvoxcon-mic') {
        document.body.classList.add('stitch-theme-mic');
    } else {
        document.body.classList.remove('stitch-theme-mic');
    }

    if (product.layout_type === 'hero_immersive') {
        const standardLayout = document.getElementById('layoutStandard');
        if (standardLayout) standardLayout.style.display = 'none';
        
        const heroLayout = document.getElementById('layoutHero');
        if (heroLayout) heroLayout.style.display = 'block';
        
        setElementTagName('heroTitle', 'h1');
        setElementTagName('productTitle', 'h2');
        renderHeroLayout(product, contactInfo);
    } else if (product.layout_type === 'nature_immersive') {
        const standardLayout = document.getElementById('layoutStandard');
        if (standardLayout) standardLayout.style.display = 'none';
        
        const heroLayout = document.getElementById('layoutHero');
        if (heroLayout) heroLayout.style.display = 'none';
        
        const natureLayout = document.getElementById('layoutNature');
        if (natureLayout) natureLayout.style.display = 'block';
        
        setElementTagName('heroTitle', 'h2');
        setElementTagName('productTitle', 'h2');
        renderNatureLayout(product, contactInfo);
    } else {
        const heroLayout = document.getElementById('layoutHero');
        if (heroLayout) heroLayout.style.display = 'none';
        
        const standardLayout = document.getElementById('layoutStandard');
        if (standardLayout) standardLayout.style.display = 'block';
        
        setElementTagName('heroTitle', 'h2');
        setElementTagName('productTitle', 'h1');
        renderStandardLayout(product, contactInfo);
    }

    // Scarcity badge
    const scarcityEl = document.getElementById('productScarcity');
    if (scarcityEl && product.stock !== undefined && product.stock <= 10) {
        scarcityEl.innerHTML = `<span class="scarcity-badge"><ion-icon name="flame"></ion-icon> Only ${product.stock} left in stock — ${product.viewing || 5} people viewing</span>`;
    }

    // Shared UI logic for BOTH layouts (Specs, Checkout Modal)

    // Model in specs
    const specModel = document.getElementById('specModel');
    if (specModel) specModel.textContent = product.name.replace(/\s+/g, '-').toUpperCase();

    // Render Dynamic Specs into table
    const specsTbody = document.querySelector('.specs-table tbody');
    if (specsTbody && product.specs) {
        // Find the first row (Product Model) and insert custom specs after it
        const firstRow = specsTbody.firstElementChild;
        if (firstRow) {
            // Remove previously added dynamic rows if they exist
            document.querySelectorAll('.dynamic-spec-row').forEach(row => row.remove());
            
            // Insert in reverse order right after the first row to keep them together
            const specEntries = Object.entries(product.specs).reverse();
            specEntries.forEach(([key, value]) => {
                const tr = document.createElement('tr');
                tr.className = 'dynamic-spec-row';
                tr.innerHTML = `<td class="specs-label">${key}</td><td class="specs-value">${value}</td>`;
                firstRow.after(tr);
            });
        }
    }

    // Modal Details setup with COD Surcharge calculation
    function updateDetailsInvoice(checkoutProduct) {
        const price = Number(checkoutProduct.curr_price);
        const codBase = price - 2000;
        const codTax = Math.round(codBase * 0.04);
        const codPayable = codBase + codTax;
        const totalCost = price + codTax;

        const summaryCam = document.getElementById('summaryCam');
        const summaryCodTax = document.getElementById('summaryCodTax');
        const summaryCodPayable = document.getElementById('summaryCodPayable');
        const summaryTotal = document.getElementById('summaryTotal');
        const invoicePrice = document.getElementById('invoicePrice');

        if (summaryCam) summaryCam.textContent = checkoutProduct.name;
        if (invoicePrice) invoicePrice.textContent = `Rs ${formatPrice(price)}`;
        if (summaryCodTax) summaryCodTax.textContent = `Rs ${formatPrice(codTax)}`;
        if (summaryCodPayable) summaryCodPayable.textContent = `Rs ${formatPrice(codPayable)}`;
        if (summaryTotal) summaryTotal.textContent = `Rs ${formatPrice(totalCost)}`;
        
        return { price, codTax, codPayable, totalCost };
    }

    // Set invoice details initially on load
    updateDetailsInvoice(product);

    // Checkout submission handling
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        // Clone to remove previous event listeners
        const newForm = checkoutForm.cloneNode(true);
        checkoutForm.parentNode.replaceChild(newForm, checkoutForm);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('custName')?.value || '';
            const phone = document.getElementById('custPhone')?.value || '';
            
            // Use window.currentOrderProduct if checking out a related product
            const checkoutProduct = window.currentOrderProduct || product;
            
            const price = Number(checkoutProduct.curr_price);
            const codBase = price - 2000;
            const codTax = Math.round(codBase * 0.04);
            const codPayable = codBase + codTax;
            const totalCost = price + codTax;

            // Build custom checkout message
            const message = `Assalam-o-Alaikum S M Enterprises,\n\nI want to confirm my order from the website:\n- Customer Name: ${name}\n- Contact Phone/WhatsApp: ${phone}\n- Product Name: ${checkoutProduct.name}\n- Base Price: Rs ${formatPrice(price)}\n- Advance Paid: Rs 2,000\n- COD Surcharge (4% Govt Tax): Rs ${formatPrice(codTax)}\n- Remaining Payable on Delivery: Rs ${formatPrice(codPayable)}\n- Total Order Cost: Rs ${formatPrice(totalCost)}\n\nNote: I will share the advance payment screenshot here. I understand that a 4% Government Tax is charged on the COD amount.`;
            const encodedMessage = encodeURIComponent(message);
            
            // Get official WhatsApp from configurations
            const waBase = (contactInfo ? contactInfo.whatsapp : "0320-6755555").replace(/[-\s]+/g, '');
            const waNum = waBase.startsWith('0') ? '92' + waBase.substring(1) : waBase;

            window.open(`https://wa.me/${waNum}?text=${encodedMessage}`, '_blank');
            
            // Close modal
            const orderModal = document.getElementById('orderModal');
            if (orderModal) orderModal.classList.remove('show');
        });
    }

    // Expose modal triggers globally as fallback
    window.openSelectionModal = function() {
        const modal = document.getElementById('actionSelectionModal');
        if (modal) {
            modal.classList.add('show');
        } else {
            window.location.href = getBasePath() + 'index.html#overview';
        }
    };
    window.openOrderModal = function() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.classList.add('show');
    };
    window.openSelfCollectModal = function() {
        const modal = document.getElementById('selfCollectModal');
        if (modal) modal.classList.add('show');
    };
}

function renderHeroLayout(product, contactInfo) {
    const heroLayout = document.getElementById('layoutHero');
    // 1. Badges
    const badgesContainer = document.getElementById('heroBadges');
    if (badgesContainer) {
        badgesContainer.innerHTML = '';
        if (product.hero_badges && product.hero_badges.length > 0) {
            product.hero_badges.forEach(badgeText => {
                if (badgeText.trim()) {
                    let badgeClass = 'reo-badge';
                    const txt = badgeText.toLowerCase();
                    if (txt.includes('pta')) {
                        badgeClass += ' orange';
                    } else if (txt.includes('4g') || txt.includes('lte') || txt.includes('sim')) {
                        badgeClass += ' blue-outline';
                    } else if (txt.includes('wire-free') || txt.includes('solar') || txt.includes('wireless') || txt.includes('battery')) {
                        badgeClass += ' green-glow';
                    } else if (txt.includes('night') || txt.includes('color') || txt.includes('colour') || txt.includes('vision')) {
                        badgeClass += ' purple-glow';
                    } else {
                        badgeClass += ' green-glow';
                    }
                    badgesContainer.innerHTML += `<span class="${badgeClass}">${badgeText}</span>`;
                }
            });
        }
    }

    // 2. Title & Description
    const titleEl = document.getElementById('heroTitle');
    if (titleEl) {
        if (product.name.includes('(Without Solar Plate)')) {
            const mainName = product.name.replace(/\(Without Solar Plate\)/i, '').trim();
            titleEl.innerHTML = `${mainName} <br><span class="hero-title-sub">(Without Solar Plate)</span>`;
        } else {
            titleEl.textContent = product.name;
        }
    }

    const descEl = document.getElementById('heroDesc');
    if (descEl) descEl.textContent = product.desc || 'High-performance camera.';

    // 3. Feature Bullets
    const bulletsEl = document.getElementById('heroBullets');
    if (bulletsEl) {
        bulletsEl.innerHTML = '';
        if (product.hero_bullets && product.hero_bullets.length > 0) {
            product.hero_bullets.forEach(bullet => {
                if (bullet.trim()) {
                    bulletsEl.innerHTML += `<li><ion-icon name="checkmark-circle"></ion-icon> <span>${bullet}</span></li>`;
                }
            });
        }
    }

    // 3.5 Trust Badges Grid
    const trustBadgesEl = document.getElementById('heroTrustBadges');
    if (trustBadgesEl) {
        trustBadgesEl.style.display = 'grid';
        const is4G = product.category === '4g-cameras' || 
                     (product.hero_badges && product.hero_badges.some(b => b.toLowerCase().includes('4g') || b.toLowerCase().includes('sim')));
        const isAccessory = product.category === 'accessories';
        
        let firstCardHtml = '';
        if (is4G) {
            firstCardHtml = `
                <div class="trust-badge-card pta-glow">
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    <div>PTA Approved</div>
                </div>
            `;
        } else if (isAccessory) {
            firstCardHtml = `
                <div class="trust-badge-card">
                    <ion-icon name="sunny-outline"></ion-icon>
                    <div>Continuous Charging</div>
                </div>
            `;
        } else {
            firstCardHtml = `
                <div class="trust-badge-card">
                    <ion-icon name="hardware-chip-outline"></ion-icon>
                    <div>Smart Detection</div>
                </div>
            `;
        }
        
        const isReolink = (product.name.toLowerCase().includes('reolink') || product.name.toLowerCase().includes('keen')) && !isAccessory;
        const packagingHtml = isReolink ? `
            <div class="trust-badge-card">
                <ion-icon name="cube-outline"></ion-icon>
                <div>Without Box</div>
            </div>
        ` : (isAccessory ? `
            <div class="trust-badge-card">
                <ion-icon name="water-outline"></ion-icon>
                <div>IP65 Weatherproof</div>
            </div>
        ` : '');

        trustBadgesEl.innerHTML = `
            ${firstCardHtml}
            <div class="trust-badge-card">
                <ion-icon name="construct-outline"></ion-icon>
                <div>${product.warranty || "1-Month Warranty"}</div>
            </div>
            ${packagingHtml}
            <div class="trust-badge-card">
                <ion-icon name="ribbon-outline"></ion-icon>
                <div>100% Original</div>
            </div>
        `;
    }

    // 4. Price Block
    const priceBlock = document.getElementById('heroPriceBlock');
    if (priceBlock && product.curr_price) {
        priceBlock.style.display = 'flex';
        const origPriceEl = document.getElementById('heroOrigPrice');
        const currPriceEl = document.getElementById('heroCurrPrice');
        const discountEl = document.getElementById('heroDiscount');

        if (origPriceEl) {
            origPriceEl.textContent = product.orig_price ? `Rs ${formatPrice(product.orig_price)}` : '';
        }
        if (currPriceEl) {
            currPriceEl.textContent = formatPrice(product.curr_price);
        }
        if (discountEl && product.orig_price) {
            const saveAmount = product.orig_price - product.curr_price;
            discountEl.innerHTML = `<span class="badge-text">Save Rs ${formatPrice(saveAmount)}</span>`;
        } else if (discountEl) {
            discountEl.style.display = 'none';
        }
    }

    // 5. Hero Actions — buttons now use modal trigger classes (btn-order-trigger / btn-self-collect-trigger)
    // Modals are handled by script.js same as homepage

    const videoBtn = document.getElementById('heroVideoBtn');
    if (videoBtn) {
        if (product.youtube_url) {
            window.currentHeroVideo = product.youtube_url;
            videoBtn.style.display = 'inline-flex';
            videoBtn.onclick = function() {
                const modal = document.getElementById('videoModal');
                const container = document.getElementById('videoContainer');
                if (modal && container) {
                    const match = product.youtube_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                    const ytId = (match && match[2].length === 11) ? match[2] : null;
                    if (ytId) {
                        container.innerHTML = `<iframe width="100%" height="450" class="modal-video" src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
                    } else {
                        container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video"><source src="${product.youtube_url}" type="video/mp4"></video>`;
                    }
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            };
        } else if (product.gallery && product.gallery.some(v => v.endsWith('.mp4') || v.endsWith('.webm') || v.endsWith('.mov'))) {
            const videoUrl = product.gallery.find(v => v.endsWith('.mp4') || v.endsWith('.webm') || v.endsWith('.mov'));
            window.currentHeroVideo = videoUrl;
            videoBtn.style.display = 'inline-flex';
            videoBtn.onclick = function() {
                const modal = document.getElementById('videoModal');
                const container = document.getElementById('videoContainer');
                if (modal && container) {
                    container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video"><source src="${videoUrl}" type="video/mp4"></video>`;
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            };
        } else {
            videoBtn.style.display = 'none';
        }
    }

    // 6. Visuals & Rain
    const mainImg = document.getElementById('heroMainImg');
    if (mainImg) {
        let activeVisual = mainImg;
        if (product.model_3d) {
            if (mainImg.tagName.toLowerCase() !== 'model-viewer') {
                const modelViewer = document.createElement('model-viewer');
                modelViewer.id = 'heroMainImg';
                modelViewer.className = 'variant-img v1';
                modelViewer.setAttribute('src', product.model_3d);
                modelViewer.setAttribute('auto-rotate', '');
                modelViewer.setAttribute('camera-controls', '');
                modelViewer.setAttribute('shadow-intensity', '1');
                modelViewer.style.width = '100%';
                modelViewer.style.height = '450px';
                modelViewer.style.background = 'transparent';
                modelViewer.style.outline = 'none';
                modelViewer.style.setProperty('--poster-color', 'transparent');
                
                mainImg.parentNode.replaceChild(modelViewer, mainImg);
                activeVisual = modelViewer;
            } else {
                mainImg.setAttribute('src', product.model_3d);
                activeVisual = mainImg;
            }
            // Fix collapse, pointer-events and animation issues for 3D model
            activeVisual.style.animation = 'none';
            activeVisual.style.opacity = '1';
            activeVisual.style.height = '450px';
            activeVisual.style.pointerEvents = 'auto';
        } else {
            if (mainImg.tagName.toLowerCase() === 'model-viewer') {
                const img = document.createElement('img');
                img.id = 'heroMainImg';
                img.className = 'variant-img v1';
                img.alt = product.name;
                img.src = product.image;
                mainImg.parentNode.replaceChild(img, mainImg);
                activeVisual = img;
            } else {
                mainImg.src = product.image;
                mainImg.alt = product.name;
                activeVisual = mainImg;
            }
            // Fix animation bug: Disable variant fade animation if there's no night variant
            activeVisual.style.animation = 'none';
            activeVisual.style.opacity = '1';
        }
    }

    const rainCanvas = document.getElementById('heroRainCanvas');
    const rainBadge = document.getElementById('heroRainBadge');
    if (product.hero_show_rain === 'on' || product.hero_show_rain === true) {
        if (rainBadge) rainBadge.style.display = 'flex';
        if (rainCanvas) {
            rainCanvas.style.display = 'block';
            initHeroRainEffect();
        }
    } else {
        if (rainBadge) rainBadge.style.display = 'none';
        if (rainCanvas) rainCanvas.style.display = 'none';
    }

    // 7. Floating Tags
    const tagsContainer = document.getElementById('heroTagsContainer');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        if (product.hero_floating_tags && product.hero_floating_tags.length > 0) {
            const positions = ['ft-1', 'ft-2', 'ft-3', 'ft-4', 'ft-5', 'ft-6'];
            product.hero_floating_tags.forEach((tag, index) => {
                const posClass = positions[index % positions.length];
                tagsContainer.innerHTML += `
                    <div class="float-tag ${posClass}">
                        <div class="tag-icon"><ion-icon name="${tag.icon || 'star'}"></ion-icon></div>
                        <span>${tag.text || ''}</span>
                    </div>`;
            });
        }
    }



    // 8. Rich Feature Sections for Hero Layout
    let existingRichFeatures = document.getElementById('heroRichFeaturesContainer');
    if (existingRichFeatures) existingRichFeatures.remove();

    if (product.rich_features && product.rich_features.length > 0) {
        if (heroLayout) {
            const richContainer = document.createElement('div');
            richContainer.id = 'heroRichFeaturesContainer';
            richContainer.className = 'rich-features-container product-container';

            let richHtml = '';

            product.rich_features.forEach((sec, secIndex) => {
                if (sec.type === 'collage') {
                    richHtml += `
                        <div class="collage-block">
                            <div class="feature-section-header">
                                <span class="eyebrow">Visuals</span>
                                <h2>${sec.title}</h2>
                                <p>${sec.desc}</p>
                            </div>
                            <div class="collage-grid-container">
                                ${(sec.collage_images || []).map((img, i) => `
                                    <div class="collage-grid-item collage-item-${i+1}">
                                        <img src="${img}" alt="Collage Image ${i+1}" loading="lazy">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else if (sec.type === 'subfeatures') {
                    richHtml += `
                        <div class="subfeatures-block">
                            <div class="feature-section-header">
                                <span class="eyebrow">Features</span>
                                <h2>${sec.title}</h2>
                                <p>${sec.desc}</p>
                            </div>
                            <div class="subfeatures-row">
                                ${(sec.items || []).map(item => `
                                    <div class="subfeature-card-premium">
                                        <div class="subfeature-card-media">
                                            <img src="${item.image}" alt="${item.title}" loading="lazy">
                                        </div>
                                        <div class="subfeature-card-content">
                                            <h4>${item.title}</h4>
                                            <p>${item.desc}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else if (sec.type === 'split') {
                    const isReverse = sec.layout === 'left' ? 'reverse' : '';
                    let mediaHtml = '';
                    if (sec.media_type === 'video') {
                        mediaHtml = `
                            <div class="premium-media-frame">
                                <video src="${sec.media_url}" poster="${sec.poster_url || ''}" loop muted autoplay playsinline></video>
                            </div>
                        `;
                    } else {
                        mediaHtml = `
                            <div class="premium-media-frame">
                                <img src="${sec.media_url}" alt="${sec.title}" loading="lazy">
                            </div>
                        `;
                    }

                    richHtml += `
                        <div class="split-block ${isReverse}">
                            <div class="split-text-col">
                                <h3>${sec.title}</h3>
                                <p>${sec.desc}</p>
                            </div>
                            <div class="split-media-col">
                                ${mediaHtml}
                            </div>
                        </div>
                    `;
                } else if (sec.type === 'toggle_video') {
                    richHtml += `
                        <div class="toggle-video-block" id="toggleBlock-${secIndex}">
                            <div class="feature-section-header">
                                <span class="eyebrow">Night Vision</span>
                                <h2>${sec.title}</h2>
                            </div>
                            <div class="toggle-video-tabs">
                                ${(sec.options || []).map((opt, i) => `
                                    <button class="toggle-tab-btn ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="switchToggleVideo(${secIndex}, ${i})">
                                        ${opt.label}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="toggle-video-description" id="toggleDesc-${secIndex}">
                                ${sec.options[0] ? sec.options[0].desc : ''}
                            </div>
                            <div class="premium-media-frame" style="max-width: 900px; margin: 0 auto;">
                                <video id="toggleVideoPlayer-${secIndex}" src="${sec.options[0] ? sec.options[0].video_url : ''}" poster="${sec.options[0] ? sec.options[0].poster_url : ''}" loop muted autoplay playsinline></video>
                            </div>
                        </div>
                    `;
                } else if (sec.type === 'card_grid') {
                    richHtml += `
                        <div class="card-grid-block">
                            <div class="feature-section-header">
                                <span class="eyebrow">Capabilities</span>
                                <h2>${sec.title}</h2>
                                <p>${sec.desc}</p>
                            </div>
                            <div class="premium-card-grid">
                                ${(sec.cards || []).map(card => {
                                    let cardMedia = '';
                                    if (card.media_type === 'video') {
                                        cardMedia = `<video src="${card.media_url}" poster="${card.poster_url || ''}" loop muted autoplay playsinline></video>`;
                                    } else {
                                        cardMedia = `<img src="${card.media_url}" alt="${card.title}" loading="lazy">`;
                                    }
                                    return `
                                        <div class="utility-feature-card">
                                            <div class="utility-card-media">
                                                ${cardMedia}
                                            </div>
                                            <div class="utility-card-content">
                                                <h4>${card.title}</h4>
                                                <p>${card.desc}</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                } else if (sec.type === 'accordion') {
                    richHtml += `
                        <div class="accordion-block" id="accordionBlock-${secIndex}">
                            <div class="feature-section-header">
                                <span class="eyebrow">Smart Control</span>
                                <h2>${sec.title}</h2>
                                <p>${sec.desc}</p>
                            </div>
                            <div class="accordion-layout-block">
                                <div class="accordion-list-side">
                                    ${(sec.items || []).map((item, i) => `
                                        <div class="accordion-card-item ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="switchAccordion(${secIndex}, ${i})">
                                            <div class="accordion-card-header">
                                                <h4>${item.title}</h4>
                                                <ion-icon name="chevron-down-outline"></ion-icon>
                                            </div>
                                            <div class="accordion-card-body">
                                                <p>${item.desc}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="accordion-preview-side">
                                    <div class="premium-media-frame">
                                        <img id="accordionPreviewImg-${secIndex}" src="${sec.items[0] ? sec.items[0].image : ''}" alt="Preview" loading="lazy">
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (sec.type === 'toggle_smarthome') {
                    richHtml += `
                        <div class="toggle-smarthome-block" id="smarthomeBlock-${secIndex}">
                            <div class="feature-section-header">
                                <span class="eyebrow">Smart Home Integration</span>
                                <h2>${sec.title}</h2>
                            </div>
                            <div class="toggle-smarthome-tabs">
                                ${(sec.options || []).map((opt, i) => `
                                    <button class="toggle-tab-btn ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="switchSmartHome(${secIndex}, ${i})">
                                        <ion-icon name="${opt.icon || 'phone-portrait-outline'}" style="margin-right: 8px; vertical-align: middle;"></ion-icon>
                                        ${opt.label}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="smarthome-layout-block">
                                <div class="smarthome-text-col">
                                    <p class="smarthome-description" id="smarthomeDesc-${secIndex}">
                                        ${sec.options[0] ? sec.options[0].desc : ''}
                                    </p>
                                </div>
                                <div class="smarthome-media-col">
                                    <div class="premium-media-frame">
                                        <img id="smarthomeImage-${secIndex}" src="${sec.options[0] ? sec.options[0].image_url : ''}" alt="Smart Home Preview" loading="lazy">
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (sec.type === 'box_contents') {
                    richHtml += `
                        <div class="box-contents-block collapsible-box-section" id="boxContentsSec">
                            <button class="box-contents-toggle-btn" onclick="toggleBoxContents()">
                                <span class="toggle-title-text">${sec.title}</span>
                                <ion-icon name="chevron-down-outline" class="toggle-icon"></ion-icon>
                            </button>
                            <div class="box-contents-grid-wrapper collapsed" id="boxContentsGridWrapper">
                                <div class="box-contents-grid" style="padding: 20px 0;">
                                    ${(sec.items || []).map(item => `
                                        <div class="box-item-card">
                                            <div class="box-item-frame">
                                                <img src="${item.image}" alt="${item.name}" loading="lazy">
                                            </div>
                                            <div class="box-item-title">${item.name}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            richContainer.innerHTML = richHtml;
            heroLayout.appendChild(richContainer);

            // Define window functions for switches if they don't exist
            window.switchToggleVideo = function(secIdx, optIdx) {
                const block = document.getElementById(`toggleBlock-${secIdx}`);
                if (!block) return;
                
                block.querySelectorAll('.toggle-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (parseInt(btn.getAttribute('data-index')) === optIdx) {
                        btn.classList.add('active');
                    }
                });

                const sec = product.rich_features[secIdx];
                const opt = sec.options[optIdx];
                if (!opt) return;

                const descEl = document.getElementById(`toggleDesc-${secIdx}`);
                if (descEl) descEl.textContent = opt.desc;

                const player = document.getElementById(`toggleVideoPlayer-${secIdx}`);
                if (player) {
                    player.src = opt.video_url;
                    player.poster = opt.poster_url || '';
                    player.load();
                    player.play().catch(e => console.log('Autoplay blocked:', e));
                }
            };

            window.switchAccordion = function(secIdx, itemIdx) {
                const block = document.getElementById(`accordionBlock-${secIdx}`);
                if (!block) return;

                block.querySelectorAll('.accordion-card-item').forEach(item => {
                    item.classList.remove('active');
                    if (parseInt(item.getAttribute('data-index')) === itemIdx) {
                        item.classList.add('active');
                    }
                });

                const sec = product.rich_features[secIdx];
                const item = sec.items[itemIdx];
                if (!item) return;

                const previewImg = document.getElementById(`accordionPreviewImg-${secIdx}`);
                if (previewImg) {
                    previewImg.src = item.image;
                }
            };

            window.switchSmartHome = function(secIdx, optIdx) {
                const block = document.getElementById(`smarthomeBlock-${secIdx}`);
                if (!block) return;
                
                block.querySelectorAll('.toggle-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (parseInt(btn.getAttribute('data-index')) === optIdx) {
                        btn.classList.add('active');
                    }
                });

                const sec = product.rich_features[secIdx];
                const opt = sec.options[optIdx];
                if (!opt) return;

                const descEl = document.getElementById(`smarthomeDesc-${secIdx}`);
                if (descEl) descEl.textContent = opt.desc;

                const imgEl = document.getElementById(`smarthomeImage-${secIdx}`);
                if (imgEl) {
                    imgEl.src = opt.image_url;
                }
            };

            window.toggleBoxContents = function() {
                const wrapper = document.getElementById('boxContentsGridWrapper');
                const btn = document.querySelector('.box-contents-toggle-btn');
                if (wrapper && btn) {
                    const isCollapsed = wrapper.classList.toggle('collapsed');
                    btn.classList.toggle('active');
                    if (isCollapsed) {
                        wrapper.style.maxHeight = '0px';
                    } else {
                        wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                    }
                }
            };
        }
    }

    // 8. Gallery for Hero Layout
    let existingGallery = document.getElementById('heroGalleryContainer');
    if (existingGallery) existingGallery.remove();

    if (product.gallery && product.gallery.length > 0) {
        if (heroLayout) {
            const gallerySection = document.createElement('div');
            gallerySection.id = 'heroGalleryContainer';
            gallerySection.className = 'product-container';
            gallerySection.style.marginTop = '60px';
            gallerySection.style.paddingBottom = '60px';

            let galleryHtml = `
                <div class="store-title text-center" style="margin-bottom: 40px;">
                    <span class="eyebrow" style="color: #00f3ff;">Product Gallery</span>
                    <h2 class="section-title" style="margin-top: 0; font-size: 32px; color: #fff;">Visual Showcase</h2>
                </div>
                <div class="hero-gallery-grid">
            `;

            product.gallery.forEach(mediaUrl => {
                const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov');
                if (isVideo) return; // Videos are handled by the Watch Video button

                galleryHtml += `
                    <div class="hero-gallery-item" onclick="openLightbox('${mediaUrl}')">
                        <img src="${mediaUrl}" alt="Gallery Image" class="hero-gallery-img" loading="lazy">
                    </div>
                `;
            });

            galleryHtml += `</div>`;
            gallerySection.innerHTML = galleryHtml;
            heroLayout.appendChild(gallerySection);
        }
    }
}

function initHeroRainEffect() {
    const canvas = document.getElementById('heroRainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let drops = [];

    function resize() {
        width = canvas.width = canvas.offsetWidth || 800;
        height = canvas.height = canvas.offsetHeight || 600;
    }

    window.addEventListener('resize', resize);
    setTimeout(resize, 500); 
    resize();

    class Drop {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * -height;
            this.v = 15 + Math.random() * 20;
            this.len = 10 + Math.random() * 25;
            this.alpha = 0.1 + Math.random() * 0.4;
        }
        update() {
            this.y += this.v;
            if (this.y > height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + 2, this.y + this.len);
            ctx.stroke();
        }
    }

    const dropCount = window.innerWidth < 768 ? 40 : 150;
    for (let i = 0; i < dropCount; i++) drops.push(new Drop());

    let animationFrameId;
    let lastTime = performance.now();
    const fpsLimit = window.innerWidth < 768 ? 30 : 60;
    const frameInterval = 1000 / fpsLimit;

    function animate(now) {
        const elapsed = now - lastTime;
        if (elapsed >= frameInterval) {
            lastTime = now - (elapsed % frameInterval);
            ctx.clearRect(0, 0, width, height);
            drops.forEach(d => {
                d.update();
                d.draw();
            });
        }
        animationFrameId = requestAnimationFrame(animate);
    }
    animate(performance.now());
}

function renderStandardLayout(product, contactInfo) {
    // Breadcrumbs
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = product.name;
    }

    // Badge/Tag
    const productTag = document.getElementById('productTag');
    if (productTag) {
        if (product.tag) {
            productTag.textContent = product.tag;
            productTag.style.display = 'inline-block';
            
            // Customize badge background matching homepage tags
            if (product.tag === 'Outdoor Special') {
                productTag.style.background = 'linear-gradient(135deg, #ff6b00 0%, #ffcc00 100%)';
            } else if (product.tag === 'Complete Kit') {
                productTag.style.background = 'linear-gradient(135deg, #25d366 0%, #007aff 100%)';
            } else {
                productTag.style.background = 'linear-gradient(135deg, #007aff 0%, #00f3ff 100%)';
            }
        } else {
            productTag.style.display = 'none';
        }
    }

    // Name & Description
    const productTitle = document.getElementById('productTitle');
    const productDesc = document.getElementById('productDesc');
    if (productTitle) productTitle.textContent = product.name;
    if (productDesc) productDesc.textContent = product.desc;

    // Prices
    const productCurrPrice = document.getElementById('productCurrPrice');
    const productOrigPrice = document.getElementById('productOrigPrice');
    if (productCurrPrice) productCurrPrice.textContent = `Rs ${formatPrice(product.curr_price)}`;
    if (productOrigPrice) productOrigPrice.textContent = `Rs ${formatPrice(product.orig_price)}`;

    // Media element (Image or Video)
    const mediaShowcase = document.getElementById('mediaShowcase');
    if (mediaShowcase) {
        mediaShowcase.innerHTML = '';
        
        const isVideo = product.image && (
            product.image.endsWith('.mp4') || 
            product.image.endsWith('.webm') || 
            product.image.endsWith('.mov') || 
            product.image.endsWith('.ogg') ||
            product.image.endsWith('.quicktime')
        );

        let ytId = null;
        if (product.youtube_url) {
            ytId = extractYouTubeID(product.youtube_url);
        }

        const isImmersive = product.layout_type === 'hero_immersive' || product.layout_type === 'nature_immersive';

        if (ytId && !isImmersive) {
            mediaShowcase.innerHTML = `
                <div class="product-glow"></div>
                <div class="cam-wrapper" style="transform-style: preserve-3d; perspective: 1200px;">
                    <div class="main-cam" style="display: grid; place-items: center; position: relative; width: 100%; min-height: 380px; transform-style: preserve-3d;" id="main-cam-container">
                        <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${ytId}&playsinline=1" frameborder="0" allow="autoplay; encrypted-media" style="width: 100%; height: 400px; border-radius: 12px; pointer-events: none;" id="detail-video"></iframe>
                    </div>
                </div>`;
        } else if (product.image_type === 'svg' || !product.image) {
            mediaShowcase.innerHTML = `
                <div class="product-glow"></div>
                <div class="cam-wrapper" style="transform-style: preserve-3d; perspective: 1200px;">
                    <div class="main-cam" style="display: grid; place-items: center; position: relative; width: 100%; min-height: 380px; transform-style: preserve-3d;" id="main-cam-container">
                        ${getFallbackSVG(product.id)}
                    </div>
                </div>`;
        } else if (isVideo) {
            mediaShowcase.innerHTML = `
                <div class="product-glow"></div>
                <div class="cam-wrapper" style="transform-style: preserve-3d; perspective: 1200px;">
                    <div class="main-cam" style="display: grid; place-items: center; position: relative; width: 100%; min-height: 380px; transform-style: preserve-3d;" id="main-cam-container">
                        <video src="${product.image}" autoplay loop muted playsinline style="width: 100%; max-height: 400px; border-radius: 12px; object-fit: cover; cursor: pointer;" id="detail-video" onclick="openLightbox()"></video>
                    </div>
                </div>`;
        } else {
            mediaShowcase.innerHTML = `
                <div class="product-glow"></div>
                <div class="cam-wrapper" style="transform-style: preserve-3d; perspective: 1200px;">
                    <div class="main-cam" style="display: grid; place-items: center; position: relative; width: 100%; min-height: 380px; transform-style: preserve-3d;" id="main-cam-container">
                        <img src="${product.image}" alt="${product.name}" id="detail-image" class="variant-img v1" onerror="this.outerHTML=getFallbackSVG('${product.id}')" style="position: relative; animation: none; opacity: 1 !important; display: block !important; z-index: 10; cursor: pointer;" onclick="openLightbox()">
                    </div>
                </div>`;
        }
        
        // Render Gallery Thumbnails if available
        if (product.gallery && product.gallery.length > 0) {
            let thumbnailsHTML = '<div class="gallery-thumbnails" style="position: relative; z-index: 10; display: flex; gap: 12px; justify-content: center; margin-top: 25px; overflow-x: auto; padding-bottom: 10px; width: 100%; max-width: 100%;">';
            
            // Main YouTube Video thumbnail
            if (product.youtube_url) {
                const ytId = extractYouTubeID(product.youtube_url);
                if (ytId) {
                    const ytThumb = `https://img.youtube.com/vi/${ytId}/default.jpg`;
                    thumbnailsHTML += `<div onclick="changeMainYoutube('${ytId}');" class="thumb-item" style="width: 65px; height: 65px; border-radius: 10px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; pointer-events: auto; background: url('${ytThumb}') center/cover; position: relative;" onmouseover="this.style.border='2px solid #00f3ff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.border='2px solid rgba(255,255,255,0.2)'; this.style.transform='translateY(0)';"><ion-icon name="logo-youtube" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:red; font-size:24px;"></ion-icon></div>`;
                }
            }
            
            // Main image thumbnail
            if (product.image && product.image_type !== 'svg') {
                if(isVideo) {
                    thumbnailsHTML += `<video src="${product.image}" onclick="changeMainVideo('${product.image}'); openLightbox('${product.image}');" class="thumb-item" style="width: 65px; height: 65px; object-fit: cover; border-radius: 10px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; pointer-events: auto;" onmouseover="this.style.border='2px solid #00f3ff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.border='2px solid rgba(255,255,255,0.2)'; this.style.transform='translateY(0)';" autoplay muted loop playsinline></video>`;
                } else {
                    thumbnailsHTML += `<img src="${product.image}" onclick="changeMainImage('${product.image}'); openLightbox('${product.image}');" class="thumb-item" style="width: 65px; height: 65px; object-fit: cover; border-radius: 10px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; pointer-events: auto;" onmouseover="this.style.border='2px solid #00f3ff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.border='2px solid rgba(255,255,255,0.2)'; this.style.transform='translateY(0)';">`;
                }
            }
            
            product.gallery.forEach(imgUrl => {
                const isVid = imgUrl.endsWith('.mp4') || imgUrl.endsWith('.webm') || imgUrl.endsWith('.mov') || imgUrl.endsWith('.ogg') || imgUrl.endsWith('.quicktime');
                if (isVid) {
                    thumbnailsHTML += `<video src="${imgUrl}" onclick="changeMainVideo('${imgUrl}'); openLightbox('${imgUrl}');" class="thumb-item" style="width: 65px; height: 65px; object-fit: cover; border-radius: 10px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; pointer-events: auto;" onmouseover="this.style.border='2px solid #00f3ff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.border='2px solid rgba(255,255,255,0.2)'; this.style.transform='translateY(0)';" autoplay muted loop playsinline></video>`;
                } else {
                    thumbnailsHTML += `<img src="${imgUrl}" onclick="changeMainImage('${imgUrl}'); openLightbox('${imgUrl}');" class="thumb-item" style="width: 65px; height: 65px; object-fit: cover; border-radius: 10px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; pointer-events: auto;" onmouseover="this.style.border='2px solid #00f3ff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.border='2px solid rgba(255,255,255,0.2)'; this.style.transform='translateY(0)';">`;
                }
            });
            thumbnailsHTML += '</div>';
            
            mediaShowcase.innerHTML += thumbnailsHTML;
        }
    }
}

function renderRelatedProducts(allGadgets, currentId, contactInfo) {
    const grid = document.getElementById('relatedProductsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Filter out current product, and show max 3 recommendations
    const recommendations = allGadgets.filter(g => g.id !== currentId && g.visible !== false).slice(0, 3);

    if (recommendations.length === 0) {
        document.getElementById('recommendations').style.display = 'none';
        return;
    }

    recommendations.forEach(g => {
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
            </ul>` : `<p style="font-size:13px; color:#94a3b8; margin:0 0 15px 0; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${g.desc}</p>`;

        const detailsLink = getBasePath() + `products/${g.id}`;
        
        const waBase = (contactInfo ? contactInfo.whatsapp : "0320-6755555").replace(/[-\s]+/g, '');
        const waNum = waBase.startsWith('0') ? '92' + waBase.substring(1) : waBase;
        const waMsg = encodeURIComponent(`Assalam-o-Alaikum S M Enterprises,\n\nMujhe yeh product order karna hai:\n- ${g.name}\n- Qeemat: Rs ${formatPrice(g.curr_price)}\n\nKindly confirm karein.`);

        card.innerHTML = `
            ${badgeHTML}
            <div class="rl-card-media" onclick="window.location.href='${detailsLink}'">
                ${imgHTML}
            </div>
            <div class="rl-card-content">
                <h3 class="rl-card-title" onclick="window.location.href='${detailsLink}'">${g.name}</h3>
                ${featuresHTML}
                <div class="rl-card-footer">
                    <div class="rl-card-price-box">
                        ${g.orig_price ? `<span class="rl-price-orig">Rs ${formatPrice(g.orig_price)}</span>` : ''}
                        <span class="rl-price-curr">Rs ${formatPrice(g.curr_price)}</span>
                    </div>
                    <a href="#" class="rl-btn-buy btn-related-order" data-id="${g.id}">
                        <ion-icon name="logo-whatsapp"></ion-icon> Order
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Attach click listeners to related products order buttons
    grid.querySelectorAll('.btn-related-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const relProd = recommendations.find(p => p.id === id);
            if (relProd) {
                window.currentOrderProduct = relProd;
                updateDetailsInvoice(relProd);
                
                const orderModal = document.getElementById('orderModal');
                if (orderModal) orderModal.classList.add('show');
            }
        });
    });
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

// Global functions for changing main media from gallery thumbnails
window.changeMainImage = function(srcUrl) {
    const mainCamContainer = document.getElementById('main-cam-container');
    if(mainCamContainer) {
        mainCamContainer.innerHTML = `<img src="${srcUrl}" id="detail-image" class="variant-img v1" style="position: relative; animation: none; opacity: 1 !important; display: block !important; z-index: 10; cursor: pointer;" onclick="openLightbox('${srcUrl}')">`;
    }
};

window.changeMainVideo = function(srcUrl) {
    const mainCamContainer = document.getElementById('main-cam-container');
    if(mainCamContainer) {
        mainCamContainer.innerHTML = `<video src="${srcUrl}" autoplay loop muted playsinline style="width: 100%; max-height: 400px; border-radius: 12px; object-fit: cover; cursor: pointer;" id="detail-video" onclick="openLightbox('${srcUrl}')"></video>`;
    }
};

// Lightbox functions
window.openLightbox = function(url) {
    if (!url) {
        const img = document.getElementById('detail-image');
        const vid = document.getElementById('detail-video');
        if (img) url = img.src;
        else if (vid) url = vid.src;
        else return;
    }
    
    // Check extension
    const isVid = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.endsWith('.ogg') || url.endsWith('.quicktime');
    const lightbox = document.getElementById('imageLightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbVid = document.getElementById('lightbox-video');
    
    if (lightbox) {
        if(isVid) {
            lbImg.style.display = 'none';
            lbVid.src = url;
            lbVid.style.display = 'block';
        } else {
            lbVid.style.display = 'none';
            lbVid.src = '';
            lbImg.src = url;
            lbImg.style.display = 'block';
        }
        lightbox.style.display = 'block';
    }
};

window.closeLightbox = function() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) lightbox.style.display = 'none';
    const lbVid = document.getElementById('lightbox-video');
    if (lbVid) {
        lbVid.pause();
        lbVid.src = '';
    }
};

window.addEventListener('click', (e) => {
    const lightbox = document.getElementById('imageLightbox');
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Helper for changing to YouTube iframe
window.changeMainYoutube = function(ytId) {
    const mainCamContainer = document.getElementById('main-cam-container');
    if(mainCamContainer) {
        mainCamContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${ytId}&playsinline=1" frameborder="0" allow="autoplay; encrypted-media" style="width: 100%; height: 400px; border-radius: 12px; pointer-events: none;" id="detail-video"></iframe>`;
    }
};

window.extractYouTubeID = function(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

function renderNatureLayout(product, contactInfo) {
    const layout = document.getElementById('layoutNature');
    if (!layout) return;

    layout.innerHTML = `
        <div class="nature-hero-section">
            <video class="nature-bg-video" autoplay loop muted playsinline>
                <source src="videos/products/keen-ranger-pt/keen-ranger-pt-banner-1.mp4" type="video/mp4">
            </video>
            <div class="nature-hero-overlay">
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                    <div class="nature-pta-badge" style="margin-bottom: 0;"><ion-icon name="shield-checkmark-outline" style="vertical-align: middle; margin-right: 5px; font-size: 16px;"></ion-icon> PTA APPROVED</div>
                    <div class="nature-pta-badge" style="margin-bottom: 0; background: rgba(33, 150, 243, 0.2); color: #00bcd4; border-color: #2196f3;"><ion-icon name="construct-outline" style="vertical-align: middle; margin-right: 5px; font-size: 16px;"></ion-icon> 1-MONTH WARRANTY</div>
                    <div class="nature-pta-badge" style="margin-bottom: 0; background: rgba(255, 152, 0, 0.2); color: #ff9800; border-color: #ff9800;"><ion-icon name="cube-outline" style="vertical-align: middle; margin-right: 5px; font-size: 16px;"></ion-icon> WITHOUT BOX</div>
                </div>
                <h1 class="nature-title">${product.name}</h1>
                <p class="nature-subtitle">${product.desc}</p>
                <div class="nature-action-wrapper">
                    <div class="nature-hero-price">Rs. ${product.curr_price.toLocaleString()}</div>
                    <button class="nature-btn" onclick="openSelectionModal()">Order Now via WhatsApp</button>
                </div>
            </div>
        </div>
        
        <div class="nature-features-section container mt-5">
            <div class="row align-items-center mb-5">
                <div class="col-md-6">
                    <video class="nature-feature-video img-fluid rounded shadow-lg" autoplay loop muted playsinline>
                        <source src="videos/products/keen-ranger-pt/keen-ranger-pt-animal-detection.mp4" type="video/mp4">
                    </video>
                </div>
                <div class="col-md-6 text-light p-4">
                    <h3 class="nature-h3">Intelligent Animal Detection</h3>
                    <p class="nature-p">Get an instant notification whenever an animal or person is detected. Now you can immediately observe those mysterious creatures as long as they appear.</p>
                </div>
            </div>
            
            <div class="row align-items-center mb-5 flex-row-reverse">
                <div class="col-md-6">
                    <video class="nature-feature-video img-fluid rounded shadow-lg" autoplay loop muted playsinline>
                        <source src="videos/products/keen-ranger-pt/product-keen-ranger-pt-360-pt-1.mp4" type="video/mp4">
                    </video>
                </div>
                <div class="col-md-6 text-light p-4">
                    <h3 class="nature-h3">360° Pan & Tilt Vision</h3>
                    <p class="nature-p">Rotate the camera remotely to monitor everything around. Never miss any detail in the wild.</p>
                </div>
            </div>
        </div>

        <div class="nature-gallery-section container mt-5 mb-5">
            <h2 class="nature-h2 text-center text-light mb-5">Wilderness In Focus</h2>
            <div class="nature-gallery-grid">
                ${(product.gallery || []).map(img => `
                    <div class="nature-gallery-item">
                        <img src="${img}" class="nature-gallery-img" alt="Keen Gallery">
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('specModel').textContent = product.name;
    const specTable = document.getElementById('specTable');
    if (specTable && product.specs) {
        specTable.innerHTML = '';
        for (const [key, value] of Object.entries(product.specs)) {
            specTable.innerHTML += `<tr><th>${key}</th><td class="text-light">${value}</td></tr>`;
        }
    }

    const checkoutModel = document.getElementById('checkoutModel');
    const checkoutPrice = document.getElementById('checkoutPrice');
    if (checkoutModel) checkoutModel.value = product.name;
    if (checkoutPrice) checkoutPrice.value = "Rs. " + product.curr_price.toLocaleString();
}
