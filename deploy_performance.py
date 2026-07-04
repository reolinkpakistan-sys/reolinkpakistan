import ftplib
import os

# FTP Credentials — environment variables se read karo
FTP_HOST = os.environ.get("FTP_HOST", "147.93.78.148")
FTP_USER = os.environ.get("FTP_USER", "u233785535.reolink.com.pk")
FTP_PASS = os.environ.get("FTP_PASS", "")
FTP_PORT = int(os.environ.get("FTP_PORT", "21"))

if not FTP_PASS:
    raise ValueError("FTP_PASS environment variable is required. Do not hardcode credentials.")

def upload_file(ftp, local_path, remote_path):
    print(f"Uploading {local_path} to {remote_path}...")
    with open(local_path, 'rb') as f:
        ftp.storbinary(f'STOR {remote_path}', f)

def main():
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        ftp.login(FTP_USER, FTP_PASS)
        print("Connected to FTP.")

        # 1. Upload root files
        upload_file(ftp, "index.html", "index.html")

        # 2. Upload CSS updates
        upload_file(ftp, "css/styles.css", "css/styles.css")

        # 3. Upload JS updates
        upload_file(ftp, "js/script.js", "js/script.js")

        # 4. Upload all optimized WebP images
        img_dir = "images"
        for original_file in os.listdir(img_dir):
            if original_file.endswith(".webp"):
                local_img = os.path.join(img_dir, original_file)
                upload_file(ftp, local_img, f"images/{original_file}")

        print("\nDeployment Successful!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        ftp.quit()

if __name__ == "__main__":
    main()
