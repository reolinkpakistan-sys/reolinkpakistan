#!/usr/bin/env python3
"""
One-click deploy for reolink.com.pk
Downloads latest files from GitHub main branch and uploads via FTP.
Usage:
    python3 deploy_live.py
Or one-liner:
    curl -fsSL -o deploy_live.py https://raw.githubusercontent.com/reolinkpakistan-sys/reolinkpakistan/main/deploy_live.py && FTP_PASS='your_password' python3 deploy_live.py
"""
import ftplib
import os
import sys
import tempfile
import time
import urllib.request

FTP_HOST = "147.93.78.148"
FTP_USER = "u233785535.reolink.com.pk"
FTP_PASS = os.environ.get("FTP_PASS", "")
FTP_PORT = 21
REPO_RAW = "https://raw.githubusercontent.com/reolinkpakistan-sys/reolinkpakistan/main"

if not FTP_PASS:
    print("Error: FTP_PASS environment variable is required.")
    print("Example: FTP_PASS='your_password' python3 deploy_live.py")
    sys.exit(1)

FILES = [
    ("index.html", "/public_html/index.html"),
    ("product-details.html", "/public_html/product-details.html"),
    ("go-pt-plus.html", "/public_html/go-pt-plus.html"),
    ("about.html", "/public_html/about.html"),
    ("contact.html", "/public_html/contact.html"),
    ("warranty.html", "/public_html/warranty.html"),
    ("cattle-farm-security.html", "/public_html/cattle-farm-security.html"),
    ("privacy-policy.html", "/public_html/privacy-policy.html"),
    ("category.html", "/public_html/category.html"),
    ("css/styles.css", "/public_html/css/styles.css"),
    ("js/script.js", "/public_html/js/script.js"),
    ("js/cms.js", "/public_html/js/cms.js"),
    ("js/conversion.js", "/public_html/js/conversion.js"),
    ("js/product-details.js", "/public_html/js/product-details.js"),
    ("js/category.js", "/public_html/js/category.js"),
    ("admin/index.php", "/public_html/admin/index.php"),
    ("admin/security.php", "/public_html/admin/security.php"),
    ("admin/config.php", "/public_html/admin/config.php"),
    ("api/capture-lead.php", "/public_html/api/capture-lead.php"),
    ("save_image.php", "/public_html/save_image.php"),
    ("cms_data.json", "/public_html/cms_data.json"),
    (".htaccess", "/public_html/.htaccess"),
    ("robots.txt", "/public_html/robots.txt"),
    ("sitemap.xml", "/public_html/sitemap.xml"),
]


def download_file(remote_path, local_path):
    url = f"{REPO_RAW}/{remote_path}"
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        with open(local_path, "wb") as f:
            f.write(resp.read())


def upload_with_fresh_connection(local_path, remote_path):
    remote_dir = os.path.dirname(remote_path)
    filename = os.path.basename(remote_path)

    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)

    try:
        ftp.cwd("/")
        if remote_dir != "/":
            for part in remote_dir.strip("/").split("/"):
                try:
                    ftp.cwd(part)
                except Exception:
                    ftp.mkd(part)
                    ftp.cwd(part)

        # Clean leftover temp file
        temp_name = f".in.{filename}."
        try:
            ftp.delete(temp_name)
        except Exception:
            pass

        with open(local_path, "rb") as f:
            ftp.storbinary(f"STOR {filename}", f)
    finally:
        try:
            ftp.quit()
        except Exception:
            pass


def deploy():
    print("Downloading latest files from GitHub...")
    tmpdir = tempfile.mkdtemp(prefix="reolink_deploy_")
    local_map = {}

    for repo_path, _ in FILES:
        local_path = os.path.join(tmpdir, repo_path)
        try:
            download_file(repo_path, local_path)
            local_map[repo_path] = local_path
            print(f"  OK: {repo_path}")
        except Exception as e:
            print(f"  FAIL download {repo_path}: {e}")
            sys.exit(1)

    print(f"\nUploading {len(FILES)} files to live server...")
    print("(This may take a few minutes. Each file uses a fresh FTP connection.)\n")

    success = 0
    failed = []

    for repo_path, remote_path in FILES:
        local_path = local_map[repo_path]
        for attempt in range(1, 4):
            try:
                upload_with_fresh_connection(local_path, remote_path)
                print(f"UPLOADED: {repo_path}")
                success += 1
                break
            except Exception as e:
                print(f"  FAIL {repo_path} (attempt {attempt}): {e}")
                if attempt == 3:
                    failed.append(repo_path)
                else:
                    time.sleep(3)

    print(f"\nDone. {success}/{len(FILES)} files uploaded successfully.")
    if failed:
        print(f"Failed files: {', '.join(failed)}")
        print("You can re-run the command to retry failed files.")
        sys.exit(1)


if __name__ == "__main__":
    print("=" * 60)
    print("Reolink Pakistan - One-Click Live Deploy")
    print("=" * 60)
    print("WARNING: Current FTP password is known to be leaked.")
    print("Rotate it via Hostinger as soon as possible.")
    print("=" * 60 + "\n")
    deploy()
