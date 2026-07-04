# Phase 1: SEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Open Graph, Twitter Cards, canonical URLs, and structured data to every public page so social sharing and search-engine rich results work correctly.

**Architecture:** Keep existing static HTML pages and dynamic JS-driven pages intact. Add reusable helper functions in `js/category.js` and `js/product-details.js` to inject OG/Twitter meta tags and JSON-LD schema at runtime. Add static JSON-LD blocks directly into `about.html` and `contact.html`. Update `sitemap.xml` to reflect any new pages.

**Tech Stack:** HTML5, vanilla JavaScript, JSON-LD (Schema.org), XML sitemap.

## Global Constraints

- Canonical URLs must use `https://www.reolink.com.pk/` (trailing slash matching existing homepage style).
- OG images must be absolute HTTPS URLs; fallback to `https://www.reolink.com.pk/images/camera.webp` when no page-specific image exists.
- All changes must preserve existing Meta Pixel and Google Analytics code.
- Do not modify `cms_data.json` structure in this phase.
- Match existing dark-theme and file naming conventions.
- Commit after every task.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `about.html` | Static about page; receives static Organization schema + OG/Twitter tags |
| `contact.html` | Static contact page; receives static LocalBusiness schema + OG/Twitter tags |
| `warranty.html` | Static policy page; receives OG/Twitter tags + canonical |
| `privacy-policy.html` | Static policy page; receives OG/Twitter tags + canonical |
| `go-pt-plus.html` | Static product landing page; receives OG/Twitter tags + canonical |
| `cattle-farm-security.html` | Static blog page; receives OG/Twitter tags + canonical |
| `category.html` | Dynamic category shell; receives static OG/Twitter template tags |
| `js/category.js` | Injects category-specific title, description, OG, Twitter, canonical, breadcrumb schema |
| `product-details.html` | Dynamic product shell; receives static OG/Twitter template tags |
| `js/product-details.js` | Injects product-specific title, description, OG, Twitter, canonical, breadcrumb schema |
| `sitemap.xml` | Lists all public URLs for search engines |

---

### Task 1: Add canonical, Open Graph and Twitter Card tags to static pages

**Files:**
- Modify: `about.html`
- Modify: `contact.html`
- Modify: `warranty.html`
- Modify: `privacy-policy.html`
- Modify: `go-pt-plus.html`
- Modify: `cattle-farm-security.html`

**Interfaces:**
- Consumes: existing `<title>` and `<meta name="description">` content.
- Produces: each page has `<link rel="canonical">`, Open Graph `property="og:*"` tags, and Twitter `name="twitter:*"` tags.

- [ ] **Step 1: Identify insertion point in each page**

Locate the line containing `<meta name="keywords"` in each file. The new tags will be inserted immediately after it.

- [ ] **Step 2: Add tags to `about.html`**

Insert after the keywords meta tag:

```html
    <link rel="canonical" href="https://www.reolink.com.pk/about">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="About Us | Reolink Pakistan - Official Partner">
    <meta property="og:description" content="Learn more about S M Enterprises, the authorized Reolink partner and official distributor of wire-free 4G solar & WiFi security cameras in Pakistan.">
    <meta property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta property="og:url" content="https://www.reolink.com.pk/about">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="About Us | Reolink Pakistan - Official Partner">
    <meta name="twitter:description" content="Authorized Reolink partner in Pakistan. Official distributor of 4G solar & WiFi security cameras by S M Enterprises.">
    <meta name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 3: Add tags to `contact.html`**

Insert after the keywords meta tag:

```html
    <link rel="canonical" href="https://www.reolink.com.pk/contact">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Contact Us | Reolink Pakistan - Official Partner">
    <meta property="og:description" content="Contact S M Enterprises, the authorized Reolink partner in Pakistan. Get support, request quotes, or find address, email, and phone details.">
    <meta property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta property="og:url" content="https://www.reolink.com.pk/contact">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Contact Us | Reolink Pakistan - Official Partner">
    <meta name="twitter:description" content="Get in touch with S M Enterprises, authorized Reolink partner in Pakistan. Support, quotes, and contact details.">
    <meta name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 4: Add tags to `warranty.html`**

Insert after the keywords meta tag:

```html
    <link rel="canonical" href="https://www.reolink.com.pk/warranty">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Warranty, Returns & FAQ | Reolink Pakistan - Official Partner">
    <meta property="og:description" content="Official warranty and return policies of S M Enterprises (Reolink Pakistan). View terms for 1-Month local warranty, returns, and FAQs.">
    <meta property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta property="og:url" content="https://www.reolink.com.pk/warranty">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Warranty, Returns & FAQ | Reolink Pakistan">
    <meta name="twitter:description" content="Official warranty & return policy for Reolink Pakistan products by S M Enterprises. 1-month local warranty details.">
    <meta name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 5: Add tags to `privacy-policy.html`**

Insert after the keywords meta tag:

```html
    <link rel="canonical" href="https://www.reolink.com.pk/privacy-policy">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Privacy Policy | Reolink Pakistan - Official Partner">
    <meta property="og:description" content="Official Privacy Policy of S M Enterprises (Reolink Pakistan). Learn how we collect, store, protect, and use your personal information.">
    <meta property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta property="og:url" content="https://www.reolink.com.pk/privacy-policy">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Privacy Policy | Reolink Pakistan">
    <meta name="twitter:description" content="Privacy policy of S M Enterprises (Reolink Pakistan). How we collect, store, and protect your information.">
    <meta name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 6: Add tags to `go-pt-plus.html`**

Use the page-specific image if it exists (e.g. `images/camera.webp` or a dedicated go-pt-plus image). Insert after keywords meta:

```html
    <link rel="canonical" href="https://www.reolink.com.pk/go-pt-plus">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product">
    <meta property="og:title" content="Reolink Go PT Plus 4G Solar Camera | Official Reolink Pakistan">
    <meta property="og:description" content="Get the Reolink Go PT Plus 4G Solar-Powered Security Camera in Pakistan. PTA approved, wire-free 2K 4MP clarity, 355° Pan, 140° Tilt.">
    <meta property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta property="og:url" content="https://www.reolink.com.pk/go-pt-plus">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">
    <meta property="product:price:amount" content="25000">
    <meta property="product:price:currency" content="PKR">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Reolink Go PT Plus 4G Solar Camera | Official Reolink Pakistan">
    <meta name="twitter:description" content="PTA approved 4G solar security camera in Pakistan. 2K 4MP, 355° pan, 140° tilt. Buy from S M Enterprises.">
    <meta name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 7: Add tags to `cattle-farm-security.html`**

Insert after keywords meta:

```html
    <link rel="canonical" href="https://www.reolink.com.pk/blog/cattle-farm-security">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="Why 4G SIM Solar Camera is Best for Cattle Farms in Pakistan | Reolink Pakistan">
    <meta property="og:description" content="Discover why wire-free 4G SIM solar cameras are the ultimate security choice for cattle farms and rural properties in Pakistan.">
    <meta property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta property="og:url" content="https://www.reolink.com.pk/blog/cattle-farm-security">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Why 4G SIM Solar Camera is Best for Cattle Farms in Pakistan">
    <meta name="twitter:description" content="Wire-free 4G SIM solar cameras for cattle farms in Pakistan. No electricity or WiFi needed.">
    <meta name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 8: Verify tags rendered**

Open each static page in a browser or use `curl` and confirm that `og:title`, `twitter:title`, and `link rel="canonical"` appear in `<head>`.

- [ ] **Step 9: Commit**

```bash
git add about.html contact.html warranty.html privacy-policy.html go-pt-plus.html cattle-farm-security.html
git commit -m "feat(seo): add canonical, Open Graph and Twitter Card tags to static pages"
```

---

### Task 2: Add Organization schema to `about.html`

**Files:**
- Modify: `about.html`

**Interfaces:**
- Consumes: existing contact details from page content.
- Produces: JSON-LD `Organization` script appended to `<head>`.

- [ ] **Step 1: Add Organization JSON-LD before `</head>`**

Insert just before the closing `</head>` tag:

```html
    <!-- Structured Data: Organization -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "S M Enterprises - Reolink Pakistan",
        "url": "https://www.reolink.com.pk",
        "logo": "https://www.reolink.com.pk/images/favicon-32.png",
        "description": "Authorized Reolink partner and official distributor of wire-free 4G solar & WiFi security cameras in Pakistan.",
        "sameAs": [
            "https://www.facebook.com/reolinkpakistan",
            "https://www.instagram.com/reolinkpakistan"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+92-320-6755555",
            "contactType": "customer service",
            "areaServed": "PK",
            "availableLanguage": ["English", "Urdu"]
        }
    }
    </script>
```

If Facebook/Instagram URLs are not available, replace `sameAs` with an empty array `[]`.

- [ ] **Step 2: Validate with Google's Rich Results Test**

Copy the generated JSON-LD into https://search.google.com/test/rich-results and confirm no errors.

- [ ] **Step 3: Commit**

```bash
git add about.html
git commit -m "feat(seo): add Organization schema to about page"
```

---

### Task 3: Add LocalBusiness schema to `contact.html`

**Files:**
- Modify: `contact.html`

**Interfaces:**
- Consumes: address, phone, email from page content.
- Produces: JSON-LD `LocalBusiness` script appended to `<head>`.

- [ ] **Step 1: Add LocalBusiness JSON-LD before `</head>`**

Insert just before the closing `</head>` tag:

```html
    <!-- Structured Data: LocalBusiness -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ElectronicsStore",
        "name": "S M Enterprises - Reolink Pakistan",
        "image": "https://www.reolink.com.pk/images/camera.webp",
        "url": "https://www.reolink.com.pk/contact",
        "telephone": "+92-320-6755555",
        "email": "support@reolink.com.pk",
        "priceRange": "Rs",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "House # 41/31361 Opposite green homes colony, Nawabpur Road",
            "addressLocality": "Multan",
            "addressRegion": "Punjab",
            "postalCode": "60000",
            "addressCountry": "PK"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "30.1575",
            "longitude": "71.5249"
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "10:00",
            "closes": "20:00"
        }
    }
    </script>
```

Update `latitude`/`longitude` to actual coordinates if available.

- [ ] **Step 2: Validate schema**

Use Google's Rich Results Test to confirm no errors.

- [ ] **Step 3: Commit**

```bash
git add contact.html
git commit -m "feat(seo): add LocalBusiness schema to contact page"
```

---

### Task 4: Add dynamic OG/Twitter/canonical/BreadcrumbList to category pages

**Files:**
- Modify: `category.html`
- Modify: `js/category.js`

**Interfaces:**
- Consumes: `CATEGORY_META[type]` object (title/eyebrow/desc/keywords), current URL, category type.
- Produces: runtime-injected `<meta property="og:*">`, `<meta name="twitter:*">`, `<link rel="canonical">`, and JSON-LD `BreadcrumbList` in `<head>`.

- [ ] **Step 1: Add placeholder meta tags in `category.html`**

In `<head>`, after the existing keywords meta tag, add:

```html
    <link rel="canonical" id="catCanonical" href="https://www.reolink.com.pk/category">

    <!-- Open Graph / Facebook -->
    <meta id="catOgType" property="og:type" content="website">
    <meta id="catOgTitle" property="og:title" content="Category | S M Enterprises - Reolink Pakistan">
    <meta id="catOgDesc" property="og:description" content="Browse premium Reolink security cameras and smart tech gadgets in Pakistan.">
    <meta id="catOgImage" property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta id="catOgUrl" property="og:url" content="https://www.reolink.com.pk/category">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta id="catTwitterTitle" name="twitter:title" content="Category | S M Enterprises - Reolink Pakistan">
    <meta id="catTwitterDesc" name="twitter:description" content="Browse premium Reolink security cameras and smart tech gadgets in Pakistan.">
    <meta id="catTwitterImage" name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 2: Add helper functions to `js/category.js`**

Append these helpers at the top of `js/category.js` after the `CATEGORY_META` definition:

```javascript
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

function setMetaProperty(id, property, content) {
    const el = document.getElementById(id);
    if (el) {
        el.setAttribute('property', property);
        el.setAttribute('content', content);
    }
}

function injectCategorySchema(type, meta) {
    const oldSchema = document.getElementById('dynamicCategorySchema');
    if (oldSchema) oldSchema.remove();

    const categoryName = meta.eyebrow || 'Products';
    const pageUrl = `${SITE_ORIGIN}/category/${type}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${categoryName} | S M Enterprises - Reolink Pakistan`,
        "description": meta.desc,
        "url": pageUrl,
        "breadcrumb": {
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
                    "item": pageUrl
                }
            ]
        }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamicCategorySchema';
    script.text = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}
```

- [ ] **Step 3: Wire helpers into `updatePageMeta`**

Modify `updatePageMeta(type)` in `js/category.js`. Replace the existing SEO update block with:

```javascript
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

    const pageTitle = `${meta.eyebrow} | S M Enterprises - Reolink Pakistan`;
    titleEl.textContent = pageTitle;
    descEl.setAttribute('content', meta.desc);
    kwEl.setAttribute('content', meta.keywords);

    // Open Graph & Twitter dynamic injection
    const pageUrl = `${SITE_ORIGIN}/category/${type}`;
    setLinkHref('catCanonical', pageUrl);
    setMetaProperty('catOgType', 'og:type', 'website');
    setMetaContent('catOgTitle', pageTitle);
    setMetaContent('catOgDesc', meta.desc);
    setMetaContent('catOgImage', DEFAULT_OG_IMAGE);
    setMetaContent('catOgUrl', pageUrl);
    setMetaContent('catTwitterTitle', pageTitle);
    setMetaContent('catTwitterDesc', meta.desc);
    setMetaContent('catTwitterImage', DEFAULT_OG_IMAGE);

    // JSON-LD schema
    injectCategorySchema(type, meta);

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
```

- [ ] **Step 4: Test category page**

Visit `/category/4g-cameras` and verify in DevTools:
- `document.title` matches category
- `og:title`, `twitter:title`, `og:url`, `canonical` are set
- JSON-LD `CollectionPage` + `BreadcrumbList` appears in `<head>`

- [ ] **Step 5: Commit**

```bash
git add category.html js/category.js
git commit -m "feat(seo): dynamic OG, Twitter, canonical and breadcrumb schema for category pages"
```

---

### Task 5: Add dynamic OG/Twitter/canonical/BreadcrumbList to product pages

**Files:**
- Modify: `product-details.html`
- Modify: `js/product-details.js`

**Interfaces:**
- Consumes: product object (`name`, `meta_title`, `meta_desc`, `image`, `curr_price`) from `cms_data.json`.
- Produces: runtime-injected `<meta property="og:*">`, `<meta name="twitter:*">`, `<link rel="canonical">`, `BreadcrumbList`, and enhanced `Product` schema.

- [ ] **Step 1: Add placeholder meta tags in `product-details.html`**

In `<head>`, after the existing keywords meta tag, add:

```html
    <link rel="canonical" id="pdCanonical" href="https://www.reolink.com.pk/products">

    <!-- Open Graph / Facebook -->
    <meta id="pdOgType" property="og:type" content="product">
    <meta id="pdOgTitle" property="og:title" content="Product Details | S M Enterprises Tech Store">
    <meta id="pdOgDesc" property="og:description" content="Explore premium smart gadgets, wireless audio, and security cameras at S M Enterprises.">
    <meta id="pdOgImage" property="og:image" content="https://www.reolink.com.pk/images/camera.webp">
    <meta id="pdOgUrl" property="og:url" content="https://www.reolink.com.pk/products">
    <meta property="og:site_name" content="Reolink Pakistan">
    <meta property="og:locale" content="en_PK">
    <meta id="pdOgPriceAmount" property="product:price:amount" content="0">
    <meta id="pdOgPriceCurrency" property="product:price:currency" content="PKR">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta id="pdTwitterTitle" name="twitter:title" content="Product Details | S M Enterprises Tech Store">
    <meta id="pdTwitterDesc" name="twitter:description" content="Explore premium smart gadgets, wireless audio, and security cameras at S M Enterprises.">
    <meta id="pdTwitterImage" name="twitter:image" content="https://www.reolink.com.pk/images/camera.webp">
```

- [ ] **Step 2: Add helper functions to `js/product-details.js`**

Append these helpers near the top after `getFallbackSVG`:

```javascript
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
```

- [ ] **Step 3: Extend `injectProductSchema` to include image array and brand**

Replace the existing `injectProductSchema` function with:

```javascript
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
            "price": product.curr_price,
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
```

- [ ] **Step 4: Wire OG/Twitter/canonical injection into `renderProductDetails`**

Inside `renderProductDetails(product, contactInfo)`, after the existing meta injection and before schema injection, add:

```javascript
    // Canonical, Open Graph & Twitter dynamic injection
    const productUrl = SITE_ORIGIN + (product.static_url || `/products/${product.id}`);
    const imageUrl = absoluteImageUrl(product.image);
    const displayTitle = product.meta_title || `${product.name} | S M Enterprises Tech Store`;
    const displayDesc = product.meta_desc || `Buy ${product.name} in Pakistan from S M Enterprises. High quality products with 1 month official warranty and express delivery.`;

    setLinkHref('pdCanonical', productUrl);
    setMetaContent('pdOgTitle', displayTitle);
    setMetaContent('pdOgDesc', displayDesc);
    setMetaContent('pdOgImage', imageUrl);
    setMetaContent('pdOgUrl', productUrl);
    setMetaContent('pdOgPriceAmount', String(product.curr_price));
    setMetaContent('pdTwitterTitle', displayTitle);
    setMetaContent('pdTwitterDesc', displayDesc);
    setMetaContent('pdTwitterImage', imageUrl);
```

Then add breadcrumb schema injection right after `injectProductSchema(product);`:

```javascript
    injectBreadcrumbSchema(product);
```

- [ ] **Step 5: Test product page**

Visit `/products/keen-ranger-pt` and verify in DevTools:
- `document.title` uses `product.meta_title`
- `og:title`, `twitter:title`, `og:url`, `canonical`, `product:price:amount` are set
- JSON-LD `Product` and `BreadcrumbList` appear in `<head>`

- [ ] **Step 6: Commit**

```bash
git add product-details.html js/product-details.js
git commit -m "feat(seo): dynamic OG, Twitter, canonical, breadcrumb and product schema for product pages"
```

---

### Task 6: Update `sitemap.xml`

**Files:**
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: list of public URLs already present.
- Produces: updated sitemap with all existing pages and any missing public pages.

- [ ] **Step 1: Verify all public URLs are listed**

Ensure the sitemap already contains:
- `/`
- `/products/4g-sim-solar-camera`
- `/blog/cattle-farm-security`
- `/about`
- `/contact`
- `/warranty`
- `/privacy-policy`
- `/category/4g-cameras`, `/category/solar-cameras`, etc.
- All product URLs from `cms_data.json`

- [ ] **Step 2: Add missing public pages if any**

If `/go-pt-plus` is missing, append before `</urlset>`:

```xml
  <url>
    <loc>https://www.reolink.com.pk/go-pt-plus</loc>
    <lastmod>2026-07-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
```

- [ ] **Step 3: Update `<lastmod>` dates**

Set all `<lastmod>` entries to `2026-07-04`.

- [ ] **Step 4: Validate XML**

Open `sitemap.xml` in a browser or run:

```bash
python3 -c "import xml.etree.ElementTree as ET; ET.parse('/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/sitemap.xml'); print('XML valid')"
```

Expected output: `XML valid`

- [ ] **Step 5: Commit**

```bash
git add sitemap.xml
git commit -m "feat(seo): update sitemap lastmod and add missing public pages"
```

---

### Task 7: Phase 1 Validation

**Files:**
- Read-only: all modified HTML/JS/XML files

**Interfaces:**
- Consumes: final state of all modified files.
- Produces: validation report confirming Phase 1 completion.

- [ ] **Step 1: Run HTML meta tag checks**

For each static page, verify presence of canonical, `og:title`, and `twitter:title`:

```bash
for page in about.html contact.html warranty.html privacy-policy.html go-pt-plus.html cattle-farm-security.html; do
  echo "=== $page ==="
  grep -o '<link rel="canonical"[^>]*>' /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/$page || echo "MISSING canonical"
  grep -o 'property="og:title"' /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/$page || echo "MISSING og:title"
  grep -o 'name="twitter:title"' /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/$page || echo "MISSING twitter:title"
done
```

Expected: each page shows one canonical, one og:title, one twitter:title.

- [ ] **Step 2: Verify JSON-LD schemas in about/contact**

```bash
grep -o '"@type": "Organization"' /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/about.html
grep -o '"@type": "ElectronicsStore"' /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/contact.html
```

Expected output contains both lines.

- [ ] **Step 3: Verify dynamic helper functions exist**

```bash
grep -n "injectCategorySchema\|injectBreadcrumbSchema\|absoluteImageUrl\|SITE_ORIGIN" /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/category.js /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/product-details.js
```

Expected: function names appear in output.

- [ ] **Step 4: Open local pages in browser (manual)**

Open the following local URLs and use DevTools to confirm meta tags:
- `http://localhost/reolinkpakistan/about.html`
- `http://localhost/reolinkpakistan/category.html?type=4g-cameras`
- `http://localhost/reolinkpakistan/product-details.html?id=keen-ranger-pt`

- [ ] **Step 5: Final commit / tag Phase 1 complete**

```bash
git log --oneline -5
```

Confirm 6 commits exist for Phase 1.

---

## Spec Coverage Check

| Spec Requirement | Implementing Task |
|------------------|-------------------|
| Open Graph tags on all pages | Task 1 (static), Task 4 (category), Task 5 (product) |
| Twitter Card tags on all pages | Task 1 (static), Task 4 (category), Task 5 (product) |
| Canonical URLs | Task 1, Task 4, Task 5 |
| Organization schema on about | Task 2 |
| LocalBusiness schema on contact | Task 3 |
| Breadcrumb navigation + schema on category/product | Task 4, Task 5 |
| Update sitemap.xml | Task 6 |

## Placeholder Scan

No TBD/TODO/fill-in-later patterns. All code snippets are concrete and copy-paste ready. Facebook/Instagram `sameAs` URLs should be updated if real accounts exist; otherwise use empty array.

## Type Consistency

- `setMetaContent(id, content)` used consistently across both `category.js` and `product-details.js`.
- `SITE_ORIGIN` and `DEFAULT_OG_IMAGE` constants defined in both JS files independently (no cross-file dependency).
- Product schema uses `product.curr_price` (number) matching existing code.
- Category breadcrumb uses `meta.eyebrow` as category name.
