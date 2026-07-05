# Graphics Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reolink Pakistan website ki graphics polish karna aur performance improve karna image optimization, hero badge SVG icons, aur visual consistency fixes se.

**Architecture:** Existing dark neon theme retain karte hue hero section ko CSS glow/animations se polish karna, inline SVG icons add karna, aur images ko WebP mein convert karke references update karna. Original assets safe rakhi jayengi rollback branch `backup-before-graphics` mein.

**Tech Stack:** HTML5, CSS3, Python (Pillow/cwebp for image conversion), Git, Hostinger deploy via `deploy_live.py`.

## Global Constraints

- Current dark neon theme (`#0b0f19` background, `#00f3ff` cyan, `#00ff88` green, `#ff6b35` orange) retain karni hai.
- Original image files delete nahi hongi; WebP versions add hongi aur HTML references update honge.
- Rollback branch `backup-before-graphics` already exists.
- `index.html` primary target hai; shared CSS se baqi pages bhi benefit lenge.
- Hostinger cache clear deploy ke baad zaroori ho sakta hai.
- Version query string `?v=120` use karni hai CSS/assets par cache bust ke liye.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `index.html` | Hero section markup, image src attributes, SVG icons inline |
| `css/styles.css` | Hero glow, badge styles, floating animations source |
| `css/styles.min.css` | Minified production CSS (generated from styles.css) |
| `images/**/*.webp` | New optimized image assets |
| `js/script.js` | Broken image placeholder handler, optional lazy-load fallback |
| `deploy_live.py` | Existing Hostinger deployment script |
| `docs/superpowers/specs/2026-07-05-graphics-improvement-design.md` | Approved design spec |

---

### Task 1: Audit Images & Prepare WebP Conversion Script

**Files:**
- Create: `scratch/convert_to_webp.py`
- Read: `docs/superpowers/specs/2026-07-05-graphics-improvement-design.md`

**Interfaces:**
- Consumes: PNG/JPG files under `images/`
- Produces: WebP files next to each source file

- [ ] **Step 1: Check available image tools**

Run:
```bash
which cwebp || which convert || python3 -c "from PIL import Image; print('Pillow available')"
```
Expected: At least one of `cwebp`, `convert`, or Pillow available.

- [ ] **Step 2: Write conversion script**

Create `scratch/convert_to_webp.py`:
```python
from pathlib import Path
from PIL import Image
import sys

IMG_DIR = Path('images')
QUALITY = 85

for p in sorted(IMG_DIR.rglob('*')):
    if p.suffix.lower() in ('.png', '.jpg', '.jpeg'):
        out = p.with_suffix('.webp')
        if out.exists():
            continue
        try:
            img = Image.open(p)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGBA')
                img.save(out, 'WEBP', quality=QUALITY, method=6)
            else:
                img = img.convert('RGB')
                img.save(out, 'WEBP', quality=QUALITY, method=6)
            print(f"Created {out}")
        except Exception as e:
            print(f"Failed {p}: {e}", file=sys.stderr)
```

- [ ] **Step 3: Run script in dry-run mode**

Run:
```bash
python3 scratch/convert_to_webp.py --dry-run 2>&1 | head -20
```
Expected: List of files that will be converted.

- [ ] **Step 4: Commit script**

```bash
git add scratch/convert_to_webp.py
git commit -m "chore(scripts): add WebP conversion script"
```

---

### Task 2: Generate WebP Assets

**Files:**
- Create: ~60 new `.webp` files under `images/`
- Modify: none

**Interfaces:**
- Consumes: `scratch/convert_to_webp.py`
- Produces: WebP versions for all PNG/JPG without existing WebP

- [ ] **Step 1: Run conversion**

Run:
```bash
python3 scratch/convert_to_webp.py
```
Expected: New `.webp` files generated next to source files.

- [ ] **Step 2: Verify size reduction**

Run:
```bash
python3 - <<'PY'
from pathlib import Path
total_before = total_after = 0
for p in Path('images').rglob('*'):
    if p.suffix.lower() in ('.png','.jpg','.jpeg'):
        total_before += p.stat().st_size
        w = p.with_suffix('.webp')
        if w.exists():
            total_after += w.stat().st_size
print(f"Before: {total_before/1024/1024:.2f} MB")
print(f"After:  {total_after/1024/1024:.2f} MB")
PY
```
Expected: After size significantly smaller than before.

- [ ] **Step 3: Stage and commit new WebP files**

```bash
git add images/**/*.webp
git commit -m "feat(assets): add WebP versions for PNG/JPG images"
```

---

### Task 3: Update HTML Image References

**Files:**
- Modify: `index.html`
- Modify: `go-pt-plus.html`, `category.html`, `cattle-farm-security.html`, `about.html`, `contact.html` (if direct `<img>` references exist)

**Interfaces:**
- Consumes: New `.webp` files
- Produces: HTML with `<picture>` or direct `.webp` src where safe

- [ ] **Step 1: Find direct PNG/JPG image references**

Run:
```bash
grep -R "src=\"images/.*\.\(png\|jpg\|jpeg\)\"" --include="*.html" .
```
Expected: List of files and lines needing update.

- [ ] **Step 2: Update hero product images in index.html**

Find:
```html
<img src="images/camera.webp" alt="Reolink Go PT Plus 4G Solar Camera Pakistan - Official Authorized Seller" class="variant-img v1">
<img src="images/camera-no-solar.webp" alt="Reolink Go PT Plus 4G LTE Security Camera - PTA Approved" class="variant-img v2">
```

No change needed if `.webp` already used. Add `width`/`height` attributes for CLS:
```html
<img src="images/camera.webp" width="600" height="600" alt="..." class="variant-img v1">
<img src="images/camera-no-solar.webp" width="600" height="600" alt="..." class="variant-img v2">
```

- [ ] **Step 3: Replace large product PNGs with WebP where WebP exists**

For each large `prod_*.png` with existing `.webp`, update `cms_data.json` or HTML references. Verify first:
```bash
ls -1 images/prod_*.webp | wc -l
```
Update references in `index.html` or rendered markup if hardcoded.

- [ ] **Step 4: Add WebP fallback using <picture> for critical images**

Example for `go-pt-plus.html` main product image:
```html
<picture>
  <source srcset="images/camera.webp" type="image/webp">
  <img id="mainProductImg" src="images/camera.png" alt="Reolink Go PT Plus 4G Solar Camera" width="600" height="600">
</picture>
```

- [ ] **Step 5: Commit HTML reference updates**

```bash
git add *.html
git commit -m "feat(html): use WebP images with fallbacks"
```

---

### Task 4: Add Lazy Loading

**Files:**
- Modify: `index.html`, `go-pt-plus.html`, `category.html`, other HTML files

**Interfaces:**
- Consumes: Existing `<img>` tags
- Produces: Lazy-loaded non-hero images

- [ ] **Step 1: Find images without loading attribute**

Run:
```bash
grep -R "<img" --include="*.html" . | grep -v 'loading=' | grep -v 'camera.webp' | grep -v 'camera-no-solar.webp'
```

- [ ] **Step 2: Add loading="lazy" to non-hero images**

Add to all below-fold images:
```html
<img src="images/example.webp" loading="lazy" alt="...">
```

Do NOT add lazy loading to hero product image (already preloaded).

- [ ] **Step 3: Commit**

```bash
git add *.html
git commit -m "perf(html): add lazy loading to below-fold images"
```

---

### Task 5: Polish Hero CSS

**Files:**
- Modify: `css/styles.css` (hero section)
- Modify: `css/styles.min.css` (minified version)

**Interfaces:**
- Consumes: Existing `.reo-hero`, `.hero-visual`, `.cam-wrapper`, `.float-tag` classes
- Produces: Enhanced glow, badge animations

- [ ] **Step 1: Read current hero CSS**

Run:
```bash
grep -n "reo-hero\|hero-visual\|cam-wrapper\|float-tag\|product-glow" css/styles.css | head -40
```

- [ ] **Step 2: Add improved product glow**

Append to `css/styles.css`:
```css
.hero-visual .product-glow {
  background: radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.25), transparent 60%);
  filter: blur(40px);
  animation: glowPulse 4s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
```

- [ ] **Step 3: Improve floating badge styling**

Update `.float-tag` if exists, otherwise append:
```css
.float-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(11, 15, 25, 0.85);
  border: 1px solid rgba(0, 243, 255, 0.3);
  border-radius: 999px;
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 15px rgba(0, 243, 255, 0.15);
}
.float-tag svg {
  width: 14px;
  height: 14px;
  fill: #00f3ff;
}
```

- [ ] **Step 4: Regenerate minified CSS**

Run existing minify process or use a CSS minifier:
```bash
python3 - <<'PY'
import re
with open('css/styles.css') as f:
    css = f.read()
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = re.sub(r'\s+', ' ', css)
css = css.replace('; ', ';').replace(' {', '{').replace('{ ', '{').replace(' }', '}').replace('} ', '}')
with open('css/styles.min.css', 'w') as f:
    f.write(css)
PY
```

- [ ] **Step 5: Bump CSS version in HTML**

Update all pages:
```html
<link rel="stylesheet" href="css/styles.min.css?v=120">
```

- [ ] **Step 6: Commit**

```bash
git add css/styles.css css/styles.min.css *.html
git commit -m "feat(css): polish hero glow and floating badges"
```

---

### Task 6: Add Custom SVG Icons for Hero Badges

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: Existing floating badge markup
- Produces: Inline SVG icons replacing ionicons in hero badges

- [ ] **Step 1: Create inline SVG icon definitions**

Add hidden SVG sprite at top of `<body>` in `index.html`:
```html
<svg width="0" height="0" style="position:absolute;" aria-hidden="true">
  <defs>
    <symbol id="icon-4g" viewBox="0 0 24 24"><path d="M2 16h2v4H2zm4-4h2v8H6zm4-4h2v12h-2zm4-4h2v16h-2zm4 8h2v8h-2z" fill="currentColor"/></symbol>
    <symbol id="icon-shield" viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 14.91c-2.97-.99-5-3.86-5-7.32V6.3l5-1.88 5 1.88v3.29c0 3.46-2.03 6.33-5 7.32z" fill="currentColor"/></symbol>
    <symbol id="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="icon-scan" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2M3 17v2a2 2 0 0 0 2 2h2M21 7V5a2 2 0 0 0-2-2h-2M21 17v2a2 2 0 0 1-2 2h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="icon-mic" viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm6-3a6 6 0 0 1-12 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 18v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
    <symbol id="icon-bell" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  </defs>
</svg>
```

- [ ] **Step 2: Replace ionicons in hero badges**

Update `.mobile-tags-row` in `index.html`:
```html
<div class="float-tag ft-1"><svg><use href="#icon-4g"></use></svg> <span>4G LTE</span></div>
<div class="float-tag ft-2"><svg><use href="#icon-shield"></use></svg> <span>PTA Approved</span></div>
<div class="float-tag ft-3"><svg><use href="#icon-sun"></use></svg> <span>Solar Powered</span></div>
<div class="float-tag ft-4"><svg><use href="#icon-scan"></use></svg> <span>2K 4MP</span></div>
<div class="float-tag ft-5"><svg><use href="#icon-mic"></use></svg> <span>Two Way Audio</span></div>
<div class="float-tag ft-6"><svg><use href="#icon-bell"></use></svg> <span>App Alerts</span></div>
```

- [ ] **Step 3: Verify SVG icons render**

Open `index.html` in browser or run:
```bash
grep -n "icon-4g\|icon-shield\|icon-sun\|icon-scan\|icon-mic\|icon-bell" index.html
```
Expected: All 6 symbols referenced.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(hero): add custom SVG icons for floating badges"
```

---

### Task 7: Add Broken Image Placeholder

**Files:**
- Create: `images/placeholder.webp`
- Modify: `js/script.js`

**Interfaces:**
- Consumes: Image load failures
- Produces: Fallback placeholder display

- [ ] **Step 1: Create placeholder image**

Generate a small placeholder:
```bash
python3 - <<'PY'
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (400, 400), '#0b0f19')
draw = ImageDraw.Draw(img)
draw.rectangle([(0,0),(399,399)], outline='#1e293b', width=2)
try:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 28)
except:
    font = ImageFont.load_default()
draw.text((120, 180), "No Image", fill="#64748b", font=font)
img.save('images/placeholder.webp', 'WEBP', quality=80)
PY
```

- [ ] **Step 2: Add JS fallback handler**

Append to `js/script.js`:
```javascript
document.addEventListener('error', function(e) {
  const target = e.target;
  if (target.tagName === 'IMG' && !target.dataset.replaced) {
    target.dataset.replaced = 'true';
    target.src = 'images/placeholder.webp';
  }
}, true);
```

- [ ] **Step 3: Commit**

```bash
git add images/placeholder.webp js/script.js
git commit -m "feat(assets): add broken image placeholder"
```

---

### Task 8: Verification

**Files:**
- Read: `index.html`, `css/styles.min.css`, `js/script.js`

- [ ] **Step 1: Validate HTML**

Run:
```bash
grep -c "loading=\"lazy\"" index.html
grep -c "\.webp" index.html
grep -c "<svg" index.html
```
Expected: Non-zero counts.

- [ ] **Step 2: Check no broken references**

Run:
```bash
grep -R "src=\"images/.*\.png\"" --include="*.html" . | grep -v "placeholder"
```
Expected: Only intentional PNG fallbacks remain.

- [ ] **Step 3: Open index.html locally**

Run:
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000` in browser. Verify:
- Hero product image loads
- Floating badges show SVG icons
- No broken images
- Animations work

- [ ] **Step 4: Stop server**

`Ctrl+C`

---

### Task 9: Deploy

**Files:**
- Run: `deploy_live.py`

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Run deploy script**

```bash
python3 deploy_live.py
```
Expected: Deployment completes successfully.

- [ ] **Step 3: Verify live site**

Open `https://www.reolink.com.pk/` in browser. Check:
- Hero section polished
- Images load fast
- No console errors

- [ ] **Step 4: If cache issues, note to user**

If old images show, Hostinger cache clear karna hoga. User ke friend ko bolna hoga cache clear karne ke liye.

---

## Self-Review Checklist

1. **Spec coverage:**
   - [x] Image optimization (WebP, compression) — Tasks 1-3
   - [x] Hero section/banner polish — Tasks 5-6
   - [x] Product photos/gallery consistency — Task 3
   - [x] Visual consistency — Tasks 3, 7
   - [x] Rollback option — Global constraints

2. **Placeholder scan:**
   - [x] No TBD/TODO
   - [x] No vague instructions
   - [x] Code blocks included for all code steps

3. **Type consistency:**
   - [x] Class names consistent across CSS and HTML
   - [x] SVG symbol IDs match usage

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-05-graphics-improvement.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach do you want?
