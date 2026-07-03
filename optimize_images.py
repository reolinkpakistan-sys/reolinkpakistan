import os
from PIL import Image

def convert_to_webp(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            filepath = os.path.join(directory, filename)
            try:
                img = Image.open(filepath)
                
                # Use high quality to satisfy user's requirement of "no quality compromise"
                webp_path = os.path.join(directory, os.path.splitext(filename)[0] + ".webp")
                img.save(webp_path, "webp", quality=90, method=6)
                print(f"Converted {filename} to {os.path.basename(webp_path)}")
            except Exception as e:
                print(f"Skipping {filename}: {e}")

if __name__ == "__main__":
    image_dir = "/Applications/XAMPP/xamppfiles/htdocs/reolinkpakistan/images/"
    convert_to_webp(image_dir)
