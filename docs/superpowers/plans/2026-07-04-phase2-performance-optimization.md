# Phase 2: Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce page load time and asset sizes by adding caching headers, removing inline CSS, lazy-loading below-the-fold images, optimizing oversized images, and documenting video compression next steps.

**Architecture:** Extend the existing `css/styles.css` with page-specific sections moved from inline `<style>` blocks. Update `.htaccess` with browser caching rules. Add `loading="lazy"` to images that lack it and are clearly below the fold. Use macOS `sips` and `cjpeg` for lossy image optimization of the largest images. Leave actual video compression to a documented follow-up because `ffmpeg` is not installed.

**Tech Stack:** Apache `.htaccess`, HTML5 `loading="lazy"`, macOS `sips`, `cjpeg` (MozJPEG), Python 3 for audits.

## Global Constraints

- Do not modify generated report pages: `code_audit_report.html`, `security_hardening_presentation.html`, `website_improvement_report.html`.
- Do not delete or move original images/videos without backing them up first.
- All CSS moves must preserve existing selectors and rules verbatim.
- Lazy loading must not be added to above-the-fold hero images.
- Do not push generated reports/PDFs to GitHub.
- Match existing file naming conventions.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `.htaccess` | Apache rewrite rules, security headers, and new caching headers |
| `css/styles.css` | Already large global stylesheet; receives moved inline CSS sections |
| `category.html` | Loses inline `<style>` block |
| `go-pt-plus.html` | Loses inline `<style>` block |
| `product-details.html` | Loses inline `<style>` block |
| `cattle-farm-security.html` | Loses inline `<style>` block |
| `index.html` | Receives lazy-loading on some below-fold images |
| `about.html`, `contact.html`, `warranty.html`, `privacy-policy.html` | May receive lazy-loading on below-fold images |
| `videos/` | Audited; unused files documented; no binary changes in this phase |
| `images/` | Largest PNG/JPEG files optimized in-place with backups |

---

### Task 1: Add browser caching headers to `.htaccess`

**Files:**
- Modify: `.htaccess`

**Interfaces:**
- Consumes: existing `.htaccess` with rewrite rules and security headers.
- Produces: `.htaccess` with added `mod_expires` / `mod_headers` caching directives for static assets.

- [ ] **Step 1: Read current `.htaccess`**

File: `/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/.htaccess`

- [ ] **Step 2: Append caching directives before closing security headers block**

Insert after the existing `<IfModule mod_headers.c>` opening tag (line 36) and before the first `Header always set` lines:

```apache
    # Browser caching for static assets
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/webp "access plus 6 months"
        ExpiresByType image/png "access plus 6 months"
        ExpiresByType image/jpeg "access plus 6 months"
        ExpiresByType image/jpg "access plus 6 months"
        ExpiresByType image/gif "access plus 6 months"
        ExpiresByType image/svg+xml "access plus 6 months"
        ExpiresByType image/x-icon "access plus 6 months"
        ExpiresByType video/mp4 "access plus 1 month"
        ExpiresByType video/webm "access plus 1 month"
        ExpiresByType video/quicktime "access plus 1 month"
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
        ExpiresByType application/json "access plus 1 hour"
        ExpiresByType text/html "access plus 1 hour"
        ExpiresDefault "access plus 1 week"
    </IfModule>

    # Cache-Control fallbacks for environments without mod_expires
    Header always set Cache-Control "max-age=604800, public" "expr=%{CONTENT_TYPE} =~ m#^image/#"
    Header always set Cache-Control "max-age=2592000, public" "expr=%{CONTENT_TYPE} =~ m#^text/css$|application/javascript$#"
    Header always set Cache-Control "max-age=86400, public" "expr=%{CONTENT_TYPE} =~ m#^video/#"
```

- [ ] **Step 3: Validate `.htaccess` syntax**

Run:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan
apachectl configtest 2>&1 || httpd -t 2>&1 || echo "Apache test command not available"
```

Expected: syntax OK or command not available.

- [ ] **Step 4: Commit**

```bash
git add .htaccess
git commit -m "perf: add browser caching headers for static assets"
```

---

### Task 2: Move inline CSS blocks to `css/styles.css`

**Files:**
- Modify: `css/styles.css`
- Modify: `category.html`
- Modify: `go-pt-plus.html`
- Modify: `product-details.html`
- Modify: `cattle-farm-security.html`

**Interfaces:**
- Consumes: inline `<style>` blocks from the 4 HTML pages.
- Produces: page-specific CSS sections appended to `css/styles.css`, and HTML files with `<style>` blocks removed.

- [ ] **Step 1: Extract inline CSS from each page**

For each file, locate the `<style>` block in `<head>` and copy its contents.

- [ ] **Step 2: Append page-specific sections to `css/styles.css`**

Append to the end of `css/styles.css`:

```css
/* =====================================================
   Page-specific styles moved from inline <style> blocks
   ===================================================== */

/* ---------- category.html ---------- */
/* paste category.html inline CSS here */

/* ---------- go-pt-plus.html ---------- */
/* paste go-pt-plus.html inline CSS here */

/* ---------- product-details.html ---------- */
/* paste product-details.html inline CSS here */

/* ---------- cattle-farm-security.html ---------- */
/* paste cattle-farm-security.html inline CSS here */
```

- [ ] **Step 3: Remove inline `<style>` blocks from each HTML page**

Delete the entire `<style>...</style>` block (including tags) from each page's `<head>`.

- [ ] **Step 4: Bump stylesheet cache-buster version**

Update the stylesheet link in each affected page from `?v=117` to `?v=118`:

```html
<link rel="stylesheet" href="css/styles.css?v=118">
```

Also bump `index.html` if it references `?v=117`.

- [ ] **Step 5: Verify no inline `<style>` remains in affected pages**

Run:

```bash
grep -n "<style" category.html go-pt-plus.html product-details.html cattle-farm-security.html
```

Expected: no output (except for report pages not being modified).

- [ ] **Step 6: Validate CSS file is parseable**

Run:

```bash
python3 -c "
import re
with open('css/styles.css') as f:
    css = f.read()
# Basic sanity: count braces balance
open_count = css.count('{')
close_count = css.count('}')
print(f'Open braces: {open_count}, Close braces: {close_count}')
assert open_count == close_count, 'Brace mismatch'
print('CSS brace balance OK')
"
```

Expected: `CSS brace balance OK`

- [ ] **Step 7: Commit**

```bash
git add css/styles.css category.html go-pt-plus.html product-details.html cattle-farm-security.html
git commit -m "perf: move inline CSS blocks to external stylesheet and bump cache version"
```

---

### Task 3: Lazy-load below-the-fold images

**Files:**
- Modify: `index.html`
- Modify: `about.html`
- Modify: `contact.html`
- Modify: `warranty.html`
- Modify: `privacy-policy.html`
- Modify: `go-pt-plus.html`
- Modify: `cattle-farm-security.html`

**Interfaces:**
- Consumes: existing `<img>` tags without `loading="lazy"`.
- Produces: same `<img>` tags with `loading="lazy"` added where appropriate.

- [ ] **Step 1: Identify candidate images**

For each page, skip the first 1-2 hero/product images. Add `loading="lazy"` to all other `<img>` tags that do not already have it and are not the Meta Pixel noscript image.

- [ ] **Step 2: Add lazy loading to `index.html` non-hero images**

Example pattern — add `loading="lazy"` to images after the hero section, such as use-case images, feature comparison images, and customer avatars. Do not add it to the main product hero images at the top of the page.

- [ ] **Step 3: Add lazy loading to static content pages**

For `about.html`, `contact.html`, `warranty.html`, `privacy-policy.html`, `go-pt-plus.html`, `cattle-farm-security.html`: add `loading="lazy"` to all content images below the fold.

- [ ] **Step 4: Verify with grep count**

Run before/after counts:

```bash
grep -roh '<img' --include='*.html' | wc -l
grep -roh 'loading="lazy"' --include='*.html' | wc -l
```

Expected: lazy count should increase and be close to total `<img>` count minus hero/noscript images.

- [ ] **Step 5: Commit**

```bash
git add index.html about.html contact.html warranty.html privacy-policy.html go-pt-plus.html cattle-farm-security.html
git commit -m "perf: add loading=lazy to below-the-fold images"
```

---

### Task 4: Optimize large images

**Files:**
- Modify: images listed by audit (largest PNG/JPEG files)

**Interfaces:**
- Consumes: large uncompressed image files.
- Produces: smaller image files with preserved dimensions, with `.orig` backups.

- [ ] **Step 1: Audit largest images**

Run:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan
find images -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -exec ls -lh {} \; | awk '{ print $5, $9 }' | sort -hr | head -30
```

- [ ] **Step 2: Back up originals**

For each image you optimize, create a `.orig` backup:

```bash
cp "images/path/to/image.png" "images/path/to/image.png.orig"
```

- [ ] **Step 3: Optimize PNGs with `sips`**

For PNG files over 500 KB, re-encode with `sips` at reasonable quality:

```bash
sips -s format png "images/path/to/image.png" --out "images/path/to/image.png"
```

If `pngquant` or `optipng` becomes available, use those instead; otherwise `sips` is the fallback.

- [ ] **Step 4: Optimize JPEGs with `cjpeg`**

For JPEG files over 500 KB:

```bash
cjpeg -quality 80 -optimize -progressive "images/path/to/image.jpg" > "images/path/to/image.jpg.tmp" && mv "images/path/to/image.jpg.tmp" "images/path/to/image.jpg"
```

- [ ] **Step 5: Convert oversized PNG/JPEG to WebP where beneficial**

If an image is used in `<img src="...">` and browsers support WebP, create a `.webp` version alongside:

```bash
sips -s format webp "images/path/to/image.png" --out "images/path/to/image.webp"
```

Only update the HTML `src` if WebP conversion yields meaningful savings and the page already has WebP variants. Otherwise keep the original format and note the WebP option.

- [ ] **Step 6: Verify image files still open**

Run:

```bash
python3 -c "
from PIL import Image
import sys
files = sys.argv[1:]
for f in files:
    try:
        img = Image.open(f)
        img.verify()
        print(f'OK: {f}')
    except Exception as e:
        print(f'FAIL: {f} - {e}')
" images/path/to/image1.png images/path/to/image2.jpg
```

If Pillow is not installed, use `sips -g all` or `file` command as a fallback.

- [ ] **Step 7: Report savings**

Run `du -sh images` before and after, and list optimized files with sizes.

- [ ] **Step 8: Commit**

```bash
git add images/
git commit -m "perf: optimize largest images (with .orig backups)"
```

---

### Task 5: Video audit and compression recommendations

**Files:**
- Create: `docs/performance/video-optimization-notes.md`
- Modify: none (no binary changes in this phase)

**Interfaces:**
- Consumes: `videos/` directory listing and references in HTML/JS/JSON.
- Produces: documented audit report with recommendations and commands for future compression.

- [ ] **Step 1: Audit video usage**

Run:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan
find videos -type f -exec ls -lh {} \; | awk '{ print $5, $9 }' | sort -hr | head -30
grep -roh 'videos/[^\"]*\.mp4\|videos/[^\"]*\.mov\|videos/[^\"]*\.webm' --include='*.html' --include='*.js' --include='*.json' | sort | uniq -c | sort -nr
```

- [ ] **Step 2: Create audit notes file**

Create `/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/docs/performance/video-optimization-notes.md`:

```markdown
# Video Optimization Notes

## Current State

- `videos/` folder total size: ~144 MB
- Only 3 videos are referenced by the site:
  - `videos/products/keen-ranger-pt/product-keen-ranger-pt-360-pt-1.mp4`
  - `videos/products/keen-ranger-pt/keen-ranger-pt-banner-1.mp4`
  - `videos/products/keen-ranger-pt/keen-ranger-pt-animal-detection.mp4`
- Largest unused videos (examples):
  - `videos/products/rlc-823a/zoom-5x.mp4` (~37 MB)
  - `videos/products/rlc-823a/zoom-5x-mobile.mp4` (~29 MB)
  - `videos/products/rlc-823a/weatherproof.mp4` (~25 MB)

## Recommendations

1. **Install ffmpeg** and compress the 3 referenced videos to 720p max:
   ```bash
   ffmpeg -i input.mp4 -vcodec h264 -acodec aac -crf 28 -preset fast -movflags +faststart output.mp4
   ```
2. **Move unused videos** to an offline archive or delete after confirming they are not needed.
3. **Consider YouTube/Vimeo embeds** for promotional videos to avoid self-hosting large files.
4. **Add `preload="metadata"`** to `<video>` tags so browsers do not download the full video on page load.

## Next Steps

This file is a placeholder for Phase 2 video work; actual compression is deferred until ffmpeg is installed or videos are offloaded to a hosting platform.
```

- [ ] **Step 3: Commit**

```bash
git add docs/performance/video-optimization-notes.md
git commit -m "docs: add video optimization audit and recommendations"
```

---

### Task 6: Phase 2 validation

**Files:**
- Read-only: `.htaccess`, `css/styles.css`, affected HTML files, optimized images

**Interfaces:**
- Consumes: final state of all modified files.
- Produces: validation report confirming Phase 2 completion.

- [ ] **Step 1: Validate `.htaccess` caching block**

```bash
grep -A5 "Browser caching" /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/.htaccess
```

Expected output includes the `mod_expires` block.

- [ ] **Step 2: Validate inline CSS removed**

```bash
grep -n "<style" category.html go-pt-plus.html product-details.html cattle-farm-security.html
```

Expected: no output.

- [ ] **Step 3: Validate lazy loading added**

```bash
grep -roh 'loading="lazy"' --include='*.html' | wc -l
```

Expected: count is higher than before Phase 2.

- [ ] **Step 4: Validate image backups exist**

```bash
find images -name '*.orig' | wc -l
```

Expected: one `.orig` file per optimized image.

- [ ] **Step 5: Validate CSS cache version bumped**

```bash
grep -n "styles.css?v=118" index.html category.html go-pt-plus.html product-details.html cattle-farm-security.html about.html contact.html warranty.html privacy-policy.html
```

Expected: all pages show the new version.

- [ ] **Step 6: Final commit / report**

No additional commit needed unless fixes are required. Report validation results.

---

## Spec Coverage Check

| Spec Requirement | Implementing Task |
|------------------|-------------------|
| Add caching headers via `.htaccess` | Task 1 |
| Move inline CSS to external file | Task 2 |
| Lazy-load below-the-fold images and iframes | Task 3 |
| Optimize images | Task 4 |
| Audit/compress videos | Task 5 (audit + recommendations; compression deferred) |

## Placeholder Scan

No TBD/TODO/fill-in-later patterns in actionable tasks. Video compression is explicitly documented as deferred due to missing `ffmpeg`. Image optimization commands are concrete.

## Type Consistency

- Cache-buster version `v=118` used consistently across all pages.
- `.orig` backup naming convention used consistently for optimized images.
- `loading="lazy"` attribute added consistently.
