# BASS BIN MUSIC v0.3 — Per-Beat Phonk Auto Video Editor

## What is new and how to use it

1. Open `/studio`, import music in **Assets** (analysis attempts for decodable audio up to 35 MB, otherwise playback is still possible but automatic beat detection may be unavailable). The same original assets remain in IndexedDB locally.
2. Enter the **Beats** panel. View separate kick/snare/hat transient estimates, the estimated BPM and suspected bass drops. Toggle **Apply beat-driven visual FX**.
3. Choose **Drift Shake** (short rhythmic pan + glow), **Hard Phonk** (stronger zoom, rhythmic bars and restrained flash), **Cinematic Drop** (expanding neon ring) or **Minimal** (subtle motion without flash). Strength 0–100%.
4. Fix late/early beat sync with global offset ±1000 ms. Use `−20ms` and `+20ms` to move the beat map in 20-ms increments. Analyzed and manual markers are stored in JSON backups.
5. Move the playhead to a kick and press **+ Beat** or **− Nearest beat**. Mark major downbeats using **Toggle bass-drop**. Keyboard shortcut **B** inserts a kick marker at the playhead.
6. When analysis is missing or inaccurate, tap **Tap BPM** at least four times to measure your manual tapping rate. **Generate BPM Grid** creates a regular series anchored to the playhead. Confirmation is required before overwriting an existing beat map; Undo can reverse it.
7. Import several images/videos, pick cut every 1/2/4/8 kick/snare onsets and choose none/fade/slide/zoom transition. **Generate Beat-Synced Cuts** replaces the current visible image/video clip arrangement, without mutating source assets or audio. Confirm first; Ctrl+Z can revert.
8. Mark bass drops and click **Generate drop captions**; captions are ordinary, editable timeline layers with their own motion keyframes.
9. **Export beat markers (.csv)** produces a timing sheet for use in other editors. **Save JSON** keeps the complete project settings and beat map, not the media bytes.
10. Choose aspect ratio, quality and video format for browser-dependent MediaRecorder export. Review exported file for timing, missing frames or silent audio before publishing.

## Engineering details

- `src/lib/beat-sync.ts` analyzes decoded PCM locally (no AI API). It uses three simple frequency envelopes and local positive-energy novelty to find likely transient onsets, and coarse inter-onset interval consensus for optional tempo. This is deliberately a heuristic, not perfect stem-separated music transcription.
- Structured `BeatMap` records onset time, relative impact, kick/snare/hat approximation and optional drop marker, capped at 1,200 events. Project JSON validation explicitly checks every field and safely accepts older v0.1/v0.2 projects where beat-sync data is absent.
- The `beatEnvelope` function uses a binary search to find nearby event timing. The Canvas renderer uses deterministic time-indexed responses instead of relying on live `AnalyserNode` peaks alone. Playback and export share one renderer path; browser stream recording itself is not frame-accurate by guarantee.
- `autoMontage` caps created cuts to avoid unbounded timelines. It does not synthesize video; it reuses locally uploaded assets. Video segments refer to their original source starting point. If a video is shorter than a repeated cut, the browser may show blank/frozen frames; use stills or long source footage.
- `addDropTitles` adds up to ten captions with editable keyframes, within an 80-track project safety cap.
- Photosensitive warning: Flash overlays are intentionally capped at 16% alpha and are disabled by the minimal style. Still review any rapid motion for your audience.

## Known limitations

- This is not a full DAW: no isolated stem separation, AI sample generation, time-stretch or verified professional-quality beat detection. Snares and hats are estimated from broad frequency bands; difficult tracks need manual correction.
- Heavy/long files may fail browser decoding; a 35 MB maximum is used for local PCM analysis but uploads are allowed under the pre-existing larger codec/size limits.
- Generated cuts reuse existing media. Original user-created image/video arrangement is replaced, not automatically preserved on a separate sequence. Undo (in the same editing session) restores it. Save project JSON before proceeding if desired.
- Audio-video MediaRecorder export, Next.js build, mobile browser performance and actual output file synchronization require hands-on QA outside this offline environment.
- The lightweight offline `demo/` has NOT been upgraded to mirror every Next.js Studio tool.
