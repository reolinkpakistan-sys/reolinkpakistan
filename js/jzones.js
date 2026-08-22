/* ==========================================================================
   JZONES V630 — ADVANCED 3D INTERACTIVE & SPATIAL ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. 3D HERO SPATIAL PARALLAX & GYROSCOPE TILT ---
    const heroWrapper = document.getElementById('hero3DWrapper');
    const heroStage = document.getElementById('hero3DStage');

    if (heroWrapper && heroStage) {
        const handleHeroTilt = (e) => {
            const rect = heroWrapper.getBoundingClientRect();
            const clientX = e.clientX || (e.touches ? e.touches[0].clientX : rect.left + rect.width / 2);
            const clientY = e.clientY || (e.touches ? e.touches[0].clientY : rect.top + rect.height / 2);

            const x = (clientX - rect.left) / rect.width - 0.5;
            const y = (clientY - rect.top) / rect.height - 0.5;

            // Smooth 3D rotation angles
            const rotX = -y * 24; // Degrees X-axis
            const rotY = x * 28;  // Degrees Y-axis

            heroStage.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;
        };

        const resetHeroTilt = () => {
            heroStage.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            heroStage.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        };

        heroWrapper.addEventListener('mouseenter', () => {
            heroStage.style.transition = 'transform 0.1s ease-out';
        });

        heroWrapper.addEventListener('mousemove', handleHeroTilt);
        heroWrapper.addEventListener('mouseleave', resetHeroTilt);

        // Mobile Device Gyroscope 3D Support
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (e.gamma !== null && e.beta !== null) {
                    const rotY = Math.min(Math.max(e.gamma / 2, -18), 18);
                    const rotX = Math.min(Math.max((e.beta - 45) / 2, -18), 18);
                    heroStage.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
                }
            }, { passive: true });
        }
    }

    // --- 2. 3D BENTO CARDS TILT & DYNAMIC LIGHT GLARE ---
    const tiltCards = document.querySelectorAll('.tilt-3d');
    tiltCards.forEach(card => {
        let glare = card.querySelector('.tilt-glare');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'tilt-glare';
            card.appendChild(glare);
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const rotX = -y * 14;
            const rotY = x * 14;

            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
            
            // Dynamic glare reflection
            const glareX = (e.clientX - rect.left) / rect.width * 100;
            const glareY = (e.clientY - rect.top) / rect.height * 100;
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, transparent 65%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });

    // --- 3. COMPARISON SLIDER LOGIC ---
    const comparisonSlider = document.getElementById('comparisonSlider');
    const afterContainer = document.getElementById('afterContainer');
    const compDivider = document.getElementById('compDivider');

    if (comparisonSlider && afterContainer && compDivider) {
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = comparisonSlider.getBoundingClientRect();
            let offsetX = clientX - rect.left;
            
            // Constrain between 5% and 95%
            let percentage = (offsetX / rect.width) * 100;
            if (percentage < 5) percentage = 5;
            if (percentage > 95) percentage = 95;

            afterContainer.style.width = `${percentage}%`;
            compDivider.style.left = `${percentage}%`;
        };

        const onStart = (e) => {
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            updateSlider(clientX);
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            updateSlider(clientX);
        };

        const onEnd = () => {
            isDragging = false;
        };

        comparisonSlider.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        comparisonSlider.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
    }

    // --- 4. PACKAGE TABS & PRICING LOGIC ---
    const pkgTabs = document.querySelectorAll('.pkg-tab');
    const calcSubtotal = document.getElementById('calcSubtotal');
    const calcTotal = document.getElementById('calcTotal');
    const barPrice = document.getElementById('barPrice');

    let selectedPackage = {
        name: '1x JZONES V630 3-Channel Kit',
        price: 32500
    };

    pkgTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            pkgTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const price = parseInt(tab.dataset.price, 10);
            const name = tab.dataset.name;

            selectedPackage = { name, price };

            const formattedPrice = `Rs. ${price.toLocaleString()}`;
            if (calcSubtotal) calcSubtotal.textContent = formattedPrice;
            if (calcTotal) calcTotal.textContent = formattedPrice;
            if (barPrice) barPrice.textContent = formattedPrice;
        });
    });

    // --- 5. CASH ON DELIVERY FORM SUBMISSION ---
    const checkoutForm = document.getElementById('appleCheckoutForm');
    const successOverlay = document.getElementById('orderSuccess');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('userName').value.trim();
            const phone = document.getElementById('userPhone').value.trim();
            const city = document.getElementById('userCity').value;
            const address = document.getElementById('userAddress').value.trim();

            if (!name || !phone || !city || !address) {
                alert('Please fill out all required fields.');
                return;
            }

            const orderData = {
                package: selectedPackage.name,
                total: `Rs. ${selectedPackage.price.toLocaleString()}`,
                customer: { name, phone, city, address },
                date: new Date().toISOString()
            };

            console.log('Order Submitted Successfully:', orderData);

            if (successOverlay) {
                successOverlay.classList.remove('hidden');
            }
        });
    }

    if (closeSuccessBtn && successOverlay) {
        closeSuccessBtn.addEventListener('click', () => {
            successOverlay.classList.add('hidden');
            if (checkoutForm) checkoutForm.reset();
        });
    }

    // --- 6. 1-CLICK WHATSAPP ORDER ---
    const waOrderBtn = document.getElementById('waOrderBtn');
    if (waOrderBtn) {
        waOrderBtn.addEventListener('click', () => {
            const name = document.getElementById('userName').value.trim() || 'Valued Customer';
            const phone = document.getElementById('userPhone').value.trim() || 'Not Provided';
            const city = document.getElementById('userCity').value || 'Pakistan';
            const address = document.getElementById('userAddress').value.trim() || 'Pending';

            const message = `*NEW ORDER - JZONES V630 DASH CAM*
*Distributor:* SM Enterprises Pakistan
----------------------------------
*Package:* ${selectedPackage.name}
*Price:* Rs. ${selectedPackage.price.toLocaleString()} (Cash On Delivery)
*Free Gift:* 64GB High-Endurance Card Included
*Free Shipping:* All Pakistan

*Customer Details:*
• Name: ${name}
• Phone: ${phone}
• City: ${city}
• Address: ${address}
----------------------------------
Please confirm my order with SM Enterprises for dispatch!`;

            const waNumber = '923206755555';
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        });
    }

    // --- 7. INTERACTIVE FOOTAGE SIMULATOR / ANGLE SWITCHER ---
    const footageTabs = document.querySelectorAll('.footage-tab');
    const frameFront = document.getElementById('frameFront');
    const frameCabin = document.getElementById('frameCabin');
    const frameRear = document.getElementById('frameRear');
    const hudChannel = document.getElementById('hudChannel');
    const hudResolution = document.getElementById('hudResolution');
    const hudLiveTime = document.getElementById('hudLiveTime');

    const footagePlayBtn = document.getElementById('footagePlayBtn');
    const footagePlayIcon = document.getElementById('footagePlayIcon');
    const footageMuteBtn = document.getElementById('footageMuteBtn');
    const footageMuteIcon = document.getElementById('footageMuteIcon');
    const footageFullscreenBtn = document.getElementById('footageFullscreenBtn');

    const channelMeta = {
        front: { title: 'CH1: FRONT 4K (DHA LAHORE)', res: '3840×2160P 4K UHD' },
        cabin: { title: 'CH2: CABIN IR NIGHT (160°)', res: '1920×1080P 30FPS' },
        rear: { title: 'CH3: REAR VIEW HD (150°)', res: '1920×1080P 30FPS' }
    };

    footageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            footageTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Toggle frames
            if (frameFront) {
                const isFront = target === 'front';
                frameFront.classList.toggle('active', isFront);
                if (isFront && frameFront.play) {
                    frameFront.play().catch(() => {});
                    if (footagePlayIcon) {
                        footagePlayIcon.className = 'fas fa-pause';
                    }
                } else if (frameFront.pause) {
                    frameFront.pause();
                    if (footagePlayIcon) {
                        footagePlayIcon.className = 'fas fa-play';
                    }
                }
            }
            if (frameCabin) frameCabin.classList.toggle('active', target === 'cabin');
            if (frameRear) frameRear.classList.toggle('active', target === 'rear');

            // Show/hide video controls when not on front video
            const videoControls = document.querySelector('.video-custom-controls');
            if (videoControls) {
                videoControls.style.display = target === 'front' ? 'flex' : 'none';
            }

            // Update HUD
            if (channelMeta[target]) {
                if (hudChannel) hudChannel.textContent = channelMeta[target].title;
                if (hudResolution) hudResolution.textContent = channelMeta[target].res;
            }
        });
    });

    // Video Play / Pause Button
    if (footagePlayBtn && frameFront) {
        footagePlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (frameFront.paused) {
                frameFront.play();
                if (footagePlayIcon) footagePlayIcon.className = 'fas fa-pause';
            } else {
                frameFront.pause();
                if (footagePlayIcon) footagePlayIcon.className = 'fas fa-play';
            }
        });
    }

    // Video Mute / Unmute Button
    if (footageMuteBtn && frameFront) {
        footageMuteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            frameFront.muted = !frameFront.muted;
            if (footageMuteIcon) {
                footageMuteIcon.className = frameFront.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
            }
        });
    }

    // Fullscreen Button
    if (footageFullscreenBtn && frameFront) {
        footageFullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (frameFront.requestFullscreen) {
                frameFront.requestFullscreen();
            } else if (frameFront.webkitRequestFullscreen) {
                frameFront.webkitRequestFullscreen();
            }
        });
    }

    // Real-time HUD Clock Simulation
    const updateHudClock = () => {
        if (!hudLiveTime) return;
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        hudLiveTime.textContent = `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
    };
    setInterval(updateHudClock, 1000);
    updateHudClock();
    updateHudClock();

    // --- 8. INTERACTIVE FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (btn) {
            btn.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                // Close other items for neat accordion feel
                faqItems.forEach(i => i.classList.remove('open'));
                if (!isOpen) {
                    item.classList.add('open');
                }
            });
        }
    });

    // --- 9. LIVE LAUNCH COUNTDOWN TIMER ---
    const launchTimerEl = document.getElementById('launchTimer');
    let totalSeconds = 3 * 3600 + 42 * 60 + 18; // 3h 42m 18s initial

    const updateLaunchTimer = () => {
        if (!launchTimerEl) return;
        if (totalSeconds <= 0) {
            totalSeconds = 4 * 3600; // Reset loop
        }
        totalSeconds--;
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        launchTimerEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    setInterval(updateLaunchTimer, 1000);

    // --- 10. INTERACTIVE CAR COMPATIBILITY CHECKER ---
    const carMakeSelect = document.getElementById('carMakeSelect');
    const compatCheckBtn = document.getElementById('compatCheckBtn');
    const compatResultBox = document.getElementById('compatResultBox');
    const compatCarTitle = document.getElementById('compatCarTitle');
    const compatCarDesc = document.getElementById('compatCarDesc');

    const handleCarCheck = () => {
        if (!carMakeSelect || !compatResultBox) return;
        const selectedVal = carMakeSelect.value;
        const brandName = selectedVal ? selectedVal.split('(')[0].trim() : 'Your Vehicle';

        // Animate result box
        compatResultBox.style.opacity = '0';
        compatResultBox.style.transform = 'translateY(10px)';

        setTimeout(() => {
            if (compatCarTitle) {
                compatCarTitle.textContent = `${brandName}: 100% Plug & Play Verified`;
            }
            if (compatCarDesc) {
                compatCarDesc.innerHTML = `<strong>${brandName}</strong> is fully tested and verified with JZONES V630. Uses standard 12V/24V power socket with <strong>zero wire cutting</strong>. 15-minute DIY installation kit included.`;
            }
            compatResultBox.style.transition = 'all 0.4s ease';
            compatResultBox.style.opacity = '1';
            compatResultBox.style.transform = 'translateY(0)';
        }, 150);
    };

    if (compatCheckBtn) {
        compatCheckBtn.addEventListener('click', handleCarCheck);
    }
    if (carMakeSelect) {
        carMakeSelect.addEventListener('change', handleCarCheck);
    }
});
