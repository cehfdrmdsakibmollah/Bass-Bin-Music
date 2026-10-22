# BASS BIN MUSIC — Reference-led Phonk Visualizer correction (v0.9)

## Why we rebuilt the themes

Previous templates mostly recolored the same spectrum. That did not match the visual grammar of serious Phonk/Avee releases: focused cover artwork or character, deliberate composition, audio-reactive edge spikes, independently moving background, high-contrast type and controlled beat-drop effects. We retired the old default look but **kept legacy styles and saved projects** for compatibility.

## Reference study

The following references informed *visual principles only*, not copying or importing third-party assets:

- [Ultimate Phonk Visualizer — Avee Player example](https://www.youtube.com/watch?v=O95MiSoLWRY) — dark/neon music response, cover/logo customization.
- [Neon Wolf Arcana — Avee template](https://www.velosofy.com/template/neon-wolf-arcana-avee-player-template-q-5ro52vtdi) — center subject + reactive outer energy.
- [Avee visualizer editing guide](https://www.velosofy.com/blog/how-to-import-avee-player-templates) — replace art/background, preserve a separate reactive spectrum layer.
- [Music Motion real Phonk case study](https://musicmotion.level-higher.com/case-studies) — coherent video rather than static artwork.
- [Music Montage editing reference](https://github.com/TANAKANAU/montagem-remotion-kit) — intro/build/drop sections and audio-driven visual changes.

Research covered public examples, thumbnails and documentation; we **did not claim to watch full streamed videos**. The implementation contains no borrowed skull/album art, NCS logos, Avee source presets, ripped clips or copyrighted tracks.

## Three distinct signature themes

### 1. Dark Skull Bass
Original hand-drawn skull mask; sculpted contour, glowing eyes, toothed radial FFT spikes, dark industrial atmosphere and edited title at the bottom. Import image/video for a personal central artwork instead of the default skull.

### 2. Midnight Drift
Procedural night highway with perspective lights, road reflections, remote skyline and tail-light silhouette. In wide format the spectrum sits off center; vertical Shorts format lifts it above the road. Your imported driving footage can replace the procedural background.

### 3. Memphis Tape
Original analog cassette with rotating internal reels, label, tactile wear and a horizontal spectrum driven by live frequency bins. Structurally different from circular ring layouts.

These themes are shown first in **Templates → Signature Phonk** with three **different illustrated posters**, not the old generic radial gradients. A true live **Preview → Apply/Cancel** flow previews both changed layer title and canvas settings, so saved/exported results agree. Select **Load original demo beat** to test live audio reaction before importing your own music.

## Fixes beyond color

- The default project now starts with Dark Skull Bass, not generic equalizer bars.
- Standard editable caption is placed in a safe lower third with larger legible text.
- The generic constant footer watermark is absent from signature scenes.
- The original source file stays local. Any uploaded image/video remains editable as a timeline layer.
- Three modes are available in **Effects → Spectrum style**, including editing palette, effects, BPM sync and existing exporting.
- **Dark Phonk 15s** quick action generates a 9:16 signature composition rather than launching the prior underdeveloped Ultra Aura look.
- Older uploaded projects and legacy templates remain loadable; existing user projects are never automatically overwritten.

## What is NOT included

This is a coded original visualizer, not a clone of CapCut, NCS, or Avee. It does not ship copyrighted illustrations, copyrighted music or live trends. Export codec compatibility varies by device; NCS music is not necessarily licensed for standalone visualizer uploads. Test an actual target Android phone before public release.

## Quality gates

GitHub Actions tests validate source code, normalized project files, mobile editing behavior and Playwright rendering/export. Additional Chromium smoke tests compare pixel fingerprints of three signature scenes and confirm preview cancellation versus applied selection. Different pixel fingerprints do not by themselves establish commercial art quality; manual visual review and real-device listening are still required.
