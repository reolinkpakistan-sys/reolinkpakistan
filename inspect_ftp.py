import ftplib

# FTP Credentials
FTP_HOST = "147.93.78.148"
FTP_USER = "u233785535.reolink.com.pk"
FTP_PASS = "Letmein.9900"
FTP_PORT = 21

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
