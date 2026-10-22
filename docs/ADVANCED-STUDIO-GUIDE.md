# Advanced Studio v0.2 — quick operator guide

## 1. Build an edit

1. Import licensed MP3/WAV (or click the original demo beat), then add images/video.
2. Choose one of the 16 templates. A template updates project visual settings without deleting existing tracks.
3. In **Effects**, pick one of the 7 visual modes, a neon palette, background style, bass pulse, vignette and grain.
4. Use **Timeline** to select a layer; drag the layer block horizontally to adjust its start time. Enable Beat snap for approximate snap points from detected audio transients.
5. Move the playhead to a visual clip's interior and press **S** or **✂ Split** to split it. Audio splitting is intentionally unavailable: only one audio source is supported.
6. Select a text/image/video layer; choose **Inspector → Add keyframe**, move playhead, add another keyframe and adjust X/Y/Scale/Rotation/Opacity. Properties tween linearly in the Canvas preview/export.
7. Apply clip fade, slide, zoom transition and visual blend modes. Media offsets work best with browser-decodable clips.

## 2. Audio mix & BPM

- The Effects inspector has Web Audio low/mid/high EQ band controls (±18 dB) and optional compressor.
- Set the audio track's volume between 0 and 200%; audio is routed to speakers and output stream through the same processed graph.
- Waveform/BPM analysis runs locally for supported audio up to 35 MB; large files can still be imported and exported, but without these analytics.
- Estimated BPM is heuristic and may be wrong. Turn off Beat snap if beats are inaccurate.

## 3. Export settings

- Select aspect 16:9, 9:16 or 1:1; width 720, 1080 or 1280px; 24, 30 or 60fps; requested bitrate 2, 5 or 8Mbps.
- **Download PNG snapshot** saves the current video canvas image.
- **Export to device** records in real-time via browser-native MediaRecorder. The browser determines actual codec and bitrate. Keep the tab active; memory/codec support is browser-dependent.
- JSON backup saves only editing settings, not actual media files. Preserve imported source files separately and stay on the same browser/origin for IndexedDB project restore.

## 4. Shortcut reference

| Shortcut | Action |
|---|---|
| Space | Play/pause (when focus is not in an input/button) |
| S | Split selected non-audio layer at playhead |
| ← / → | Seek one video frame |
| Shift + ← / → | Seek one second |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Delete | Remove selected non-audio layer |

## 5. Browser verification before commercial launch

Test with real audio and video in Chrome/Edge/Firefox/Safari, inspect output in an independent player, compare soundtrack timing against transient markers, and test 320px mobile widths. These tests were not possible in the network-restricted development environment. The included offline `demo/` is a **limited v0.1 proof-of-concept** and does not have this entire advanced suite.
