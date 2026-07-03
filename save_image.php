<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['image'])) {
        $base64 = $data['image'];
        if (preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) {
            $base64 = substr($base64, strpos($base64, ',') + 1);
        }
        $imgData = base64_decode($base64);
        $dest = __DIR__ . '/images/products/rlc-823a/gallery-1-transparent.png';
        if (file_put_contents($dest, $imgData)) {
            echo "SUCCESS";
        } else {
            echo "FAIL_WRITE";
        }
    } else {
        echo "NO_IMAGE";
    }
} else {
    echo "INVALID_METHOD";
}
?>
