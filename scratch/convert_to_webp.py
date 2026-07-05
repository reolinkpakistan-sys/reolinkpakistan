#!/usr/bin/env python3
"""
Convert PNG/JPG images under images/ to WebP.

Usage:
    python3 scratch/convert_to_webp.py           # convert missing WebP files
    python3 scratch/convert_to_webp.py --dry-run # list files that would be converted

Constraints:
    - Original files are never deleted.
    - WebP files are created next to their source files.
    - Existing WebP files are skipped.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Pillow is required. Install it with: python3 -m pip install Pillow"
    ) from exc


IMG_DIR = Path("images")
QUALITY = 85
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def convert_image(src: Path, dry_run: bool) -> bool:
    """Convert a single image to WebP. Returns True if a WebP was/would be created."""
    if src.suffix.lower() not in SUPPORTED_EXTENSIONS:
        return False

    out = src.with_suffix(".webp")
    if out.exists():
        return False

    if dry_run:
        print(f"Would create {out}")
        return True

    try:
        with Image.open(src) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
                img.save(out, "WEBP", quality=QUALITY, method=6)
            else:
                img = img.convert("RGB")
                img.save(out, "WEBP", quality=QUALITY, method=6)
        print(f"Created {out}")
        return True
    except Exception as exc:  # pragma: no cover - best-effort conversion
        print(f"Failed {src}: {exc}", file=sys.stderr)
        return False


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate WebP versions for PNG/JPG images under images/"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List files that would be converted without writing WebP files",
    )
    parser.add_argument(
        "--dir",
        type=Path,
        default=IMG_DIR,
        help=f"Directory to scan for images (default: {IMG_DIR})",
    )
    args = parser.parse_args()

    if not args.dir.is_dir():
        print(f"Directory not found: {args.dir}", file=sys.stderr)
        return 1

    count = 0
    for path in sorted(args.dir.rglob("*")):
        if path.is_file() and convert_image(path, dry_run=args.dry_run):
            count += 1

    action = "Would convert" if args.dry_run else "Converted"
    print(f"{action} {count} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
