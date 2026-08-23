<?php
// router.php - Local routing for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Decode URL to handle spaces/special characters
$uri = urldecode($uri);

// Serve root directly
if ($uri === '/' || $uri === '') {
    include __DIR__ . '/index.html';
    exit;
}

// Serve existing static files directly using PHP's built-in web server (enables native HTTP 206 Partial Content Range streaming for HTML5 videos)
$filePath = __DIR__ . $uri;
if (file_exists($filePath) && is_file($filePath)) {
    return false;
}

// Clean URL: Products (Static & Dynamic)
if ($uri === '/products/4g-sim-solar-camera' || $uri === '/products/4g-sim-solar-camera/') {
    include __DIR__ . '/go-pt-plus.html';
    exit;
}
if ($uri === '/products/reolink-go-pt-plus' || $uri === '/products/reolink-go-pt-plus/') {
    include __DIR__ . '/go-pt-plus.html';
    exit;
}
if ($uri === '/products/jzones-v630' || $uri === '/products/jzones-v630/' || $uri === '/jzones-v630' || $uri === '/jzones-v630/') {
    include __DIR__ . '/jzones-v630.html';
    exit;
}

if (preg_match('#^/products/([^/]+)/?$#', $uri, $matches)) {
    $_GET['id'] = $matches[1];
    include __DIR__ . '/product-details.html';
    exit;
}

// Clean URL: Blog
$allowedBlogSlugs = [
    'cattle-farm-security' => 'cattle-farm-security.html',
    'pta-approval-guide' => 'pta-approval-guide.html',
    'solar-vs-wired-cctv' => 'solar-vs-wired-cctv.html',
    'farm-tube-well-security' => 'farm-tube-well-security.html',
    'best-car-dashcam-pakistan-guide' => 'best-car-dashcam-pakistan-guide.html'
];
if (preg_match('#^/blog/([^/]+)/?$#', $uri, $matches)) {
    $slug = $matches[1];
    if (isset($allowedBlogSlugs[$slug]) && file_exists(__DIR__ . '/' . $allowedBlogSlugs[$slug])) {
        include __DIR__ . '/' . $allowedBlogSlugs[$slug];
    } else {
        include __DIR__ . '/index.html';
    }
    exit;
}

// Clean URL: Cities (Programmatic Local SEO)
$allowedCitySlugs = ['lahore', 'karachi', 'islamabad-rawalpindi', 'multan', 'faisalabad', 'peshawar'];
if (preg_match('#^/cities/([^/]+)/?$#', $uri, $matches)) {
    $slug = $matches[1];
    if (in_array($slug, $allowedCitySlugs, true) && file_exists(__DIR__ . '/cities/' . $slug . '.html')) {
        include __DIR__ . '/cities/' . $slug . '.html';
    } else {
        include __DIR__ . '/index.html';
    }
    exit;
}

// Clean URL: Pages
if ($uri === '/about' || $uri === '/about/') {
    include __DIR__ . '/about.html';
    exit;
}
if ($uri === '/contact' || $uri === '/contact/') {
    include __DIR__ . '/contact.html';
    exit;
}
if ($uri === '/warranty' || $uri === '/warranty/') {
    include __DIR__ . '/warranty.html';
    exit;
}
if ($uri === '/privacy-policy' || $uri === '/privacy-policy/') {
    include __DIR__ . '/privacy-policy.html';
    exit;
}
if ($uri === '/shipping' || $uri === '/shipping/') {
    include __DIR__ . '/shipping.html';
    exit;
}
if ($uri === '/returns' || $uri === '/returns/') {
    include __DIR__ . '/returns.html';
    exit;
}
if ($uri === '/terms' || $uri === '/terms/') {
    include __DIR__ . '/terms.html';
    exit;
}

// Clean URL: Category pages
$allowedCategories = ['4g-cameras', 'solar-cameras', 'wifi-cameras', 'cctv-systems', 'dashcams', 'wireless-mics', 'speakers', 'accessories'];
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

// Default fallback
return false;
?>
