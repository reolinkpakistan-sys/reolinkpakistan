#!/usr/bin/env python3
"""
Convert large .mov videos to compressed .mp4 (H.264 + AAC).
Keeps original .mov files as backup.

Requires ffmpeg installed:
  macOS: brew install ffmpeg
  Ubuntu: sudo apt install ffmpeg

Usage:
  python3 scratch/convert_videos.py
"""
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path('.')
BACKUP_DIR = ROOT / 'videos' / 'original_mov_backup'
CRF = 28  # quality: lower = better/larger (23 default, 28 good web balance)
PRESET = 'fast'
MAX_HEIGHT = 1080


def find_mov_files():
    return sorted([p for p in ROOT.rglob('*.mov') if '.mov' in p.suffix.lower()])


def has_ffmpeg():
    return shutil.which('ffmpeg') is not None


def get_video_height(path):
    """Return video height using ffprobe if available."""
    ffprobe = shutil.which('ffprobe')
    if not ffprobe:
        return None
    try:
        out = subprocess.check_output([
            ffprobe, '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=height', '-of', 'csv=s=x:p=0', str(path)
        ], text=True).strip()
        return int(out)
    except Exception:
        return None


def convert_mov_to_mp4(mov_path):
    mp4_path = mov_path.with_suffix('.mp4')
    backup_path = BACKUP_DIR / mov_path.relative_to(ROOT)
    backup_path.parent.mkdir(parents=True, exist_ok=True)

    # Move original to backup, then convert in place
    shutil.move(str(mov_path), str(backup_path))

    height = get_video_height(backup_path)
    scale_filter = f"scale='if(gt(ih,{MAX_HEIGHT}),-2,{MAX_HEIGHT})':min(ih\,{MAX_HEIGHT})" if height and height > MAX_HEIGHT else None

    cmd = [
        'ffmpeg', '-y', '-i', str(backup_path),
        '-c:v', 'libx264', '-crf', str(CRF), '-preset', PRESET,
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
    ]
    if scale_filter:
        cmd += ['-vf', scale_filter]
    cmd += [str(mp4_path)]

    print(f"Converting: {mov_path}")
    subprocess.run(cmd, check=True)

    before = backup_path.stat().st_size
    after = mp4_path.stat().st_size
    saved = (1 - after / before) * 100
    print(f"  Saved: {before/1024/1024:.1f}MB -> {after/1024/1024:.1f}MB ({saved:.0f}% smaller)")
    return mp4_path


def update_html_references(mov_files):
    """Update any .mov references in HTML to .mp4 (if a .mp4 now exists)."""
    html_files = sorted(ROOT.rglob('*.html'))
    changed = []
    for html in html_files:
        text = html.read_text(encoding='utf-8')
        new_text = text
        for mov in mov_files:
            rel = str(mov.relative_to(ROOT)).replace('\\', '/')
            mp4_rel = str(mov.with_suffix('.mp4').relative_to(ROOT)).replace('\\', '/')
            if rel in new_text:
                new_text = new_text.replace(rel, mp4_rel)
        if new_text != text:
            html.write_text(new_text, encoding='utf-8')
            changed.append(str(html.relative_to(ROOT)))
    return changed


def main():
    if not has_ffmpeg():
        print("ERROR: ffmpeg is not installed.")
        print("Install it first:")
        print("  macOS: brew install ffmpeg")
        print("  Ubuntu/Debian: sudo apt install ffmpeg")
        print("  Windows: https://ffmpeg.org/download.html")
        sys.exit(1)

    mov_files = find_mov_files()
    if not mov_files:
        print("No .mov files found.")
        sys.exit(0)

    print(f"Found {len(mov_files)} .mov file(s)")
    converted = []
    for mov in mov_files:
        try:
            convert_mov_to_mp4(mov)
            converted.append(mov)
        except Exception as e:
            print(f"  FAILED: {mov} - {e}")

    if converted:
        changed_html = update_html_references(converted)
        if changed_html:
            print(f"Updated HTML references in: {', '.join(changed_html)}")
        print(f"Original .mov files moved to: {BACKUP_DIR}")


if __name__ == '__main__':
    main()
