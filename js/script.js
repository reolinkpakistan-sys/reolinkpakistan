function initApp() {
    initFAQ();
    initSalesNotifications();
    initStickyBar();
    initSmoothScroll();
    initLazyVideos();  // ← NEW: Lazy load videos
    
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
        const canvas = document.getElementById('rainCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let drops = [];

        function resize() {
            width = canvas.width = canvas.offsetWidth || 800;
            height = canvas.height = canvas.offsetHeight || 600;
        }

        window.addEventListener('resize', resize);
        setTimeout(resize, 500); // Re-run after layout settling
        resize();

        class Drop {
            constructor(type) {
                this.type = type; // 'line' or 'droplet'
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
                ctx.lineTo(this.x + 2, this.y + this.len); // Fixed slant to match screenshot
                ctx.stroke();
            }
        }

        const isMobile = window.innerWidth < 768;
        const dropCount = isMobile ? 40 : 150; // Further reduced for mobile cooling
        for (let i = 0; i < dropCount; i++) drops.push(new Drop());

        let animationFrameId;
        let isVisible = true;
        let isTabActive = !document.hidden;

        // Page Visibility API to pause when tab is inactive
        document.addEventListener('visibilitychange', () => {
            isTabActive = !document.hidden;
            if (isTabActive && isVisible) {
                if (!animationFrameId) animate();
            } else {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        });

        // Render Throttling with Intersection Observer
        const rainObserver = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
            if (isVisible && isTabActive) {
                if (!animationFrameId) animate();
            } else {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }, { threshold: 0.01 });
        rainObserver.observe(canvas);

        let lastTime = performance.now();
        const fpsLimit = isMobile ? 30 : 60; // Clamp mobile to 30 FPS to prevent heating
        const frameInterval = 1000 / fpsLimit;

        function animate(now) {
            if (!isVisible || !isTabActive) {
                animationFrameId = null;
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
            animationFrameId = requestAnimationFrame(animate);
        }
        animate(performance.now());
    }
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
    if (type === 'construction') container.innerHTML = `<video autoplay loop controls playsinline preload="metadata" class="modal-video"><source src="dha-site-sample.mov" type="video/mp4"></video>`;
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

// Dynamic Sales Notifications (High-Capacity Engine)
function initSalesNotifications() {
    const notif = document.getElementById('sales-notification');
    const notifText = document.getElementById('notif-text');
    const notifTime = document.getElementById('notif-time');
    if (!notif) return;

    const firstNames = ["Muhammad", "Ahmed", "Ali", "Usman", "Zaid", "Faisal", "Bilal", "Shahzad", "Kamran", "Raza", "Umar", "Hamza", "Hassan", "Ibrahim", "Abdullah", "Zain", "Faraz", "Danish", "Adil", "Shoaib", "Salman", "Kashif", "Naveed", "Waqas", "Junaid", "Asad", "Fahad", "Arsalan", "Haris", "Talha"];
    const lastNames = ["Khan", "Ahmed", "Ali", "Sheikh", "Qureshi", "Malik", "Shah", "Butt", "Siddiqui", "Farooqi", "Gondal", "Gujjar", "Bajwa", "Abbasi", "Mughal", "Jatoi", "Wattoo", "Dogar", "Lodhi", "Hashmi"];
    const cities = ["Karachi", "Lahore", "Islamabad", "Multan", "Faisalabad", "Peshawar", "Quetta", "Sialkot", "Hyderabad", "Bahawalpur", "Sargodha", "Gujranwala", "Sukkur", "Mardan", "Rawalpindi", "Jhang", "Sahiwal", "Gujrat", "Okara", "Kasur"];

    let lastUsedNames = [];

    function showRandomNotif() {
        let firstName, lastName, city, fullName;
        
        // Ensure no immediate repeats (last 50 names)
        let attempts = 0;
        do {
            firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            city = cities[Math.floor(Math.random() * cities.length)];
            fullName = firstName + " " + lastName;
            attempts++;
        } while (lastUsedNames.includes(fullName) && attempts < 10);

        lastUsedNames.push(fullName);
        if (lastUsedNames.length > 50) lastUsedNames.shift();

        notifText.innerText = `${fullName} from ${city} just purchased a Reolink Go PT Plus!`;
        notifTime.innerText = `${Math.floor(Math.random() * 15) + 1} minutes ago`;
        
        notif.classList.add('active');
        
        // Hide after 6 seconds
        setTimeout(() => {
            notif.classList.remove('active');
            
            // Randomly shift next notification time (45 seconds to 3 minutes)
            const nextDelay = Math.floor(Math.random() * (180000 - 45000 + 1)) + 45000;
            setTimeout(showRandomNotif, nextDelay);
        }, 6000);
    }

    // Initial appearance after 8 seconds of page load
    setTimeout(showRandomNotif, 8000);
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
// LAZY VIDEO LOADER
// Videos sirf tab load honge jab screen mein aayenge
// ============================================
function initLazyVideos() {
    const lazyVideos = document.querySelectorAll('video.lazy-video');
    if (!lazyVideos.length) return;

    const videoObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const video = entry.target;

            // Set src on each <source> child
            video.querySelectorAll('source[data-src]').forEach(source => {
                source.src = source.getAttribute('data-src');
                source.removeAttribute('data-src');
            });

            // Also set src directly on video if data-src present
            if (video.dataset.src) {
                video.src = video.dataset.src;
                delete video.dataset.src;
            }

            video.setAttribute('preload', 'auto'); // Force browser to buffer the video aggressively
            video.load();
            video.play().catch(() => {}); // ignore autoplay policy errors

            obs.unobserve(video);
        });
    }, {
        threshold: 0.0,     // Margins enter hote hi load shuru ho jaye
        rootMargin: '1500px' // Video screen par aane se 1500px pehle pre-buffer hona shuru ho jaye
    });

    lazyVideos.forEach(v => videoObserver.observe(v));
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

