# Video Optimization Notes

## Current State

- `videos/` folder total size: ~144 MB
- Only 3 videos are referenced by the site:
  - `videos/products/keen-ranger-pt/product-keen-ranger-pt-360-pt-1.mp4`
  - `videos/products/keen-ranger-pt/keen-ranger-pt-banner-1.mp4`
  - `videos/products/keen-ranger-pt/keen-ranger-pt-animal-detection.mp4`
- Largest unused videos (examples):
  - `videos/products/rlc-823a/zoom-5x.mp4` (~37 MB)
  - `videos/products/rlc-823a/zoom-5x-mobile.mp4` (~29 MB)
  - `videos/products/rlc-823a/weatherproof.mp4` (~25 MB)

## Recommendations

1. **Install ffmpeg** and compress the 3 referenced videos to 720p max:
   ```bash
   ffmpeg -i input.mp4 -vcodec h264 -acodec aac -crf 28 -preset fast -movflags +faststart output.mp4
   ```
2. **Move unused videos** to an offline archive or delete after confirming they are not needed.
3. **Consider YouTube/Vimeo embeds** for promotional videos to avoid self-hosting large files.
4. **Add `preload="metadata"`** to `<video>` tags so browsers do not download the full video on page load.

## Next Steps

This file is a placeholder for Phase 2 video work; actual compression is deferred until ffmpeg is installed or videos are offloaded to a hosting platform.
