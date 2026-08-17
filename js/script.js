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
        
        // Insert it before the "Buy Now" button
        const buyBtn = headerInner.querySelector('.nav-btn');
        if (buyBtn) {
            headerInner.insertBefore(hamburger, buyBtn);
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
        } else {
            window.location.href = '/#overview';
        }
    };
    window.openOrderModal = function() {
        if (orderModal) orderModal.classList.add('show');
    };
    window.openSelfCollectModal = function() {
        if (selfCollectModal) selfCollectModal.classList.add('show');
    };

    document.querySelectorAll('.btn-selection-trigger').forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (actionSelectionModal) {
            actionSelectionModal.classList.add('show');
        } else {
            window.location.href = '/#overview';
        }
    }));

    document.querySelector('.close-selection')?.addEventListener('click', () => actionSelectionModal?.classList.remove('show'));
    document.querySelector('.select-delivery')?.addEventListener('click', () => { 
        actionSelectionModal?.classList.remove('show'); 
        if (orderModal) setTimeout(() => orderModal.classList.add('show'), 100); 
    });
    document.querySelector('.select-self-collect')?.addEventListener('click', () => { 
        actionSelectionModal?.classList.remove('show'); 
        if (selfCollectModal) setTimeout(() => selfCollectModal.classList.add('show'), 100); 
    });

    document.querySelectorAll('.btn-order-trigger').forEach(btn => btn.addEventListener('click', (e) => { 
        if (orderModal) {
            e.preventDefault();
            // Reset dynamic product if it was set
            window.currentOrderProduct = null;
            
            // Restore default item name on homepage
            const invoiceItemName = document.getElementById('invoiceItemName');
            if (invoiceItemName) invoiceItemName.textContent = 'Reolink Go PT Plus';
            
            const formOptions = orderModal.querySelector('.form-options');
            if (formOptions) formOptions.style.display = 'block';
            
            // Re-run calculateTotal to restore Reolink Go PT Plus pricing/summary
            calculateTotal();
            
            orderModal.classList.add('show'); 
        }
    }));
    document.querySelector('.close-modal')?.addEventListener('click', () => orderModal?.classList.remove('show'));

    document.querySelectorAll('.btn-self-collect-trigger').forEach(btn => btn.addEventListener('click', (e) => { 
        if (selfCollectModal) {
            e.preventDefault();
            selfCollectModal.classList.add('show'); 
        }
    }));
    document.querySelector('.close-self-collect')?.addEventListener('click', () => selfCollectModal?.classList.remove('show'));

    document.querySelectorAll('.btn-seller-contact-trigger').forEach(btn => btn.addEventListener('click', (e) => { 
        if (sellerContactModal) {
            e.preventDefault();
            sellerContactModal.classList.add('show'); 
        }
    }));
    document.querySelector('.close-seller-contact')?.addEventListener('click', () => sellerContactModal?.classList.remove('show'));

    window.addEventListener('click', (e) => {
        if (orderModal && e.target === orderModal) orderModal.classList.remove('show');
        if (selfCollectModal && e.target === selfCollectModal) selfCollectModal.classList.remove('show');
        if (actionSelectionModal && e.target === actionSelectionModal) actionSelectionModal.classList.remove('show');
        if (sellerContactModal && e.target === sellerContactModal) sellerContactModal.classList.remove('show');
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
        let camPrice = 23000;
        let optName = '';
        optRadios.forEach(radio => { if (radio.checked) { camPrice = parseInt(radio.value); optName = radio.id === 'optSolar' ? 'With Solar Panel' : 'Without Solar Panel'; } });
        const summaryInfo = updateInvoiceSummary('Reolink Go PT Plus', camPrice);
        return { camPrice, optName, total: summaryInfo.totalCost, codTax: summaryInfo.codTax, codPayable: summaryInfo.codPayable };
    }
    optRadios.forEach(r => r.addEventListener('change', calculateTotal));
    if (summaryCam || summaryTotal) calculateTotal();

    // Form Submission
    document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('custName')?.value || '';
        const phone = document.getElementById('custPhone')?.value || '';
        
        let message = '';
        if (window.currentOrderProduct) {
            const product = window.currentOrderProduct;
            const price = Number(product.curr_price);
            const codBase = price - 2000;
            const codTax = Math.round(codBase * 0.04);
            const codPayable = codBase + codTax;
            const totalCost = price + codTax;
            
            message = `Assalam-o-Alaikum S M Enterprises,\n\nI want to confirm my order from the website:\n- Customer Name: ${name}\n- Contact Phone/WhatsApp: ${phone}\n- Product Name: ${product.name}\n- Base Price: Rs ${price.toLocaleString('en-PK')}\n- Advance Paid: Rs 2,000\n- COD Surcharge (4% Govt Tax): Rs ${codTax.toLocaleString('en-PK')}\n- Remaining Payable on Delivery: Rs ${codPayable.toLocaleString('en-PK')}\n- Total Order Cost: Rs ${totalCost.toLocaleString('en-PK')}\n\nNote: I will attach the Rs 2,000 Advance Payment screenshot in this chat. I understand that a 4% Government Tax is charged on the COD amount.`;
        } else {
            const { camPrice, optName, total, codTax, codPayable } = calculateTotal();
            message = `Assalam-o-Alaikum S M Enterprises,\n\nI want to confirm my order from the website:\n- Customer Name: ${name}\n- Contact Phone/WhatsApp: ${phone}\n- Product Name: Reolink Go PT Plus (${optName})\n- Base Price: Rs ${camPrice.toLocaleString('en-PK')}\n- Advance Paid: Rs 2,000\n- COD Surcharge (4% Govt Tax): Rs ${codTax.toLocaleString('en-PK')}\n- Remaining Payable on Delivery: Rs ${codPayable.toLocaleString('en-PK')}\n- Total Order Cost: Rs ${total.toLocaleString('en-PK')}\n\nNote: I will attach the Rs 2,000 Advance Payment screenshot in this chat. I understand that a 4% Government Tax is charged on the COD amount.`;
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
    container.innerHTML = '';
    if (type === 'construction') container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video"><source src="dha-site-sample.mp4" type="video/mp4"></video>`;
    else if (type === 'farm') container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="go_pt_plus_sample.mp4" type="video/mp4"></video><video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="go_pt_plus_night_vision.mp4" type="video/mp4"></video>`;
    else if (type === 'logistics') container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="Chungi no 9_20260214155305_20260214155335_95270005CWT782UY_0..MP4" type="video/mp4"></video><video autoplay loop controls playsinline preload="metadata" class="modal-video farm-video"><source src="Lutfabad Parking yard_20260319140007_20260319140019_95270005CVZW1D85_0..MP4" type="video/mp4"></video>`;
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

    // Clear previous timer if re-initialized
    if (window._heroSliderTimer) {
        clearTimeout(window._heroSliderTimer);
        window._heroSliderTimer = null;
    }

    let currentIndex = 0;
    let autoSlideTimer = null;
    let isPaused = false;
    const slideDuration = customDuration || (window.cmsData && window.cmsData.hero_slider && window.cmsData.hero_slider.interval_seconds ? window.cmsData.hero_slider.interval_seconds * 1000 : 4500);

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

    function showSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev-slide');
            if (i === currentIndex && i !== index) {
                slide.classList.add('prev-slide');
            }
        });

        tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });

        slides[index].classList.add('active');
        currentIndex = index;

        startProgress(currentIndex);
        restartTimer();

        if (typeof window.initRain === 'function') {
            setTimeout(window.initRain, 60);
        }
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    function startTimer() {
        stopTimer();
        if (!isPaused) {
            autoSlideTimer = setTimeout(() => {
                nextSlide();
            }, slideDuration);
        }
    }

    function stopTimer() {
        if (autoSlideTimer) {
            clearTimeout(autoSlideTimer);
            autoSlideTimer = null;
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

    // Initial trigger
    startProgress(0);
    startTimer();
}


