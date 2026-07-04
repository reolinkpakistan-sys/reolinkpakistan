import ftplib
import os

# FTP Credentials — NEVER hardcode passwords. Use environment variables.
FTP_HOST = os.environ.get("FTP_HOST", "147.93.78.148")
FTP_USER = os.environ.get("FTP_USER", "u233785535.reolink.com.pk")
FTP_PASS = os.environ.get("FTP_PASS", "")
FTP_PORT = int(os.environ.get("FTP_PORT", "21"))

if not FTP_PASS:
    raise ValueError("FTP_PASS environment variable is required. Do not hardcode credentials.")

def main():
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        ftp.login(FTP_USER, FTP_PASS)
        print("Connected.")
        
        print("Root directory content:")
        ftp.retrlines('LIST')
        
        # Check for common web root names
        dirs = ftp.nlst()
        print(f"\nDirectories found: {dirs}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ftp.quit()

if __name__ == "__main__":
    main()
