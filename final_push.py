import ftplib
import os
import time

# FTP Credentials — NEVER hardcode passwords. Use environment variables.
FTP_HOST = os.environ.get("FTP_HOST", "147.93.78.148")
FTP_USER = os.environ.get("FTP_USER", "u233785535.reolink.com.pk")
FTP_PASS = os.environ.get("FTP_PASS", "")
FTP_PORT = int(os.environ.get("FTP_PORT", "21"))

if not FTP_PASS:
    raise ValueError("FTP_PASS environment variable is required. Do not hardcode credentials.")

def get_ftp_connection():
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    return ftp

def reliable_upload(ftp_holder, local_path, remote_path):
    print(f"Targeting: {remote_path} ... ", end="", flush=True)
    file_name = os.path.basename(remote_path)
    remote_dir = os.path.dirname(remote_path)
    
    # Try up to 3 attempts
    for attempt in range(1, 4):
        try:
            # 1. Establish connection if none exists
            if ftp_holder['ftp'] is None:
                ftp_holder['ftp'] = get_ftp_connection()
            
            ftp = ftp_holder['ftp']
            
            # 2. Navigate to directory
            if remote_dir and remote_dir != '/':
                parts = [p for p in remote_dir.split('/') if p]
                ftp.cwd('/')
                for part in parts:
                    try:
                        ftp.cwd(part)
                    except Exception:
                        try:
                            ftp.mkd(part)
                            ftp.cwd(part)
                        except Exception:
                            ftp.cwd(part)

            # 3. Clean up any leftover temporary hidden files
            temp_file_name = f".in.{file_name}."
            try:
                ftp.delete(temp_file_name)
            except Exception:
                pass
                
            # 4. Upload file in binary mode with standard 32KB block size
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {file_name}', f, blocksize=32768)
                
            print("SUCCESS")
            return True
            
        except Exception as e:
            print(f"FAIL: {e} (Attempt {attempt}/3). ", end="", flush=True)
            # Close connection so it gets re-established on next retry
            if ftp_holder['ftp']:
                try:
                    ftp_holder['ftp'].close()
                except Exception:
                    pass
                ftp_holder['ftp'] = None
            
            # If it failed, wait a bit before retrying
            if attempt < 3:
                print("Retrying connection... ", end="", flush=True)
                time.sleep(2)
                
    return False

def main():
    base_candidates = [
        os.path.abspath(os.path.dirname(__file__)),
        "/Users/MAC/Desktop/reolinkpakistan",
        "/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan"
    ]
    local_root = None
    for cand in base_candidates:
        if os.path.exists(os.path.join(cand, "index.html")):
            local_root = cand
            break
    if not local_root:
        local_root = os.getcwd()

    core_files = [
        "index.html",
        "jzones-v630.html",
        "product-details.html",
        "go-pt-plus.html",
        "category.html",
        "about.html",
        "contact.html",
        "warranty.html",
        "shipping.html",
        "returns.html",
        "terms.html",
        "privacy-policy.html",
        "404.html",
        "cattle-farm-security.html",
        "best-car-dashcam-pakistan-guide.html",
        "pta-approval-guide.html",
        "solar-vs-wired-cctv.html",
        "farm-tube-well-security.html",
        "cities/karachi.html",
        "cities/lahore.html",
        "cities/multan.html",
        "cities/islamabad-rawalpindi.html",
        "cities/peshawar.html",
        "cities/faisalabad.html",
        "css/styles.css",
        "css/styles.min.css",
        "css/jzones.css",
        "js/script.js",
        "js/cms.js",
        "js/conversion.js",
        "js/product-details.js",
        "js/category.js",
        "js/jzones.js",
        "admin/index.php",
        "admin/security.php",
        "admin/config.php",
        "admin/.htaccess",
        "api/capture-lead.php",
        "save_image.php",
        "cms_data.json",
        ".htaccess",
        "robots.txt",
        "sitemap.xml",
        "llms.txt",
        "favicon.ico",
        "images/favicon.png",
        "images/favicon-32.png"
    ]

    files = [(os.path.join(local_root, f), f"/public_html/{f}") for f in core_files if os.path.exists(os.path.join(local_root, f))]
    
    print("--- Starting SEO Deployment ---")
    start_time = time.time()
    success_count = 0
    
    # Store persistent connection in holder
    ftp_holder = {'ftp': None}
    
    try:
        for local, remote in files:
            success = reliable_upload(ftp_holder, local, remote)
            if success:
                success_count += 1
    finally:
        # Close connection at the end if it's open
        if ftp_holder['ftp']:
            try:
                ftp_holder['ftp'].quit()
            except Exception:
                pass
            
    end_time = time.time()
    print(f"\n--- Deployment Finished in {end_time - start_time:.1f}s ---")
    print(f"Status: {success_count}/{len(files)} files uploaded successfully.")

if __name__ == "__main__":
    main()
