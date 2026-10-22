# BASS BIN MUSIC v0.8 — Mobile Ultra Aura Studio

This release fixes the cramped desktop-style mobile layout without removing desktop Studio features.

## What changed

- Android-sized viewport uses a **fixed six-action bar**: Media, Audio, Templates, Aura FX, Tools and Export.
- Each tab opens an accessible **slide-up tool sheet** with a close button and a horizontally scrollable subtool selector that exposes the entire Studio (Shorts, Beat Sync, Director, Music, FX, Discover, Inspector).
- **Export** opens a separate settings sheet rather than hiding below the timeline. Header **Next →** goes to the same sheet.
- Preview stays above the timeline. Audio transport, scene preview, mobile selected-clip actions and scrollable multitrack timeline are visible without wading through all 10 settings panels.
- Selecting a media/text/audio track opens its inspector on narrow screens. A selected-clip quick toolbar gives working Split, Adjust, FX, Copy and Delete actions.
- Timeline shortcuts directly open Shorts Lab, Beat Sync and Auto Director on mobile.
- Inputs, tap targets, sheet close/backdrop, safe area insets and horizontal timeline scrolling have been adjusted.

## Five Ultra Aura presets

- **Ultra Aura** — signature bass-reactive blue/violet neon ring renderer
- **Aura Float** — soft atmospheric aura
- **Hard Bass Aura** — stronger kick/flash-limited spectrum
- **Night Drive Aura** — moody JDM blue mist
- **Ghost Wave Aura** — dark teal/blue rings

All are original audio-reactive Canvas designs, not copies of CapCut/Avee assets. The modes use existing analyser data and beat marker energy, and the same renderer is used by preview and video export.

### Preview → Apply → Undo

1. Open **Templates**.
2. Filter by **Ultra Aura**, **Phonk**, **Drift**, **Avee Inspired** or **NCS Inspired**, or view all.
3. Tap a template to **preview** its settings on the live canvas. *The saved project is still unchanged*.
4. Tap **Apply Template** to save, or **Cancel Preview** to discard.
5. Navigating away from a preview cancels it, avoiding a mismatch between canvas preview and exported project. Export will request a decision if a preview remains open.
6. Ctrl+Z/Undo restores the previous committed project.

### One-tap vertical reel
Press **Ultra Aura 15s** above the preview: it creates a 9:16 / 720px / 30 fps Aura composition, selects the first 15 seconds of your imported audio if present, and preserves Undo. You can import your own image/video and finish with the previous Instagram MP4 export preset.

### New motion pack
FX Lab adds working keyframe animations on the *selected media/text clip*: **Bass Punch**, **Drift Push**, **Aura Orbit** and **Cinema Pan**. Edit the resulting motion/keyframes in Inspector. Effects preview and render with the same drawing code.

## Validation

- Existing automated unit tests continue to run; new tests cover five aura settings, non-destructive preview, explicit commit, and legacy save compatibility.
- Desktop Chromium tests continue to check MP4/WebM render and Phonk Music Lab.
- New mobile Chromium emulation at 390×844 with touch enabled checks the fixed toolbar, hidden/open sheet visibility, template preview/cancel/apply, 9:16 Reel preset, export settings and FX tab access.
- Mobile emulation is **not equivalent to physical Android/iOS testing**; MediaRecorder and H.264 codec support vary across devices.
- Photos/videos remain local. This does not automatically fetch trending/copyrighted music or copy CapCut designs.

## Quick start

Open https://bassbinmusic.vercel.app/studio on mobile, refresh, tap **Ultra Aura 15s** and import your footage. Use the fixed bottom toolbar to edit, then choose **Export** and use **Instagram / Shorts MP4** where supported.

All media must be your own or used with appropriate permission.
