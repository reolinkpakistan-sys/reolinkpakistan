# Reolink Pakistan Website Improvements — Design Spec

**Date:** 2026-07-04  
**Project:** reolink.com.pk (Reolink Pakistan)  
**Scope:** Implement all recommendations from the Website Improvement Report  
**Approach:** Phased Roadmap (Approved)  

## 1. Goal

Convert the existing static/dynamic website into a higher-performing, better-converting, SEO-rich storefront by implementing the 20+ recommendations identified in the audit report.

## 2. Current State

- Static HTML pages + dynamic product/category pages driven by `cms_data.json`
- Admin panel available at `/admin/` for CMS updates
- Security recently hardened (CSRF, rate limiting, upload validation, `.htaccess`)
- Homepage has strong meta/OG/schema; other pages lack OG/schema
- `videos/` folder: ~144 MB, `images/` folder: ~72 MB
- WhatsApp order buttons exist but no lead capture or sticky CTA
- No visible customer reviews, trust badges, or urgency elements

## 3. Success Criteria

- All public HTML pages have unique Open Graph and Twitter Card tags
- Schema.org markup present on homepage, product, category, about, contact, FAQ pages
- Video folder reduced below 20 MB or offloaded to YouTube/Vimeo embeds
- Customer reviews section visible on homepage and product pages
- Sticky WhatsApp CTA present on mobile
- Lead capture form(s) collect visitor contact info into admin/CMS
- New FAQ and Shipping/Delivery pages published
- Page load speed improved (TTFB < 0.3s target)

## 4. Architecture & Constraints

- Keep existing file structure and admin CMS intact
- Prefer minimal, maintainable changes; match existing code style
- All new dynamic content should be editable via `cms_data.json` / admin panel
- Do not break existing WhatsApp order flow
- Do not push generated reports/PDFs to GitHub
- Maintain responsive design for mobile-first Pakistan audience

## 5. Phase Breakdown

### Phase 1 — SEO Foundation (Week 1)

1. Add Open Graph tags to all public pages:
   - `about.html`
   - `contact.html`
   - `warranty.html`
   - `privacy-policy.html`
   - `category.html`
   - `product-details.html`
   - `go-pt-plus.html`
   - `cattle-farm-security.html`
2. Add Twitter Card tags to same pages.
3. Add canonical URLs where missing.
4. Add Organization schema to `about.html`.
5. Add LocalBusiness schema to `contact.html`.
6. Add Breadcrumb navigation + BreadcrumbList schema to category/product pages.
7. Update `sitemap.xml` generation to include new pages.

### Phase 2 — Performance Optimization (Week 2)

1. Audit `videos/` folder; compress large videos with HandBrake/FFmpeg.
2. Replace self-hosted promo videos with YouTube/Vimeo embeds where possible.
3. Audit `images/` folder; compress/resize images > 200 KB.
4. Move inline `<style>` blocks from HTML pages into `css/styles.css` or page-specific CSS.
5. Add caching headers via `.htaccess` for static assets.
6. Lazy-load below-the-fold images and iframes.

### Phase 3 — Conversion & UX (Week 3)

1. Add customer reviews/testimonials section on homepage.
2. Add reviews section on product detail page (data from `cms_data.json`).
3. Add admin UI to manage reviews.
4. Add sticky floating WhatsApp button on mobile.
5. Add trust badges to homepage hero section (COD, Warranty, Free Shipping, PTA Approved).
6. Add urgency top bar with rotating messages.
7. Add "Get Best Price" / "Request a Call" lead capture forms.
8. Store leads in admin panel / JSON file.
9. Add WhatsApp chat widget (optional live chat fallback).
10. Add scarcity badges: "Only X left", "X people viewing".

### Phase 4 — Content Expansion (Week 4)

1. Create `faq.html` with FAQ schema markup.
2. Create `shipping-delivery.html` with delivery info.
3. Expand blog: add 2-3 posts (installation guides, comparisons).
4. Improve product page content: specs table, use cases, comparison tables.
5. Add 404 error page customization.
6. Add internal linking strategy (related products, related blogs).

## 6. Data Model Updates

Extend `cms_data.json` with:

```json
{
  "reviews": [
    {
      "id": 1,
      "name": "Customer Name",
      "city": "Lahore",
      "rating": 5,
      "text": "Review text",
      "product": "Reolink Go PT Plus",
      "date": "2026-06-15",
      "photo": "images/reviews/photo1.webp"
    }
  ],
  "leads": [
    {
      "id": 1,
      "name": "...",
      "phone": "...",
      "email": "...",
      "product_interest": "...",
      "source": "get_best_price_form",
      "date": "2026-07-04T10:00:00"
    }
  ],
  "faqs": [
    {
      "question": "...",
      "answer": "..."
    }
  ],
  "settings": {
    "urgency_bar_text": "Limited Stock - Order Today for Same-Day Dispatch",
    "trust_badges": [...]
  }
}
```

## 7. Error Handling

- Forms must validate phone/WhatsApp numbers (Pakistan format).
- Fallback if `cms_data.json` keys missing: hide section gracefully.
- OG images must have absolute HTTPS URLs; fallback to homepage image.
- Lead storage must be protected by admin auth; no direct public write.

## 8. Testing

- Validate all pages with Facebook Sharing Debugger.
- Validate schema with Google Rich Results Test.
- Test forms on mobile and desktop.
- Measure page load with Lighthouse before/after.
- Verify no broken links after adding new pages.

## 9. Out of Scope

- E-commerce checkout/payment gateway
- Full multi-language Urdu translation (future phase)
- Advanced search/filter (until products > 20)
- CDN migration (Cloudflare) — documented as future task

## 10. Approval

Design approved by user on 2026-07-04 for phased implementation starting with Phase 1.
