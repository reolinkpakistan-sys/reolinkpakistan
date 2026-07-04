<?php
// router.php - Local routing for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Decode URL to handle spaces/special characters
$uri = urldecode($uri);

// Serve existing static files/directories directly
$filePath = __DIR__ . $uri;
if (file_exists($filePath) && is_file($filePath)) {
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    
    // Let PHP files be parsed and executed by the server
    if ($ext === 'php') {
        return false;
    }
    
    // Determine MIME type for correct serving
    $mimeTypes = [
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        'mp4'  => 'video/mp4',
        'webm' => 'video/webm',
        'mov'  => 'video/quicktime',
        'ico'  => 'image/x-icon',
        'json' => 'application/json',
        'xml'  => 'application/xml',
        'html' => 'text/html'
    ];
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    readfile($filePath);
    exit;
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

if (preg_match('#^/products/([^/]+)/?$#', $uri, $matches)) {
    $_GET['id'] = $matches[1];
    include __DIR__ . '/product-details.html';
    exit;
}

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

// Default fallback
return false;
?>
