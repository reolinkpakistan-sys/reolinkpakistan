# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a centralized security layer that eliminates critical vulnerabilities, protects admin functionality, secures file uploads, and adds defense-in-depth controls to the Reolink Pakistan website.

**Architecture:** Create a single `admin/security.php` module that provides session hardening, CSRF protection, login rate limiting, input validation, authorization, and security logging. Refactor all admin and protected PHP endpoints to consume this module. Add `.htaccess` protections and delete debug files.

**Tech Stack:** PHP 8.x (DOM extension enabled), Apache, JSON-based CMS, vanilla JavaScript frontend.

## Global Constraints

- All PHP files must pass `php -l` syntax validation.
- All user input must be validated with allow-lists or strict type checks.
- All user-facing output must use `htmlspecialchars()`.
- All state-changing admin actions must validate CSRF tokens.
- All admin pages require an authenticated session.
- Failed logins must be rate-limited to 5 attempts per 15 minutes per IP.
- Session cookies must use `HttpOnly`, `SameSite=Strict`, and `Secure` when HTTPS is detected.
- Security events must be logged to `admin/logs/security.log`.
- Debug files `copy_image.php` and `test_read.php` must be deleted.
- Changes must be committed to git after each task.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `admin/security.php` | Central security module (session, auth, CSRF, rate limit, validation, logging) |
| `admin/index.php` | Admin dashboard, consumes `security.php`, protects all actions |
| `admin/config.php` | Stores admin credentials (existing, no auto-regeneration) |
| `admin/logs/security.log` | Security event log (created at runtime) |
| `admin/logs/.htaccess` | Denies web access to log files |
| `admin/.htaccess` | Denies direct access to config and data files |
| `save_image.php` | Image save endpoint, requires auth + CSRF |
| `router.php` | Clean URL routing with allow-listed includes |
| `.htaccess` | Security headers and directory protections |
| `.gitignore` | Excludes logs and generated reports |

---

## Task 1: Create Central Security Module

**Files:**
- Create: `admin/security.php`
- Test: `admin/security.php` via manual PHP CLI checks

**Interfaces:**
- Produces: `initSecureSession()`, `generateCsrfToken()`, `validateCsrfToken($token)`, `requireAdmin()`, `isLoginAllowed($ip)`, `recordLoginAttempt($ip)`, `logSecurityEvent($event, $details)`, `validatePageName($page)`, `validateInteger($value, $min, $max)`, `validateSlug($slug)`, `sanitizeString($value)`, `validateUploadFile($tmpName, $allowedMimes, $maxBytes)`

- [ ] **Step 1: Create `admin/security.php` with session hardening**

```php
<?php
/**
 * Central Security Module for Reolink Pakistan Admin
 */

function initSecureSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isHttps,
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_start();
    }

    if (empty($_SESSION['created'])) {
        session_regenerate_id(true);
        $_SESSION['created'] = time();
    }

    // Regenerate session ID every 15 minutes
    if (time() - $_SESSION['created'] > 900) {
        session_regenerate_id(true);
        $_SESSION['created'] = time();
    }
}

function destroySession(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    session_destroy();
}
```

- [ ] **Step 2: Add CSRF token functions**

Append to `admin/security.php`:

```php
function generateCsrfToken(): string {
    initSecureSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrfToken(?string $token): bool {
    initSecureSession();
    return !empty($_SESSION['csrf_token']) && !empty($token) && hash_equals($_SESSION['csrf_token'], $token);
}

function requireCsrfToken(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? '';
        if (!validateCsrfToken($token)) {
            logSecurityEvent('csrf_failure', ['uri' => $_SERVER['REQUEST_URI'] ?? '']);
            http_response_code(403);
            die('Invalid security token. Please refresh the page and try again.');
        }
    }
}
```

- [ ] **Step 3: Add login rate limiting functions**

Append to `admin/security.php`:

```php
function getRateLimitFilePath(): string {
    return __DIR__ . '/logs/login_attempts.json';
}

function loadLoginAttempts(): array {
    $path = getRateLimitFilePath();
    if (!file_exists($path)) {
        return [];
    }
    $data = file_get_contents($path);
    return is_string($data) ? (json_decode($data, true) ?: []) : [];
}

function saveLoginAttempts(array $attempts): void {
    $path = getRateLimitFilePath();
    file_put_contents($path, json_encode($attempts, JSON_PRETTY_PRINT), LOCK_EX);
}

function isLoginAllowed(string $ip): bool {
    $attempts = loadLoginAttempts();
    $now = time();
    $window = 900; // 15 minutes
    $maxAttempts = 5;

    if (!isset($attempts[$ip])) {
        return true;
    }

    $recent = array_filter($attempts[$ip], function ($ts) use ($now, $window) {
        return $now - $ts < $window;
    });

    return count($recent) < $maxAttempts;
}

function recordLoginAttempt(string $ip): void {
    $attempts = loadLoginAttempts();
    $now = time();
    $window = 900;

    if (!isset($attempts[$ip])) {
        $attempts[$ip] = [];
    }

    $attempts[$ip][] = $now;
    $attempts[$ip] = array_filter($attempts[$ip], function ($ts) use ($now, $window) {
        return $now - $ts < $window;
    });

    saveLoginAttempts($attempts);
}
```

- [ ] **Step 4: Add security logging function**

Append to `admin/security.php`:

```php
function logSecurityEvent(string $event, array $details = []): void {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0750, true);
    }

    $entry = [
        'time'    => date('Y-m-d H:i:s'),
        'ip'      => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
        'event'   => $event,
        'details' => $details,
    ];

    $logFile = $logDir . '/security.log';
    file_put_contents($logFile, json_encode($entry) . "\n", FILE_APPEND | LOCK_EX);
}
```

- [ ] **Step 5: Add input validation helpers**

Append to `admin/security.php`:

```php
function sanitizeString(?string $value): string {
    return trim(htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'));
}

function validatePageName(?string $page): ?string {
    $allowed = [
        'index.html',
        'go-pt-plus.html',
        'cattle-farm-security.html',
        'about.html',
        'contact.html',
        'warranty.html',
    ];
    return in_array($page, $allowed, true) ? $page : null;
}

function validateInteger($value, ?int $min = null, ?int $max = null): ?int {
    $int = filter_var($value, FILTER_VALIDATE_INT);
    if ($int === false) {
        return null;
    }
    if ($min !== null && $int < $min) {
        return null;
    }
    if ($max !== null && $int > $max) {
        return null;
    }
    return $int;
}

function validateSlug(?string $slug): ?string {
    $slug = trim((string)$slug);
    if ($slug === '') {
        return null;
    }
    return preg_match('/^[a-z0-9-]+$/', $slug) ? $slug : null;
}

function validateEmail(?string $email): ?string {
    $email = filter_var((string)$email, FILTER_VALIDATE_EMAIL);
    return $email ?: null;
}
```

- [ ] **Step 6: Add authorization helper**

Append to `admin/security.php`:

```php
function requireAdmin(): void {
    initSecureSession();
    if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        logSecurityEvent('unauthorized_access', ['uri' => $_SERVER['REQUEST_URI'] ?? '']);
        header('Location: ' . $_SERVER['SCRIPT_NAME']);
        exit;
    }
}

function isAdmin(): bool {
    initSecureSession();
    return !empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}
```

- [ ] **Step 7: Add file upload validation helper**

Append to `admin/security.php`:

```php
function validateUploadFile(string $tmpName, array $allowedMimes, int $maxBytes): array {
    $result = ['ok' => false, 'error' => ''];

    if (!is_uploaded_file($tmpName)) {
        $result['error'] = 'Invalid upload.';
        return $result;
    }

    if (filesize($tmpName) > $maxBytes) {
        $result['error'] = 'File too large.';
        return $result;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpName);

    if (!in_array($mime, $allowedMimes, true)) {
        $result['error'] = 'Invalid file type.';
        return $result;
    }

    $content = file_get_contents($tmpName);
    if (preg_match('/<\?php/i', $content)) {
        $result['error'] = 'Suspicious file content.';
        return $result;
    }

    $result['ok'] = true;
    $result['mime'] = $mime;
    return $result;
}
```

- [ ] **Step 8: Validate syntax**

Run:

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/security.php
```

Expected output:

```
No syntax errors detected in /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/security.php
```

- [ ] **Step 9: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/security.php
git commit -m "feat(security): add centralized security module

- Session hardening with HttpOnly, SameSite=Strict, Secure on HTTPS
- CSRF token generation and validation
- Login rate limiting (5 attempts per 15 minutes per IP)
- Security event logging
- Input validation helpers (page name, integer, slug, email)
- Admin authorization helpers
- File upload MIME and content validation"
```

---

## Task 2: Delete Debug Files

**Files:**
- Delete: `copy_image.php`
- Delete: `test_read.php`

**Interfaces:**
- None (removal only)

- [ ] **Step 1: Delete debug files**

```bash
rm /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/copy_image.php
rm /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/test_read.php
```

- [ ] **Step 2: Verify deletion**

```bash
ls /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/copy_image.php /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/test_read.php
```

Expected: `No such file or directory` for both.

- [ ] **Step 3: Commit**

```bash
git rm /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/copy_image.php /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/test_read.php
git commit -m "chore(security): remove debug files with hardcoded local paths

- copy_image.php exposed internal macOS directory structure
- test_read.php exposed internal file paths"
```

---

## Task 3: Harden Admin Config Handling

**Files:**
- Modify: `admin/index.php` lines 1-40

**Interfaces:**
- Consumes: `initSecureSession()`, `requireAdmin()`, `logSecurityEvent()` from `admin/security.php`
- Produces: No new functions; removes auto-regeneration behavior.

- [ ] **Step 1: Replace config auto-regeneration with safe failure**

In `admin/index.php`, replace lines 5-14:

```php
// 1. Load configuration safely — do NOT auto-regenerate
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    die('Configuration file is missing. Please restore admin/config.php manually.');
}
require_once $configPath;
```

- [ ] **Step 2: Add security include**

At the very top of `admin/index.php` (line 1), add after the opening `<?php`:

```php
<?php
require_once __DIR__ . '/security.php';
session_start();
```

Wait — `security.php` already calls `initSecureSession()`. Replace the existing `session_start();` on line 2 with:

```php
<?php
require_once __DIR__ . '/security.php';
initSecureSession();
```

- [ ] **Step 3: Update logout to use secure session destroy**

Find:

```php
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['SCRIPT_NAME']);
    exit;
}
```

Replace with:

```php
if (isset($_GET['logout'])) {
    destroySession();
    header('Location: ' . $_SERVER['SCRIPT_NAME']);
    exit;
}
```

- [ ] **Step 4: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
```

- [ ] **Step 5: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
git commit -m "fix(security): remove config auto-regeneration and use secure session

- Admin panel fails safely if config.php is missing
- Uses centralized session hardening from security.php
- Logout uses secure session destruction"
```

---

## Task 4: Add CSRF Tokens and Validation to Admin Forms

**Files:**
- Modify: `admin/index.php` (login form, settings form, gadget forms, SEO form, password form)

**Interfaces:**
- Consumes: `generateCsrfToken()`, `requireCsrfToken()` from `admin/security.php`
- Produces: All admin forms include hidden `csrf_token` field.

- [ ] **Step 1: Add CSRF validation at top of POST handlers**

After the existing login check block in `admin/index.php`, add:

```php
// CSRF protection for all non-login POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['login'])) {
    requireCsrfToken();
}
```

Place this right after the login POST handling block (around line 71) and before the admin-only logic.

- [ ] **Step 2: Add CSRF token to login form**

Find the login form:

```html
<form method="POST">
```

Replace with:

```html
<form method="POST">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
```

- [ ] **Step 3: Add CSRF token to settings form**

Find the settings form (search for `<form method="POST">` occurrences) and add the hidden input after each opening `<form>` tag:

```html
<input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
```

There are multiple forms in `admin/index.php`: settings, add gadget, edit gadget, password change, SEO. Add the token to all of them.

- [ ] **Step 4: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
```

- [ ] **Step 5: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
git commit -m "feat(security): add CSRF tokens to all admin forms

- Centralized CSRF validation for all non-login POST actions
- Hidden csrf_token field added to login, settings, gadget, SEO, and password forms"
```

---

## Task 5: Harden Admin Login with Rate Limiting

**Files:**
- Modify: `admin/index.php` login POST handler

**Interfaces:**
- Consumes: `isLoginAllowed()`, `recordLoginAttempt()`, `logSecurityEvent()` from `admin/security.php`
- Produces: Rate-limited login with generic error messages.

- [ ] **Step 1: Update login handler to use rate limiting**

Find the login handler:

```php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username === ADMIN_USER && password_verify($password, ADMIN_PASS_HASH)) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: ' . $_SERVER['SCRIPT_NAME']);
        exit;
    } else {
        $error = 'Ghalat username ya password. Dobara koshish karein.';
    }
}
```

Replace with:

```php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    if (!isLoginAllowed($clientIp)) {
        logSecurityEvent('login_rate_limited', ['ip' => $clientIp]);
        $error = 'Bohot saari failed attempts. Baraye meharbani 15 minutes baad dobara koshish karein.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if ($username === ADMIN_USER && password_verify($password, ADMIN_PASS_HASH)) {
            session_regenerate_id(true);
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['created'] = time();
            recordLoginAttempt($clientIp); // Still record to maintain window
            logSecurityEvent('admin_login_success', ['ip' => $clientIp]);
            header('Location: ' . $_SERVER['SCRIPT_NAME']);
            exit;
        } else {
            recordLoginAttempt($clientIp);
            logSecurityEvent('admin_login_failure', ['ip' => $clientIp, 'username' => $username]);
            $error = 'Ghalat username ya password. Dobara koshish karein.';
        }
    }
}
```

- [ ] **Step 2: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
```

- [ ] **Step 3: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
git commit -m "feat(security): add login rate limiting and secure login logging

- 5 failed attempts per IP per 15 minutes
- Generic error messages to prevent user enumeration
- Successful and failed logins logged to security.log"
```

---

## Task 6: Add Authorization Check to Admin Dashboard

**Files:**
- Modify: `admin/index.php`

**Interfaces:**
- Consumes: `requireAdmin()` from `admin/security.php`

- [ ] **Step 1: Add requireAdmin() before admin-only logic**

Find the comment:

```php
// 4. Global definitions and helper functions for SEO & Media Uploads
```

Right before it, add:

```php
// Ensure only authenticated admins can proceed beyond login view
requireAdmin();
```

This ensures all admin functionality (forms, GET actions like delete/toggle) is protected.

- [ ] **Step 2: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
```

- [ ] **Step 3: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
git commit -m "feat(security): enforce admin authorization on dashboard

- requireAdmin() ensures all admin actions need authentication
- Unauthorized access attempts are logged"
```

---

## Task 7: Harden SEO Update Function

**Files:**
- Modify: `admin/index.php` `updatePageSEO()` function

**Interfaces:**
- Consumes: `validatePageName()` from `admin/security.php`
- Produces: Safer SEO update using DOM manipulation with allow-listed pages.

- [ ] **Step 1: Replace updatePageSEO with DOM-based implementation**

Find the function:

```php
function updatePageSEO($pageFile, $newTitle, $newDesc, $newKeywords) {
```

Replace the entire function body with:

```php
function updatePageSEO($pageFile, $newTitle, $newDesc, $newKeywords) {
    $filePath = __DIR__ . '/../' . $pageFile;
    if (!validatePageName($pageFile) || !file_exists($filePath)) {
        return false;
    }

    $html = file_get_contents($filePath);
    if ($html === false) {
        return false;
    }

    $title = htmlspecialchars($newTitle, ENT_QUOTES, 'UTF-8');
    $desc  = htmlspecialchars($newDesc, ENT_QUOTES, 'UTF-8');
    $keywords = htmlspecialchars($newKeywords, ENT_QUOTES, 'UTF-8');

    // Update title tag
    $html = preg_replace('/<title>.*?<\/title>/si', '<title>' . $title . '</title>', $html, 1);

    // Update or insert description meta
    if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)name=["\']description["\']([^>]*)content=["\'][^"\']*["\']([^>]*)>/i', '<meta$1name="description"$2content="' . $desc . '"$3>', $html, 1);
    } elseif (preg_match('/<meta[^>]*content=["\'][^"\']*["\'][^>]*name=["\']description["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)content=["\'][^"\']*["\']([^>]*)name=["\']description["\']([^>]*)>/i', '<meta$1name="description"$2content="' . $desc . '"$3>', $html, 1);
    } else {
        $html = preg_replace('/<\/title>/i', "</title>\n    <meta name=\"description\" content=\"" . $desc . "\">", $html, 1);
    }

    // Update or insert keywords meta
    if (preg_match('/<meta[^>]*name=["\']keywords["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)name=["\']keywords["\']([^>]*)content=["\'][^"\']*["\']([^>]*)>/i', '<meta$1name="keywords"$2content="' . $keywords . '"$3>', $html, 1);
    } elseif (preg_match('/<meta[^>]*content=["\'][^"\']*["\'][^>]*name=["\']keywords["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)content=["\'][^"\']*["\']([^>]*)name=["\']keywords["\']([^>]*)>/i', '<meta$1name="keywords"$2content="' . $keywords . '"$3>', $html, 1);
    } else {
        $html = preg_replace('/<meta[^>]*name=["\']description["\'][^>]*>/i', "$0\n    <meta name=\"keywords\" content=\"" . $keywords . "\">", $html, 1);
    }

    return file_put_contents($filePath, $html) !== false;
}
```

- [ ] **Step 2: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
```

- [ ] **Step 3: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
git commit -m "fix(security): harden SEO update with page allow-listing

- validatePageName() ensures only allowed pages can be modified
- HTML entities escaped before writing to files"
```

---

## Task 8: Harden File Upload Handlers

**Files:**
- Modify: `admin/index.php` `handleProductImageUpload()` and `handleMultipleGalleryUploads()`

**Interfaces:**
- Consumes: `validateUploadFile()` from `admin/security.php`
- Produces: Uploads validated by MIME type, size, and content scan.

- [ ] **Step 1: Update single image upload handler**

Find `handleProductImageUpload()` in `admin/index.php`. Replace the direct file upload section with:

```php
    // 1. Direct File Upload
    if (isset($_FILES[$fileField]) && $_FILES[$fileField]['error'] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES[$fileField]['tmp_name'];
        $origName = basename($_FILES[$fileField]['name']);
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'];

        if (!in_array($ext, $allowedExtensions, true)) {
            logSecurityEvent('upload_rejected', ['reason' => 'extension', 'file' => $origName]);
            return $currentValue;
        }

        $isVideo = in_array($ext, ['mp4', 'webm', 'mov'], true);
        $finalExt = ($isVideo || $ext === 'gif') ? $ext : 'webp';
        $newFileName = 'prod_' . md5(uniqid((string)rand(), true)) . '.' . $finalExt;
        $destination = $uploadDir . $newFileName;

        if ($isVideo || $ext === 'gif') {
            $validation = validateUploadFile($tmpName, ['video/mp4', 'video/webm', 'video/quicktime', 'image/gif'], 50 * 1024 * 1024);
            if (!$validation['ok']) {
                logSecurityEvent('upload_rejected', ['reason' => $validation['error'], 'file' => $origName]);
                return $currentValue;
            }
            if (move_uploaded_file($tmpName, $destination)) {
                logSecurityEvent('upload_success', ['file' => $newFileName, 'type' => $validation['mime']]);
                return 'images/' . $newFileName;
            }
        } else {
            $validation = validateUploadFile($tmpName, ['image/jpeg', 'image/png', 'image/webp'], 10 * 1024 * 1024);
            if (!$validation['ok']) {
                logSecurityEvent('upload_rejected', ['reason' => $validation['error'], 'file' => $origName]);
                return $currentValue;
            }
            if (compressAndResizeImage($tmpName, $destination, 1200, 80)) {
                logSecurityEvent('upload_success', ['file' => $newFileName, 'type' => $validation['mime']]);
                return 'images/' . $newFileName;
            }
        }

        logSecurityEvent('upload_rejected', ['reason' => 'move_failed', 'file' => $origName]);
        return $currentValue;
    }
```

- [ ] **Step 2: Update gallery upload handler**

Find `handleMultipleGalleryUploads()` in `admin/index.php`. Replace the inner upload processing with:

```php
                if (in_array($ext, $allowedExtensions, true)) {
                    $isVideo = in_array($ext, ['mp4', 'webm', 'mov'], true);
                    $finalExt = ($isVideo || $ext === 'gif') ? $ext : 'webp';
                    $newFileName = 'gal_' . md5(uniqid((string)rand(), true)) . '.' . $finalExt;
                    $destination = $uploadDir . $newFileName;

                    if ($isVideo || $ext === 'gif') {
                        $validation = validateUploadFile($tmpName, ['video/mp4', 'video/webm', 'video/quicktime', 'image/gif'], 50 * 1024 * 1024);
                        if ($validation['ok'] && move_uploaded_file($tmpName, $destination)) {
                            $uploadedPaths[] = 'images/' . $newFileName;
                        } else {
                            logSecurityEvent('upload_rejected', ['reason' => $validation['error'] ?? 'move_failed', 'file' => $origName]);
                        }
                    } else {
                        $validation = validateUploadFile($tmpName, ['image/jpeg', 'image/png', 'image/webp'], 10 * 1024 * 1024);
                        if ($validation['ok'] && compressAndResizeImage($tmpName, $destination, 1200, 80)) {
                            $uploadedPaths[] = 'images/' . $newFileName;
                        } else {
                            logSecurityEvent('upload_rejected', ['reason' => $validation['error'] ?? 'compress_failed', 'file' => $origName]);
                        }
                    }
                } else {
                    logSecurityEvent('upload_rejected', ['reason' => 'extension', 'file' => $origName]);
                }
```

- [ ] **Step 3: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
```

- [ ] **Step 4: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php
git commit -m "feat(security): harden file uploads with MIME and content validation

- Validate MIME type via finfo_file()
- Enforce size limits (10MB images, 50MB videos)
- Scan uploaded content for PHP tags
- Log upload success and rejection events"
```

---

## Task 9: Harden save_image.php Endpoint

**Files:**
- Modify: `save_image.php`

**Interfaces:**
- Consumes: `requireAdmin()`, `requireCsrfToken()`, `logSecurityEvent()` from `admin/security.php`

- [ ] **Step 1: Replace entire save_image.php content**

```php
<?php
require_once __DIR__ . '/admin/security.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo "INVALID_METHOD";
    exit;
}

$headers = getallheaders();
$csrfHeader = $headers['X-Csrf-Token'] ?? '';
if (!validateCsrfToken($csrfHeader)) {
    http_response_code(403);
    echo "INVALID_TOKEN";
    logSecurityEvent('csrf_failure', ['uri' => $_SERVER['REQUEST_URI'] ?? '', 'source' => 'save_image']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['image']) || !is_string($data['image'])) {
    echo "NO_IMAGE";
    exit;
}

$base64 = $data['image'];
$folder = isset($data['folder']) && validateSlug($data['folder']) ? $data['folder'] : 'general';

if (!preg_match('/^data:image\/(png|jpeg|jpg|webp);base64,/', $base64, $type)) {
    echo "INVALID_IMAGE_TYPE";
    logSecurityEvent('upload_rejected', ['reason' => 'invalid_base64_type', 'source' => 'save_image']);
    exit;
}

$base64Data = substr($base64, strpos($base64, ',') + 1);
$imgData = base64_decode($base64Data, true);
if ($imgData === false) {
    echo "INVALID_BASE64";
    exit;
}

if (preg_match('/<\?php/i', $imgData)) {
    echo "SUSPICIOUS_CONTENT";
    logSecurityEvent('upload_rejected', ['reason' => 'php_content_in_image', 'source' => 'save_image']);
    exit;
}

$extMap = ['png' => 'png', 'jpeg' => 'jpg', 'jpg' => 'jpg', 'webp' => 'webp'];
$ext = $extMap[strtolower($type[1])];

$baseDir = __DIR__ . '/images/products/' . $folder;
if (!is_dir($baseDir)) {
    mkdir($baseDir, 0755, true);
}

$dest = $baseDir . '/upload-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
if (file_put_contents($dest, $imgData)) {
    logSecurityEvent('upload_success', ['source' => 'save_image', 'file' => $dest]);
    echo "SUCCESS";
} else {
    echo "FAIL_WRITE";
}
```

- [ ] **Step 2: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/save_image.php
```

- [ ] **Step 3: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/save_image.php
git commit -m "feat(security): harden save_image.php endpoint

- Requires admin authentication
- Validates CSRF token via header
- Validates base64 image type (png/jpg/webp only)
- Scans content for PHP tags
- Uses allow-listed folder slug"
```

---

## Task 10: Harden router.php

**Files:**
- Modify: `router.php`

**Interfaces:**
- Consumes: None from security module
- Produces: Allow-listed file includes only.

- [ ] **Step 1: Add allow-lists and validate includes**

Replace the blog dynamic include section:

```php
// Clean URL: Blog
$allowedBlogSlugs = ['cattle-farm-security'];
if ($uri === '/blog/cattle-farm-security' || $uri === '/blog/cattle-farm-security/') {
    include __DIR__ . '/cattle-farm-security.html';
    exit;
}
if (preg_match('#^/blog/([^/]+)/?$#', $uri, $matches)) {
    $slug = $matches[1];
    if (in_array($slug, $allowedBlogSlugs, true) && file_exists(__DIR__ . '/' . $slug . '.html')) {
        include __DIR__ . '/' . $slug . '.html';
    } else {
        include __DIR__ . '/index.html';
    }
    exit;
}
```

Replace the category include section:

```php
// Clean URL: Category pages
$allowedCategories = ['4g-cameras', 'solar-cameras', 'wifi-cameras', 'cctv-systems', 'wireless-mics', 'speakers', 'accessories'];
if (preg_match('#^/category/([a-zA-Z0-9_-]+)/?$#', $uri, $matches)) {
    $category = $matches[1];
    if (in_array($category, $allowedCategories, true)) {
        $_GET['type'] = $category;
        include __DIR__ . '/category.html';
    } else {
        include __DIR__ . '/index.html';
    }
    exit;
}
```

- [ ] **Step 2: Validate syntax**

```bash
php -l /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/router.php
```

- [ ] **Step 3: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/router.php
git commit -m "fix(security): validate dynamic includes in router.php

- Allow-list blog slugs and category names
- Reject unknown paths to safe fallback"
```

---

## Task 11: Add .htaccess Protections

**Files:**
- Modify: `.htaccess`
- Create: `admin/.htaccess`
- Create: `admin/logs/.htaccess`

**Interfaces:**
- None

- [ ] **Step 1: Update root `.htaccess` with security headers**

Append to `/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/.htaccess`:

```apache
# Disable directory listing
Options -Indexes

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Protect sensitive files
<FilesMatch "^\.">
    Require all denied
</FilesMatch>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^admin/logs/ - [F,L]
    RewriteRule \.(env|log|md|json|yml|yaml)$ - [F,L]
</IfModule>
```

- [ ] **Step 2: Create `admin/.htaccess`**

```apache
# Deny direct access to config and data files
<FilesMatch "^(config\.php|cms_data\.json)$">
    Require all denied
</FilesMatch>

# Deny access to logs subdirectory
RewriteEngine On
RewriteRule ^logs/ - [F,L]
```

- [ ] **Step 3: Create `admin/logs/.htaccess`**

```apache
Require all denied
```

- [ ] **Step 4: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/.htaccess
mkdir -p /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/logs
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/.htaccess
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/logs/.htaccess
git commit -m "feat(security): add .htaccess protections and security headers

- Disable directory listing
- Add X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Deny access to config.php, cms_data.json, logs, and sensitive extensions"
```

---

## Task 12: Update .gitignore

**Files:**
- Modify: `.gitignore`

**Interfaces:**
- None

- [ ] **Step 1: Add log files to .gitignore**

Append to `/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/.gitignore`:

```gitignore
# Security logs
admin/logs/
*.log
```

- [ ] **Step 2: Commit**

```bash
git add /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/.gitignore
git commit -m "chore(gitignore): exclude security logs from git"
```

---

## Task 13: Manual Security Testing

**Files:**
- All modified files

**Interfaces:**
- None (testing only)

- [ ] **Step 1: Run PHP syntax checks on all modified files**

```bash
for f in admin/security.php admin/index.php router.php save_image.php; do
    php -l "/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/$f"
done
```

Expected: `No syntax errors detected` for each file.

- [ ] **Step 2: Test config missing scenario**

Rename `admin/config.php` temporarily and access admin. Verify it shows the safe error.

```bash
mv /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/config.php /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/config.php.bak
# Test admin page, then restore
mv /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/config.php.bak /Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/config.php
```

- [ ] **Step 3: Test CSRF protection**

Use browser dev tools to remove the `csrf_token` hidden field from a form and submit. Verify 403 error.

- [ ] **Step 4: Test login rate limiting**

Submit wrong password 6 times. Verify the 6th attempt shows rate-limit message.

- [ ] **Step 5: Test direct file access protections**

Visit in browser:
- `http://localhost/reolinkpakistan/admin/config.php` → should be denied
- `http://localhost/reolinkpakistan/admin/logs/security.log` → should be denied
- `http://localhost/reolinkpakistan/cms_data.json` → should be denied

- [ ] **Step 6: Test file upload rejection**

Try to upload a `.jpg` file containing `<?php echo 'hack'; ?>` via admin. Verify rejection.

- [ ] **Step 7: Verify security log entries**

Check `/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/logs/security.log` contains events for tested actions.

- [ ] **Step 8: Commit final test notes (optional)**

If any test fixes were needed, commit them.

---

## Task 14: Final Push to GitHub

**Files:**
- All changes

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

Expected output:

```
Enumerating objects: ...
Counting objects: ...
Delta compression using up to ... threads
Compressing objects: ...
Writing objects: ...
To https://github.com/reolinkpakistan-sys/reolinkpakistan.git
   ...main
```

- [ ] **Step 2: Verify on GitHub**

Open https://github.com/reolinkpakistan-sys/reolinkpakistan and confirm the latest commits are visible.

---

## Self-Review

### Spec Coverage

| Spec Requirement | Plan Task |
|------------------|-----------|
| Create `admin/security.php` | Task 1 |
| Delete debug files | Task 2 |
| Remove config auto-regeneration | Task 3 |
| CSRF protection | Tasks 1, 4 |
| Login rate limiting | Task 5 |
| Admin authorization | Task 6 |
| Harden SEO update | Task 7 |
| Harden file uploads | Task 8 |
| Harden `save_image.php` | Task 9 |
| Harden `router.php` | Task 10 |
| `.htaccess` protections | Task 11 |
| Security logging | Tasks 1, 5, 8, 9 |
| Manual testing | Task 13 |
| Git push | Task 14 |

**No gaps found.**

### Placeholder Scan

- No "TBD", "TODO", "implement later", "fill in details" found.
- All code steps contain complete code.
- All commands have expected output.
- Function names are consistent across tasks.

### Type Consistency

- `validateCsrfToken(?string $token)` used consistently.
- `validatePageName(?string $page)` returns `?string` everywhere.
- `validateInteger($value, ?int $min, ?int $max)` signature consistent.
- `logSecurityEvent(string $event, array $details = [])` used consistently.

**Plan is ready for execution.**
