<?php
/**
 * Central Security Module for Reolink Pakistan Admin
 */

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 900;
const SESSION_REGENERATION_SECONDS = 900;

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
        $_SESSION['created'] = time();
    } elseif (time() - $_SESSION['created'] > SESSION_REGENERATION_SECONDS) {
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
    $dir = dirname($path);

    if (!is_dir($dir)) {
        if (!mkdir($dir, 0750, true) && !is_dir($dir)) {
            error_log('Failed to create login attempts directory: ' . $dir);
            return;
        }
    }

    if (file_put_contents($path, json_encode($attempts, JSON_PRETTY_PRINT), LOCK_EX) === false) {
        error_log('Failed to write login attempts file: ' . $path);
    }
}

function isLoginAllowed(string $ip): bool {
    $attempts = loadLoginAttempts();
    $now = time();

    if (!isset($attempts[$ip])) {
        return true;
    }

    $recent = array_filter($attempts[$ip], function ($ts) use ($now) {
        return $now - $ts < RATE_LIMIT_WINDOW_SECONDS;
    });

    return count($recent) < RATE_LIMIT_MAX_ATTEMPTS;
}

function recordLoginAttempt(string $ip): void {
    $attempts = loadLoginAttempts();
    $now = time();

    if (!isset($attempts[$ip])) {
        $attempts[$ip] = [];
    }

    $attempts[$ip][] = $now;
    $attempts[$ip] = array_filter($attempts[$ip], function ($ts) use ($now) {
        return $now - $ts < RATE_LIMIT_WINDOW_SECONDS;
    });

    saveLoginAttempts($attempts);
}

function logSecurityEvent(string $event, array $details = []): void {
    $logDir = __DIR__ . '/logs';

    if (!is_dir($logDir)) {
        if (!mkdir($logDir, 0750, true) && !is_dir($logDir)) {
            error_log('Failed to create security log directory: ' . $logDir);
            return;
        }
    }

    $entry = [
        'time'    => date('Y-m-d H:i:s'),
        'ip'      => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
        'event'   => $event,
        'details' => $details,
    ];

    $logFile = $logDir . '/security.log';
    if (file_put_contents($logFile, json_encode($entry) . "\n", FILE_APPEND | LOCK_EX) === false) {
        error_log('Failed to write security log file: ' . $logFile);
    }
}

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

function requireAdmin(): void {
    initSecureSession();
    if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        logSecurityEvent('unauthorized_access', ['uri' => $_SERVER['REQUEST_URI'] ?? '']);
        header('Location: /admin/index.php');
        exit;
    }
}

function isAdmin(): bool {
    initSecureSession();
    return !empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

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
    $phpPattern = '/<\?(?:php|[=\s])|<script\s+language\s*=\s*["\']?php["\']?\s*>/i';
    if (preg_match($phpPattern, $content)) {
        $result['error'] = 'Suspicious file content.';
        return $result;
    }

    $result['ok'] = true;
    $result['mime'] = $mime;
    return $result;
}
