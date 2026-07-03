<?php
ob_start();
$_SESSION['admin_logged_in'] = true;
require_once __DIR__ . '/index.php';
ob_end_clean();

$cmsData = json_decode(file_get_contents(__DIR__ . '/../cms_data.json'), true);
generateDynamicSitemap($cmsData);
echo "Dynamic sitemap built successfully!\n";
unlink(__DIR__ . '/temp_build.php'); // Clean up itself after execution
