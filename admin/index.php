<?php
require_once __DIR__ . '/security.php';
initSecureSession();

// 1. Load configuration safely — do NOT auto-regenerate
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    die('Configuration file is missing. Please restore admin/config.php manually.');
}
require_once $configPath;

// 2. Data store paths
$dataPath = __DIR__ . '/../cms_data.json';

// Initialize default data if file is missing
if (!file_exists($dataPath)) {
    $defaultData = [
        "prices" => ["solar" => 23000, "no_solar" => 21000],
        "contact" => [
            "phone" => "0320-6755555",
            "whatsapp" => "0320-6755555",
            "email" => "support@reolink.com.pk",
            "address" => "Nawabpur road Opposite green homes colony, Multan, Pakistan"
        ],
        "videos" => [
            "construction" => "dha-site-sample.mov",
            "farm" => "go_pt_plus_sample.mp4",
            "logistics" => "Chungi no 9_20260214155305_20260214155335_95270005CWT782UY_0..MP4"
        ],
        "gadgets" => []
    ];
    file_put_contents($dataPath, json_encode($defaultData, JSON_PRETTY_PRINT));
}

$cmsData = json_decode(file_get_contents($dataPath), true);

// 3. Authentication logic
$error = '';
$success = '';

// Check if request exceeded post_max_size
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST) && $_SERVER['CONTENT_LENGTH'] > 0) {
    $maxSize = ini_get('post_max_size');
    $error = "File ka size bohot bara hai! Aap ki select kiye gaye file ka size PHP post limit ({$maxSize}) se zyada hai. Baraye meharbani choti size ki file upload karein.";
}

if (isset($_GET['logout'])) {
    destroySession();
    header('Location: ' . $_SERVER['SCRIPT_NAME']);
    exit;
}

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
            recordLoginAttempt($clientIp);
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

// CSRF protection for all non-login POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['login'])) {
    requireCsrfToken();
}

// If not logged in, render Login View
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login | S M Enterprises Admin Panel</title>
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Quicksand', sans-serif; }
            body {
                background: #07080a;
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                overflow: hidden;
                position: relative;
            }
            .glow-bg {
                position: absolute;
                width: 400px;
                height: 400px;
                background: radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1;
            }
            .login-container {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(0, 243, 255, 0.2);
                box-shadow: 0 10px 45px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 243, 255, 0.05);
                border-radius: 20px;
                padding: 40px;
                width: 100%;
                max-width: 420px;
                z-index: 2;
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
            }
            .logo-text {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo-text h2 { font-size: 24px; font-weight: 700; color: #fff; letter-spacing: 1px; }
            .logo-text span { font-size: 12px; color: #00f3ff; text-transform: uppercase; font-weight: 600; }
            .form-group { margin-bottom: 20px; }
            .form-group label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 600; }
            .form-group input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }
            .form-group input:focus { border-color: #00f3ff; }
            .btn-login {
                width: 100%;
                padding: 13px;
                background: linear-gradient(135deg, #007aff 0%, #00f3ff 100%);
                border: none;
                border-radius: 8px;
                color: #fff;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn-login:hover { transform: translateY(-1px); box-shadow: 0 0 25px rgba(0, 243, 255, 0.4); }
            .alert-error {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #ef4444;
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 20px;
                text-align: center;
            }
            .hint { text-align: center; font-size: 12px; color: #475569; margin-top: 25px; }
        </style>
    </head>
    <body>
        <div class="glow-bg"></div>
        <div class="login-container">
            <div class="logo-text">
                <h2>S M Enterprises</h2>
                <span>CMS Admin Access</span>
            </div>
            
            <?php if ($error): ?>
                <div class="alert-error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" placeholder="Enter username" required autofocus>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="Enter password" required>
                </div>
                <button type="submit" name="login" class="btn-login">Log In to Dashboard</button>
            </form>
            <div class="hint">Reolink Pakistan Distributor Network.</div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Ensure only authenticated admins can proceed beyond login view
requireAdmin();

// 4. Global definitions and helper functions for SEO & Media Uploads
$allowedSeoPages = [
    'index.html' => 'Home Page (index.html)',
    'go-pt-plus.html' => 'Reolink Go PT Plus Product Page (go-pt-plus.html)',
    'cattle-farm-security.html' => 'Cattle Farm Security Blog Page (cattle-farm-security.html)',
    'about.html' => 'About Us Page (about.html)',
    'contact.html' => 'Contact Us Page (contact.html)',
    'warranty.html' => 'Warranty/FAQ Page (warranty.html)'
];

function getPageSEO($pageFile) {
    $filePath = __DIR__ . '/../' . $pageFile;
    if (!file_exists($filePath)) {
        return ['title' => '', 'desc' => '', 'keywords' => ''];
    }
    $html = file_get_contents($filePath);
    
    $title = '';
    $desc = '';
    $keywords = '';
    
    if (preg_match('/<title>(.*?)<\/title>/si', $html, $matches)) {
        $title = htmlspecialchars_decode($matches[1]);
    }
    
    if (preg_match('/<meta\s+name="description"\s+content="([^"]*)"/i', $html, $matches)) {
        $desc = htmlspecialchars_decode($matches[1]);
    } elseif (preg_match('/<meta\s+content="([^"]*)"\s+name="description"/i', $html, $matches)) {
        $desc = htmlspecialchars_decode($matches[1]);
    }
    
    if (preg_match('/<meta\s+name="keywords"\s+content="([^"]*)"/i', $html, $matches)) {
        $keywords = htmlspecialchars_decode($matches[1]);
    } elseif (preg_match('/<meta\s+content="([^"]*)"\s+name="keywords"/i', $html, $matches)) {
        $keywords = htmlspecialchars_decode($matches[1]);
    }
    
    return ['title' => $title, 'desc' => $desc, 'keywords' => $keywords];
}

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

    // 1. Update title tag
    $html = preg_replace('/<title>.*?<\/title>/si', '<title>' . $title . '</title>', $html, 1);

    // 2. Update or insert description meta
    if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)name=["\']description["\']([^>]*)content=["\'][^"\']*["\']([^>]*)>/i', '<meta$1name="description"$2content="' . $desc . '"$3>', $html, 1);
    } elseif (preg_match('/<meta[^>]*content=["\'][^"\']*["\'][^>]*name=["\']description["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)content=["\'][^"\']*["\']([^>]*)name=["\']description["\']([^>]*)>/i', '<meta$1name="description"$2content="' . $desc . '"$3>', $html, 1);
    } else {
        $html = preg_replace('/<\/title>/i', "</title>\n    <meta name=\"description\" content=\"" . $desc . "\">", $html, 1);
    }

    // 3. Update or insert keywords meta
    if (preg_match('/<meta[^>]*name=["\']keywords["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)name=["\']keywords["\']([^>]*)content=["\'][^"\']*["\']([^>]*)>/i', '<meta$1name="keywords"$2content="' . $keywords . '"$3>', $html, 1);
    } elseif (preg_match('/<meta[^>]*content=["\'][^"\']*["\'][^>]*name=["\']keywords["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<meta([^>]*)content=["\'][^"\']*["\']([^>]*)name=["\']keywords["\']([^>]*)>/i', '<meta$1name="keywords"$2content="' . $keywords . '"$3>', $html, 1);
    } else {
        $html = preg_replace('/<meta[^>]*name=["\']description["\'][^>]*>/i', "$0\n    <meta name=\"keywords\" content=\"" . $keywords . "\">", $html, 1);
    }

    return file_put_contents($filePath, $html) !== false;
}

// Load SEO details for all allowed pages
$pagesSeoData = [];
foreach ($allowedSeoPages as $pageKey => $pageName) {
    $pagesSeoData[$pageKey] = getPageSEO($pageKey);
}

// Sync schema prices dynamically inside index.html and go-pt-plus.html
function syncSchemaPrices($solarPrice) {
    $files = [__DIR__ . '/../index.html', __DIR__ . '/../go-pt-plus.html'];
    foreach ($files as $file) {
        if (!file_exists($file)) continue;
        $html = file_get_contents($file);
        $updatedHtml = preg_replace('/("price"\s*:\s*)"?[0-9]+"?(?=\s*,|\s*\n|\s*\})/i', '$1"' . $solarPrice . '"', $html);
        if ($updatedHtml !== null) {
            file_put_contents($file, $updatedHtml);
        }
    }
}

// Dynamic XML Sitemap Generator
function generateDynamicSitemap($cmsData) {
    $sitemapPath = __DIR__ . '/../sitemap.xml';
    $baseUrl = 'https://www.reolink.com.pk/';
    
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    
    // Static primary pages with clean URLs
    $staticPages = [
        '' => '1.0',
        'products/4g-sim-solar-camera' => '0.9',
        'blog/cattle-farm-security' => '0.8',
        'about' => '0.7',
        'contact' => '0.7',
        'warranty' => '0.6',
        'privacy-policy' => '0.5',
        'category/4g-cameras' => '0.7',
        'category/solar-cameras' => '0.7',
        'category/wifi-cameras' => '0.7',
        'category/cctv-systems' => '0.7',
        'category/wireless-mics' => '0.7',
        'category/speakers' => '0.7',
        'category/accessories' => '0.7'
    ];
    
    foreach ($staticPages as $page => $priority) {
        $xml .= '  <url>' . "\n";
        $xml .= '    <loc>' . $baseUrl . $page . '</loc>' . "\n";
        $xml .= '    <lastmod>' . date('Y-m-d') . '</lastmod>' . "\n";
        $xml .= '    <changefreq>weekly</changefreq>' . "\n";
        $xml .= '    <priority>' . $priority . '</priority>' . "\n";
        $xml .= '  </url>' . "\n";
    }
    
    // Dynamic product detail pages with clean URLs
    if (isset($cmsData['gadgets'])) {
        foreach ($cmsData['gadgets'] as $gadget) {
            if ($gadget['visible'] ?? true) {
                $xml .= '  <url>' . "\n";
                $xml .= '    <loc>' . $baseUrl . 'products/' . urlencode($gadget['id']) . '</loc>' . "\n";
                $xml .= '    <lastmod>' . date('Y-m-d') . '</lastmod>' . "\n";
                $xml .= '    <changefreq>weekly</changefreq>' . "\n";
                $xml .= '    <priority>0.8</priority>' . "\n";
                $xml .= '  </url>' . "\n";
            }
        }
    }
    
    $xml .= '</urlset>';
    file_put_contents($sitemapPath, $xml);
}

// Image Compression & Resizing Helper
function compressAndResizeImage($sourcePath, $destinationPath, $maxWidth = 1200, $quality = 80) {
    $info = getimagesize($sourcePath);
    if ($info === false) return move_uploaded_file($sourcePath, $destinationPath);
    
    $mime = $info['mime'];
    $image = null;
    
    switch ($mime) {
        case 'image/jpeg':
            $image = @imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $image = @imagecreatefrompng($sourcePath);
            if ($image) {
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
            }
            break;
        case 'image/webp':
            $image = @imagecreatefromwebp($sourcePath);
            break;
        case 'image/gif':
            return move_uploaded_file($sourcePath, $destinationPath); // Don't compress GIFs to preserve animation
        default:
            return move_uploaded_file($sourcePath, $destinationPath);
    }
    
    if (!$image) return move_uploaded_file($sourcePath, $destinationPath);
    
    $width = imagesx($image);
    $height = imagesy($image);
    
    $newWidth = $width;
    $newHeight = $height;
    
    if ($width > $maxWidth || $height > $maxWidth) {
        if ($width > $height) {
            $newWidth = $maxWidth;
            $newHeight = (int)($height * ($maxWidth / $width));
        } else {
            $newHeight = $maxWidth;
            $newWidth = (int)($width * ($maxWidth / $height));
        }
    }
    
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    
    if ($mime == 'image/png' || $mime == 'image/webp') {
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
        $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
        imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    imagedestroy($image);
    
    // Save as WEBP for all images to save maximum space
    $success = imagewebp($newImage, $destinationPath, $quality);
    imagedestroy($newImage);
    
    return $success;
}

// Helper function for handling image uploads/camera capture
function handleProductImageUpload($fileField, $base64Field, $textField, $currentValue = '') {
    $uploadDir = __DIR__ . '/../images/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // 1. Direct File Upload
    if (isset($_FILES[$fileField]) && $_FILES[$fileField]['error'] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES[$fileField]['tmp_name'];
        $origName = basename($_FILES[$fileField]['name']);
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'];
        if (in_array($ext, $allowedExtensions)) {
            $isVideo = in_array($ext, ['mp4', 'webm', 'mov']);
            $finalExt = ($isVideo || $ext === 'gif') ? $ext : 'webp'; // Convert images to webp
            $newFileName = 'prod_' . md5(uniqid(rand(), true)) . '.' . $finalExt;
            $destination = $uploadDir . $newFileName;
            
            if ($isVideo || $ext === 'gif') {
                if (move_uploaded_file($tmpName, $destination)) {
                    return 'images/' . $newFileName;
                }
            } else {
                if (compressAndResizeImage($tmpName, $destination, 1200, 80)) {
                    return 'images/' . $newFileName;
                }
            }
        }
    }
    
    // 2. Direct Camera Access (Base64)
    if (!empty($_POST[$base64Field])) {
        $base64Data = $_POST[$base64Field];
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $data = substr($base64Data, strpos($base64Data, ',') + 1);
            $data = base64_decode($data);
            if ($data !== false) {
                $ext = strtolower($type[1]) ?: 'jpg';
                if ($ext === 'jpeg') $ext = 'jpg';
                $newFileName = 'capture_' . md5(uniqid(rand(), true)) . '.' . $ext;
                $destination = $uploadDir . $newFileName;
                if (file_put_contents($destination, $data)) {
                    return 'images/' . $newFileName;
                }
            }
        }
    }
    
    // 3. Image Link / SVG input
    if (isset($_POST[$textField])) {
        return trim($_POST[$textField]);
    }
    
    return $currentValue;
}

// Helper function for multiple gallery uploads
function handleMultipleGalleryUploads($fileField) {
    $uploadDir = __DIR__ . '/../images/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $uploadedPaths = [];
    if (isset($_FILES[$fileField]) && is_array($_FILES[$fileField]['error'])) {
        foreach ($_FILES[$fileField]['error'] as $key => $error) {
            if ($error === UPLOAD_ERR_OK) {
                $tmpName = $_FILES[$fileField]['tmp_name'][$key];
                $origName = basename($_FILES[$fileField]['name'][$key]);
                $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'];
                
                if (in_array($ext, $allowedExtensions)) {
                    $isVideo = in_array($ext, ['mp4', 'webm', 'mov']);
                    $finalExt = ($isVideo || $ext === 'gif') ? $ext : 'webp'; // Convert images to webp
                    $newFileName = 'gal_' . md5(uniqid(rand(), true)) . '.' . $finalExt;
                    $destination = $uploadDir . $newFileName;
                    
                    if ($isVideo || $ext === 'gif') {
                        if (move_uploaded_file($tmpName, $destination)) {
                            $uploadedPaths[] = 'images/' . $newFileName;
                        }
                    } else {
                        if (compressAndResizeImage($tmpName, $destination, 1200, 80)) {
                            $uploadedPaths[] = 'images/' . $newFileName;
                        }
                    }
                }
            }
        }
    }
    return $uploadedPaths;
}

// 5. Handle POST actions for authorized admins
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['login'])) {
    
    // Save general settings & prices
    if (isset($_POST['save_settings'])) {
        $cmsData['prices']['solar'] = intval($_POST['price_solar'] ?? 23000);
        $cmsData['prices']['no_solar'] = intval($_POST['price_no_solar'] ?? 21000);
        
        $cmsData['contact']['phone'] = trim($_POST['phone'] ?? '');
        $cmsData['contact']['whatsapp'] = trim($_POST['whatsapp'] ?? '');
        $cmsData['contact']['email'] = trim($_POST['email'] ?? '');
        $cmsData['contact']['address'] = trim($_POST['address'] ?? '');
        
        $cmsData['videos']['construction'] = trim($_POST['video_construction'] ?? '');
        $cmsData['videos']['farm'] = trim($_POST['video_farm'] ?? '');
        $cmsData['videos']['logistics'] = trim($_POST['video_logistics'] ?? '');
        
        if (file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT))) {
            syncSchemaPrices($cmsData['prices']['solar']);
            generateDynamicSitemap($cmsData);
            header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=saved');
            exit;
        } else {
            $error = 'File save karne me masla hua. Permissions check karein.';
        }
    }

    // Save Page SEO
    if (isset($_POST['save_page_seo'])) {
        $seo_page = trim($_POST['seo_page'] ?? '');
        $seo_title = trim($_POST['seo_title'] ?? '');
        $seo_desc = trim($_POST['seo_desc'] ?? '');
        $seo_keywords = trim($_POST['seo_keywords'] ?? '');
        
        if (array_key_exists($seo_page, $allowedSeoPages)) {
            if (updatePageSEO($seo_page, $seo_title, $seo_desc, $seo_keywords)) {
                generateDynamicSitemap($cmsData);
                header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=seo_saved');
                exit;
            } else {
                $error = 'Page SEO update karne me error aaya. File permissions check karein.';
            }
        } else {
            $error = 'Invalid page selection.';
        }
    }

    // Add Gadget Action
    if (isset($_POST['add_gadget'])) {
        $name = trim($_POST['gadget_name'] ?? '');
        $desc = trim($_POST['gadget_desc'] ?? '');
        $orig_price = intval($_POST['gadget_orig_price'] ?? 0);
        $curr_price = intval($_POST['gadget_curr_price'] ?? 0);
        $tag = trim($_POST['gadget_tag'] ?? '');
        
        $meta_title = trim($_POST['gadget_meta_title'] ?? '');
        $meta_desc = trim($_POST['gadget_meta_desc'] ?? '');
        $focus_keywords = trim($_POST['gadget_focus_keywords'] ?? '');
        
        // Process uploaded/captured/manual image
        $image = handleProductImageUpload('gadget_image_file', 'gadget_image_base64', 'gadget_image');
        
        // Clean URL-friendly slug
        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $name), '-'));
        $id = $slug ?: uniqid();

        if ($name) {
            $category = trim($_POST['category'] ?? '');
            $homepage_show = isset($_POST['homepage_show']) && $_POST['homepage_show'] === '1';
            
            $layout_type = $_POST['layout_type'] ?? 'standard';
            $hero_badges = isset($_POST['hero_badges']) ? array_filter(array_map('trim', explode(',', $_POST['hero_badges']))) : [];
            $hero_bullets = isset($_POST['hero_bullets']) ? array_filter(array_map('trim', explode("\n", $_POST['hero_bullets']))) : [];
            $hero_show_rain = isset($_POST['hero_show_rain']) ? true : false;
            $hero_floating_tags = [];
            if (isset($_POST['hero_tag_text']) && is_array($_POST['hero_tag_text'])) {
                foreach ($_POST['hero_tag_text'] as $i => $text) {
                    $text = trim($text);
                    if (!empty($text)) {
                        $hero_floating_tags[] = [
                            'text' => $text,
                            'icon' => $_POST['hero_tag_icon'][$i] ?? 'star-outline'
                        ];
                    }
                }
            }

            $newGadget = [
                "id" => $id,
                "name" => $name,
                "category" => $category ?: "accessories",
                "homepage" => $homepage_show,
                "desc" => $desc,
                "orig_price" => $orig_price,
                "curr_price" => $curr_price,
                "tag" => $tag,
                "image_type" => $image ? "url" : "svg",
                "image" => $image,
                "gallery" => handleMultipleGalleryUploads('gadget_gallery_files'),
                "youtube_url" => trim($_POST['gadget_youtube_url'] ?? ''),
                "meta_title" => $meta_title,
                "meta_desc" => $meta_desc,
                "focus_keywords" => $focus_keywords,
                "layout_type" => $layout_type,
                "hero_badges" => $hero_badges,
                "hero_bullets" => $hero_bullets,
                "hero_show_rain" => $hero_show_rain,
                "hero_floating_tags" => $hero_floating_tags,
                "visible" => true
            ];
            
            $cmsData['gadgets'][] = $newGadget;
            if (file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT))) {
                generateDynamicSitemap($cmsData);
                header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=added');
                exit;
            }
        }
    }

    // Edit Gadget Action
    if (isset($_POST['edit_gadget'])) {
        $g_idx = intval($_POST['gadget_index'] ?? -1);
        if ($g_idx >= 0 && isset($cmsData['gadgets'][$g_idx])) {
            $cmsData['gadgets'][$g_idx]['name'] = trim($_POST['edit_name'] ?? '');
            $cmsData['gadgets'][$g_idx]['desc'] = trim($_POST['edit_desc'] ?? '');
            $cmsData['gadgets'][$g_idx]['orig_price'] = intval($_POST['edit_orig_price'] ?? 0);
            $cmsData['gadgets'][$g_idx]['curr_price'] = intval($_POST['edit_curr_price'] ?? 0);
            $cmsData['gadgets'][$g_idx]['tag'] = trim($_POST['edit_tag'] ?? '');
            
            $cmsData['gadgets'][$g_idx]['meta_title'] = trim($_POST['edit_meta_title'] ?? '');
            $cmsData['gadgets'][$g_idx]['meta_desc'] = trim($_POST['edit_meta_desc'] ?? '');
            $cmsData['gadgets'][$g_idx]['focus_keywords'] = trim($_POST['edit_focus_keywords'] ?? '');
            
            // Handle image updates
            $currentImg = $cmsData['gadgets'][$g_idx]['image'] ?? '';
            $image = handleProductImageUpload('edit_image_file', 'edit_image_base64', 'edit_image', $currentImg);
            
            $cmsData['gadgets'][$g_idx]['image'] = $image;
            $cmsData['gadgets'][$g_idx]['image_type'] = $image ? "url" : "svg";
            
            // Handle gallery updates
            $newGalleryImages = handleMultipleGalleryUploads('edit_gallery_files');
            
            if (!isset($cmsData['gadgets'][$g_idx]['gallery'])) {
                $cmsData['gadgets'][$g_idx]['gallery'] = [];
            }
            
            // Remove individual gallery images if requested
            if (!empty($_POST['remove_gallery_images']) && is_array($_POST['remove_gallery_images'])) {
                $cmsData['gadgets'][$g_idx]['gallery'] = array_values(array_filter($cmsData['gadgets'][$g_idx]['gallery'], function($img) {
                    return !in_array($img, $_POST['remove_gallery_images']);
                }));
                
                // Optional: Delete physical files from disk to save space
                foreach ($_POST['remove_gallery_images'] as $delImg) {
                    $delPath = __DIR__ . '/../' . $delImg;
                    if (file_exists($delPath)) {
                        @unlink($delPath);
                    }
                }
            }
            if (!empty($newGalleryImages)) {
                $cmsData['gadgets'][$g_idx]['gallery'] = array_merge($cmsData['gadgets'][$g_idx]['gallery'], $newGalleryImages);
            }
            
            $cmsData['gadgets'][$g_idx]['youtube_url'] = trim($_POST['edit_youtube_url'] ?? '');
            
            $cmsData['gadgets'][$g_idx]['layout_type'] = $_POST['edit_layout_type'] ?? 'standard';
            $cmsData['gadgets'][$g_idx]['hero_badges'] = isset($_POST['edit_hero_badges']) ? array_filter(array_map('trim', explode(',', $_POST['edit_hero_badges']))) : [];
            $cmsData['gadgets'][$g_idx]['hero_bullets'] = isset($_POST['edit_hero_bullets']) ? array_filter(array_map('trim', explode("\n", $_POST['edit_hero_bullets']))) : [];
            $cmsData['gadgets'][$g_idx]['hero_show_rain'] = isset($_POST['edit_hero_show_rain']) ? true : false;
            
            $hero_floating_tags = [];
            if (isset($_POST['edit_hero_tag_text']) && is_array($_POST['edit_hero_tag_text'])) {
                foreach ($_POST['edit_hero_tag_text'] as $i => $text) {
                    $text = trim($text);
                    if (!empty($text)) {
                        $hero_floating_tags[] = [
                            'text' => $text,
                            'icon' => $_POST['edit_hero_tag_icon'][$i] ?? 'star-outline'
                        ];
                    }
                }
            }
            $cmsData['gadgets'][$g_idx]['hero_floating_tags'] = $hero_floating_tags;
            
            if (file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT))) {
                generateDynamicSitemap($cmsData);
                header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=edited');
                exit;
            }
        }
    }

    // Security (Change Password) Action
    if (isset($_POST['change_password'])) {
        $curr_pass = $_POST['curr_pass'] ?? '';
        $new_pass = $_POST['new_pass'] ?? '';
        $confirm_pass = $_POST['confirm_pass'] ?? '';
        
        if (password_verify($curr_pass, ADMIN_PASS_HASH)) {
            if ($new_pass === $confirm_pass) {
                if (strlen($new_pass) >= 6) {
                    $new_hash = password_hash($new_pass, PASSWORD_DEFAULT);
                    $configCode = "<?php\n"
                                . "// Auto-generated Admin Configuration\n"
                                . "define('ADMIN_USER', 'admin');\n"
                                . "define('ADMIN_PASS_HASH', '" . $new_hash . "');\n";
                    if (file_put_contents($configPath, $configCode)) {
                        header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=password_changed');
                        exit;
                    } else {
                        $error = 'config.php update karne me masla hua.';
                    }
                } else {
                    $error = 'Naya password kam se kam 6 characters ka hona chahiye.';
                }
            } else {
                $error = 'Naye passwords aapas me match nahi karte.';
            }
        } else {
            $error = 'Maujooda (Current) password ghalat hai.';
        }
    }
}

// 5. Handle GET operations for Gadgets
if (isset($_GET['delete_gadget'])) {
    $idx = intval($_GET['delete_gadget']);
    if (isset($cmsData['gadgets'][$idx])) {
        array_splice($cmsData['gadgets'], $idx, 1);
        if (file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT))) {
            generateDynamicSitemap($cmsData);
            header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=deleted');
            exit;
        }
    }
}

if (isset($_GET['toggle_gadget'])) {
    $idx = intval($_GET['toggle_gadget']);
    if (isset($cmsData['gadgets'][$idx])) {
        $cmsData['gadgets'][$idx]['visible'] = !($cmsData['gadgets'][$idx]['visible'] ?? true);
        if (file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT))) {
            generateDynamicSitemap($cmsData);
            header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=toggled');
            exit;
        }
    }
}

if (isset($_GET['move_gadget_up'])) {
    $idx = intval($_GET['move_gadget_up']);
    if ($idx > 0 && isset($cmsData['gadgets'][$idx])) {
        $temp = $cmsData['gadgets'][$idx];
        $cmsData['gadgets'][$idx] = $cmsData['gadgets'][$idx - 1];
        $cmsData['gadgets'][$idx - 1] = $temp;
        if (file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT))) {
            header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=reordered');
            exit;
        }
    }
}

if (isset($_GET['move_gadget_down'])) {
    $idx = intval($_GET['move_gadget_down']);
    if ($idx < count($cmsData['gadgets']) - 1 && isset($cmsData['gadgets'][$idx])) {
        $temp = $cmsData['gadgets'][$idx];
        $cmsData['gadgets'][$idx] = $cmsData['gadgets'][$idx + 1];
        $cmsData['gadgets'][$idx + 1] = $temp;
        if (file_put_contents($dataPath, json_encode($cmsData, JSON_PRETTY_PRINT))) {
            header('Location: ' . $_SERVER['SCRIPT_NAME'] . '?status=reordered');
            exit;
        }
    }
}

if (isset($_GET['status'])) {
    if ($_GET['status'] === 'deleted') $success = 'Gadget list se delete kar diya gaya!';
    if ($_GET['status'] === 'toggled') $success = 'Gadget ki visibility toggle ho gayi!';
    if ($_GET['status'] === 'reordered') $success = 'Gadgets ki tarteeb (sequence) kamyabi se tabdeel ho gayi!';
    if ($_GET['status'] === 'saved') $success = 'Settings aur prices kamyabi se save ho gayi hain!';
    if ($_GET['status'] === 'seo_saved') $success = 'Page SEO details kamyabi se update ho gayi hain aur sitemap regenerate ho gaya hai!';
    if ($_GET['status'] === 'added') $success = 'Naya gadget kamyabi se add kar diya gaya hai aur sitemap update ho gaya hai!';
    if ($_GET['status'] === 'edited') $success = 'Gadget details update ho gayi hain aur sitemap update ho gaya hai!';
    if ($_GET['status'] === 'password_changed') $success = 'Password kamyabi se change ho gaya! Naya password next login par valid hoga.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S M Enterprises CMS - Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Quicksand', sans-serif; }
        body { background: #07080a; color: #fff; min-height: 100vh; display: flex; flex-direction: column; }
        
        /* Layout Grid */
        .wrapper { display: flex; flex: 1; height: 100vh; overflow: hidden; }
        
        /* Sidebar */
        .sidebar {
            width: 260px;
            background: rgba(255,255,255,0.01);
            border-right: 1px solid rgba(0, 243, 255, 0.1);
            display: flex;
            flex-direction: column;
            padding: 30px 20px;
        }
        .sidebar-brand h2 { font-size: 20px; font-weight: 700; color: #fff; }
        .sidebar-brand span { font-size: 11px; color: #00f3ff; text-transform: uppercase; font-weight: 600; }
        .menu-items { margin-top: 40px; display: flex; flex-direction: column; gap: 10px; }
        .menu-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 18px;
            border-radius: 8px;
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            background: transparent;
            border: none;
            cursor: pointer;
            width: 100%;
            text-align: left;
            transition: all 0.2s;
        }
        .menu-btn.active, .menu-btn:hover {
            color: #fff;
            background: rgba(0, 243, 255, 0.1);
            box-shadow: inset 0 0 10px rgba(0,243,255,0.05);
        }
        .menu-btn ion-icon { font-size: 18px; color: #00f3ff; }
        .logout-btn { margin-top: auto; color: #ef4444; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
        .logout-btn ion-icon { color: #ef4444; }

        /* Main Content Container */
        .main-content { flex: 1; padding: 40px; overflow-y: auto; position: relative; }
        .glow-bg {
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(0, 243, 255, 0.05) 0%, transparent 70%);
            top: -100px;
            right: -100px;
            z-index: 0;
            pointer-events: none;
        }
        .content-container { position: relative; z-index: 1; max-width: 1000px; }
        .header-title { margin-bottom: 30px; }
        .header-title h1 { font-size: 28px; font-weight: 700; color: #fff; }
        .header-title p { font-size: 14px; color: #94a3b8; margin-top: 5px; }

        /* Card panels */
        .panel {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: none;
        }
        .panel.active { display: block; }
        .panel-title { margin-bottom: 25px; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 15px; }
        .panel-title h3 { font-size: 18px; color: #fff; display: flex; align-items: center; gap: 8px; }
        .panel-title h3 ion-icon { color: #00f3ff; }

        /* Form styling */
        .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 600; }
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: #00f3ff; }
        .btn-submit {
            padding: 12px 25px;
            background: linear-gradient(135deg, #007aff 0%, #00f3ff 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
        }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 0 25px rgba(0, 243, 255, 0.4); }

        /* Alert styling */
        .alert { padding: 15px; border-radius: 8px; font-size: 14px; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
        .alert-success { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; }
        .alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; }

        /* Tables */
        .gadgets-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; text-align: left; }
        .gadgets-table th, .gadgets-table td { padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
        .gadgets-table th { color: #94a3b8; font-weight: 600; }
        .gadgets-table td { color: #cbd5e1; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-badge.visible { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-badge.hidden { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        
        .action-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #cbd5e1; text-decoration: none; cursor: pointer; font-size: 16px; margin-right: 5px; transition: all 0.2s; }
        .action-icon-btn:hover { background: rgba(255,255,255,0.05); color: #00f3ff; border-color: #00f3ff; }
        .action-icon-btn.delete:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: #ef4444; }
        .order-btn:hover { color: #00f3ff !important; filter: drop-shadow(0 0 4px #00f3ff); }

        /* Edit Form Modal Block */
        .edit-block {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(0, 243, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin-top: 35px;
            display: none;
        }

        /* Image Source Tabs & Camera styling */
        .image-source-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            margin-top: 5px;
        }
        .image-tab-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            color: #cbd5e1;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .image-tab-btn.active, .image-tab-btn:hover {
            background: rgba(0, 243, 255, 0.1);
            color: #fff;
            border-color: rgba(0, 243, 255, 0.3);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.15);
        }
        .tab-content-pane {
            display: none;
            padding: 20px;
            background: rgba(255, 255, 255, 0.01);
            border: 1px dashed rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .tab-content-pane.active {
            display: block;
        }

        /* File Upload */
        .file-upload-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
            border: 2px dashed rgba(0, 243, 255, 0.2);
            border-radius: 8px;
            background: rgba(0, 243, 255, 0.01);
            cursor: pointer;
            transition: all 0.2s;
            overflow: hidden;
        }
        .file-upload-wrapper:hover {
            border-color: #00f3ff;
            background: rgba(0, 243, 255, 0.03);
        }
        .file-upload-wrapper input[type="file"] {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            opacity: 0;
            cursor: pointer;
            z-index: 10;
        }
        .file-upload-info {
            text-align: center;
            color: #94a3b8;
            pointer-events: none;
        }
        .file-upload-info ion-icon {
            font-size: 40px;
            color: #00f3ff;
            margin-bottom: 10px;
            filter: drop-shadow(0 0 8px rgba(0, 243, 255, 0.3));
        }
        .file-upload-info p {
            font-size: 14px;
            font-weight: 600;
            color: #cbd5e1;
            margin-bottom: 4px;
        }

        /* Camera Feed UI */
        .camera-feed-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            width: 100%;
        }
        .camera-video {
            width: 100%;
            max-width: 380px;
            aspect-ratio: 4/3;
            background: #0d1117;
            border-radius: 8px;
            border: 1px solid rgba(0, 243, 255, 0.2);
            object-fit: cover;
            transform: scaleX(-1); /* Mirror view for easy aligning */
        }
        .camera-preview {
            width: 100%;
            max-width: 380px;
            aspect-ratio: 4/3;
            background: #0d1117;
            border-radius: 8px;
            border: 1px solid rgba(0, 243, 255, 0.2);
            object-fit: cover;
            display: none;
        }
        .camera-controls {
            display: flex;
            gap: 10px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-brand">
                <h2>S M Enterprises</h2>
                <span>Distributor CMS</span>
            </div>
            
            <div class="menu-items">
                <button class="menu-btn active" onclick="switchTab('pricing', this)">
                    <ion-icon name="wallet-outline"></ion-icon> Reolink Pricing
                </button>
                <button class="menu-btn" onclick="switchTab('gadgets', this)">
                    <ion-icon name="grid-outline"></ion-icon> Featured Gadgets
                </button>
                <button class="menu-btn" onclick="switchTab('page-seo', this)">
                    <ion-icon name="globe-outline"></ion-icon> Page SEO Editor
                </button>
                <button class="menu-btn" onclick="switchTab('contact', this)">
                    <ion-icon name="business-outline"></ion-icon> Contact Settings
                </button>
                <button class="menu-btn" onclick="switchTab('videos', this)">
                    <ion-icon name="videocam-outline"></ion-icon> Banner Videos
                </button>
                <button class="menu-btn" onclick="switchTab('security', this)">
                    <ion-icon name="lock-closed-outline"></ion-icon> Security Settings
                </button>
                
                <a href="<?= $_SERVER['SCRIPT_NAME'] ?>?logout=true" class="menu-btn logout-btn" onclick="localStorage.removeItem('adminActiveTab');">
                    <ion-icon name="log-out-outline"></ion-icon> Log Out
                </a>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <div class="glow-bg"></div>
            <div class="content-container">
                <div class="header-title">
                    <h1>S M Enterprises Content Management Panel</h1>
                    <p>Apni website ki pricing, contact info aur gadgets inventory yahan se tabdeeli karein.</p>
                </div>

                <?php if ($success): ?>
                    <div class="alert alert-success">
                        <ion-icon name="checkmark-circle-outline" style="font-size: 20px;"></ion-icon>
                        <div><?= htmlspecialchars($success) ?></div>
                    </div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="alert alert-error">
                        <ion-icon name="alert-circle-outline" style="font-size: 20px;"></ion-icon>
                        <div><?= htmlspecialchars($error) ?></div>
                    </div>
                <?php endif; ?>

                <!-- Tab 1: Pricing -->
                <div class="panel active" id="tab-pricing">
                    <div class="panel-title">
                        <h3><ion-icon name="wallet"></ion-icon> Reolink Go PT Plus Prices</h3>
                    </div>
                    <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Option 1: With Solar Panel Price (PKR)</label>
                                <input type="number" name="price_solar" value="<?= htmlspecialchars($cmsData['prices']['solar']) ?>" required>
                            </div>
                            <div class="form-group">
                                <label>Option 2: Without Solar Panel Price (PKR)</label>
                                <input type="number" name="price_no_solar" value="<?= htmlspecialchars($cmsData['prices']['no_solar']) ?>" required>
                            </div>
                        </div>
                        
                        <!-- Hidden details matching others to submit together -->
                        <input type="hidden" name="phone" value="<?= htmlspecialchars($cmsData['contact']['phone'] ?? '') ?>">
                        <input type="hidden" name="whatsapp" value="<?= htmlspecialchars($cmsData['contact']['whatsapp'] ?? '') ?>">
                        <input type="hidden" name="email" value="<?= htmlspecialchars($cmsData['contact']['email'] ?? '') ?>">
                        <input type="hidden" name="address" value="<?= htmlspecialchars($cmsData['contact']['address'] ?? '') ?>">
                        <input type="hidden" name="video_construction" value="<?= htmlspecialchars($cmsData['videos']['construction'] ?? '') ?>">
                        <input type="hidden" name="video_farm" value="<?= htmlspecialchars($cmsData['videos']['farm'] ?? '') ?>">
                        <input type="hidden" name="video_logistics" value="<?= htmlspecialchars($cmsData['videos']['logistics'] ?? '') ?>">

                        <button type="submit" name="save_settings" class="btn-submit">Save Camera Prices</button>
                    </form>
                </div>

                <!-- Tab 2: Gadgets -->
                <div class="panel" id="tab-gadgets">
                    <div class="panel-title">
                        <h3><ion-icon name="grid"></ion-icon> Smart Tech Gadgets Inventory</h3>
                    </div>
                    
                    <table class="gadgets-table">
                        <thead>
                            <tr>
                                <th style="width: 100px;">Order</th>
                                <th>Name</th>
                                <th>Original Price</th>
                                <th>Current Price</th>
                                <th>Tag</th>
                                <th>Status</th>
                                <th style="width: 150px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($cmsData['gadgets'] as $idx => $gadget): ?>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="font-weight: 700; color: #00f3ff; font-family: monospace; font-size: 15px; min-width: 25px;">#<?= $idx + 1 ?></span>
                                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                                <?php if ($idx > 0): ?>
                                                    <a href="<?= $_SERVER['SCRIPT_NAME'] ?>?move_gadget_up=<?= $idx ?>" class="order-btn" title="Move Up" style="color: #cbd5e1; font-size: 15px; display: inline-flex; transition: color 0.2s;"><ion-icon name="caret-up-outline"></ion-icon></a>
                                                <?php else: ?>
                                                    <span style="color: rgba(255,255,255,0.1); font-size: 15px; display: inline-flex; cursor: not-allowed;"><ion-icon name="caret-up-outline"></ion-icon></span>
                                                <?php endif; ?>
                                                
                                                <?php if ($idx < count($cmsData['gadgets']) - 1): ?>
                                                    <a href="<?= $_SERVER['SCRIPT_NAME'] ?>?move_gadget_down=<?= $idx ?>" class="order-btn" title="Move Down" style="color: #cbd5e1; font-size: 15px; display: inline-flex; transition: color 0.2s;"><ion-icon name="caret-down-outline"></ion-icon></a>
                                                <?php else: ?>
                                                    <span style="color: rgba(255,255,255,0.1); font-size: 15px; display: inline-flex; cursor: not-allowed;"><ion-icon name="caret-down-outline"></ion-icon></span>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                    <td><strong><?= htmlspecialchars($gadget['name']) ?></strong></td>
                                    <td>Rs <?= number_format($gadget['orig_price']) ?></td>
                                    <td style="color:#ff6b00; font-weight:700;">Rs <?= number_format($gadget['curr_price']) ?></td>
                                    <td><?= htmlspecialchars($gadget['tag'] ?? '-') ?></td>
                                    <td>
                                        <?php if ($gadget['visible'] ?? true): ?>
                                            <span class="status-badge visible">Visible</span>
                                        <?php else: ?>
                                            <span class="status-badge hidden">Hidden</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <button class="action-icon-btn" onclick="openEditForm(<?= $idx ?>, <?= htmlspecialchars(json_encode($gadget)) ?>)" title="Edit">
                                            <ion-icon name="create-outline"></ion-icon>
                                        </button>
                                        <a href="<?= $_SERVER['SCRIPT_NAME'] ?>?toggle_gadget=<?= $idx ?>" class="action-icon-btn" title="Toggle Visibility">
                                            <ion-icon name="eye-outline"></ion-icon>
                                        </a>
                                        <a href="<?= $_SERVER['SCRIPT_NAME'] ?>?delete_gadget=<?= $idx ?>" class="action-icon-btn delete" onclick="return confirm('Kya aap sach me ye item delete karna chahte hain?')" title="Delete">
                                            <ion-icon name="trash-outline"></ion-icon>
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>

                    <!-- Edit Gadget Section -->
                    <div class="edit-block" id="editBlock">
                        <div class="panel-title" style="margin-bottom:15px; padding-bottom:5px;">
                            <h3><ion-icon name="create"></ion-icon> Edit Gadget Details</h3>
                        </div>
                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="gadget_index" id="editIndex">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Gadget Name</label>
                                    <input type="text" name="edit_name" id="editName" required>
                                </div>
                                <div class="form-group">
                                    <label>Status Tag (e.g. Best Seller, New)</label>
                                    <input type="text" name="edit_tag" id="editTag">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="edit_desc" id="editDesc" rows="3" required></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Page Layout Template</label>
                                    <select name="edit_layout_type" id="editLayoutType" style="width:100%; padding:10px 14px; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#e2e8f0; font-size:14px;" onchange="toggleHeroFields('edit')">
                                        <option value="standard">Standard Default</option>
                                        <option value="hero_immersive">Immersive Hero (Like Homepage)</option>
                                        <option value="nature_immersive">Nature Immersive (Wildlife)</option>
                                    </select>
                                </div>
                            </div>

                            <div id="editHeroFields" style="display:none; padding:20px; background:rgba(0,0,0,0.2); border-radius:10px; margin-bottom:20px; border:1px solid rgba(0, 243, 255, 0.2);">
                                <h4 style="color:#00f3ff; margin-bottom:15px; margin-top:0;">Hero Layout Settings</h4>
                                <div class="form-group">
                                    <label>Top Badges (Comma separated, max 3)</label>
                                    <input type="text" name="edit_hero_badges" id="editHeroBadges" placeholder="e.g. PTA Approved, 4G LTE, 100% Wire-Free">
                                </div>
                                <div class="form-group">
                                    <label>Feature Bullets (One per line)</label>
                                    <textarea name="edit_hero_bullets" id="editHeroBullets" rows="3" placeholder="2K 4MP Super HD&#10;355° Pan & 140° Tilt..."></textarea>
                                </div>
                                <div class="form-group" style="display:flex; align-items:center; gap:10px;">
                                    <input type="checkbox" name="edit_hero_show_rain" id="editHeroRain" value="on">
                                    <label for="editHeroRain" style="margin:0;">Enable Rain / Weatherproof Effect</label>
                                </div>
                                
                                <label>Floating Tags (Leave text empty to skip)</label>
                                <div class="form-row" style="margin-top:10px;">
                                    <div class="form-group"><input type="text" name="edit_hero_tag_text[]" placeholder="Tag 1 Text (e.g. 4G LTE)"><select name="edit_hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                    <div class="form-group"><input type="text" name="edit_hero_tag_text[]" placeholder="Tag 2 Text"><select name="edit_hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="water-outline">Water</option><option value="cellular-outline">Cellular</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group"><input type="text" name="edit_hero_tag_text[]" placeholder="Tag 3 Text"><select name="edit_hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="battery-charging-outline">Battery</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                    <div class="form-group"><input type="text" name="edit_hero_tag_text[]" placeholder="Tag 4 Text"><select name="edit_hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="shield-checkmark-outline">Shield</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group"><input type="text" name="edit_hero_tag_text[]" placeholder="Tag 5 Text"><select name="edit_hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="flash-outline">Flash</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                    <div class="form-group"><input type="text" name="edit_hero_tag_text[]" placeholder="Tag 6 Text"><select name="edit_hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="videocam-outline">Camera</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Original Price (PKR)</label>
                                    <input type="number" name="edit_orig_price" id="editOrigPrice" required>
                                </div>
                                <div class="form-group">
                                    <label>Discounted Current Price (PKR)</label>
                                    <input type="number" name="edit_curr_price" id="editCurrPrice" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Meta Title (SEO)</label>
                                    <input type="text" name="edit_meta_title" id="editMetaTitle" placeholder="e.g. 4G SIM Camera Pakistan | S M Enterprises">
                                </div>
                                <div class="form-group">
                                    <label>Focus Keywords (Separated by commas)</label>
                                    <input type="text" name="edit_focus_keywords" id="editFocusKeywords" placeholder="e.g. 4g sim camera, solar camera pakistan">
                                </div>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Meta Description (SEO)</label>
                                <textarea name="edit_meta_desc" id="editMetaDesc" rows="2" placeholder="Describe how this page should appear on Google Search..."></textarea>
                            </div>
                            
                            <!-- Product Image Source (Edit) -->
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Product Image Source</label>
                                <div class="image-source-tabs">
                                    <button type="button" class="image-tab-btn edit-image-tab active" id="edit_tab_file" onclick="switchImageTab('file', 'edit')">
                                        <ion-icon name="cloud-upload-outline"></ion-icon> Upload File
                                    </button>
                                    <button type="button" class="image-tab-btn edit-image-tab" id="edit_tab_camera" onclick="switchImageTab('camera', 'edit')">
                                        <ion-icon name="camera-outline"></ion-icon> Take Live Photo
                                    </button>
                                    <button type="button" class="image-tab-btn edit-image-tab" id="edit_tab_link" onclick="switchImageTab('link', 'edit')">
                                        <ion-icon name="link-outline"></ion-icon> Image Link / SVG
                                    </button>
                                </div>
                                
                                <div class="tab-content-pane edit-image-pane active" id="edit_pane_file">
                                    <div class="file-upload-wrapper">
                                        <input type="file" name="edit_image_file" accept="image/*,video/*" onchange="previewUpload(this, 'edit_file_preview_img')">
                                        <div class="file-upload-info" id="edit_file_info">
                                            <ion-icon name="document-attach-outline"></ion-icon>
                                            <p>Apni device se photo ya video upload karein</p>
                                            <span style="font-size:11px; color:#64748b;">Supported: JPG, PNG, WEBP, MP4, MOV, WEBM</span>
                                        </div>
                                        <div class="file-preview-container" style="margin-top: 10px; text-align: center;">
                                            <img id="edit_file_preview_img" src="" style="max-height: 120px; border-radius: 6px; display: none;">
                                            <video id="edit_file_preview_video" src="" style="max-height: 120px; border-radius: 6px; display: none;" autoplay muted loop></video>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-content-pane edit-image-pane" id="edit_pane_camera">
                                    <input type="hidden" name="edit_image_base64" id="edit_image_base64">
                                    <div class="camera-feed-container">
                                        <div id="edit_camera_placeholder" style="text-align: center; padding: 20px; color: #94a3b8;">
                                            <ion-icon name="videocam-off-outline" style="font-size: 48px; color: #475569; margin-bottom: 10px;"></ion-icon>
                                            <p>Camera off hai. Shuru karne ke liye niche button dabayein.</p>
                                        </div>
                                        <video id="edit_camera_video" class="camera-video" style="display: none;" autoplay playsinline></video>
                                        <img id="edit_camera_video_preview" class="camera-preview" src="" style="display: none;">
                                        <canvas id="edit_camera_canvas" style="display: none;"></canvas>
                                        
                                        <div class="camera-controls">
                                            <button type="button" class="btn-submit" id="edit_camera_video_start_btn" style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; box-shadow: none;" onclick="startCamera('edit_camera_video', 'edit_camera_placeholder')">
                                                <ion-icon name="videocam-outline" style="margin-right:5px; vertical-align:middle;"></ion-icon> Open Camera
                                            </button>
                                            <button type="button" class="btn-submit" id="edit_camera_video_capture_btn" style="display: none;" onclick="captureSnapshot('edit_camera_video', 'edit_camera_canvas', 'edit_image_base64')">
                                                <ion-icon name="camera-outline" style="margin-right:5px; vertical-align:middle;"></ion-icon> Capture Photo
                                            </button>
                                            <button type="button" class="btn-submit" id="edit_camera_video_retake_btn" style="display: none; background: #475569; box-shadow: none;" onclick="startCamera('edit_camera_video', 'edit_camera_placeholder')">
                                                <ion-icon name="refresh-outline" style="margin-right:5px; vertical-align:middle;"></ion-icon> Retake Photo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-content-pane edit-image-pane" id="edit_pane_link">
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label>Image URL (Optional - Leave blank to use premium vectors)</label>
                                        <input type="text" name="edit_image" id="editImage" placeholder="images/speaker.webp">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Multiple Gallery Images -->
                            <div class="form-group" style="grid-column: span 2; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                                <label>YouTube Video Link (Optional - Seamless Auto-play)</label>
                                <input type="text" name="edit_youtube_url" id="editYoutubeUrl" placeholder="e.g. https://www.youtube.com/watch?v=xxxxx" style="margin-bottom: 15px;">

                                <label>Product Gallery Images (Optional - Upload More)</label>
                                
                                <div id="edit_gallery_wrapper" style="margin-bottom: 15px; display: none; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                    <label style="color: #cbd5e1; font-size: 13px; margin-bottom: 10px; display: block; font-weight: 600;">Current Gallery Images (Click <ion-icon name="close-circle" style="color:#ef4444; vertical-align:middle;"></ion-icon> to remove):</label>
                                    <div id="edit_current_gallery" style="display: flex; gap: 12px; flex-wrap: wrap;"></div>
                                </div>

                                <div class="file-upload-wrapper" style="border-style: dashed; padding: 15px;">
                                    <input type="file" name="edit_gallery_files[]" multiple accept="image/*,video/*" onchange="previewMultipleUploads(this, 'edit_gallery_preview')">
                                    <div class="file-upload-info">
                                        <ion-icon name="images-outline"></ion-icon>
                                        <p>Nayi tasveerein select karein (Current gallery me add ho jayengi)</p>
                                        <span style="font-size:11px; color:#64748b;">Supported: JPG, PNG, WEBP</span>
                                    </div>
                                    <div id="edit_gallery_preview" style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;"></div>
                                </div>
                            </div>
                            
                            <div style="display:flex; gap:10px;">
                                <button type="submit" name="edit_gadget" class="btn-submit">Update Gadget</button>
                                <button type="button" class="btn-submit" style="background:#475569; box-shadow:none;" onclick="document.getElementById('editBlock').style.display='none'">Cancel</button>
                            </div>
                        </form>
                    </div>

                    <!-- Add New Gadget Form -->
                    <div class="panel-title" style="margin-top: 40px; margin-bottom: 20px;">
                        <h3><ion-icon name="add-circle"></ion-icon> Add New Smart Tech Product</h3>
                    </div>
                    <form method="POST" enctype="multipart/form-data">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Product Name</label>
                                <input type="text" name="gadget_name" placeholder="e.g. Premium Wireless Mic" required>
                            </div>
                            <div class="form-group">
                                <label>Status Tag (e.g. Best Seller, Special Offer)</label>
                                <input type="text" name="gadget_tag" placeholder="e.g. Best Seller">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Category (Product Page par dikhega)</label>
                                <select name="category" style="width:100%; padding:10px 14px; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#e2e8f0; font-size:14px;">
                                    <option value="4g-cameras">4G SIM Cameras</option>
                                    <option value="solar-cameras">Solar Cameras</option>
                                    <option value="wifi-cameras">WiFi Cameras</option>
                                    <option value="cctv-systems">Wireless IP Kits / CCTV Systems</option>
                                    <option value="wireless-mics">Wireless Microphones</option>
                                    <option value="speakers">Bluetooth Speakers</option>
                                    <option value="accessories">Smart Accessories</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Homepage par dikhana?</label>
                                <select name="homepage_show" style="width:100%; padding:10px 14px; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#e2e8f0; font-size:14px;">
                                    <option value="0">Nahi — Sirf Category Page par</option>
                                    <option value="1">Haan — Homepage Store Grid mein bhi</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Product Description</label>
                            <textarea name="gadget_desc" placeholder="Product ke bare me detailed short features..." rows="3" required></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Page Layout Template</label>
                                <select name="layout_type" id="addLayoutType" style="width:100%; padding:10px 14px; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#e2e8f0; font-size:14px;" onchange="toggleHeroFields('add')">
                                    <option value="standard">Standard Default</option>
                                    <option value="hero_immersive">Immersive Hero (Like Homepage)</option>
                                    <option value="nature_immersive">Nature Immersive (Wildlife)</option>
                                </select>
                            </div>
                        </div>

                        <div id="addHeroFields" style="display:none; padding:20px; background:rgba(0,0,0,0.2); border-radius:10px; margin-bottom:20px; border:1px solid rgba(0, 243, 255, 0.2);">
                            <h4 style="color:#00f3ff; margin-bottom:15px; margin-top:0;">Hero Layout Settings</h4>
                            <div class="form-group">
                                <label>Top Badges (Comma separated, max 3)</label>
                                <input type="text" name="hero_badges" placeholder="e.g. PTA Approved, 4G LTE, 100% Wire-Free">
                            </div>
                            <div class="form-group">
                                <label>Feature Bullets (One per line)</label>
                                <textarea name="hero_bullets" rows="3" placeholder="2K 4MP Super HD&#10;355° Pan & 140° Tilt..."></textarea>
                            </div>
                            <div class="form-group" style="display:flex; align-items:center; gap:10px;">
                                <input type="checkbox" name="hero_show_rain" id="addHeroRain" value="on">
                                <label for="addHeroRain" style="margin:0;">Enable Rain / Weatherproof Effect</label>
                            </div>
                            
                            <label>Floating Tags (Leave text empty to skip)</label>
                            <div class="form-row" style="margin-top:10px;">
                                <div class="form-group"><input type="text" name="hero_tag_text[]" placeholder="Tag 1 Text (e.g. 4G LTE)"><select name="hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                <div class="form-group"><input type="text" name="hero_tag_text[]" placeholder="Tag 2 Text"><select name="hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="water-outline">Water</option><option value="cellular-outline">Cellular</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group"><input type="text" name="hero_tag_text[]" placeholder="Tag 3 Text"><select name="hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="battery-charging-outline">Battery</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                <div class="form-group"><input type="text" name="hero_tag_text[]" placeholder="Tag 4 Text"><select name="hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="shield-checkmark-outline">Shield</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group"><input type="text" name="hero_tag_text[]" placeholder="Tag 5 Text"><select name="hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="flash-outline">Flash</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="videocam-outline">Camera</option><option value="star-outline">Star</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                                <div class="form-group"><input type="text" name="hero_tag_text[]" placeholder="Tag 6 Text"><select name="hero_tag_icon[]" class="hero-icon-select" style="width:100%; padding:8px 10px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:5px; color:#e2e8f0; font-size:13px; margin-top:5px;"><option value="videocam-outline">Camera</option><option value="cellular-outline">Cellular</option><option value="water-outline">Water</option><option value="battery-charging-outline">Battery</option><option value="shield-checkmark-outline">Shield</option><option value="star-outline">Star</option><option value="flash-outline">Flash</option><option value="wifi-outline">WiFi</option><option value="moon-outline">Moon/Night</option></select></div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Original Price (PKR)</label>
                                <input type="number" name="gadget_orig_price" placeholder="7500" required>
                            </div>
                            <div class="form-group">
                                <label>Current Offer Price (PKR)</label>
                                <input type="number" name="gadget_curr_price" placeholder="4999" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Meta Title (SEO)</label>
                                <input type="text" name="gadget_meta_title" placeholder="e.g. 4G SIM Camera Pakistan | S M Enterprises">
                            </div>
                            <div class="form-group">
                                <label>Focus Keywords (Separated by commas)</label>
                                <input type="text" name="gadget_focus_keywords" placeholder="e.g. 4g sim camera, solar camera pakistan">
                            </div>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Meta Description (SEO)</label>
                            <textarea name="gadget_meta_desc" rows="2" placeholder="Describe how this page should appear on Google Search..."></textarea>
                        </div>
                        
                        <!-- Product Image Source (Add) -->
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Product Image Source</label>
                            <div class="image-source-tabs">
                                <button type="button" class="image-tab-btn add-image-tab active" id="add_tab_file" onclick="switchImageTab('file', 'add')">
                                    <ion-icon name="cloud-upload-outline"></ion-icon> Upload File
                                </button>
                                <button type="button" class="image-tab-btn add-image-tab" id="add_tab_camera" onclick="switchImageTab('camera', 'add')">
                                    <ion-icon name="camera-outline"></ion-icon> Take Live Photo
                                </button>
                                <button type="button" class="image-tab-btn add-image-tab" id="add_tab_link" onclick="switchImageTab('link', 'add')">
                                    <ion-icon name="link-outline"></ion-icon> Image Link / SVG
                                </button>
                            </div>
                            
                            <div class="tab-content-pane add-image-pane active" id="add_pane_file">
                                <div class="file-upload-wrapper">
                                    <input type="file" name="gadget_image_file" accept="image/*,video/*" onchange="previewUpload(this, 'add_file_preview_img')">
                                    <div class="file-upload-info" id="add_file_info">
                                        <ion-icon name="document-attach-outline"></ion-icon>
                                        <p>Apni device se photo ya video upload karein</p>
                                        <span style="font-size:11px; color:#64748b;">Supported: JPG, PNG, WEBP, MP4, MOV, WEBM</span>
                                    </div>
                                    <div class="file-preview-container" style="margin-top: 10px; text-align: center;">
                                        <img id="add_file_preview_img" src="" style="max-height: 120px; border-radius: 6px; display: none;">
                                        <video id="add_file_preview_video" src="" style="max-height: 120px; border-radius: 6px; display: none;" autoplay muted loop></video>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tab-content-pane add-image-pane" id="add_pane_camera">
                                <input type="hidden" name="gadget_image_base64" id="add_gadget_image_base64">
                                <div class="camera-feed-container">
                                    <div id="add_camera_placeholder" style="text-align: center; padding: 20px; color: #94a3b8;">
                                        <ion-icon name="videocam-off-outline" style="font-size: 48px; color: #475569; margin-bottom: 10px;"></ion-icon>
                                        <p>Camera off hai. Shuru karne ke liye niche button dabayein.</p>
                                    </div>
                                    <video id="add_camera_video" class="camera-video" style="display: none;" autoplay playsinline></video>
                                    <img id="add_camera_video_preview" class="camera-preview" src="" style="display: none;">
                                    <canvas id="add_camera_canvas" style="display: none;"></canvas>
                                    
                                    <div class="camera-controls">
                                        <button type="button" class="btn-submit" id="add_camera_video_start_btn" style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; box-shadow: none;" onclick="startCamera('add_camera_video', 'add_camera_placeholder')">
                                            <ion-icon name="videocam-outline" style="margin-right:5px; vertical-align:middle;"></ion-icon> Open Camera
                                        </button>
                                        <button type="button" class="btn-submit" id="add_camera_video_capture_btn" style="display: none;" onclick="captureSnapshot('add_camera_video', 'add_camera_canvas', 'add_gadget_image_base64')">
                                            <ion-icon name="camera-outline" style="margin-right:5px; vertical-align:middle;"></ion-icon> Capture Photo
                                        </button>
                                        <button type="button" class="btn-submit" id="add_camera_video_retake_btn" style="display: none; background: #475569; box-shadow: none;" onclick="startCamera('add_camera_video', 'add_camera_placeholder')">
                                            <ion-icon name="refresh-outline" style="margin-right:5px; vertical-align:middle;"></ion-icon> Retake Photo
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tab-content-pane add-image-pane" id="add_pane_link">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label>Image URL (Optional - Khali chornay par default icon load hoga)</label>
                                    <input type="text" name="gadget_image" placeholder="e.g. images/mic.webp">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Multiple Gallery Images & YouTube -->
                        <div class="form-group" style="grid-column: span 2; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                            <label>YouTube Video Link (Optional - Seamless Auto-play)</label>
                            <input type="text" name="gadget_youtube_url" placeholder="e.g. https://www.youtube.com/watch?v=xxxxx" style="margin-bottom: 15px;">
                            
                            <label>Product Gallery Images (Optional - Multiple Allowed)</label>
                            <div class="file-upload-wrapper" style="border-style: dashed; padding: 15px;">
                                <input type="file" name="gadget_gallery_files[]" multiple accept="image/*,video/*" onchange="previewMultipleUploads(this, 'add_gallery_preview')">
                                <div class="file-upload-info">
                                    <ion-icon name="images-outline"></ion-icon>
                                    <p>Ek se zyada tasveerein select karein</p>
                                    <span style="font-size:11px; color:#64748b;">Supported: JPG, PNG, WEBP</span>
                                </div>
                                <div id="add_gallery_preview" style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;"></div>
                            </div>
                        </div>
                        
                        <button type="submit" name="add_gadget" class="btn-submit">Add Product to Store</button>
                    </form>
                </div>

                <!-- Tab: Page SEO Editor -->
                <div class="panel" id="tab-page-seo">
                    <div class="panel-title">
                        <h3><ion-icon name="globe"></ion-icon> Static Pages SEO Editor</h3>
                    </div>
                    <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
                        <div class="form-group">
                            <label>Select Page to Edit</label>
                            <select name="seo_page" id="seoPageSelect" onchange="loadPageSeoData(this.value)" class="form-control" style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; margin-bottom: 20px; font-size: 15px;">
                                <option value="">-- Choose a Page --</option>
                                <?php foreach ($allowedSeoPages as $pageKey => $pageName): ?>
                                    <option value="<?= htmlspecialchars($pageKey) ?>"><?= htmlspecialchars($pageName) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div id="seoFormFields" style="display: none;">
                            <div class="form-group">
                                <label>Meta Title (Google tab & search results title)</label>
                                <input type="text" name="seo_title" id="seoTitleInput" placeholder="Enter Page Title" required style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label>Focus Keywords (separated by commas)</label>
                                <input type="text" name="seo_keywords" id="seoKeywordsInput" placeholder="e.g. 4g camera, solar security camera pakistan" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label>Meta Description (Google search snippet text)</label>
                                <textarea name="seo_desc" id="seoDescInput" rows="4" placeholder="Enter meta description..." required style="width:100%;"></textarea>
                            </div>
                            <button type="submit" name="save_page_seo" class="btn-submit">Save Page SEO Settings</button>
                        </div>
                    </form>
                </div>

                <!-- Tab 3: Contact Info -->
                <div class="panel" id="tab-contact">
                    <div class="panel-title">
                        <h3><ion-icon name="business"></ion-icon> Contact Settings & Info</h3>
                    </div>
                    <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
                        <!-- Camera Prices submitted as hidden inputs -->
                        <input type="hidden" name="price_solar" value="<?= htmlspecialchars($cmsData['prices']['solar']) ?>">
                        <input type="hidden" name="price_no_solar" value="<?= htmlspecialchars($cmsData['prices']['no_solar']) ?>">
                        <input type="hidden" name="video_construction" value="<?= htmlspecialchars($cmsData['videos']['construction'] ?? '') ?>">
                        <input type="hidden" name="video_farm" value="<?= htmlspecialchars($cmsData['videos']['farm'] ?? '') ?>">
                        <input type="hidden" name="video_logistics" value="<?= htmlspecialchars($cmsData['videos']['logistics'] ?? '') ?>">

                        <div class="form-row">
                            <div class="form-group">
                                <label>Official Phone Number</label>
                                <input type="text" name="phone" value="<?= htmlspecialchars($cmsData['contact']['phone']) ?>" required>
                            </div>
                            <div class="form-group">
                                <label>WhatsApp Contact Number</label>
                                <input type="text" name="whatsapp" value="<?= htmlspecialchars($cmsData['contact']['whatsapp']) ?>" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Official Support Email Address</label>
                            <input type="email" name="email" value="<?= htmlspecialchars($cmsData['contact']['email']) ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Physical Address (Dera / Showroom Location)</label>
                            <input type="text" name="address" value="<?= htmlspecialchars($cmsData['contact']['address']) ?>" required>
                        </div>
                        
                        <button type="submit" name="save_settings" class="btn-submit">Save Contact Details</button>
                    </form>
                </div>

                <!-- Tab 4: Videos -->
                <div class="panel" id="tab-videos">
                    <div class="panel-title">
                        <h3><ion-icon name="videocam"></ion-icon> Banner & Use-case Video Settings</h3>
                    </div>
                    <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
                        <!-- Camera Prices and Contact submitted as hidden inputs -->
                        <input type="hidden" name="price_solar" value="<?= htmlspecialchars($cmsData['prices']['solar']) ?>">
                        <input type="hidden" name="price_no_solar" value="<?= htmlspecialchars($cmsData['prices']['no_solar']) ?>">
                        <input type="hidden" name="phone" value="<?= htmlspecialchars($cmsData['contact']['phone']) ?>">
                        <input type="hidden" name="whatsapp" value="<?= htmlspecialchars($cmsData['contact']['whatsapp']) ?>">
                        <input type="hidden" name="email" value="<?= htmlspecialchars($cmsData['contact']['email']) ?>">
                        <input type="hidden" name="address" value="<?= htmlspecialchars($cmsData['contact']['address']) ?>">

                        <div class="form-group">
                            <label>Construction Sites Video Path / File</label>
                            <input type="text" name="video_construction" value="<?= htmlspecialchars($cmsData['videos']['construction'] ?? '') ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Farms & Agriculture Video Path / File</label>
                            <input type="text" name="video_farm" value="<?= htmlspecialchars($cmsData['videos']['farm'] ?? '') ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Logistics & Warehouse Video Path / Youtube Link</label>
                            <input type="text" name="video_logistics" value="<?= htmlspecialchars($cmsData['videos']['logistics'] ?? '') ?>" required>
                        </div>
                        
                        <button type="submit" name="save_settings" class="btn-submit">Update Video Configurations</button>
                    </form>
                </div>

                <!-- Tab 5: Security -->
                <div class="panel" id="tab-security">
                    <div class="panel-title">
                        <h3><ion-icon name="lock-closed"></ion-icon> Change Administrative Password</h3>
                    </div>
                    <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generateCsrfToken()) ?>">
                        <div class="form-group">
                            <label>Current Password</label>
                            <input type="password" name="curr_pass" placeholder="Enter current password" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>New Password (min 6 characters)</label>
                                <input type="password" name="new_pass" placeholder="Enter new password" required>
                            </div>
                            <div class="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" name="confirm_pass" placeholder="Repeat new password" required>
                            </div>
                        </div>
                        
                        <button type="submit" name="change_password" class="btn-submit">Update Admin Password</button>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <script>
        const pagesSeoData = <?php echo json_encode($pagesSeoData); ?>;

        function loadPageSeoData(pageKey) {
            const container = document.getElementById('seoFormFields');
            if (!pageKey || !pagesSeoData[pageKey]) {
                container.style.display = 'none';
                return;
            }
            
            const data = pagesSeoData[pageKey];
            document.getElementById('seoTitleInput').value = data.title || '';
            document.getElementById('seoKeywordsInput').value = data.keywords || '';
            document.getElementById('seoDescInput').value = data.desc || '';
            container.style.display = 'block';
        }

        let currentStream = null;

        function switchTab(tabId, element) {
            // Remove active classes
            document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and panel
            element.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
            
            // Save active tab state
            localStorage.setItem('adminActiveTab', tabId);
            
            // Close edit block if switching tab and stop camera
            document.getElementById('editBlock').style.display = 'none';
            stopCamera();
        }

        // Restore tab state on page load
        document.addEventListener('DOMContentLoaded', () => {
            const activeTab = localStorage.getItem('adminActiveTab');
            if (activeTab) {
                const btn = Array.from(document.querySelectorAll('.menu-btn')).find(el => {
                    const onclick = el.getAttribute('onclick');
                    return onclick && onclick.includes(`switchTab('${activeTab}'`);
                });
                if (btn) {
                    switchTab(activeTab, btn);
                }
            }
        });

        function switchImageTab(mode, formType) {
            document.querySelectorAll(`.${formType}-image-tab`).forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll(`.${formType}-image-pane`).forEach(pane => pane.classList.remove('active'));
            
            document.getElementById(`${formType}_tab_${mode}`).classList.add('active');
            document.getElementById(`${formType}_pane_${mode}`).classList.add('active');
            
            if (mode !== 'camera') {
                stopCamera();
            }
        }

        function previewUpload(input, imgPreviewId) {
            const file = input.files[0];
            if (file) {
                const fileType = file.type;
                const reader = new FileReader();
                const isVideo = fileType.startsWith('video/');
                const imgPreview = document.getElementById(imgPreviewId);
                const videoPreview = document.getElementById(imgPreviewId.replace('_img', '_video'));
                const infoDiv = document.getElementById(imgPreviewId.replace('_preview_img', '_info'));
                
                reader.onload = function(e) {
                    if (isVideo) {
                        imgPreview.style.display = 'none';
                        videoPreview.src = e.target.result;
                        videoPreview.style.display = 'block';
                    } else {
                        videoPreview.style.display = 'none';
                        imgPreview.src = e.target.result;
                        imgPreview.style.display = 'block';
                    }
                    if (infoDiv) {
                        infoDiv.style.display = 'none';
                    }
                };
                reader.readAsDataURL(file);
            }
        }

        function previewMultipleUploads(input, previewContainerId) {
            const container = document.getElementById(previewContainerId);
            container.innerHTML = '';
            const files = input.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    const isVideo = file.type.startsWith('video/');
                    reader.onload = function(e) {
                        if (isVideo) {
                            const video = document.createElement('video');
                            video.src = e.target.result;
                            video.style.height = '60px';
                            video.style.borderRadius = '4px';
                            video.style.border = '1px solid rgba(255,255,255,0.2)';
                            video.autoplay = true;
                            video.muted = true;
                            video.loop = true;
                            container.appendChild(video);
                        } else {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.style.height = '60px';
                            img.style.borderRadius = '4px';
                            img.style.border = '1px solid rgba(255,255,255,0.2)';
                            container.appendChild(img);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        }

        async function startCamera(videoElementId, placeholderId) {
            stopCamera();
            try {
                const constraints = {
                    video: {
                        facingMode: { ideal: "environment" }
                    },
                    audio: false
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                currentStream = stream;
                const video = document.getElementById(videoElementId);
                video.srcObject = stream;
                video.play();
                
                video.style.display = 'block';
                document.getElementById(videoElementId + '_preview').style.display = 'none';
                document.getElementById(placeholderId).style.display = 'none';
                
                document.getElementById(videoElementId + '_start_btn').style.display = 'none';
                document.getElementById(videoElementId + '_capture_btn').style.display = 'inline-flex';
                document.getElementById(videoElementId + '_retake_btn').style.display = 'none';
            } catch (err) {
                alert("Camera start karne me masla pesh aya: " + err.message + "\nBaraye meharbani HTTPS aur camera permissions check karein.");
            }
        }

        function stopCamera() {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }
        }

        function captureSnapshot(videoElementId, canvasElementId, hiddenInputId) {
            const video = document.getElementById(videoElementId);
            const canvas = document.getElementById(canvasElementId);
            const preview = document.getElementById(videoElementId + '_preview');
            
            if (!video.srcObject) return;
            
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            document.getElementById(hiddenInputId).value = dataUrl;
            
            preview.src = dataUrl;
            preview.style.display = 'block';
            video.style.display = 'none';
            
            stopCamera();
            
            document.getElementById(videoElementId + '_capture_btn').style.display = 'none';
            document.getElementById(videoElementId + '_retake_btn').style.display = 'inline-flex';
        }

        function toggleHeroFields(type) {
            const layoutType = document.getElementById(type + 'LayoutType').value;
            const heroFields = document.getElementById(type + 'HeroFields');
            if (layoutType === 'hero_immersive') {
                heroFields.style.display = 'block';
            } else {
                heroFields.style.display = 'none';
            }
        }

        function openEditForm(idx, gadget) {
            document.getElementById('editIndex').value = idx;
            document.getElementById('editName').value = gadget.name;
            document.getElementById('editDesc').value = gadget.desc;
            document.getElementById('editOrigPrice').value = gadget.orig_price;
            document.getElementById('editCurrPrice').value = gadget.curr_price;
            document.getElementById('editTag').value = gadget.tag || '';
            document.getElementById('editImage').value = gadget.image || '';
            document.getElementById('editYoutubeUrl').value = gadget.youtube_url || '';
            
            // Populate Hero Layout Fields
            document.getElementById('editLayoutType').value = gadget.layout_type || 'standard';
            toggleHeroFields('edit');
            
            document.getElementById('editHeroBadges').value = (gadget.hero_badges || []).join(', ');
            document.getElementById('editHeroBullets').value = (gadget.hero_bullets || []).join('\n');
            document.getElementById('editHeroRain').checked = gadget.hero_show_rain === true || gadget.hero_show_rain === 'on';
            
            const editTagTexts = document.querySelectorAll('input[name="edit_hero_tag_text[]"]');
            const editTagIcons = document.querySelectorAll('select[name="edit_hero_tag_icon[]"]');
            editTagTexts.forEach(el => el.value = '');
            if (gadget.hero_floating_tags) {
                gadget.hero_floating_tags.forEach((tag, i) => {
                    if (editTagTexts[i]) editTagTexts[i].value = tag.text || '';
                    if (editTagIcons[i]) editTagIcons[i].value = tag.icon || 'star-outline';
                });
            }
            
            // Populate SEO Fields
            document.getElementById('editMetaTitle').value = gadget.meta_title || '';
            document.getElementById('editMetaDesc').value = gadget.meta_desc || '';
            document.getElementById('editFocusKeywords').value = gadget.focus_keywords || '';
            
            // Reset upload file elements
            document.querySelector('input[name="edit_image_file"]').value = '';
            document.getElementById('edit_file_preview_img').style.display = 'none';
            document.getElementById('edit_file_preview_video').style.display = 'none';
            document.getElementById('edit_file_info').style.display = 'block';
            
            // Reset camera elements
            stopCamera();
            document.getElementById('edit_image_base64').value = '';
            document.getElementById('edit_camera_video_preview').style.display = 'none';
            document.getElementById('edit_camera_video').style.display = 'none';
            document.getElementById('edit_camera_placeholder').style.display = 'block';
            document.getElementById('edit_camera_video_start_btn').style.display = 'inline-flex';
            document.getElementById('edit_camera_video_capture_btn').style.display = 'none';
            document.getElementById('edit_camera_video_retake_btn').style.display = 'none';
            
            // Populate current gallery
            const galleryContainer = document.getElementById('edit_current_gallery');
            galleryContainer.innerHTML = '';
            // Clear any previously added hidden inputs for removed images
            document.querySelectorAll('input[name="remove_gallery_images[]"]').forEach(el => el.remove());
            
            if (gadget.gallery && gadget.gallery.length > 0) {
                gadget.gallery.forEach(imgUrl => {
                    const isVideo = imgUrl.endsWith('.mp4') || imgUrl.endsWith('.mov') || imgUrl.endsWith('.webm');
                    
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';
                    
                    let mediaEl = '';
                    if(isVideo) {
                        mediaEl = `<video src="../${imgUrl}" style="height: 65px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); object-fit: cover;" autoplay muted loop playsinline></video>`;
                    } else {
                        mediaEl = `<img src="../${imgUrl}" style="height: 65px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); object-fit: cover;">`;
                    }
                    
                    const removeBtn = `<button type="button" onclick="removeGalleryImage(this, '${imgUrl}')" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border: 2px solid #07080a; border-radius: 50%; width: 22px; height: 22px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.5); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';"><ion-icon name="close-outline"></ion-icon></button>`;
                    
                    wrapper.innerHTML = mediaEl + removeBtn;
                    galleryContainer.appendChild(wrapper);
                });
                document.getElementById('edit_gallery_wrapper').style.display = 'block';
            } else {
                document.getElementById('edit_gallery_wrapper').style.display = 'none';
            }
            document.querySelector('input[name="edit_gallery_files[]"]').value = '';
            document.getElementById('edit_gallery_preview').innerHTML = '';
            
            // Switch to Link tab by default (which contains the loaded image path)
            switchImageTab('link', 'edit');
            
            // Show the edit box
            document.getElementById('editBlock').style.display = 'block';
            
            // Scroll to the edit box
            document.getElementById('editBlock').scrollIntoView({ behavior: 'smooth' });
        }

        function removeGalleryImage(btn, imgUrl) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'remove_gallery_images[]';
            input.value = imgUrl;
            document.getElementById('edit_gallery_wrapper').appendChild(input);
            
            btn.parentElement.remove();
        }
    </script>
</body>
</html>
