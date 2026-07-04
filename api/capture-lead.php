<?php
// capture-lead.php — Append a lead to cms_data.json
header('Content-Type: application/json');

$dataPath = __DIR__ . '/../cms_data.json';

// Read input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
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

// Load CMS data
if (!file_exists($dataPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'cms_data.json not found']);
    exit;
}

$cmsData = json_decode(file_get_contents($dataPath), true);
if (!is_array($cmsData)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to parse cms_data.json']);
    exit;
}

if (!isset($cmsData['leads']) || !is_array($cmsData['leads'])) {
    $cmsData['leads'] = [];
}

$cmsData['leads'][] = [
    'id' => time() . '-' . bin2hex(random_bytes(4)),
    'date' => date('c'),
    'name' => $name,
    'phone' => $phone,
    'product_interest' => $productInterest,
    'source' => $source
];

$written = file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
if ($written === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to write cms_data.json']);
    exit;
}

echo json_encode(['success' => true]);
