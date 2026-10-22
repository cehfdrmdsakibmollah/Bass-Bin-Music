# Instagram Reels / YouTube Shorts MP4 Export (v0.6)

## Why an older BASS BIN MUSIC WebM was rejected by Instagram

Earlier Chrome exports were WebM containing VP9 video and Opus audio. Instagram Reels prefers/accepts MP4 or MOV with H.264/HEVC video and AAC audio. Merely renaming `.webm` to `.mp4` is **not** conversion.

## Create a new Instagram-ready video

1. In Studio select **Export video format → Instagram / Shorts MP4 · H.264 + AAC** (the default).
2. Set **Ratio → 9:16** and frame rate **30 fps**; output width **1080** produces 1080×1920. Choose **720** for slower devices.
3. Select **Export to device**. Studio records your canvas/audio first, then uses Mediabunny/WebCodecs to locally transcode to an H.264 AVC + AAC MP4 (30fps), and downloads `bass-bin-instagram-….mp4`.
4. Conversion happens on your device; no media leaves the browser. It can use substantial CPU/memory, especially for long 1080p videos. Do not close the tab while encoding.

## Convert a video you have already exported

In the right-hand Studio export panel select **Convert existing WebM to Instagram MP4**, choose the saved `.webm` file and download the new `-instagram.mp4` file. You do not need to re-edit or re-render the project.

## Compatibility and fallback

The MP4 encoder requires browser support for video encoding/decoding with WebCodecs. Mediabunny ships a fallback AAC encoder when native AAC encoding is missing. Desktop Chrome/Edge are recommended, but not guaranteed for all hardware or browsers.

If converting a new render fails, Studio downloads the original WebM as a **backup** and shows an explicit error message. **Never upload or rename that WebM backup as MP4.** On Windows, you can convert it using FFmpeg:

```powershell
ffmpeg -i "input.webm" -vf "fps=30,tpad=stop_mode=clone:stop_duration=2,setsar=1" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest "instagram-reel.mp4"
```

For videos at an aspect other than 9:16, use the Studio Ratio control before exporting rather than stretching afterwards.

**Copyright:** Only post music and clips you own or are licensed to use. MP4 compatibility doesn't override Meta's copyright/usage restrictions.
