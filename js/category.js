// category.js — Dynamic category page controller
// Reads ?type= from URL, fetches cms_data.json, renders product grid

const CATEGORY_META = {
    '4g-cameras': {
        eyebrow: 'Wire-Free 4G Surveillance',
        title: 'Best <span class="accent-glow">4G SIM Cameras</span> in Pakistan',
        desc: 'PTA-approved, 100% wire-free 4G LTE security cameras that work on Jazz, Zong, or Telenor SIM. No WiFi needed — monitor remotely from anywhere.',
        keywords: '4g sim camera pakistan, wire free camera, 4g cctv',
        richDesc: `
<div class="seo-content-block">
    <h3 style="color:#fff; font-size:22px; margin-bottom:15px;">PTA-Approved 4G SIM Cameras in Pakistan</h3>
    <p>S M Enterprises brings you the ultimate standalone security solution for off-grid properties in Pakistan. 4G SIM cameras are game-changers for security, as they operate completely independently without requiring a traditional WiFi router or wired broadband connection. By utilizing a local SIM card from Jazz, Zong, Telenor, or Ufone, these standalone cellular surveillance cameras connect directly to the 4G LTE mobile network. This makes them the perfect choice for remote locations such as agricultural lands, construction projects, cattle farms (deras), orchards, and farmhouse properties where internet infrastructure is absent.</p>
    <p>Our PTA-approved 4G security systems feature wire-free convenience, combining high-capacity rechargeable battery packs with continuous solar power charging. S M Enterprises offers official, certified hardware that ensures your cellular connection remains stable and is not blocked by regulatory authorities. With advanced 2K 4MP Super HD resolution, smart AI person and vehicle detection, and 355-degree pan and 140-degree tilt rotation, you can monitor large geographical areas remotely from Lahore, Karachi, Islamabad, or any other city. The systems are designed to withstand harsh Pakistani weather conditions, featuring IP65 weatherproof certification.</p>
    <h4 style="color:#fff; font-size:18px; margin-top:20px; margin-bottom:10px;">Common Surveillance Use Cases</h4>
    <p>Protect remote properties from trespassers, monitor construction project progress, secure valuable agricultural equipment, and keep track of livestock in real-time. S M Enterprises makes sure that you can secure any off-grid site effortlessly.</p>
    <ul style="padding-left:20px; margin-bottom:20px; list-style-type:disc; color: #94a3b8;">
        <li style="margin-bottom: 8px;"><strong>100% Wire-Free:</strong> No power cords or network cables needed to run your security setups.</li>
        <li style="margin-bottom: 8px;"><strong>Cellular Independence:</strong> Runs on local 4G mobile networks with PTA-approved cellular modules.</li>
        <li style="margin-bottom: 8px;"><strong>Sun-Charged Operation:</strong> Continuous power supply through high-performance panels.</li>
        <li style="margin-bottom: 8px;"><strong>Remote App Control:</strong> Pan, tilt, and view live footage on your phone via the free Reolink App.</li>
        <li style="margin-bottom: 8px;"><strong>Two-Way Voice:</strong> Talk to visitors or warn off intruders using the built-in speaker and microphone.</li>
    </ul>
</div>
`
    },
    'solar-cameras': {
        eyebrow: 'Eco Solar Surveillance',
        title: 'Solar-Powered <span class="accent-glow">Security Cameras</span>',
        desc: 'Continuous 24/7 monitoring powered entirely by sunlight. Zero electricity bills, zero power cuts — perfect for farms, remote sites, and off-grid properties.',
        keywords: 'solar camera pakistan, off grid security camera, solar cctv',
        richDesc: `
<div class="seo-content-block">
    <h3 style="color:#fff; font-size:22px; margin-bottom:15px;">Solar-Powered Security Cameras in Pakistan</h3>
    <p>Harness the power of the sun with eco-friendly solar-powered security cameras from S M Enterprises. In Pakistan, where electricity load-shedding is common and power cuts are frequent, relying on a wired power grid can compromise your security. Sun-charged surveillance systems solve this problem by operating 100% independently of local electrical lines. These devices feature highly efficient photovoltaic solar panels paired with built-in rechargeable batteries to ensure continuous, 24/7 security monitoring without a single rupee added to your electricity bill.</p>
    <p>Whether you need to monitor an off-grid farm, a remote warehouse, or a residential driveway, our solar security cameras provide complete peace of mind. S M Enterprises provides official packages where the camera and solar panel are fully synchronized for maximum charging efficiency. The solar panels are designed to capture light even on cloudy or overcast days, recharging the internal high-capacity battery during daylight hours. This stored power then runs the camera smoothly through the night, ensuring zero downtime.</p>
    <p>With smart features such as 2K clarity, motion-activated recording, and night vision up to 66 feet, you can protect your assets around the clock. The motion-triggered recording system ensures that the camera only uses power when activity is detected, saving battery life and data. The dynamic sensors detect movement instantly, recording clips locally or uploading them to the cloud.</p>
    <h4 style="color:#fff; font-size:18px; margin-top:20px; margin-bottom:10px;">Why Switch to Sun-Charged Surveillance?</h4>
    <ul style="padding-left:20px; margin-bottom:20px; list-style-type:disc; color: #94a3b8;">
        <li style="margin-bottom: 8px;"><strong>Green Energy:</strong> Eco-friendly power source with zero running costs or extra electrical bills.</li>
        <li style="margin-bottom: 8px;"><strong>Weatherproof Construction:</strong> Heavy-duty IP65 casing designed for Pakistani summers and monsoons.</li>
        <li style="margin-bottom: 8px;"><strong>Day & Night Security:</strong> Smart infrared and spotlight night vision options for clear night streams.</li>
        <li style="margin-bottom: 8px;"><strong>Intelligent Alerts:</strong> Real-time mobile push notifications when movement is detected.</li>
        <li style="margin-bottom: 8px;"><strong>DIY Setup:</strong> Simple bracket installation that requires no professional technician or wiring.</li>
    </ul>
</div>
`
    },
    'wifi-cameras': {
        eyebrow: 'Smart WiFi Surveillance',
        title: 'Smart <span class="accent-glow">WiFi Cameras</span> — Crystal Clear Security',
        desc: 'High-definition indoor and outdoor WiFi security cameras with optical zoom, PTZ auto-tracking, and full-color night vision for home and office.',
        keywords: 'wifi camera pakistan, indoor camera, outdoor wifi cctv',
        richDesc: `
<div class="seo-content-block">
    <h3 style="color:#fff; font-size:22px; margin-bottom:15px;">Smart WiFi Security Cameras for Home & Office</h3>
    <p>Keep your home, shop, or office safe with smart WiFi security cameras from S M Enterprises. Connected to your local wireless internet router, these cameras offer a reliable and crystal-clear way to monitor your indoor and outdoor spaces. These internet-connected smart cameras feature high-definition video output (up to 4K resolution), optical zoom, automatic motion tracking, and full-color night vision. With built-in two-way audio, you can communicate with family members or visitors directly from your phone.</p>
    <p>We are restocking this category soon with premium WiFi surveillance systems, including dome cameras, bullet cameras, and PTZ auto-tracking models. These cameras are ideal for monitoring internal rooms, retail store checkout counters, office corridors, and home yards. They offer easy installation, allowing you to connect them to your home network in minutes. With custom motion detection zones, you can focus on key entrances and filter out false alarms.</p>
    <h4 style="color:#fff; font-size:18px; margin-top:20px; margin-bottom:10px;">Expected Specifications & Features</h4>
    <ul style="padding-left:20px; margin-bottom:20px; list-style-type:disc; color: #94a3b8;">
        <li style="margin-bottom: 8px;"><strong>4K Ultra HD Clarity:</strong> Capture fine details such as license plates and facial features.</li>
        <li style="margin-bottom: 8px;"><strong>Dual-Band WiFi:</strong> Supports both 2.4GHz and 5GHz wireless bands for a stronger and faster connection.</li>
        <li style="margin-bottom: 8px;"><strong>Smart Auto-Tracking:</strong> The camera automatically follows moving persons or pets.</li>
        <li style="margin-bottom: 8px;"><strong>Active Defense:</strong> Built-in sirens and spotlights to scare away unwanted visitors.</li>
        <li style="margin-bottom: 8px;"><strong>Local & Cloud Storage:</strong> Save recordings on MicroSD cards or sync with secure cloud backup.</li>
    </ul>
</div>
`
    },
    'cctv-systems': {
        eyebrow: 'Complete Security Systems',
        title: 'Wireless <span class="accent-glow">IP Camera Kits</span>',
        desc: 'All-in-one multi-camera surveillance systems with central NVR storage. Plug-and-play WiFi setup covering every corner of your home or business.',
        keywords: 'wireless ip camera kit, nvr system pakistan, cctv system',
        richDesc: `
<div class="seo-content-block">
    <h3 style="color:#fff; font-size:22px; margin-bottom:15px;">Complete CCTV, NVR, & DVR Surveillance Systems</h3>
    <p>For professional-grade security that covers every corner, choose our complete wireless IP camera kits and NVR recording systems. Designed for large residential properties, warehouses, commercial offices, and retail stores in Pakistan, these systems provide comprehensive multi-channel monitoring. An NVR (Network Video Recorder) serves as the central hub, storing high-definition video from multiple cameras on internal hard drives. This ensures you have weeks of continuous, 24/7 video archives. These setups provide maximum protection and ease of search for specific events.</p>
    <p>Our upcoming security packages will feature plug-and-play wireless setups, eliminating complex wiring. You can monitor all cameras simultaneously on a single TV screen or monitor, as well as access them remotely on your smartphone. We are restocking this category soon to bring you top-tier surveillance systems that support multi-camera synchronization and secure offline recording. Whether you need to cover a small retail outlet or a large industrial complex, our NVR packages will be the ultimate security solution.</p>
    <h4 style="color:#fff; font-size:18px; margin-top:20px; margin-bottom:10px;">Surrounding Security Capabilities</h4>
    <ul style="padding-left:20px; margin-bottom:20px; list-style-type:disc; color: #94a3b8;">
        <li style="margin-bottom: 8px;"><strong>Multi-Channel Recording:</strong> Support for 4-channel, 8-channel, or 16-channel camera setups.</li>
        <li style="margin-bottom: 8px;"><strong>24/7 Continuous Recording:</strong> Unlike motion-only cameras, these systems record non-stop.</li>
        <li style="margin-bottom: 8px;"><strong>Power over Ethernet (PoE) & Wireless:</strong> Choose between easy PoE wiring or wireless transmission.</li>
        <li style="margin-bottom: 8px;"><strong>Local Centralized Storage:</strong> Secure hard drives preserve footage without relying on internet bandwidth.</li>
        <li style="margin-bottom: 8px;"><strong>Intelligent Motion Masking:</strong> Customize detection zones to focus on key areas like entrances and gates.</li>
    </ul>
</div>
`
    },
    'wireless-mics': {
        eyebrow: 'Professional Audio Gear',
        title: 'Premium <span class="accent-glow">Wireless Microphones</span>',
        desc: 'Crystal-clear dual-channel wireless microphones for vloggers, content creators, and remote interview setups. Ultra-low latency, noise-cancelling.',
        keywords: 'wireless mic pakistan, collar mic, wireless microphone',
        richDesc: `
<div class="seo-content-block">
    <h3 style="color:#fff; font-size:22px; margin-bottom:15px;">Professional Wireless Microphones & Lapel Mics</h3>
    <p>Elevate your content creation with premium wireless microphones and collar lapel mics from S M Enterprises. High-quality video requires crystal-clear audio, and our upcoming range of dual-channel sound recording devices is perfect for vloggers, YouTubers, online educators, and remote interviewers in Pakistan. Featuring ultra-low latency, intelligent active noise cancellation, and long-range signal transmission, these microphones ensure your voice is captured perfectly without background noise or room echoes.</p>
    <p>These compact, plug-and-play audio gadgets are fully compatible with Android smartphones, iPhones, DSLR cameras, and laptops. S M Enterprises is restocking this category soon with certified wireless microphones that offer extended battery runtime and charging cases. The dual-channel system allows you to record two speakers simultaneously, making it ideal for remote interviews, podcasts, and co-hosted vlogs. We ensure that you get the best audio quality at competitive rates in Pakistan.</p>
    <h4 style="color:#fff; font-size:18px; margin-top:20px; margin-bottom:10px;">Professional Audio Features</h4>
    <ul style="padding-left:20px; margin-bottom:20px; list-style-type:disc; color: #94a3b8;">
        <li style="margin-bottom: 8px;"><strong>Dual-Channel Recording:</strong> Record two speakers simultaneously with twin lapel transmitters.</li>
        <li style="margin-bottom: 8px;"><strong>Active Noise Cancelling:</strong> Filters out wind, traffic, and room echoes for clear speech.</li>
        <li style="margin-bottom: 8px;"><strong>Ultra-Low Latency:</strong> Zero delay between your voice and video recording.</li>
        <li style="margin-bottom: 8px;"><strong>Long Battery Backup:</strong> Up to 10 hours of continuous recording on a single charge.</li>
        <li style="margin-bottom: 8px;"><strong>Aux Monitoring:</strong> Plug in headphones to monitor audio quality in real-time.</li>
    </ul>
</div>
`
    },
    'speakers': {
        eyebrow: 'High-Fidelity Audio',
        title: 'Premium <span class="accent-glow">Bluetooth Speakers</span>',
        desc: 'Powerful outdoor and indoor Bluetooth speakers with heavy bass, long battery life, and waterproof design for every adventure.',
        keywords: 'bluetooth speaker pakistan, outdoor speaker, waterproof speaker',
        richDesc: `
<div class="seo-content-block">
    <h3 style="color:#fff; font-size:22px; margin-bottom:15px;">Premium High-Fidelity Wireless Bluetooth Speakers</h3>
    <p>Experience rich, high-fidelity sound with our upcoming collection of premium wireless Bluetooth speakers. Designed for music lovers, outdoor adventurers, and home entertainment in Pakistan, these portable sound systems offer deep bass, clear vocals, and long battery backup. With rugged waterproof construction and sleek modern aesthetics, these wireless audio devices are perfect for indoor gatherings, outdoor trips, or bedroom audio setups. S M Enterprises only offers certified hardware that provides dynamic, multi-directional sound.</p>
    <p>Our upcoming speakers feature multi-device pairing and long-lasting rechargeable batteries, allowing you to enjoy your favorite music without interruption. We are restocking this category to bring you the best portable audio experience. These speakers deliver deep bass and clear vocals whether you are hosting an outdoor party, traveling, or relaxing at home. The high-performance drivers ensure that the sound remains distortion-free even at maximum volume.</p>
    <h4 style="color:#fff; font-size:18px; margin-top:20px; margin-bottom:10px;">Audio System Specifications</h4>
    <ul style="padding-left:20px; margin-bottom:20px; list-style-type:disc; color: #94a3b8;">
        <li style="margin-bottom: 8px;"><strong>High-Fidelity Audio:</strong> Custom-tuned drivers deliver clear highs and heavy, deep bass.</li>
        <li style="margin-bottom: 8px;"><strong>20+ Hours Playtime:</strong> Long-lasting batteries keep the music going all day and night.</li>
        <li style="margin-bottom: 8px;"><strong>IPX5 Water Resistance:</strong> Splash-proof design suitable for outdoor use and travels.</li>
        <li style="margin-bottom: 8px;"><strong>Multi-Host Connection:</strong> Connect multiple smartphones to share control of the playlist.</li>
        <li style="margin-bottom: 8px;"><strong>Fast USB-C Charging:</strong> Quick charge technology gives hours of playtime from a short charge.</li>
    </ul>
</div>
`
    },
    'accessories': {
        eyebrow: 'Camera Accessories',
        title: 'Smart Camera <span class="accent-glow">Accessories</span>',
        desc: 'Enhance your security setup with official Reolink accessories — solar panels, mounts, and add-ons to maximize your camera\'s performance.',
        keywords: 'reolink solar panel, camera accessories pakistan, camera mount',
        richDesc: `
<div class="seo-content-block">
    <h3 style="color:#fff; font-size:22px; margin-bottom:15px;">Official Security Camera Accessories & Solar Panels</h3>
    <p>Keep your security camera network operating at peak performance with official Reolink accessories from S M Enterprises. Our accessories category includes high-efficiency replacement solar panels, anti-theft wall mounts, ceiling brackets, long-range extension cables, and weatherproof protectors. These tools are designed to securely position and continuously power your surveillance cameras, ensuring they can withstand Pakistani summer heat and monsoon rains. S M Enterprises is the authorized source for authentic camera add-ons.</p>
    <p>We are restocking official accessories soon. If you need replacement panels or custom mounts for your Reolink Go PT Plus or other models, contact S M Enterprises today. Using official mounts and cables prevents signal loss and guarantees that your weatherproof certifications are maintained. Our upcoming stock will include brackets and straps suitable for tree mounting, wall mounting, or pole positioning, giving you full flexibility during installation.</p>
    <h4 style="color:#fff; font-size:18px; margin-top:20px; margin-bottom:10px;">Durable Accessories Catalog</h4>
    <ul style="padding-left:20px; margin-bottom:20px; list-style-type:disc; color: #94a3b8;">
        <li style="margin-bottom: 8px;"><strong>Official Solar Panels:</strong> Micro-USB and USB-C options for continuous camera power under the sun.</li>
        <li style="margin-bottom: 8px;"><strong>Weatherproof Cables:</strong> Run connection lines up to 4.5 meters without power drop-off.</li>
        <li style="margin-bottom: 8px;"><strong>Universal Brackets:</strong> Heavy-duty metal brackets for wall, ceiling, or pole mounting.</li>
        <li style="margin-bottom: 8px;"><strong>Security Signs:</strong> Warning signs to alert trespassers and prevent theft on remote sites.</li>
    </ul>
</div>
`
    }
};

// SVG fallbacks matching existing theme
function getFallbackSVG(id) {
    const svgs = {
        'mic': `<svg viewBox="0 0 100 100" width="120" height="120" style="color:#00f3ff;filter:drop-shadow(0 0 12px rgba(0,243,255,0.4))"><rect x="40" y="20" width="20" height="40" rx="10" fill="currentColor" opacity="0.8"/><path d="M30 40C30 51 40 60 50 60C60 60 70 51 70 40" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/><line x1="50" y1="60" x2="50" y2="75" stroke="currentColor" stroke-width="4"/><line x1="35" y1="75" x2="65" y2="75" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,


        'solar-panel': `<svg viewBox="0 0 100 100" width="120" height="120" style="color:#ffcc00;filter:drop-shadow(0 0 12px rgba(255,204,0,0.4))"><rect x="10" y="25" width="80" height="50" rx="4" fill="none" stroke="currentColor" stroke-width="4"/><line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="2"/><line x1="37" y1="25" x2="37" y2="75" stroke="currentColor" stroke-width="2"/><line x1="63" y1="25" x2="63" y2="75" stroke="currentColor" stroke-width="2"/><line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" stroke-width="4"/></svg>`,
        'default': `<svg viewBox="0 0 100 100" width="120" height="120" style="color:#94a3b8;filter:drop-shadow(0 0 8px rgba(148,163,184,0.3))"><rect x="25" y="30" width="50" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.5"/></svg>`
    };
    return svgs[id] || svgs['default'];
}

function formatPrice(num) {
    return Number(num).toLocaleString('en-PK');
}

function getBadgeClass(tag) {
    if (!tag) return '';
    const t = tag.toLowerCase();
    if (t.includes('outdoor') || t.includes('special offer') || t.includes('popular')) return 'orange';
    if (t.includes('complete') || t.includes('kit')) return 'green';
    return '';
}

// Determine active category from URL
function getCategoryType() {
    // Try query param ?type=wifi-cameras
    const params = new URLSearchParams(window.location.search);
    if (params.get('type')) return params.get('type');

    // Try clean path /category/wifi-cameras
    const match = window.location.pathname.match(/\/category\/([^/]+)/);
    if (match) return match[1];

    return null;
}

function updatePageMeta(type) {
    const meta = CATEGORY_META[type] || {
        eyebrow: 'S M Enterprises Store',
        title: 'Browse Our <span class="accent-glow">Products</span>',
        desc: 'Discover premium security cameras, audio gear, and smart tech accessories at S M Enterprises.',
        keywords: 'reolink pakistan, security camera, smart gadgets'
    };

    document.getElementById('catEyebrow').textContent = meta.eyebrow;
    document.getElementById('catTitle').innerHTML = meta.title;
    document.getElementById('catDesc').textContent = meta.desc;

    // Page title and SEO meta
    const titleEl = document.getElementById('pageTitle');
    const descEl = document.getElementById('pageDesc');
    const kwEl = document.getElementById('pageKeywords');

    titleEl.textContent = `${meta.eyebrow} | S M Enterprises - Reolink Pakistan`;
    descEl.setAttribute('content', meta.desc);
    kwEl.setAttribute('content', meta.keywords);

    // Dynamic SEO Content Section
    const seoContentEl = document.getElementById('categorySeoContent');
    if (seoContentEl) {
        seoContentEl.innerHTML = meta.richDesc || '';
    }

    // Highlight active nav dropdown link
    document.querySelectorAll('.dropdown-menu a').forEach(a => {
        if (a.href.includes(`/category/${type}`)) {
            a.style.color = '#00f3ff';
            a.style.fontWeight = '700';
        }
    });
}

function renderGrid(gadgets, type, contact) {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;

    // Handle Coming Soon categories
    const INACTIVE_CATEGORIES = ['wifi-cameras', 'cctv-systems', 'wireless-mics', 'speakers', 'accessories'];
    if (INACTIVE_CATEGORIES.includes(type)) {
        grid.innerHTML = `
            <div class="coming-soon-card reveal-up" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; backdrop-filter: blur(10px); margin-bottom: 30px;">
                <ion-icon name="time-outline" style="font-size: 64px; color: #ff6b00; margin-bottom: 20px; filter: drop-shadow(0 0 8px rgba(255,107,0,0.3));"></ion-icon>
                <h3 style="font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 12px;">Coming Soon / Restocking</h3>
                <p style="font-size: 16px; color: #94a3b8; max-width: 600px; margin: 0 auto 24px; line-height: 1.6;">Hum is category ke premium products ko restocking kar rahe hain. Naya stock jald hi Pakistan mein live hoga. Agar aap pre-order karna chahte hain ya alert receive karna chahte hain to hum se WhatsApp par rabta karein.</p>
                <a href="https://wa.me/923206755555?text=Assalam-o-Alaikum S M Enterprises, mujhe category '${type}' ke products ke baare mein maloomat chahiye jab wo restocking hon." target="_blank" class="btn-reo-primary" style="display: inline-flex; align-items: center; gap: 8px; justify-content: center; padding: 12px 28px; border-radius: 50px;">
                    <ion-icon name="logo-whatsapp" style="font-size: 20px;"></ion-icon> Contact via WhatsApp
                </a>
            </div>`;
        return;
    }

    // For 4g-cameras, also show solar-cameras (same physical products)
    let filtered;
    if (type === 'solar-cameras') {
        filtered = gadgets.filter(g => g.category === 'solar-cameras' || g.category === '4g-cameras');
    } else if (type) {
        filtered = gadgets.filter(g => g.category === type);
    } else {
        filtered = gadgets;
    }

    filtered = filtered.filter(g => g.visible !== false);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="cat-empty">
                <ion-icon name="cube-outline"></ion-icon>
                <p>Is category mein abhi koi product nahi hai. Jaldi add hoga!</p>
                <a href="/" class="btn-reo-primary" style="display:inline-flex; margin-top:24px;">Homepage Dekhein</a>
            </div>`;
        return;
    }

    const waBase = (contact && contact.whatsapp ? contact.whatsapp : '0320-6755555').replace(/[-\s]+/g, '');
    const waNum = waBase.startsWith('0') ? '92' + waBase.substring(1) : waBase;

    grid.innerHTML = '';

    filtered.forEach((g, i) => {
        const card = document.createElement('div');
        card.className = 'rl-store-card reveal-up';
        if (i % 3 !== 0) card.classList.add(`delay-${i % 3}`);

        const badgeClass = g.tag && g.tag.toLowerCase().includes('outdoor') ? 'orange' : (g.tag && g.tag.toLowerCase().includes('kit') ? 'green' : '');
        const badgeHTML = g.tag ? `<span class="rl-card-badge ${badgeClass}">${g.tag}</span>` : '';

        const isVideo = g.image && (g.image.endsWith('.mp4') || g.image.endsWith('.webm') || g.image.endsWith('.mov'));
        let imgHTML;
        if (!g.image || g.image_type === 'svg') {
            imgHTML = getFallbackSVG(g.id);
        } else if (isVideo) {
            imgHTML = `<video src="${g.image}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`;
        } else {
            imgHTML = `<img src="${g.image}" alt="${g.name}" loading="lazy" onerror="this.outerHTML=getFallbackSVG('${g.id}')">`;
        }

        // Features (show max 3)
        const features = (g.features || []).slice(0, 3);
        const featuresHTML = features.length ? `
            <ul class="rl-card-specs">
                ${features.map(f => `<li>${f}</li>`).join('')}
            </ul>` : '';

        // Determine product link
        const detailsLink = g.static_url || `/products/${g.id}`;
        const waMsg = encodeURIComponent(
            `Assalam-o-Alaikum S M Enterprises,\n\nMujhe yeh product order karna hai:\n- ${g.name}\n- Qeemat: Rs ${formatPrice(g.curr_price)}\n\nKindly confirm karein.`
        );

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
                    <a href="#" class="rl-btn-buy btn-cat-order-now" data-id="${g.id}">
                        <ion-icon name="logo-whatsapp"></ion-icon> Order
                    </a>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    // Attach click listeners to category order buttons
    grid.querySelectorAll('.btn-cat-order-now').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const product = filtered.find(p => p.id === id);
            if (product) {
                openCategoryOrderModal(product);
            }
        });
    });

    // Trigger reveal animations
    const revealEls = grid.querySelectorAll('.reveal-up');
    const obs = new IntersectionObserver((entries, ob) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); ob.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));
}

// Modal logic
let _selectedProduct = null;

function openCategoryOrderModal(product) {
    _selectedProduct = product;
    const modal = document.getElementById('orderModal');
    
    const price = Number(product.curr_price);
    const codBase = price - 2000;
    const codTax = Math.round(codBase * 0.04);
    const codPayable = codBase + codTax;
    const totalCost = price + codTax;

    document.getElementById('catSummaryCam').textContent = product.name;
    document.getElementById('catInvoicePrice').textContent = `Rs ${formatPrice(price)}`;
    
    const catSummaryCodTax = document.getElementById('catSummaryCodTax');
    const catSummaryCodPayable = document.getElementById('catSummaryCodPayable');
    if (catSummaryCodTax) catSummaryCodTax.textContent = `Rs ${formatPrice(codTax)}`;
    if (catSummaryCodPayable) catSummaryCodPayable.textContent = `Rs ${formatPrice(codPayable)}`;
    
    document.getElementById('catSummaryTotal').textContent = `Rs ${formatPrice(totalCost)}`;
    
    if (modal) modal.classList.add('show');
}

function getBasePath() {
    const idxCategory = window.location.pathname.indexOf('/category/');
    if (idxCategory !== -1) {
        return window.location.pathname.substring(0, idxCategory + 1);
    }
    const pathname = window.location.pathname;
    const lastSlash = pathname.lastIndexOf('/');
    if (lastSlash !== -1) {
        return pathname.substring(0, lastSlash + 1);
    }
    return '/';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    const type = getCategoryType();
    updatePageMeta(type);

    // Close modal on X
    document.querySelector('.close-modal')?.addEventListener('click', () => {
        document.getElementById('orderModal')?.classList.remove('show');
    });
    window.addEventListener('click', e => {
        const modal = document.getElementById('orderModal');
        if (e.target === modal) modal.classList.remove('show');
    });

    // Checkout form
    document.getElementById('catCheckoutForm')?.addEventListener('submit', e => {
        e.preventDefault();
        if (!_selectedProduct) return;
        const name = document.getElementById('catCustName').value;
        const phone = document.getElementById('catCustPhone').value;
        
        const price = Number(_selectedProduct.curr_price);
        const codBase = price - 2000;
        const codTax = Math.round(codBase * 0.04);
        const codPayable = codBase + codTax;
        const totalCost = price + codTax;

        const msg = `Assalam-o-Alaikum S M Enterprises,\n\nMain apna order confirm karna chahta hun:\n- Name: ${name}\n- Phone: ${phone}\n- Product: ${_selectedProduct.name}\n- Base Price: Rs ${formatPrice(price)}\n- Advance Paid: Rs 2,000\n- COD Surcharge (4% Govt Tax): Rs ${formatPrice(codTax)}\n- Remaining Payable on Delivery: Rs ${formatPrice(codPayable)}\n- Total Order Cost: Rs ${formatPrice(totalCost)}\n\nNote: Advance payment screenshot yahan share karunga. Mujhe maloom hai ke COD amount par 4% government tax applicable hai.`;
        
        let waNum = "923206755555";
        if (window.cmsData && window.cmsData.contact && window.cmsData.contact.whatsapp) {
            const cleanNum = window.cmsData.contact.whatsapp.replace(/[-\s]+/g, '');
            waNum = cleanNum.startsWith('0') ? '92' + cleanNum.substring(1) : cleanNum;
        }
        
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
        document.getElementById('orderModal')?.classList.remove('show');
    });

    // Fetch data and render
    fetch(getBasePath() + 'cms_data.json?t=' + Date.now())
        .then(r => r.json())
        .then(data => {
            window.cmsData = data;
            renderGrid(data.gadgets || [], type, data.contact);
        })
        .catch(err => {
            console.error('Category data load error:', err);
            document.getElementById('categoryGrid').innerHTML = `
                <div class="cat-empty">
                    <ion-icon name="wifi-outline"></ion-icon>
                    <p>Products load nahi ho sake. Page refresh karein.</p>
                </div>`;
        });
});
