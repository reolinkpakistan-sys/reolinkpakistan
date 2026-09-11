/**
 * Reolink Go PT Plus — Apple-Style Scrollytelling Engine
 * Built with GSAP 3.12 + ScrollTrigger
 * 60 FPS Hardware-Accelerated 3D Product Presentation
 */

(function () {
    'use strict';

    // Wait for DOM & GSAP to be ready
    function initScrollytelling() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('[Scrollytelling] GSAP or ScrollTrigger not loaded yet, retrying in 100ms...');
            setTimeout(initScrollytelling, 100);
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

        // Scenes
        const sceneStudio = document.querySelector('.bg-scene-studio');
        const sceneConstruction = document.querySelector('.bg-scene-construction');
        const sceneFarm = document.querySelector('.bg-scene-farm');
        const sceneConversion = document.querySelector('.bg-scene-conversion');

        // Cards
        const card1 = document.getElementById('stageCard1');
        const card2 = document.getElementById('stageCard2');
        const card3 = document.getElementById('stageCard3');
        const card4 = document.getElementById('stageCard4');

        // Rail Dots
        const dots = document.querySelectorAll('.rail-dot');

        if (!track || !stage || !cameraRig) return;

        // Check for mobile viewport
        const isMobile = () => window.innerWidth <= 900;

        // Helper to set active rail dot
        function updateRailDots(activeIndex) {
            dots.forEach((dot, idx) => {
                if (idx === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Rail dot click to navigate smoothly
        dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
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

        // 3D Interactive Mouse & Gyro Tilt on Hero Camera (Stage 1 only)
        let currentStageIndex = 0;
        let mouseX = 0, mouseY = 0;
        let targetTiltX = 0, targetTiltY = 0;
        let currentTiltX = 0, currentTiltY = 0;

        function handleMouseMove(e) {
            if (currentStageIndex !== 0) return;
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            mouseX = (e.clientX - cx) / cx;
            mouseY = (e.clientY - cy) / cy;
            targetTiltX = -mouseY * 12; // tilt up/down
            targetTiltY = mouseX * 16;  // tilt left/right
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Device orientation tilt for mobile
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (currentStageIndex !== 0 || !e.gamma || !e.beta) return;
                targetTiltY = Math.max(-15, Math.min(15, e.gamma * 0.5));
                targetTiltX = Math.max(-12, Math.min(12, (e.beta - 45) * 0.4));
            }, { passive: true });
        }

        // Render loop for smooth lerp 3D tilt
        function render3dTilt() {
            if (currentStageIndex === 0 && camera3dWrapper) {
                currentTiltX += (targetTiltX - currentTiltX) * 0.08;
                currentTiltY += (targetTiltY - currentTiltY) * 0.08;
                camera3dWrapper.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
            } else if (camera3dWrapper && camera3dWrapper.style.transform) {
                camera3dWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            }
            requestAnimationFrame(render3dTilt);
        }
        requestAnimationFrame(render3dTilt);

        // Responsive coordinates calculation
        function getCameraTransform(progress) {
            const mobile = isMobile();

            // Stage 1 (0.00 - 0.22): Hero Reveal, camera floating on right side
            if (progress <= 0.22) {
                currentStageIndex = 0;
                return {
                    x: mobile ? 0 : 210,
                    y: mobile ? -15 : 0,
                    scale: mobile ? 0.95 : 1.05,
                    rotateZ: 0
                };
            }
            // Transition 1 -> 2 (0.22 - 0.52): Mounts to steel girder on left side
            else if (progress <= 0.52) {
                currentStageIndex = 1;
                const localP = (progress - 0.22) / 0.30;
                const eased = gsap.parseEase("power2.inOut")(localP);
                return {
                    x: mobile ? 0 : gsap.utils.interpolate(210, -250, eased),
                    y: mobile ? gsap.utils.interpolate(-15, -120, eased) : gsap.utils.interpolate(0, 30, eased),
                    scale: mobile ? gsap.utils.interpolate(0.95, 0.9, eased) : gsap.utils.interpolate(1.05, 1.15, eased),
                    rotateZ: gsap.utils.interpolate(0, -4, eased)
                };
            }
            // Transition 2 -> 3 (0.52 - 0.78): Farmhouse night vision (moves to right, projects beam across)
            else if (progress <= 0.78) {
                currentStageIndex = 2;
                const localP = (progress - 0.52) / 0.26;
                const eased = gsap.parseEase("power2.inOut")(localP);
                return {
                    x: mobile ? 0 : gsap.utils.interpolate(-250, 240, eased),
                    y: mobile ? gsap.utils.interpolate(-120, -90, eased) : gsap.utils.interpolate(30, -20, eased),
                    scale: mobile ? gsap.utils.interpolate(0.9, 0.95, eased) : gsap.utils.interpolate(1.15, 1.1, eased),
                    rotateZ: gsap.utils.interpolate(-4, 3, eased)
                };
            }
            // Transition 3 -> 4 (0.78 - 1.00): Conversion dock (shifts left, alongside price card)
            else {
                currentStageIndex = 3;
                const localP = (progress - 0.78) / 0.22;
                const eased = gsap.parseEase("power2.out")(localP);
                return {
                    x: mobile ? 0 : gsap.utils.interpolate(240, -250, eased),
                    y: mobile ? gsap.utils.interpolate(-90, -140, eased) : gsap.utils.interpolate(-20, 20, eased),
                    scale: mobile ? gsap.utils.interpolate(0.95, 0.8, eased) : gsap.utils.interpolate(1.1, 0.95, eased),
                    rotateZ: gsap.utils.interpolate(3, 0, eased)
                };
            }
        }

        // GSAP ScrollTrigger Master Timeline
        const masterTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: track,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2,
                pin: stage,
                anticipatePin: 1,
                onUpdate: (self) => {
                    const progress = self.progress;

                    // Camera position orchestration
                    const coords = getCameraTransform(progress);
                    gsap.set(cameraRig, {
                        x: coords.x,
                        y: coords.y,
                        scale: coords.scale,
                        rotation: coords.rotateZ,
                        overwrite: "auto"
                    });

                    // Stage class triggers
                    if (progress <= 0.22) {
                        // Stage 1
                        sceneStudio?.classList.add('active');
                        sceneConstruction?.classList.remove('active');
                        sceneFarm?.classList.remove('active');
                        sceneConversion?.classList.remove('active');

                        card1?.classList.add('active');
                        card2?.classList.remove('active');
                        card3?.classList.remove('active');
                        card4?.classList.remove('active');

                        hudLayer?.classList.remove('active');
                        nightVisionOverlay?.classList.remove('active');
                        cameraIrGlow?.classList.remove('active');
                        cameraRig?.classList.add('idle-float');

                        updateRailDots(0);
                    } else if (progress <= 0.52) {
                        // Stage 2: Construction
                        sceneStudio?.classList.remove('active');
                        sceneConstruction?.classList.add('active');
                        sceneFarm?.classList.remove('active');
                        sceneConversion?.classList.remove('active');

                        card1?.classList.remove('active');
                        card2?.classList.add('active');
                        card3?.classList.remove('active');
                        card4?.classList.remove('active');

                        hudLayer?.classList.add('active');
                        nightVisionOverlay?.classList.remove('active');
                        cameraIrGlow?.classList.remove('active');
                        cameraRig?.classList.remove('idle-float');

                        updateRailDots(1);
                    } else if (progress <= 0.78) {
                        // Stage 3: Farm Night Vision
                        sceneStudio?.classList.remove('active');
                        sceneConstruction?.classList.remove('active');
                        sceneFarm?.classList.add('active');
                        sceneConversion?.classList.remove('active');

                        card1?.classList.remove('active');
                        card2?.classList.remove('active');
                        card3?.classList.add('active');
                        card4?.classList.remove('active');

                        hudLayer?.classList.remove('active');
                        nightVisionOverlay?.classList.add('active');
                        cameraIrGlow?.classList.add('active');
                        cameraRig?.classList.remove('idle-float');

                        updateRailDots(2);
                    } else {
                        // Stage 4: Conversion Dock
                        sceneStudio?.classList.remove('active');
                        sceneConstruction?.classList.remove('active');
                        sceneFarm?.classList.remove('active');
                        sceneConversion?.classList.add('active');

                        card1?.classList.remove('active');
                        card2?.classList.remove('active');
                        card3?.classList.remove('active');
                        card4?.classList.add('active');

                        hudLayer?.classList.remove('active');
                        nightVisionOverlay?.classList.remove('active');
                        cameraIrGlow?.classList.remove('active');
                        cameraRig?.classList.remove('idle-float');

                        updateRailDots(3);
                    }
                }
            }
        });

        // Interactive Night Vision Toggle (Stage 3)
        const btnStarlight = document.getElementById('btnStarlight');
        const btnDaylight = document.getElementById('btnDaylight');
        const spotlightBeam = document.querySelector('.night-spotlight-beam');

        if (btnStarlight && btnDaylight) {
            btnStarlight.addEventListener('click', () => {
                btnStarlight.classList.add('active');
                btnDaylight.classList.remove('active');
                if (sceneFarm) {
                    sceneFarm.style.filter = 'brightness(1.15) contrast(1.1)';
                }
                if (spotlightBeam) spotlightBeam.style.opacity = '1';
                if (cameraIrGlow) cameraIrGlow.classList.add('active');
            });

            btnDaylight.addEventListener('click', () => {
                btnDaylight.classList.add('active');
                btnStarlight.classList.remove('active');
                if (sceneFarm) {
                    sceneFarm.style.filter = 'brightness(0.35) contrast(1.2)';
                }
                if (spotlightBeam) spotlightBeam.style.opacity = '0.15';
                if (cameraIrGlow) cameraIrGlow.classList.remove('active');
            });
        }

        // Refresh on window resize for responsive accuracy
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        }, { passive: true });
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollytelling);
    } else {
        initScrollytelling();
    }
})();
