function initApp() {
    initFAQ();
    initStickyBar();
    initSmoothScroll();
    initLazyVideos();  // ← NEW: Lazy load videos
    initHeroSlider();  // ← NEW: Dual Flagship Hero Auto-Slider
    
    // ----------------------------------------
    // Mobile Hamburger Menu Injection
    // ----------------------------------------
    const headerInner = document.querySelector('.header-inner');
    const navLinks = document.querySelector('.nav-links');
    if (headerInner && navLinks) {
        // Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'menu-hamburger';
        hamburger.setAttribute('aria-label', 'Toggle menu');
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        
        // Insert it before the header actions or Buy Now button
        const headerActions = headerInner.querySelector('.header-actions') || headerInner.querySelector('.nav-btn');
        if (headerActions && headerActions.parentNode === headerInner) {
            headerInner.insertBefore(hamburger, headerActions);
        } else if (headerActions && headerActions.parentNode) {
            headerActions.parentNode.insertBefore(hamburger, headerActions);
        } else {
            headerInner.appendChild(hamburger);
        }

        // Create mobile drawer overlay
        const mobileDrawer = document.createElement('div');
        mobileDrawer.className = 'mobile-menu-drawer';
        
        // Clone the nav links content
        const navLinksCloned = navLinks.cloneNode(true);
        navLinksCloned.style.display = 'flex';
        
        // Add close button to drawer
        const closeBtn = document.createElement('div');
        closeBtn.className = 'drawer-close';
        closeBtn.innerHTML = '&times;';
        mobileDrawer.appendChild(closeBtn);
        mobileDrawer.appendChild(navLinksCloned);
        document.body.appendChild(mobileDrawer);

        // Click to toggle drawer
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileDrawer.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        closeBtn.addEventListener('click', () => {
            mobileDrawer.classList.remove('active');
            hamburger.classList.remove('active');
        });

        // Close when clicking outside the drawer
        document.addEventListener('click', (e) => {
            if (!mobileDrawer.contains(e.target) && !hamburger.contains(e.target)) {
                mobileDrawer.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });

        // Accordion dropdowns for mobile menu drawer
        const mobileDropdowns = mobileDrawer.querySelectorAll('.dropdown');
        mobileDropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle('mobile-open');
                });
            }
        });
    }

    // Set dynamic template message for generic WhatsApp links
    const genericMsg = encodeURIComponent("Hi S M Enterprises, I am interested in the Reolink Go PT Plus 4G Solar Camera for my property. Please guide me.");
    document.querySelectorAll('a[href="https://wa.me/923206755555"]').forEach(link => {
        link.href = `https://wa.me/923206755555?text=${genericMsg}`;
    });
    
    console.log("App initialization started...");

    // ----------------------------------------
    // Starry Background Animation
    // ----------------------------------------
    const starField = document.createElement('div');
    starField.id = 'star-field';
    document.body.prepend(starField);

    const isMobile = window.innerWidth < 768;
    
    // Completely disable particle animations on mobile to prevent GPU heating
    if (!isMobile) {
        const starCount = 60;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.animationDuration = `${Math.random() * 6 + 7}s`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            starField.appendChild(star);
        }
    }

    // ----------------------------------------
    // Intersection Observer (reveal animations)
    // ----------------------------------------
    const revealElements = document.querySelectorAll('.reveal-up');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.02 });
    revealElements.forEach(el => observer.observe(el));

    // ----------------------------------------
    // Modals & Gateway Logic
    // ----------------------------------------
    const orderModal = document.getElementById('orderModal');
    const selfCollectModal = document.getElementById('selfCollectModal');
    const actionSelectionModal = document.getElementById('actionSelectionModal');
    const sellerContactModal = document.getElementById('sellerContactModal');

    // Expose modal controls globally on window
    window.openSelectionModal = function() {
        if (actionSelectionModal) {
            actionSelectionModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            window.location.href = '/#overview';
        }
    };

    window.openOrderModal = function(customProduct) {
        const modal = document.getElementById('orderModal');
        if (!modal) return;

        if (customProduct && (customProduct.name || customProduct.curr_price || customProduct.price)) {
            window.currentOrderProduct = {
                id: customProduct.id || 'custom-product',
                name: customProduct.name || customProduct.title || 'Selected Product',
                curr_price: Number(customProduct.curr_price || customProduct.price || 25000)
            };
            const formOptions = modal.querySelector('.form-options');
            if (formOptions) formOptions.style.display = 'none';

            if (typeof updateInvoiceSummary === 'function') {
                updateInvoiceSummary(window.currentOrderProduct.name, window.currentOrderProduct.curr_price);
            }
        } else {
            window.currentOrderProduct = null;
            const invoiceItemName = document.getElementById('invoiceItemName');
            if (invoiceItemName) invoiceItemName.textContent = 'Reolink Go PT Plus (With Solar Panel)';

            const formOptions = modal.querySelector('.form-options');
            if (formOptions) formOptions.style.display = 'block';

            if (typeof calculateTotal === 'function') {
                calculateTotal();
            }
        }
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeOrderModal = function() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    };

    window.openSelfCollectModal = function() {
        if (selfCollectModal) {
            selfCollectModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeSelfCollectModal = function() {
        if (selfCollectModal) selfCollectModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    };

    // Global Document Event Delegation (Handles static & dynamic elements)
    document.addEventListener('click', function(e) {
        // 1. Order Trigger
        const orderBtn = e.target.closest('.btn-order-trigger, .btn-order-modal, .jzones-btn-cta, .btn-cms-order-now');
        if (orderBtn) {
            e.preventDefault();
            
            // Check if button is inside JZONES slide or has JZONES class
            const isJzonesSlide = orderBtn.closest('.hero-slide[data-theme="jzones"]') || orderBtn.classList.contains('jzones-btn-cta');
            if (isJzonesSlide) {
                window.openOrderModal({
                    id: 'jzones-v630',
                    name: 'JZONES V630 3-Channel 4K Dash Cam',
                    curr_price: 32500
                });
                return;
            }

            // Check if button has custom data attributes or data-id
            const prodId = orderBtn.getAttribute('data-id');
            const prodName = orderBtn.getAttribute('data-name');
            const prodPrice = orderBtn.getAttribute('data-price');
            
            if (prodName && prodPrice) {
                window.openOrderModal({
                    id: prodId || 'product',
                    name: prodName,
                    curr_price: Number(prodPrice)
                });
                return;
            } else if (prodId && window.cmsData) {
                const gadgetsList = window.cmsData.gadgets || window.cmsData.products || [];
                const gadget = gadgetsList.find(p => p.id === prodId);
                if (gadget) {
                    window.openOrderModal(gadget);
                    return;
                }
            }

            // Default order modal (Reolink Go PT Plus)
            window.openOrderModal();
            return;
        }

        // 2. Self Collect Trigger
        const selfCollectBtn = e.target.closest('.btn-self-collect-trigger');
        if (selfCollectBtn) {
            e.preventDefault();
            window.openSelfCollectModal();
            return;
        }

        // 3. Selection Modal Trigger
        const selectBtn = e.target.closest('.btn-selection-trigger');
        if (selectBtn) {
            e.preventDefault();
            window.openSelectionModal();
            return;
        }

        // 4. Select Delivery / Self Collect inside selection modal
        if (e.target.closest('.select-delivery')) {
            if (actionSelectionModal) actionSelectionModal.classList.remove('show');
            setTimeout(() => window.openOrderModal(), 100);
            return;
        }
        if (e.target.closest('.select-self-collect')) {
            if (actionSelectionModal) actionSelectionModal.classList.remove('show');
            setTimeout(() => window.openSelfCollectModal(), 100);
            return;
        }

        // 5. Seller Contact Trigger
        const sellerBtn = e.target.closest('.btn-seller-contact-trigger');
        if (sellerBtn) {
            e.preventDefault();
            if (sellerContactModal) {
                sellerContactModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
            return;
        }

        // 6. Close Modal Buttons (Universal close handler)
        const closeBtn = e.target.closest('.close-modal, .close-order-modal, .close-self-collect, .close-selection, .close-seller-contact, .quickview-close-btn');
        if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const parentModal = closeBtn.closest('.reo-modal, .quickview-modal');
            if (parentModal) {
                parentModal.classList.remove('show');
            }
            if (closeBtn.classList.contains('close-self-collect') || (selfCollectModal && parentModal === selfCollectModal)) {
                window.closeSelfCollectModal();
            } else if (closeBtn.classList.contains('close-selection') || (actionSelectionModal && parentModal === actionSelectionModal)) {
                if (actionSelectionModal) actionSelectionModal.classList.remove('show');
            } else if (closeBtn.classList.contains('close-seller-contact') || (sellerContactModal && parentModal === sellerContactModal)) {
                if (sellerContactModal) sellerContactModal.classList.remove('show');
            } else {
                window.closeOrderModal();
            }
            document.body.style.overflow = 'auto';
            return;
        }

        // 7. Modal Backdrops click
        if (orderModal && e.target === orderModal) window.closeOrderModal();
        if (selfCollectModal && e.target === selfCollectModal) window.closeSelfCollectModal();
        if (actionSelectionModal && e.target === actionSelectionModal) {
            actionSelectionModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
        if (sellerContactModal && e.target === sellerContactModal) {
            sellerContactModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });

    // Escape key modal dismiss
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            const activeModals = document.querySelectorAll('.reo-modal.show, .quickview-modal.show');
            activeModals.forEach(m => m.classList.remove('show'));
            document.body.style.overflow = 'auto';
        }
    });

    // ----------------------------------------
    // Calculator Logic
    // ----------------------------------------
    const optRadios = document.querySelectorAll('input[name="productOption"]');
    const summaryCam = document.getElementById('summaryCam');
    const summaryTotal = document.getElementById('summaryTotal');

    function updateInvoiceSummary(productName, price) {
        const invoiceItemName = document.getElementById('invoiceItemName');
        const summaryCamEl = document.getElementById('summaryCam');
        const summaryCodTax = document.getElementById('summaryCodTax');
        const summaryCodPayable = document.getElementById('summaryCodPayable');
        const summaryTotalEl = document.getElementById('summaryTotal');

        const codBase = price - 2000;
        const codTax = Math.round(codBase * 0.04);
        const codPayable = codBase + codTax;
        const totalCost = price + codTax;

        if (invoiceItemName) invoiceItemName.textContent = productName;
        if (summaryCamEl) summaryCamEl.textContent = `Rs ${price.toLocaleString()}`;
        if (summaryCodTax) summaryCodTax.textContent = `Rs ${codTax.toLocaleString()}`;
        if (summaryCodPayable) summaryCodPayable.textContent = `Rs ${codPayable.toLocaleString()}`;
        if (summaryTotalEl) summaryTotalEl.textContent = `Rs ${totalCost.toLocaleString()}`;
        return { price, codTax, codPayable, totalCost };
    }
    // Expose globally so cms.js can update invoice details when a dynamic gadget is ordered
    window.updateInvoiceSummary = updateInvoiceSummary;

    function calculateTotal() {
        if (optRadios.length === 0) return { camPrice: 0, optName: '', total: 0, codTax: 0, codPayable: 0 };
        let camPrice = 25000;
        let optName = '';
        optRadios.forEach(radio => { if (radio.checked) { camPrice = parseInt(radio.value); optName = radio.id === 'optSolar' ? 'With Solar Panel' : 'Without Solar Panel'; } });
        const summaryInfo = updateInvoiceSummary('Reolink Go PT Plus', camPrice);
        return { camPrice, optName, total: summaryInfo.totalCost, codTax: summaryInfo.codTax, codPayable: summaryInfo.codPayable };
    }
    optRadios.forEach(r => r.addEventListener('change', calculateTotal));
    if (summaryCam || summaryTotal) calculateTotal();

    // Pakistani Phone Auto-formatter (03XX-XXXXXXX)
    const custPhoneInput = document.getElementById('custPhone');
    if (custPhoneInput) {
        custPhoneInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 11) val = val.substring(0, 11);
            if (val.length > 4) {
                val = val.substring(0, 4) + '-' + val.substring(4);
            }
            e.target.value = val;
        });
    }

    // Quick City Selector Chips
    document.querySelectorAll('.city-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const city = this.getAttribute('data-city');
            const addressInput = document.getElementById('custAddress');
            if (addressInput) {
                addressInput.value = city + ', ';
                addressInput.focus();
            }
            document.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Quick Direct WhatsApp Order (1-Click Fast Track)
    window.quickDirectWhatsAppOrder = function() {
        const product = window.currentOrderProduct || { name: 'Reolink Go PT Plus (With Solar Panel)', curr_price: 25000 };
        const price = Number(product.curr_price || 25000);
        const codBase = price - 2000;
        const codTax = Math.round(codBase * 0.04);
        const codPayable = codBase + codTax;
        const totalCost = price + codTax;
        
        let waNum = "923206755555";
        if (window.cmsData && window.cmsData.contact && window.cmsData.contact.whatsapp) {
            const cleanNum = window.cmsData.contact.whatsapp.replace(/[-\s]+/g, '');
            waNum = cleanNum.startsWith('0') ? '92' + cleanNum.substring(1) : cleanNum;
        }
        
        const msg = `Assalam-o-Alaikum S M Enterprises,\n\nI want to place an instant order:\n- Product: ${product.name || 'Reolink Go PT Plus'}\n- Package Price: Rs ${price.toLocaleString('en-PK')}\n- Upfront Advance Required: Rs 2,000\n- COD Surcharge (4% Govt Tax): Rs ${codTax.toLocaleString('en-PK')}\n- Remaining Payable on Delivery: Rs ${codPayable.toLocaleString('en-PK')}\n- Total Order Cost: Rs ${totalCost.toLocaleString('en-PK')}\n\nPlease confirm delivery time for my city. Thank you.`;
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
        if (orderModal) orderModal.classList.remove('show');
    };

    // Form Submission
    document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
        e.preventDefault();

        // Anti-Spam Honeypot Check
        const hp = document.querySelector('input[name="website_url"]')?.value;
        if (hp) {
            console.warn('Bot submission blocked');
            return;
        }

        const name = document.getElementById('custName')?.value || '';
        const phone = document.getElementById('custPhone')?.value || '';
        const address = document.getElementById('custAddress')?.value || '';
        
        let message = '';
        if (window.currentOrderProduct) {
            const product = window.currentOrderProduct;
            const price = Number(product.curr_price);
            const codBase = price - 2000;
            const codTax = Math.round(codBase * 0.04);
            const codPayable = codBase + codTax;
            const totalCost = price + codTax;
            
            message = `Assalam-o-Alaikum S M Enterprises,\n\nI want to confirm my order from the website:\n- Customer Name: ${name}\n- Contact Phone/WhatsApp: ${phone}${address ? `\n- Delivery Address: ${address}` : ''}\n- Product Name: ${product.name}\n- Base Price: Rs ${price.toLocaleString('en-PK')}\n- Advance Paid: Rs 2,000\n- COD Surcharge (4% Govt Tax): Rs ${codTax.toLocaleString('en-PK')}\n- Remaining Payable on Delivery: Rs ${codPayable.toLocaleString('en-PK')}\n- Total Order Cost: Rs ${totalCost.toLocaleString('en-PK')}\n\nNote: I will attach the Rs 2,000 Advance Payment screenshot in this chat. I understand that a 4% Government Tax is charged on the COD amount.`;
        } else {
            const { camPrice, optName, total, codTax, codPayable } = calculateTotal();
            message = `Assalam-o-Alaikum S M Enterprises,\n\nI want to confirm my order from the website:\n- Customer Name: ${name}\n- Contact Phone/WhatsApp: ${phone}${address ? `\n- Delivery Address: ${address}` : ''}\n- Product Name: Reolink Go PT Plus (${optName})\n- Base Price: Rs ${camPrice.toLocaleString('en-PK')}\n- Advance Paid: Rs 2,000\n- COD Surcharge (4% Govt Tax): Rs ${codTax.toLocaleString('en-PK')}\n- Remaining Payable on Delivery: Rs ${codPayable.toLocaleString('en-PK')}\n- Total Order Cost: Rs ${total.toLocaleString('en-PK')}\n\nNote: I will attach the Rs 2,000 Advance Payment screenshot in this chat. I understand that a 4% Government Tax is charged on the COD amount.`;
        }
        const encodedMessage = encodeURIComponent(message);
        
        // Use clean number config from dynamic data if available
        let waNum = "923206755555";
        if (window.cmsData && window.cmsData.contact && window.cmsData.contact.whatsapp) {
            const cleanNum = window.cmsData.contact.whatsapp.replace(/[-\s]+/g, '');
            waNum = cleanNum.startsWith('0') ? '92' + cleanNum.substring(1) : cleanNum;
        }
        
        window.open(`https://wa.me/${waNum}?text=${encodedMessage}`, '_blank');
        orderModal.classList.remove('show');
    });

    // ----------------------------------------
    // Interactive 3D Parallax & Rain
    // ----------------------------------------
    const isMobileDevice = window.innerWidth < 768;

    if (!isMobileDevice) { // Disable 3D parallax on mobile for performance
        document.addEventListener('mousemove', (e) => {
            const camWrappers = document.querySelectorAll('.cam-wrapper');
            if (camWrappers.length === 0) return;
            const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            camWrappers.forEach(cw => {
                cw.style.transform = `perspective(1000px) scale3d(1.05, 1.05, 1.05) rotateX(${yOffset * -15}deg) rotateY(${xOffset * 15}deg)`;
            });
        });
        document.addEventListener('mouseleave', () => {
            const camWrappers = document.querySelectorAll('.cam-wrapper');
            camWrappers.forEach(cw => {
                cw.style.transform = `perspective(1000px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg)`;
            });
        });
    }

    function initRain() {
        if (window._heroRainAnimId) {
            cancelAnimationFrame(window._heroRainAnimId);
            window._heroRainAnimId = null;
        }
        if (window._heroRainObserver) {
            window._heroRainObserver.disconnect();
            window._heroRainObserver = null;
        }

        const canvas = document.getElementById('rainCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0, height = 0;
        let drops = [];

        function resize() {
            if (!canvas) return;
            const parent = canvas.parentElement || canvas.closest('.product-rain-mask') || canvas.closest('.main-cam');
            const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
            const newW = Math.round(rect.width || (parent ? parent.offsetWidth : 0) || canvas.offsetWidth || 500);
            const newH = Math.round(rect.height || (parent ? parent.offsetHeight : 0) || canvas.offsetHeight || 500);
            if (newW > 0 && newH > 0) {
                width = canvas.width = newW;
                height = canvas.height = newH;
            }
        }

        window.removeEventListener('resize', resize);
        window.addEventListener('resize', resize, { passive: true });
        resize();
        setTimeout(resize, 100);
        setTimeout(resize, 400);
        setTimeout(resize, 1000);

        class Drop {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * (width || 500);
                this.y = Math.random() * -(height || 500);
                this.v = 15 + Math.random() * 20;
                this.len = 12 + Math.random() * 24;
                this.alpha = 0.15 + Math.random() * 0.45;
            }
            update() {
                this.y += this.v;
                if (this.y > height) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.lineWidth = 1.2;
                ctx.lineCap = 'round';
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + 2, this.y + this.len);
                ctx.stroke();
            }
        }

        const isMobile = window.innerWidth < 768;
        const dropCount = isMobile ? 50 : 160;
        drops = [];
        for (let i = 0; i < dropCount; i++) drops.push(new Drop());

        let isVisible = true;
        let isTabActive = !document.hidden;

        if (!window._rainVisBound) {
            window._rainVisBound = true;
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && typeof window.initRain === 'function') {
                    window.initRain();
                }
            });
        }

        if ('IntersectionObserver' in window) {
            window._heroRainObserver = new IntersectionObserver((entries) => {
                isVisible = entries[0].isIntersecting;
                if (isVisible && isTabActive) {
                    if (!window._heroRainAnimId) animate(performance.now());
                } else {
                    if (window._heroRainAnimId) cancelAnimationFrame(window._heroRainAnimId);
                    window._heroRainAnimId = null;
                }
            }, { threshold: 0.01 });
            window._heroRainObserver.observe(canvas);
        }

        let lastTime = performance.now();
        const fpsLimit = isMobile ? 35 : 60;
        const frameInterval = 1000 / fpsLimit;

        function animate(now) {
            const currentCanvas = document.getElementById('rainCanvas');
            if (!currentCanvas || currentCanvas !== canvas || !isVisible || !isTabActive) {
                window._heroRainAnimId = null;
                return;
            }

            const elapsed = now - lastTime;
            if (elapsed >= frameInterval) {
                lastTime = now - (elapsed % frameInterval);

                ctx.clearRect(0, 0, width, height);
                drops.forEach(d => {
                    d.update();
                    d.draw();
                });
            }
            window._heroRainAnimId = requestAnimationFrame(animate);
        }
        window._heroRainAnimId = requestAnimationFrame(animate);
    }
    window.initRain = initRain;
    initRain();
    initTier4();
    registerServiceWorker();
    initGlobalLiveSearch();
    initPtaVerificationModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initTier4() {
    // Set dynamic HUD dates
    const today = new Date().toISOString().split('T')[0];
    ['hudDate1', 'hudDate2', 'hudDate3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = today;
    });

    // 360 Vision Mouse Tracker
    const pivotCam = document.getElementById('pivotCam');
    if (pivotCam) {
        document.querySelector('.vision-360-visual').addEventListener('mousemove', (e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - box.left) / box.width - 0.5;
            const y = (e.clientY - box.top) / box.height - 0.5;
            pivotCam.style.transform = `rotateY(${x * 60}deg) rotateX(${y * -40}deg)`;
        });
        document.querySelector('.vision-360-visual').addEventListener('mouseleave', () => {
            pivotCam.style.transform = `rotateY(0deg) rotateX(0deg)`;
        });
    }
}

// Starlight Vision Toggle
window.setVision = function(mode) {
    const nightImg = document.getElementById('nightImg');
    const nvLabel = document.getElementById('nvLabel');
    const btns = document.querySelectorAll('.vision-btn');
    
    if (mode === 'night') {
        nightImg.classList.add('active');
        nvLabel.innerText = 'STARLIGHT NIGHT VISION (Active)';
        btns[1].classList.add('active');
        btns[0].classList.remove('active');
    } else {
        nightImg.classList.remove('active');
        nvLabel.innerText = 'DAY MODE';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    }
};

// Video Popups Logic
window.openVideoModal = function(type) {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('videoContainer');
    if (!container || !modal) return;
    container.innerHTML = '';
    if (type === 'construction') container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video"><source src="/dha-site-sample.mp4" type="video/mp4"></video>`;
    else if (type === 'farm') container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="/go_pt_plus_sample.mp4" type="video/mp4"></video><video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="/go_pt_plus_night_vision.mp4" type="video/mp4"></video>`;
    else if (type === 'logistics') container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="/Chungi no 9_20260214155305_20260214155335_95270005CWT782UY_0..MP4" type="video/mp4"></video><video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="/Lutfabad Parking yard_20260319140007_20260319140019_95270005CVZW1D85_0..MP4" type="video/mp4"></video>`;
    else if (type === 'warehouse') container.innerHTML = `<iframe width="100%" height="450" class="modal-video" src="https://www.youtube.com/embed/AfPik5OukxE?autoplay=1&mute=1&loop=1&playlist=AfPik5OukxE" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
};

window.closeVideoModal = function() {
    document.getElementById('videoModal').classList.remove('show');
    document.getElementById('videoContainer').innerHTML = '';
    document.body.style.overflow = 'auto';
};

// Smart FAQ Interactivity
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isOpen) {
                item.classList.add('active');
            }
        });
    });
}

// Dynamic Sales Notifications disabled per user request
function initSalesNotifications() {
    // Disabled
}

// Sticky Bar Logic
function initStickyBar() {
    const stickyBar = document.getElementById('sticky-bar');
    if (!stickyBar) return;
    
    window.addEventListener('scroll', () => {
        // Show after scrolling past Hero (usually ~800px)
        if (window.scrollY > 800) {
            stickyBar.classList.add('active');
        } else {
            stickyBar.classList.remove('active');
        }
    });
}

// Smooth Scrolling engine
function initSmoothScroll() {
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const hashIndex = href.indexOf('#');
            if (hashIndex !== -1) {
                const hash = href.substring(hashIndex);
                try {
                    const targetEl = document.querySelector(hash);
                    const targetPath = href.substring(0, hashIndex);
                    const currentPath = window.location.pathname;
                    
                    const isCurrentPage = targetPath === '' || 
                                          targetPath === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html')) ||
                                          currentPath.endsWith(targetPath);
                                          
                    if (isCurrentPage && targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                } catch (err) {
                    console.warn("Target element not found or invalid selector:", hash);
                }
            }
        });
    });

    // Handle initial hash routing
    if (window.location.hash) {
        setTimeout(() => {
            try {
                const targetEl = document.querySelector(window.location.hash);
                if (targetEl) {
                    targetEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } catch (err) {
                console.warn("Invalid hash selector on load:", window.location.hash);
            }
        }, 300);
    }
}

// ============================================
// INSTANT & LAZY VIDEO LOADER
// Zero-lag video streaming with pre-buffered metadata & posters
// ============================================
function initLazyVideos() {
    const lazyVideos = document.querySelectorAll('video.lazy-video, video.rounded-video');
    if (!lazyVideos.length) return;

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;

            if (entry.isIntersecting) {
                // Ensure sources are loaded if using data-src fallback
                if (!video.dataset.loaded) {
                    video.querySelectorAll('source[data-src]').forEach(source => {
                        source.src = source.getAttribute('data-src');
                        source.removeAttribute('data-src');
                    });

                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        delete video.dataset.src;
                        video.load();
                    }
                    video.dataset.loaded = 'true';
                }

                // Play smoothly when approaching or inside viewport
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Retry with muted on user interaction if browser policy requires it
                        video.muted = true;
                        video.play().catch(() => {});
                    });
                }
            } else {
                // Pause when scrolled out of view to save mobile CPU/GPU & battery
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '1000px 0px 1000px 0px'
    });

    lazyVideos.forEach(v => {
        // Pre-configure inline playback flags
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.muted = true;
        videoObserver.observe(v);
    });
}

// ============================================
// FACEBOOK PIXEL LEAD TRACKING
// ============================================
document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button');
    if (!target) return;

    const text = (target.innerText || target.textContent || '').trim().toLowerCase();
    const href = target.getAttribute('href') || '';
    const className = target.className || '';

    // Check if it's Buy Now
    const isBuyNow = text.includes('buy now') || 
                     className.includes('btn-selection-trigger') || 
                     className.includes('rl-btn-buy');

    // Check if it's Order Now
    const isOrderNow = text.includes('order now') || 
                       text.includes('buy option') || 
                       text.includes('confirm order') || 
                       text.includes('submit order') ||
                       className.includes('btn-order-trigger') || 
                       className.includes('submit-order-btn') || 
                       className.includes('btn-related-order') ||
                       className.includes('btn-order-whatsapp') ||
                       className.includes('nature-btn');

    // Check if it's Direct Chat / WhatsApp / Call Rabta
    const isDirectChat = text.includes('direct chat') || 
                         text.includes('chat with') || 
                         text.includes('chat on') || 
                         text.includes('ask expert') ||
                         text.includes('whatsapp chat') ||
                         href.includes('wa.me') || 
                         href.startsWith('tel:') ||
                         className.includes('wa-option') ||
                         className.includes('sticky-whatsapp') ||
                         className.includes('call-option');

    if (isBuyNow || isOrderNow || isDirectChat) {
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
            console.log('Facebook Pixel: Lead event tracked for', text);
        }
    }
});

// ============================================
// BROKEN IMAGE FALLBACK
// Failed images automatically swap to placeholder
// ============================================
document.addEventListener('error', function(e) {
  const target = e.target;
  if (target.tagName === 'IMG' && !target.dataset.replaced) {
    target.dataset.replaced = 'true';
    target.src = 'images/placeholder.webp';
  }
}, true);

// ============================================
// DUAL FLAGSHIP HERO SLIDER (REOLINK & JZONES)
// ============================================
function initHeroSlider(customDuration) {
    const sliderSection = document.querySelector('.reo-hero-slider-section');
    if (!sliderSection) return;

    const slides = sliderSection.querySelectorAll('.hero-slide');
    const tabs = sliderSection.querySelectorAll('.hero-pill-tab');
    if (slides.length <= 1) return;

    // Clear previous global timer if re-initialized
    if (window._heroSliderTimer) {
        clearTimeout(window._heroSliderTimer);
        window._heroSliderTimer = null;
    }

    let currentIndex = 0;
    let isPaused = false;
    const slideDuration = customDuration || (window.cmsData && window.cmsData.hero_slider && window.cmsData.hero_slider.interval_seconds ? window.cmsData.hero_slider.interval_seconds * 1000 : 4000);

    function resetProgressBars() {
        tabs.forEach(tab => {
            const fill = tab.querySelector('.tab-progress-fill');
            if (fill) {
                fill.classList.remove('running');
                fill.style.animationDuration = (slideDuration / 1000) + 's';
                void fill.offsetWidth; // Force reflow
            }
        });
    }

    function startProgress(index) {
        resetProgressBars();
        const activeTab = tabs[index];
        if (activeTab) {
            const fill = activeTab.querySelector('.tab-progress-fill');
            if (fill) {
                fill.style.animationDuration = (slideDuration / 1000) + 's';
                fill.classList.add('running');
            }
        }
    }

    function showSlide(index, direction) {
        if (index === currentIndex && slides[index].classList.contains('active')) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        // Determine if movement is forward (swipe left / next) or backward (swipe right / prev)
        let isForward = true;
        if (direction === 'prev') {
            isForward = false;
        } else if (direction === 'next') {
            isForward = true;
        } else {
            // Clicked on tab pill or direct index jump
            if (index < currentIndex) {
                isForward = (currentIndex === slides.length - 1 && index === 0);
            } else {
                isForward = !(currentIndex === 0 && index === slides.length - 1);
            }
        }

        const outgoingSlide = slides[currentIndex];
        const incomingSlide = slides[index];

        // Clean up classes on other inactive slides
        slides.forEach((slide, i) => {
            if (i !== currentIndex && i !== index) {
                slide.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-from-right', 'slide-from-left', 'prev-slide');
            }
        });

        // 1. Move outgoing slide away smoothly
        if (outgoingSlide && outgoingSlide !== incomingSlide) {
            outgoingSlide.classList.remove('active', 'slide-from-right', 'slide-from-left');
            if (isForward) {
                outgoingSlide.classList.remove('slide-out-right');
                outgoingSlide.classList.add('slide-out-left');
            } else {
                outgoingSlide.classList.remove('slide-out-left');
                outgoingSlide.classList.add('slide-out-right');
            }
        }

        // 2. Position incoming slide offscreen before transition, then activate
        if (incomingSlide) {
            incomingSlide.classList.remove('active', 'slide-out-left', 'slide-out-right', 'prev-slide');
            if (isForward) {
                incomingSlide.classList.remove('slide-from-left');
                incomingSlide.classList.add('slide-from-right');
            } else {
                incomingSlide.classList.remove('slide-from-right');
                incomingSlide.classList.add('slide-from-left');
            }

            // Force reflow so starting offscreen position is committed instantly
            void incomingSlide.offsetWidth;

            // Trigger smooth slide into center view
            incomingSlide.classList.remove('slide-from-right', 'slide-from-left');
            incomingSlide.classList.add('active');
        }

        tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });

        currentIndex = index;

        startProgress(currentIndex);
        restartTimer();

        if (typeof window.initRain === 'function') {
            setTimeout(window.initRain, 60);
        }
    }

    function nextSlide() {
        showSlide(currentIndex + 1, 'next');
    }

    function prevSlide() {
        showSlide(currentIndex - 1, 'prev');
    }

    function startTimer() {
        stopTimer();
        if (!isPaused) {
            window._heroSliderTimer = setTimeout(() => {
                nextSlide();
            }, slideDuration);
        }
    }

    function stopTimer() {
        if (window._heroSliderTimer) {
            clearTimeout(window._heroSliderTimer);
            window._heroSliderTimer = null;
        }
    }

    function restartTimer() {
        stopTimer();
        startTimer();
    }

    // Expose global methods for HTML onclick triggers
    window.goToHeroSlide = function(index) {
        showSlide(index);
    };

    window.changeHeroSlide = function(direction) {
        if (direction > 0) nextSlide();
        else prevSlide();
    };

    // Attach interaction listeners once
    if (!sliderSection.dataset.listenersAttached) {
        sliderSection.dataset.listenersAttached = "true";

        // Pause on Hover (Desktop)
        sliderSection.addEventListener('mouseenter', () => {
            isPaused = true;
            sliderSection.classList.add('is-paused');
            stopTimer();
        });

        sliderSection.addEventListener('mouseleave', () => {
            isPaused = false;
            sliderSection.classList.remove('is-paused');
            startTimer();
        });

        // Touch Swipe Gestures (Mobile)
        let touchStartX = 0;
        let touchStartY = 0;

        sliderSection.addEventListener('touchstart', (e) => {
            isPaused = true;
            sliderSection.classList.add('is-paused');
            stopTimer();
            if (e.changedTouches && e.changedTouches.length > 0) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }
        }, { passive: true });

        sliderSection.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touchEndX = e.changedTouches[0].screenX;
                const touchEndY = e.changedTouches[0].screenY;
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                // Horizontal swipe dominance check
                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < 0) {
                        nextSlide(); // Swipe Left -> Next
                    } else {
                        prevSlide(); // Swipe Right -> Prev
                    }
                }
            }

            isPaused = false;
            sliderSection.classList.remove('is-paused');
            startTimer();
        }, { passive: true });
    }

    // Initial trigger
    startProgress(0);
    startTimer();
}

// Global Helper for Product Stories Horizontal Navigation
window.scrollStories = function(direction) {
    const track = document.querySelector('.stories-track');
    if (track) {
        const scrollAmount = direction > 0 ? 320 : -320;
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
};

// ============================================
// 1. PROGRESSIVE WEB APP (SERVICE WORKER REGISTRATION)
// ============================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    // Service Worker registered
                })
                .catch(err => {
                    console.log('SW reg info:', err);
                });
        });
    }
}

// ============================================
// 2. GLOBAL LIVE INSTANT SEARCH (AUTOCOMPLETE)
// ============================================
function initGlobalLiveSearch() {
    const searchModal = document.getElementById('globalSearchModal');
    const searchInput = document.getElementById('globalSearchInput');
    const searchResults = document.getElementById('globalSearchResults');
    const searchClear = document.getElementById('globalSearchClear');

    let productsCache = [];
    let selectedIndex = -1;

    // Load products database
    function loadProducts() {
        if (window.cmsData && window.cmsData.gadgets && window.cmsData.gadgets.length) {
            populateCache(window.cmsData);
            return;
        }
        fetch('/cms_data.json')
            .then(res => res.json())
            .then(data => {
                populateCache(data);
            })
            .catch(() => {});
    }

    function populateCache(data) {
        productsCache = (data.gadgets || []).filter(g => g.visible !== false);
        // Ensure flagship 4G solar is indexed
        if (!productsCache.find(p => p.id === 'reolink-go-pt-plus')) {
            productsCache.unshift({
                id: 'reolink-go-pt-plus',
                name: 'Reolink Go PT Plus 4G Solar Camera',
                category: '4g-cameras',
                curr_price: (data.prices && data.prices.solar) || 25000,
                orig_price: 35000,
                desc: 'PTA Approved 100% wire-free 4G LTE solar security camera with 2K 4MP, 355 Pan & 140 Tilt.',
                image: 'images/camera.webp',
                static_url: '/go-pt-plus.html',
                tag: 'Bestseller Flagship'
            });
        }
    }

    loadProducts();

    function openSearch() {
        if (!searchModal) return;
        loadProducts();
        searchModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
            renderResults('');
        }
    }

    function closeSearch() {
        if (!searchModal) return;
        searchModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    // Bind triggers on document delegation
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.header-search-btn, .btn-search-trigger, [data-search-trigger]');
        if (trigger) {
            e.preventDefault();
            openSearch();
            return;
        }
        if (e.target.closest('.search-close-esc')) {
            closeSearch();
            return;
        }
        if (e.target === searchModal) {
            closeSearch();
            return;
        }
    });

    // Keyboard Shortcuts (⌘K / Ctrl+K / Escape / Arrow navigation)
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (searchModal && searchModal.classList.contains('show')) closeSearch();
            else openSearch();
        } else if (e.key === 'Escape' && searchModal && searchModal.classList.contains('show')) {
            closeSearch();
        }
    });

    if (searchClear && searchInput) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            searchInput.focus();
            renderResults('');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (searchClear) searchClear.style.display = query ? 'block' : 'none';
            selectedIndex = -1;
            renderResults(query);
        });

        searchInput.addEventListener('keydown', (e) => {
            const items = searchResults ? searchResults.querySelectorAll('.search-result-item') : [];
            if (!items.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelectedItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelectedItem(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                } else if (items[0]) {
                    items[0].click();
                }
            }
        });
    }

    function updateSelectedItem(items) {
        items.forEach((item, idx) => {
            item.classList.toggle('is-selected', idx === selectedIndex);
            if (idx === selectedIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function highlightMatch(text, query) {
        if (!query || !text) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function getCategoryName(slug) {
        const map = {
            '4g-cameras': '4G SIM CCTV',
            'solar-cameras': 'Solar Security',
            'wifi-cameras': 'WiFi Cameras',
            'cctv-systems': 'Wireless NVR Kit',
            'dashcams': 'Car Dashcams',
            'wireless-mics': 'Wireless Mics',
            'speakers': 'Bluetooth Speakers',
            'accessories': 'Accessories'
        };
        return map[slug] || 'Smart Gadgets';
    }

    function renderResults(query) {
        if (!searchResults) return;
        if (!productsCache.length) {
            searchResults.innerHTML = `<div class="search-no-results"><p>Loading products catalog...</p></div>`;
            return;
        }

        let matches = [];
        if (!query) {
            matches = productsCache.slice(0, 6);
        } else {
            const q = query.toLowerCase();
            matches = productsCache.filter(p => {
                const titleMatch = (p.name || '').toLowerCase().includes(q);
                const descMatch = (p.desc || '').toLowerCase().includes(q);
                const catMatch = (p.category || '').toLowerCase().includes(q);
                const kwMatch = (p.focus_keywords || '').toLowerCase().includes(q);
                const idMatch = (p.id || '').toLowerCase().includes(q);
                return titleMatch || descMatch || catMatch || kwMatch || idMatch;
            });
        }

        if (!matches.length) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <ion-icon name="search-outline"></ion-icon>
                    <p>No products found for "<strong>${escapeHtml(query)}</strong>"</p>
                    <span style="font-size:13px; color:#64748b;">Try searching for <em>4G, Solar, Dashcam, PT Plus, or Wireless Mic</em></span>
                </div>`;
            return;
        }

        const headerText = query ? `Matching Products (${matches.length})` : 'Popular Flagship Models';
        let html = `<div class="search-results-header">${headerText}</div>`;

        matches.forEach((p, idx) => {
            const url = p.static_url || (p.id === 'reolink-go-pt-plus' ? '/go-pt-plus.html' : `/products/${p.id}`);
            const highlightedTitle = highlightMatch(p.name, query);
            const catName = getCategoryName(p.category);
            const formattedPrice = Number(p.curr_price || 0).toLocaleString('en-PK');
            const img = p.image || 'images/placeholder.webp';

            html += `
                <a href="${url}" class="search-result-item" data-index="${idx}">
                    <div class="search-item-left">
                        <img src="${img}" class="search-item-thumb" alt="${escapeHtml(p.name)}" loading="lazy">
                        <div class="search-item-info">
                            <span class="search-item-title">${highlightedTitle}</span>
                            <div class="search-item-meta">
                                <span class="search-cat-chip">${catName}</span>
                                <span class="search-stock-chip">● In Stock</span>
                            </div>
                        </div>
                    </div>
                    <div class="search-item-right">
                        <span class="search-item-price">Rs ${formattedPrice}</span>
                        <ion-icon name="arrow-forward-outline" class="search-item-arrow"></ion-icon>
                    </div>
                </a>`;
        });

        searchResults.innerHTML = html;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(m) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
        });
    }

    window.openGlobalSearch = openSearch;
    window.closeGlobalSearch = closeSearch;
}

// ============================================
// 3. INTERACTIVE PTA VERIFICATION MODAL
// ============================================
function initPtaVerificationModal() {
    const ptaModal = document.getElementById('ptaVerificationModal');
    if (!ptaModal) return;

    function openPtaModal(e) {
        if (e) e.preventDefault();
        ptaModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closePtaModal() {
        ptaModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.reo-badge.orange, .float-tag.ft-2, .btn-pta-trigger, [data-pta-trigger]');
        if (trigger) {
            openPtaModal(e);
            return;
        }
        if (e.target.closest('.close-pta-modal, .close-pta-modal-btn')) {
            closePtaModal();
            return;
        }
        if (e.target === ptaModal || (e.target.classList && e.target.classList.contains('modal-overlay'))) {
            closePtaModal();
            return;
        }
    });

    window.openPtaModal = openPtaModal;
    window.closePtaModal = closePtaModal;
}



