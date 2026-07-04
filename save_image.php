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
$csrfHeader = '';
if (is_array($headers)) {
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'x-csrf-token') {
            $csrfHeader = $value;
            break;
        }
    }
}

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

if (preg_match('/<\?(?:php|[=\s])|<script\s+language\s*=\s*["\']?php["\']?\s*>/i', $imgData)) {
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
