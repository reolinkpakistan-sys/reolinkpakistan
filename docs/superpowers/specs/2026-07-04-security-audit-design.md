# Security Audit & Hardening Design

**Project:** Reolink Pakistan — S M Enterprises Security Camera E-Commerce Platform  
**Date:** 2026-07-04  
**Author:** Kimi Code CLI  
**Status:** Pending Implementation Review  

---

## 1. Objective

Implement a comprehensive security hardening layer for the Reolink Pakistan website to eliminate critical vulnerabilities, protect admin functionality, secure file uploads, and establish defense-in-depth controls suitable for production deployment.

---

## 2. Current Security Findings

### 2.1 Critical Issues

| # | Issue | File | Risk |
|---|-------|------|------|
| 1 | Debug files expose internal macOS paths and file structure | `copy_image.php`, `test_read.php` | Information disclosure |
| 2 | `config.php` auto-regenerates with a hardcoded default password | `admin/index.php` lines 7-13 | Account takeover if config file is deleted |
| 3 | Admin actions lack CSRF protection | `admin/index.php` POST handlers | Unauthorized state-changing actions |
| 4 | SEO update uses regex on user input without strict allow-listing | `admin/index.php` `updatePageSEO()` | Potential HTML/regex injection |

### 2.2 High-Priority Issues

| # | Issue | File | Risk |
|---|-------|------|------|
| 5 | No rate limiting on admin login | `admin/index.php` | Brute-force password attacks |
| 6 | Session cookies use default PHP settings | `admin/index.php` | Session hijacking / fixation |
| 7 | File upload extension check only, no MIME validation on video/GIF | `admin/index.php` | Malicious file upload |
| 8 | No security headers | `.htaccess` | XSS, clickjacking, MIME sniffing |
| 9 | Direct access to `admin/config.php` and data files possible | `admin/` directory | Credential / data exposure |

### 2.3 Medium-Priority Issues

| # | Issue | File | Risk |
|---|-------|------|------|
| 10 | No security event logging | — | No audit trail for incidents |
| 11 | Error messages reveal paths and internal details | Multiple | Information disclosure |
| 12 | `router.php` includes arbitrary files based on URL | `router.php` | LFI if regex is bypassed |
| 13 | `save_image.php` accepts any base64 image without auth | `save_image.php` | Unauthorized file writes |

---

## 3. Design Approach

**Approach:** Centralized Security Layer (Approach 1)  
**Rationale:** A single, well-tested security module keeps all protections in one place, makes future features secure by default, and simplifies audits.

### 3.1 Core Principle: Defense in Depth

No single control is relied upon. Each sensitive operation is protected by multiple layers:

1. **Network/Transport:** HTTPS-only cookies, security headers
2. **Authentication:** Strong password hashing, session hardening, brute-force protection
3. **Authorization:** Admin-only access controls
4. **Integrity:** CSRF tokens for state-changing actions
5. **Input Validation:** Strict allow-listing for filenames, IDs, page names, prices
6. **Output Encoding:** `htmlspecialchars()` for all user-facing output
7. **Audit:** Security event logging

---

## 4. Architecture

### 4.1 New Files

| File | Purpose |
|------|---------|
| `admin/security.php` | Central security module: sessions, auth, CSRF, rate limiting, logging, validation |
| `admin/logs/.htaccess` | Deny web access to log files |
| `admin/.htaccess` | Deny direct access to `config.php` and data files |
| `docs/superpowers/specs/2026-07-04-security-audit-design.md` | This design document |

### 4.2 Modified Files

| File | Changes |
|------|---------|
| `admin/index.php` | Include `security.php`, add CSRF tokens to all forms, use validation helpers, remove auto-regeneration of config |
| `admin/config.php` | Keep minimal; add comment warning not to expose |
| `router.php` | Add security headers, validate included file paths strictly |
| `save_image.php` | Require auth, validate CSRF, validate image data strictly |
| `.htaccess` | Add security headers, disable directory listing, protect sensitive files |
| `.gitignore` | Already excludes debug files; ensure `admin/logs/` is ignored |

### 4.3 Deleted Files

| File | Reason |
|------|--------|
| `copy_image.php` | Debug file with hardcoded local path |
| `test_read.php` | Debug file with hardcoded local path |

---

## 5. Components

### 5.1 `admin/security.php`

#### 5.1.1 Session Hardening

```php
function initSecureSession() {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 1);     // requires HTTPS
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.use_strict_mode', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
    if (empty($_SESSION['created'])) {
        session_regenerate_id(true);
        $_SESSION['created'] = time();
    }
    // Regenerate every 15 minutes
    if (time() - $_SESSION['created'] > 900) {
        session_regenerate_id(true);
        $_SESSION['created'] = time();
    }
}
```

**Notes:**
- `session.cookie_secure` will be set conditionally if HTTPS is detected to allow local HTTP development.
- Session lifetime is 15 minutes of inactivity by default.

#### 5.1.2 CSRF Protection

```php
function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
```

All POST forms include `<input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">`.  
All POST handlers call `requireCsrfToken()` before processing.

#### 5.1.3 Login Rate Limiting

```php
function isLoginAllowed($ip) {
    $attempts = getLoginAttempts($ip); // from transient file or session
    return $attempts < 5;
}

function recordLoginAttempt($ip) {
    // Increment counter, reset after 15 minutes
}
```

- Max 5 failed attempts per IP per 15-minute window.
- Display generic error: "Invalid credentials." — never reveal if username exists.

#### 5.1.4 Security Logging

```php
function logSecurityEvent($event, $details = []) {
    $entry = [
        'time' => date('Y-m-d H:i:s'),
        'ip'   => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
        'event'=> $event,
        'details' => $details
    ];
    file_put_contents(
        __DIR__ . '/logs/security.log',
        json_encode($entry) . "\n",
        FILE_APPEND | LOCK_EX
    );
}
```

Logged events:
- Successful admin login
- Failed admin login
- Password change
- CSRF validation failure
- Unauthorized access attempt
- File upload (filename, size, result)
- Product add/edit/delete

#### 5.1.5 Input Validation Helpers

```php
function validatePageName($page) {
    $allowed = ['index.html', 'go-pt-plus.html', 'category.html', ...];
    return in_array($page, $allowed, true) ? $page : false;
}

function validateInteger($value, $min = null, $max = null) {
    $int = filter_var($value, FILTER_VALIDATE_INT);
    if ($int === false) return false;
    if ($min !== null && $int < $min) return false;
    if ($max !== null && $int > $max) return false;
    return $int;
}

function validateSlug($slug) {
    return preg_match('/^[a-z0-9-]+$/', $slug) ? $slug : false;
}
```

#### 5.1.6 Authorization

```php
function requireAdmin() {
    initSecureSession();
    if (empty($_SESSION['admin_logged_in'])) {
        logSecurityEvent('unauthorized_access', ['uri' => $_SERVER['REQUEST_URI']]);
        header('Location: ' . $_SERVER['SCRIPT_NAME']);
        exit;
    }
}
```

### 5.2 Admin Panel Updates

#### 5.2.1 Config File Handling

Remove auto-regeneration. If `config.php` is missing, show a setup error and do not create a default:

```php
if (!file_exists($configPath)) {
    die('Configuration file is missing. Please restore admin/config.php.');
}
```

#### 5.2.2 Form Changes

Every POST form gets a CSRF token:

```html
<input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
```

Every POST handler validates it:

```php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        logSecurityEvent('csrf_failure', ['uri' => $_SERVER['REQUEST_URI']]);
        die('Invalid security token. Please refresh the page and try again.');
    }
}
```

#### 5.2.3 SEO Update Refactor

Replace regex-based HTML editing with a safer DOM-based approach or strict allow-list:

```php
function updatePageSEO($pageFile, $newTitle, $newDesc, $newKeywords) {
    $filePath = __DIR__ . '/../' . $pageFile;
    if (!validatePageName($pageFile) || !file_exists($filePath)) {
        return false;
    }
    $html = file_get_contents($filePath);
    $dom = new DOMDocument();
    @$dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    // Update title and meta tags safely
    // ...
    return file_put_contents($filePath, $dom->saveHTML()) !== false;
}
```

If DOM extension is unreliable, use strict regex with escaped input and verify the result by parsing.

### 5.3 File Upload Security

Current `compressAndResizeImage()` and upload handlers already check extension. Enhance with:

1. MIME type validation via `finfo_file()`.
2. File size limit (e.g., 10 MB images, 50 MB videos).
3. Re-compute extension from MIME type, do not trust client-provided extension.
4. Store uploaded files outside web root or with `.htaccess` deny rules (currently in `images/` is acceptable with proper validation).
5. Scan for embedded PHP in uploaded files by checking content for `<?php` tags.
6. Log all uploads.

### 5.4 Router Hardening

In `router.php`:

```php
$allowedBlogSlugs = ['cattle-farm-security', ...];
$allowedProductFiles = ['go-pt-plus.html', 'product-details.html'];
```

Validate every dynamic include against an allow-list. Never include a file constructed directly from user input.

### 5.5 `save_image.php` Hardening

- Require admin session.
- Require CSRF token in header or POST body.
- Validate base64 is a valid image (PNG/JPG/WEBP).
- Validate destination path is inside `images/products/`.
- Remove hardcoded path; accept target folder as allow-listed parameter.

### 5.6 `.htaccess` Security Headers

```apache
# Disable directory listing
Options -Indexes

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.youtube.com; connect-src 'self';"

# Protect sensitive files
<FilesMatch "^\.">
    Require all denied
</FilesMatch>

<FilesMatch "\.(env|json|log|md)$">
    Require all denied
</FilesMatch>
```

CSP must be tested carefully because inline scripts and styles are heavily used.

---

## 6. Data Flow

### 6.1 Admin Login Flow

1. User submits login form → `admin/index.php`
2. `security.php` initializes hardened session
3. Rate limiter checks IP attempts
4. CSRF token validated
5. Credentials verified with `password_verify()`
6. On success: regenerate session ID, set `admin_logged_in = true`, log success
7. On failure: increment attempt counter, log failure, show generic error

### 6.2 State-Changing Action Flow (e.g., Add Gadget)

1. `requireAdmin()` checks session
2. CSRF token validated
3. Input sanitized and validated (price as int, name length limits, slug format)
4. File upload processed with MIME + size checks
5. `cms_data.json` updated
6. Sitemap regenerated
7. Security event logged
8. Redirect with success status

### 6.3 Public Page Request Flow

1. Request hits `router.php`
2. Static files served with correct MIME types
3. Clean URLs matched against allow-lists
4. Included files validated before `include`
5. Security headers added by `.htaccess`

---

## 7. Error Handling

### 7.1 Production Error Handling

```php
if (!defined('DEBUG_MODE') || !DEBUG_MODE) {
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/logs/php_errors.log');
}
```

- Users see generic error messages.
- Detailed errors go to log files only.
- Debug mode can be enabled in a separate config for development.

### 7.2 Security Event Responses

| Event | Response | Log |
|-------|----------|-----|
| Failed login | Generic error, rate limit | Yes |
| CSRF failure | 403 error page | Yes |
| Unauthorized admin access | Redirect to login | Yes |
| Invalid file upload | Reject upload, alert admin | Yes |
| Brute-force threshold | Block IP for 15 min | Yes |

---

## 8. Testing Plan

### 8.1 Manual Tests

1. Delete `admin/config.php` and verify setup error appears (no auto-regeneration).
2. Submit admin form without CSRF token → should fail.
3. Try 6 wrong passwords → 7th attempt should be blocked.
4. Upload a PHP file disguised as `.jpg` → should be rejected.
5. Access `admin/config.php` directly via browser → should be denied.
6. Access `admin/logs/security.log` via browser → should be denied.
7. Submit invalid page name to SEO update → should be rejected.
8. Verify all admin actions still work with valid CSRF token.

### 8.2 Automated Tests (Optional)

- PHP syntax check on all modified files.
- CSP header validation via curl.
- Login brute-force simulation.

---

## 9. Rollback Plan

1. Create a backup branch before changes:
   ```bash
   git checkout -b security-hardening-backup
   git checkout main
   ```
2. Make changes in small, focused commits.
3. If anything breaks, revert the specific commit or checkout the backup branch.

---

## 10. Success Criteria

- [ ] `copy_image.php` and `test_read.php` deleted
- [ ] `admin/security.php` created and included by all admin/protected PHP files
- [ ] All admin POST forms include and validate CSRF tokens
- [ ] Config auto-regeneration removed
- [ ] Login rate limiting active
- [ ] Security logging active
- [ ] `.htaccess` denies access to logs/config and sets security headers
- [ ] File uploads validated by MIME type and size
- [ ] `router.php` includes only allow-listed files
- [ ] `save_image.php` requires admin + CSRF
- [ ] All manual security tests pass

---

## 11. Out of Scope

- SSL certificate installation (assumes HTTPS already enabled on production)
- Database migration (JSON-based CMS remains)
- Two-factor authentication
- Web application firewall (WAF) configuration
- Automated penetration testing tools

---

## 12. Notes

- This design follows the existing codebase patterns while adding a centralized security layer.
- Changes are intentionally minimal to reduce regression risk.
- All changes will be committed to git and pushed to the private GitHub repository.
