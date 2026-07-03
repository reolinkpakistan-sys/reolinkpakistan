import ftplib
import os
import time

FTP_HOST = os.environ.get("FTP_HOST", "147.93.78.148")
FTP_USER = os.environ.get("FTP_USER", "u233785535.reolink.com.pk")
FTP_PASS = os.environ.get("FTP_PASS", "Letmein.9900")
FTP_PORT = int(os.environ.get("FTP_PORT", "21"))

def connect_ftp():
    for attempt in range(1, 6):
        try:
            ftp = ftplib.FTP()
            print(f"Connecting to FTP {FTP_HOST}:{FTP_PORT} (timeout 180s)...")
            ftp.connect(FTP_HOST, FTP_PORT, timeout=180)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            print(f"FTP connection attempt {attempt} failed: {e}. Retrying in 5 seconds...")
            time.sleep(5)
    raise Exception("Could not connect to FTP after 5 attempts.")

def create_remote_dir(ftp, dir_path):
    parts = dir_path.strip('/').split('/')
    current = ""
    for part in parts:
        if not part:
            continue
        current += "/" + part
        try:
            ftp.cwd(current)
        except:
            try:
                print(f"Creating remote directory: {current}")
                ftp.mkd(current)
            except Exception as e:
                pass

def get_remote_file_size(ftp, file_path):
    try:
        return ftp.size(file_path)
    except:
        return -1

def upload_file_with_retry(ftp_ref, local_file, remote_dir, file_name):
    local_size = os.path.getsize(local_file)
    
    for attempt in range(1, 6):
        try:
            # Check if FTP connection is still alive, otherwise reconnect
            try:
                ftp_ref[0].voidcmd("NOOP")
            except:
                print("\nFTP connection lost. Reconnecting...")
                ftp_ref[0] = connect_ftp()
                
            ftp = ftp_ref[0]
            create_remote_dir(ftp, remote_dir)
            ftp.cwd(remote_dir)
            
            remote_file_path = os.path.join(remote_dir, file_name).replace("\\", "/")
            remote_size = get_remote_file_size(ftp, remote_file_path)
            
            if local_size == remote_size:
                print(f"Skipping (Already Synced): {remote_file_path}")
                return True
                
            print(f"Uploading {local_file} ({local_size / 1024 / 1024:.2f} MB) [Attempt {attempt}/5]...", end="", flush=True)
            with open(local_file, 'rb') as f:
                # Use large blocksize (256 KB) for much faster upload on slow/high-latency lines
                ftp.storbinary(f'STOR {file_name}', f, blocksize=262144)
            print(" SUCCESS")
            return True
        except Exception as e:
            print(f" FAILED: {e}")
            if attempt < 5:
                print("Waiting 5 seconds before retrying...")
                time.sleep(5)
    return False

def sync_directory(ftp_ref, local_dir, remote_base):
    for root, dirs, files in os.walk(local_dir):
        rel_path = os.path.relpath(root, local_dir)
        if rel_path == ".":
            remote_dir = remote_base
        else:
            remote_dir = os.path.join(remote_base, rel_path).replace("\\", "/")

        for file_name in files:
            if file_name.startswith('.'):
                continue # Skip hidden files
            
            local_file = os.path.join(root, file_name)
            upload_file_with_retry(ftp_ref, local_file, remote_dir, file_name)

def main():
    print("--- Starting Media Assets Sync (FTP) ---")
    start_time = time.time()
    try:
        ftp = connect_ftp()
        ftp_ref = [ftp]

        # 1. Sync images directory recursively
        print("\n[Syncing Images Folder...]")
        sync_directory(ftp_ref, "/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/images", "/public_html/images")

        # 2. Sync videos directory recursively
        print("\n[Syncing Videos Folder...]")
        sync_directory(ftp_ref, "/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/videos", "/public_html/videos")

        # 3. Sync root video files
        print("\n[Syncing Root Video Files...]")
        root_videos = [
            "go_pt_plus_sample.mp4",
            "go_pt_plus_night_vision.mp4",
            "dha-site-sample.mov",
            "Chungi no 9_20260214155305_20260214155335_95270005CWT782UY_0..MP4",
            "Lutfabad Parking yard_20260319140007_20260319140019_95270005CVZW1D85_0..MP4"
        ]
        for f in root_videos:
            local_file = os.path.join("/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan", f)
            if os.path.exists(local_file):
                upload_file_with_retry(ftp_ref, local_file, "/public_html", f)

        # Close final connection
        try:
            ftp_ref[0].quit()
        except:
            pass
            
        print(f"\n--- Sync Completed Successfully in {time.time() - start_time:.1f}s ---")
    except Exception as e:
        print(f"\nCRITICAL SYNC ERROR: {e}")

if __name__ == "__main__":
    main()
