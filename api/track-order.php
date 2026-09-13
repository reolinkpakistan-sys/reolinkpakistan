<?php
// api/track-order.php — In-page live order tracking API
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Only allow GET / POST
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$courier = strtolower(trim($_REQUEST['courier'] ?? 'mnp'));
$cn = trim($_REQUEST['cn'] ?? $_REQUEST['consignment'] ?? $_REQUEST['tracking'] ?? '');

// Strip leading '#' or extra spaces
$cn = preg_replace('/^[#\s]+/', '', $cn);
$cn = trim($cn);

if ($cn === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tracking number is required.']);
    exit;
}

// Basic format validation: only alphanumeric, dashes, underscores, length 4 to 35
if (!preg_match('/^[a-zA-Z0-9\-_]{4,35}$/', $cn)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid tracking number format.']);
    exit;
}

// 1. M&P Express Logistics (Muller & Phipps Pakistan)
if ($courier === 'mnp') {
    $targetUrl = 'https://www.mulphilog.com/tracking/' . urlencode($cn);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $targetUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 18,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9',
            'Cache-Control: no-cache'
        ],
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $html = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($html === false || $httpCode < 200 || $httpCode >= 400) {
        echo json_encode([
            'success' => false,
            'courier' => 'M&P Express',
            'consignment' => $cn,
            'error' => 'Unable to connect to M&P tracking server.',
            'official_url' => $targetUrl
        ]);
        exit;
    }

    // Check if record is not found
    if (stripos($html, 'No tracking record found') !== false || stripos($html, 'record not found') !== false) {
        echo json_encode([
            'success' => true,
            'found' => false,
            'courier' => 'M&P Express',
            'consignment' => $cn,
            'message' => 'Is consignment number ka koi record nahi mila. Agar parcel aaj dispatch hua hai to 2 se 4 ghantay ke andar courier system mein status active ho jata hai.',
            'official_url' => $targetUrl
        ]);
        exit;
    }

    // Parse HTML with DOMDocument
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    @$dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);

    // Helper to extract values next to/under specific labels
    $getValueByLabel = function($labelText) use ($xpath) {
        $nodes = $xpath->query("//label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '" . strtolower($labelText) . "')]");
        if ($nodes->length > 0) {
            $parent = $nodes->item(0)->parentNode;
            $inputs = $xpath->query(".//input", $parent);
            $vals = [];
            foreach ($inputs as $inp) {
                $v = trim($inp->getAttribute('value'));
                if ($v !== '') $vals[] = $v;
            }
            return implode(" - ", $vals);
        }
        return '';
    };

    $orderId = $getValueByLabel('Order ID');
    $bookingDate = $getValueByLabel('Booking Date');
    $origin = $getValueByLabel('From');
    $destination = $getValueByLabel('To');

    // Parse timeline steps from .order-track .order-track-step
    $timeline = [];
    $stepNodes = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' order-track-step ')]");
    
    if ($stepNodes->length > 0) {
        foreach ($stepNodes as $step) {
            $leftNodes = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' order-track-text-left ')]", $step);
            $rightNodes = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' order-track-text-right ')]", $step);

            $dateText = $leftNodes->length > 0 ? trim($leftNodes->item(0)->textContent) : '';
            $statusText = $rightNodes->length > 0 ? trim($rightNodes->item(0)->textContent) : '';

            // Clean multiple whitespaces / newlines
            $dateText = preg_replace('/\s+/', ' ', $dateText);
            $statusText = preg_replace('/\s+/', ' ', $statusText);

            if ($dateText !== '' || $statusText !== '') {
                $timeline[] = [
                    'datetime' => $dateText,
                    'status' => $statusText
                ];
            }
        }
    }

    // Determine latest status
    $currentStatus = 'In Transit';
    $statusType = 'transit'; // 'delivered', 'out_for_delivery', 'transit', 'booked'

    if (!empty($timeline)) {
        $allStatuses = array_map(function($t) { return strtolower($t['status']); }, $timeline);
        $fullText = implode(' ', $allStatuses);

        if (strpos($fullText, 'delivered') !== false) {
            $currentStatus = 'Delivered';
            $statusType = 'delivered';
        } elseif (strpos($fullText, 'out for delivery') !== false || strpos($fullText, 'runsheet') !== false) {
            $currentStatus = 'Out for Delivery';
            $statusType = 'out_for_delivery';
        } elseif (strpos($fullText, 'arrived') !== false || strpos($fullText, 'in transit') !== false || strpos($fullText, 'dispatched') !== false) {
            $currentStatus = 'In Transit';
            $statusType = 'transit';
        } elseif (strpos($fullText, 'booked') !== false) {
            $currentStatus = 'Booked';
            $statusType = 'booked';
        } else {
            $currentStatus = $timeline[0]['status'] ?? 'In Transit';
        }
    } elseif ($bookingDate !== '' || $origin !== '' || $destination !== '') {
        $currentStatus = 'In Transit';
    } else {
        // Fallback: Check if there is any general table or text
        $tables = $xpath->query("//table");
        if ($tables->length > 0) {
            $tableRows = $xpath->query(".//tr", $tables->item(0));
            foreach ($tableRows as $tr) {
                $tds = $xpath->query(".//td", $tr);
                if ($tds->length >= 2) {
                    $timeline[] = [
                        'datetime' => trim($tds->item(0)->textContent),
                        'status' => trim($tds->item(1)->textContent)
                    ];
                }
            }
        }
    }

    $hasData = ($orderId !== '' || $bookingDate !== '' || $origin !== '' || $destination !== '' || !empty($timeline));

    echo json_encode([
        'success' => true,
        'found' => $hasData,
        'courier' => 'M&P Express',
        'consignment' => $cn,
        'data' => [
            'order_id' => $orderId ?: 'N/A',
            'booking_date' => $bookingDate ?: 'Recent Dispatch',
            'origin' => $origin ?: 'Dispatch Warehouse',
            'destination' => $destination ?: 'Customer Address',
            'current_status' => $currentStatus,
            'status_type' => $statusType,
            'timeline' => $timeline
        ],
        'official_url' => $targetUrl
    ]);
    exit;
}

// 2. TCS Express
if ($courier === 'tcs') {
    echo json_encode([
        'success' => true,
        'external' => true,
        'courier' => 'TCS Express',
        'consignment' => $cn,
        'official_url' => 'https://www.tcsexpress.com/track/' . urlencode($cn)
    ]);
    exit;
}

// 3. Trax Logistics
if ($courier === 'trax') {
    echo json_encode([
        'success' => true,
        'external' => true,
        'courier' => 'Trax Logistics',
        'consignment' => $cn,
        'official_url' => 'https://sonic.trax.pk/tracking?tracking_number=' . urlencode($cn)
    ]);
    exit;
}

// 4. Leopards Courier
if ($courier === 'leopards') {
    echo json_encode([
        'success' => true,
        'external' => true,
        'courier' => 'Leopards Courier',
        'consignment' => $cn,
        'official_url' => 'https://leopardscourier.com/tracking?track_id=' . urlencode($cn)
    ]);
    exit;
}

// Default fallback
echo json_encode([
    'success' => true,
    'external' => true,
    'courier' => 'Courier Service',
    'consignment' => $cn,
    'official_url' => 'https://www.mulphilog.com/tracking/' . urlencode($cn)
]);
