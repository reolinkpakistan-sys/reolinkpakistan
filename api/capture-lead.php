<?php
// capture-lead.php — Securely append lead to admin/leads.json
header('Content-Type: application/json');

$leadsDir = __DIR__ . '/../admin';
$leadsPath = $leadsDir . '/leads.json';

// Read input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Anti-spam Honeypot Check: if bot fills hidden field, silently exit with 200 OK
$honeypot = trim($input['website_url_check'] ?? $input['website_url'] ?? $input['honeypot'] ?? '');
if ($honeypot !== '') {
    // Silently drop bot lead
    echo json_encode(['success' => true]);
    exit;
}

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$productInterest = trim($input['product_interest'] ?? '');
$source = trim($input['source'] ?? 'lead_form');

if ($name === '' || $phone === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name and phone are required']);
    exit;
}

// Length constraints & sanitization
if (mb_strlen($name) > 100 || mb_strlen($phone) > 35 || mb_strlen($productInterest) > 250) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Input exceeds maximum allowed length']);
    exit;
}

// Ensure admin dir exists
if (!is_dir($leadsDir)) {
    mkdir($leadsDir, 0755, true);
}

// Load existing leads
$leads = [];
if (file_exists($leadsPath)) {
    $existing = json_decode(file_get_contents($leadsPath), true);
    if (is_array($existing)) {
        $leads = $existing;
    }
}

$leads[] = [
    'id' => time() . '-' . bin2hex(random_bytes(4)),
    'date' => date('c'),
    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    'phone' => htmlspecialchars($phone, ENT_QUOTES, 'UTF-8'),
    'product_interest' => htmlspecialchars($productInterest, ENT_QUOTES, 'UTF-8'),
    'source' => htmlspecialchars($source, ENT_QUOTES, 'UTF-8')
];

$written = file_put_contents($leadsPath, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
if ($written === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to write leads file']);
    exit;
}

echo json_encode(['success' => true]);

