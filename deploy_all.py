import ftplib
import os
import sys
import time

FTP_HOST = os.environ.get("FTP_HOST", "147.93.78.148")
FTP_USER = os.environ.get("FTP_USER", "u233785535.reolink.com.pk")
FTP_PASS = os.environ.get("FTP_PASS", "")
FTP_PORT = int(os.environ.get("FTP_PORT", "21"))

LOCAL_ROOT = "/Users/MAC/Desktop/reolinkpakistan"
REMOTE_ROOT = "public_html"

def get_ftp_connection():
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    return ftp

def ensure_remote_dir(ftp, remote_dir):
    ftp.cwd('/')
    if not remote_dir or remote_dir in ['/', '.', '']:
        return
    parts = [p for p in remote_dir.replace('\\', '/').split('/') if p]
    for part in parts:
        try:
            ftp.cwd(part)
        except Exception:
            try:
                ftp.mkd(part)
                ftp.cwd(part)
            except Exception:
                ftp.cwd(part)

def reliable_upload(ftp_holder, local_path, remote_path):
    print(f"Uploading: {remote_path} ... ", end="", flush=True)
    file_name = os.path.basename(remote_path)
    remote_dir = os.path.dirname(remote_path)
    
    for attempt in range(1, 4):
        try:
            if ftp_holder['ftp'] is None:
                ftp_holder['ftp'] = get_ftp_connection()
            
            ftp = ftp_holder['ftp']
            ensure_remote_dir(ftp, remote_dir)
            
            # Clean leftover temporary files if any
            temp_file_name = f".in.{file_name}."
            try:
                ftp.delete(temp_file_name)
            except Exception:
                pass
                
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {file_name}', f, blocksize=32768)
                
            print("SUCCESS")
            return True
        except Exception as e:
            print(f"RETRY ({attempt}/3: {e}) ... ", end="", flush=True)
            if ftp_holder['ftp']:
                try:
                    ftp_holder['ftp'].close()
                except Exception:
                    pass
                ftp_holder['ftp'] = None
            if attempt < 3:
                time.sleep(2)
    print("FAILED")
    return False

def collect_files_to_deploy():
    # Explicit list of core files and directories
    deploy_list = []
    
    core_files = [
        "index.html",
        "jzones-v630.html",
        "best-car-dashcam-pakistan-guide.html",
        "category.html",
        "product-details.html",
        "go-pt-plus.html",
        "about.html",
        "contact.html",
        "warranty.html",
        "privacy-policy.html",
        "terms.html",
        "shipping.html",
        "returns.html",
        "cattle-farm-security.html",
        "pta-approval-guide.html",
        "solar-vs-wired-cctv.html",
        "farm-tube-well-security.html",
        "404.html",
        "sitemap.xml",
        "robots.txt",
        "llms.txt",
        "cms_data.json",
        ".htaccess",
        "router.php",
        "save_image.php",
        "favicon.ico",
        "css/styles.css",
        "css/styles.min.css",
        "css/jzones.css",
        "js/script.js",
        "js/cms.js",
        "js/category.js",
        "js/conversion.js",
        "js/jzones.js",
        "js/product-details.js",
        "admin/index.php",
        "admin/security.php",
        "admin/config.php",
        "api/capture-lead.php",
    ]
    
    for rel_path in core_files:
        loc = os.path.join(LOCAL_ROOT, rel_path)
        if os.path.exists(loc):
            rem = os.path.join(REMOTE_ROOT, rel_path).replace("\\", "/")
            deploy_list.append((loc, rem))
            
    # Include cities/
    cities_dir = os.path.join(LOCAL_ROOT, "cities")
    if os.path.isdir(cities_dir):
        for f in os.listdir(cities_dir):
            if f.endswith(".html"):
                loc = os.path.join(cities_dir, f)
                rem = f"{REMOTE_ROOT}/cities/{f}"
                deploy_list.append((loc, rem))

    # Include assets/jzones/
    jzones_assets = os.path.join(LOCAL_ROOT, "assets", "jzones")
    if os.path.isdir(jzones_assets):
        for f in os.listdir(jzones_assets):
            if not f.startswith("."):
                loc = os.path.join(jzones_assets, f)
                rem = f"{REMOTE_ROOT}/assets/jzones/{f}"
                deploy_list.append((loc, rem))
                
    # Include all product folders in images/products/
    images_products_dir = os.path.join(LOCAL_ROOT, "images", "products")
    if os.path.isdir(images_products_dir):
        for root, dirs, files_in_dir in os.walk(images_products_dir):
            for file_name in files_in_dir:
                if file_name.startswith(".") or file_name.endswith(".glb"):
                    continue
                loc = os.path.join(root, file_name)
                rel = os.path.relpath(loc, LOCAL_ROOT).replace("\\", "/")
                rem = f"{REMOTE_ROOT}/{rel}"
                deploy_list.append((loc, rem))

    # Include guide images and posters
    for g_img in ["images/guide-pta-approved.webp", "images/guide-solar-vs-wired.webp"]:
        loc = os.path.join(LOCAL_ROOT, g_img)
        if os.path.exists(loc):
            rem = f"{REMOTE_ROOT}/{g_img}"
            deploy_list.append((loc, rem))

    # Include images/posters/
    posters_dir = os.path.join(LOCAL_ROOT, "images", "posters")
    if os.path.isdir(posters_dir):
        for f in os.listdir(posters_dir):
            if not f.startswith("."):
                loc = os.path.join(posters_dir, f)
                rem = f"{REMOTE_ROOT}/images/posters/{f}"
                deploy_list.append((loc, rem))

    return deploy_list

def main():
    print("=== Starting Full Live Deployment to Reolink Pakistan ===")
    files = collect_files_to_deploy()
    print(f"Total items queued for upload: {len(files)}")
    
    ftp_holder = {'ftp': None}
    success_count = 0
    start_time = time.time()
    
    try:
        for local, remote in files:
            if reliable_upload(ftp_holder, local, remote):
                success_count += 1
    finally:
        if ftp_holder['ftp']:
            try:
                ftp_holder['ftp'].quit()
            except Exception:
                pass
                
    total_time = time.time() - start_time
    print(f"\n=== Deployment Completed in {total_time:.1f}s ===")
    print(f"Result: {success_count}/{len(files)} files successfully uploaded to live server.")

if __name__ == "__main__":
    main()
