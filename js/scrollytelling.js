/**
 * Reolink Go PT Plus — Apple-Style Scrollytelling Engine
 * Built with GSAP 3.12 + ScrollTrigger
 * Pure Timeline Scrub Architecture for 60 FPS Fluidity
 */

(function () {
    'use strict';

    function initScrollytelling() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('[Scrollytelling] Waiting for GSAP & ScrollTrigger...');
            setTimeout(initScrollytelling, 80);
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const track = document.getElementById('scrollyTrack');
        const stage = document.getElementById('scrollyStage');
        const cameraRig = document.getElementById('cameraRig');
        const camera3dWrapper = document.getElementById('camera3dWrapper');
        const cameraIrGlow = document.getElementById('cameraIrGlow');
        const hudLayer = document.getElementById('hudLayer');
        const nightVisionOverlay = document.getElementById('nightVisionOverlay');

        // Background Scenes
        const sceneStudio = document.querySelector('.bg-scene-studio');
        const sceneConstruction = document.querySelector('.bg-scene-construction');
        const sceneFarm = document.querySelector('.bg-scene-farm');
        const sceneConversion = document.querySelector('.bg-scene-conversion');

        // Cards
        const card1 = document.getElementById('stageCard1');
        const card2 = document.getElementById('stageCard2');
        const card3 = document.getElementById('stageCard3');
        const card4 = document.getElementById('stageCard4');

        // Navigation Rail Dots
        const dots = document.querySelectorAll('.rail-dot');

        if (!track || !stage || !cameraRig) return;

        function updateRailDots(activeIndex) {
            dots.forEach((dot, idx) => {
                if (idx === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Rail click smooth scroll
        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const targetRatio = parseFloat(dot.getAttribute('data-target-progress') || '0');
                const trackRect = track.getBoundingClientRect();
                const totalScrollable = track.offsetHeight - window.innerHeight;
                const targetScrollY = window.scrollY + trackRect.top + (totalScrollable * targetRatio);
                window.scrollTo({
                    top: targetScrollY,
                    behavior: 'smooth'
                });
            });
        });

        // 3D Interactive Mouse & Gyro Tilt (Stage 1 only)
        let tiltActive = true;
        let mouseX = 0, mouseY = 0;
        let targetTiltX = 0, targetTiltY = 0;
        let currentTiltX = 0, currentTiltY = 0;

        function onMouseMove(e) {
            if (!tiltActive) return;
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            mouseX = (e.clientX - cx) / cx;
            mouseY = (e.clientY - cy) / cy;
            targetTiltX = -mouseY * 10;
            targetTiltY = mouseX * 14;
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true });

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (!tiltActive || !e.gamma || !e.beta) return;
                targetTiltY = Math.max(-12, Math.min(12, e.gamma * 0.4));
                targetTiltX = Math.max(-10, Math.min(10, (e.beta - 45) * 0.3));
            }, { passive: true });
        }

        function renderTiltLoop() {
            if (camera3dWrapper) {
                if (tiltActive) {
                    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
                    currentTiltY += (targetTiltY - currentTiltY) * 0.08;
                    camera3dWrapper.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
                } else if (Math.abs(currentTiltX) > 0.01 || Math.abs(currentTiltY) > 0.01) {
                    currentTiltX *= 0.85;
                    currentTiltY *= 0.85;
                    camera3dWrapper.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
                }
            }
            requestAnimationFrame(renderTiltLoop);
        }
        requestAnimationFrame(renderTiltLoop);

        // Timeline Builder
        let masterTimeline = null;

        function buildMasterTimeline() {
            if (masterTimeline) {
                if (masterTimeline.scrollTrigger) masterTimeline.scrollTrigger.kill();
                masterTimeline.kill();
            }

            const w = window.innerWidth;
            const isDesktop = w > 900;
            const isSmall = w <= 550;

            // Responsive Coordinates
            const coords = {
                s1: {
                    x: isDesktop ? 210 : 0,
                    y: isDesktop ? 0 : (isSmall ? -25 : -15),
                    scale: isDesktop ? 1.05 : (isSmall ? 0.88 : 0.95),
                    rotation: 0
                },
                s2: {
                    x: isDesktop ? -250 : 0,
                    y: isDesktop ? 30 : (isSmall ? -35 : -25),
                    scale: isDesktop ? 1.15 : (isSmall ? 0.92 : 1.0),
                    rotation: -3
                },
                s3: {
                    x: isDesktop ? 240 : 0,
                    y: isDesktop ? -20 : (isSmall ? -30 : -20),
                    scale: isDesktop ? 1.1 : (isSmall ? 0.90 : 0.98),
                    rotation: 2
                },
                s4: {
                    x: isDesktop ? -250 : 0,
                    y: isDesktop ? 20 : (isSmall ? -55 : -45),
                    scale: isDesktop ? 0.95 : (isSmall ? 0.78 : 0.85),
                    rotation: 0
                }
            };

            // Set initial GSAP positions
            gsap.set(cameraRig, {
                xPercent: -50,
                yPercent: -50,
                x: coords.s1.x,
                y: coords.s1.y,
                scale: coords.s1.scale,
                rotation: coords.s1.rotation,
                transformOrigin: "center center",
                force3D: true
            });

            gsap.set(sceneStudio, { opacity: 1 });
            gsap.set([sceneConstruction, sceneFarm, sceneConversion], { opacity: 0 });

            gsap.set(card1, { opacity: 1, y: 0, pointerEvents: "auto" });
            gsap.set([card2, card3, card4], { opacity: 0, y: 35, pointerEvents: "none" });

            gsap.set(hudLayer, { opacity: 0, scale: 0.88 });
            gsap.set([nightVisionOverlay, cameraIrGlow], { opacity: 0 });

            // Create Master ScrollTrigger Timeline
            masterTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: track,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.8, // Instant response, zero lag
                    pin: stage,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const p = self.progress;
                        tiltActive = (p < 0.18);

                        if (p < 0.25) updateRailDots(0);
                        else if (p < 0.52) updateRailDots(1);
                        else if (p < 0.78) updateRailDots(2);
                        else updateRailDots(3);
                    }
                }
            });

            // ------------------------------------------------------------------
            // TIMELINE ORCHESTRATION (Normalized 10s scrub space)
            // ------------------------------------------------------------------

            // 1. Stage 1 Hold (0.0 to 1.2s)
            masterTimeline.to({}, { duration: 1.2 });

            // 2. Transition Stage 1 -> Stage 2 (Construction Site) (1.2s to 3.0s)
            masterTimeline
                .to(card1, { opacity: 0, y: -30, pointerEvents: "none", duration: 0.8 }, 1.2)
                .to(sceneStudio, { opacity: 0, duration: 1.2 }, 1.3)
                .to(sceneConstruction, { opacity: 1, duration: 1.2 }, 1.3)
                .to(cameraRig, {
                    x: coords.s2.x,
                    y: coords.s2.y,
                    scale: coords.s2.scale,
                    rotation: coords.s2.rotation,
                    duration: 1.5,
                    ease: "power1.inOut"
                }, 1.3)
                .fromTo(card2, { opacity: 0, y: 35 }, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.9 }, 1.8)
                .fromTo(hudLayer, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8 }, 1.9);

            // 3. Stage 2 Hold (3.0s to 4.2s)
            masterTimeline.to({}, { duration: 1.2 });

            // 4. Transition Stage 2 -> Stage 3 (Rural Farm Night Vision) (4.2s to 6.0s)
            masterTimeline
                .to(card2, { opacity: 0, y: -30, pointerEvents: "none", duration: 0.8 }, 4.2)
                .to(hudLayer, { opacity: 0, scale: 0.9, duration: 0.6 }, 4.2)
                .to(sceneConstruction, { opacity: 0, duration: 1.2 }, 4.3)
                .to(sceneFarm, { opacity: 1, duration: 1.2 }, 4.3)
                .to(cameraRig, {
                    x: coords.s3.x,
                    y: coords.s3.y,
                    scale: coords.s3.scale,
                    rotation: coords.s3.rotation,
                    duration: 1.5,
                    ease: "power1.inOut"
                }, 4.3)
                .to(cameraIrGlow, { opacity: 1, duration: 0.6 }, 4.8)
                .fromTo(nightVisionOverlay, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 4.7)
                .fromTo(card3, { opacity: 0, y: 35 }, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.9 }, 4.8);

            // 5. Stage 3 Hold (6.0s to 7.2s)
            masterTimeline.to({}, { duration: 1.2 });

            // 6. Transition Stage 3 -> Stage 4 (Conversion Dock) (7.2s to 9.0s)
            masterTimeline
                .to(card3, { opacity: 0, y: -30, pointerEvents: "none", duration: 0.8 }, 7.2)
                .to([nightVisionOverlay, cameraIrGlow], { opacity: 0, duration: 0.6 }, 7.2)
                .to(sceneFarm, { opacity: 0, duration: 1.0 }, 7.3)
                .to(sceneConversion, { opacity: 1, duration: 1.0 }, 7.3)
                .to(cameraRig, {
                    x: coords.s4.x,
                    y: coords.s4.y,
                    scale: coords.s4.scale,
                    rotation: 0,
                    duration: 1.5,
                    ease: "power1.inOut"
                }, 7.3)
                .fromTo(card4, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 1.1 }, 7.7);

            // 7. Stage 4 Hold (9.0s to 10.0s)
            masterTimeline.to({}, { duration: 1.0 });
        }

        buildMasterTimeline();

        // Responsive Debounced Resize Listener
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(buildMasterTimeline, 200);
        }, { passive: true });

        // Interactive Night Vision Toggle (Stage 3)
        const btnStarlight = document.getElementById('btnStarlight');
        const btnDaylight = document.getElementById('btnDaylight');
        const spotlightBeam = document.querySelector('.night-spotlight-beam');

        if (btnStarlight && btnDaylight) {
            btnStarlight.addEventListener('click', () => {
                btnStarlight.classList.add('active');
                btnDaylight.classList.remove('active');
                if (sceneFarm) sceneFarm.style.filter = 'brightness(1.15) contrast(1.1)';
                if (spotlightBeam) spotlightBeam.style.opacity = '1';
                if (cameraIrGlow) gsap.to(cameraIrGlow, { opacity: 1, duration: 0.3 });
            });

            btnDaylight.addEventListener('click', () => {
                btnDaylight.classList.add('active');
                btnStarlight.classList.remove('active');
                if (sceneFarm) sceneFarm.style.filter = 'brightness(0.3) contrast(1.2)';
                if (spotlightBeam) spotlightBeam.style.opacity = '0.15';
                if (cameraIrGlow) gsap.to(cameraIrGlow, { opacity: 0, duration: 0.3 });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollytelling);
    } else {
        initScrollytelling();
    }
})();
