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
    files = [
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/index.html", "/public_html/index.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/about.html", "/public_html/about.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/contact.html", "/public_html/contact.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/warranty.html", "/public_html/warranty.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/go-pt-plus.html", "/public_html/go-pt-plus.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/cattle-farm-security.html", "/public_html/cattle-farm-security.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/css/styles.min.css", "/public_html/css/styles.min.css"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/404.html", "/public_html/404.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/terms.html", "/public_html/terms.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/shipping.html", "/public_html/shipping.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/returns.html", "/public_html/returns.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/script.js", "/public_html/js/script.js"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/cms.js", "/public_html/js/cms.js"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/cms_data.json", "/public_html/cms_data.json"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/index.php", "/public_html/admin/index.php"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/robots.txt", "/public_html/robots.txt"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/sitemap.xml", "/public_html/sitemap.xml"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/favicon.ico", "/public_html/favicon.ico"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/images/favicon.png", "/public_html/images/favicon.png"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/images/favicon-32.png", "/public_html/images/favicon-32.png"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/product-details.html", "/public_html/product-details.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/category.html", "/public_html/category.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/product-details.js", "/public_html/js/product-details.js"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/category.js", "/public_html/js/category.js"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/js/conversion.js", "/public_html/js/conversion.js"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/privacy-policy.html", "/public_html/privacy-policy.html"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/.htaccess", "/public_html/.htaccess"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/security.php", "/public_html/admin/security.php"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/admin/config.php", "/public_html/admin/config.php"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/api/capture-lead.php", "/public_html/api/capture-lead.php"),
        ("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/save_image.php", "/public_html/save_image.php")
    ]
    
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
