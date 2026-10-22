# BASS BIN MUSIC — Auto Director Pro v0.4

## What is actually new

This upgrade builds directly on the v0.3 ZIP source. No existing media, templates, timeline or beat analysis modules were removed. The original user-provided logo file is unchanged.

1. **Auto Director Pro**: a new Studio panel and an offline `src/lib/director.ts` engine. It selects kick, snare, hat or all onsets, filters by strength, chooses a shot change every 1/2/4/8 selected onsets, rotates among uploaded images/videos, and generates editable clip metadata. Original asset files are never changed. Undo is available.
2. **Four camera choreography presets**: Bass Punch, JDM Drift, Orbit and Smooth Glide produce per-clip position/scale/rotation/opacity keyframes. Presets can also animate a selected layer, and normal keyframe editing stays available.
3. **Arrangement phrase map**: groups observed onsets into approximate song phrases and labels them intro, groove, breakdown, build, drop or outro. The label is a *heuristic*, not music-semantic AI analysis. Click a phrase to seek.
4. **Per-band beat impact mixer**: separate kick, snare, hat and drop gain (0–200%). These values feed the same timestamped `beatEnvelope()` used by preview and video rendering. Existing projects default to 100% on every channel.
5. **Onset quantization**: quarter/eighth/sixteenth step based on estimated or tapped BPM, optional 0–100% tightness to preserve some human feel. Undo restores original markers.
6. **Clip snapping**: snap a selected layer or eligible visual/text layers to nearby beat events, with existing duration/boundary protection.
7. **Ripple move**: move a selected visual/text clip and later short-form visual/text clips together, leaving the audio track and full-duration background elements alone. Rejects overflow.
8. **Speed and source playback**: per-video 0.25×–4× playback-rate control affects preview and capture while reusing the original imported file. The source offset when a sped-up clip is split reflects the rate. Browser implementation/codec limits still apply.
9. **Per-clip fades and flip**: video, image and text drawing opacity can fade in/out; image/video/text layers can flip horizontally. Audio fade in/out is applied to the monitor/export destination gain envelope.
10. **Analog-film post FX**: live scanlines, neon edge fringing and letterboxing, all applied through the same canvas render path as exports. The edge fringing effect is a light overlay, not channel-by-channel RGB chromatic separation.
11. **Beat/drop transport**: navigate to previous/next onset or next drop via clickable preview controls.
12. **Caption and edit-list export**: text tracks produce separate SRT captions; the timeline produces a CSV clip list. These exports are companion files, not a native Premiere/Resolve EDL and do not embed subtitles in a video container.
13. **Mobile-performance improvement**: beat events and arrangement sections are memoized; at most 72 representative beat marker elements are drawn per lane, rather than hundreds on every render.
14. **SEO**: helpful public route `/guides/auto-director-phonk-editor` with metadata and sitemap entry, updated features page and homepage copy.

## Hands-on workflow

1. `npm install` and `npm run dev` on a supported development machine (Node 20.9+ recommended). Open `http://localhost:3000/studio`.
2. Choose **Assets**, import authorized audio, and await local transient detection. For files too large to analyze, Tap BPM in **Beats** and generate a manual grid.
3. Add one or more images/videos in **Assets**.
4. Open **Director**, choose focus, strength, cut interval, movement and transition. Press **Build Directed Phonk Edit**. Confirm replacement of the visual arrangement. User audio, FX and text layers are retained. Undo restores previous clips.
5. Edit any clip by selecting its lane and opening **Inspector**. Try Video speed, Fades, Flip, and keyframes.
6. Under **Beats**, adjust kick/snare/hat/drop responses. Quantize markers in **Director** if desired; for complex rhythms manual adjustment is recommended.
7. Apply scanlines/fringing/letterbox in **Effects**. Use the Arrangements list and beat-navigation buttons to inspect the result.
8. Download CSV/SRT companion files as needed and select supported video codec from **Export**. Play exported files to check real sync.

## Important constraints

- This is a deterministic, offline rhythm-based editing system. It does **not** generate music, images or video, and no online AI subscription is required.
- Analyzed tempo/phrases, band classes and drop markers are approximate; manual correction remains necessary on noisy or highly syncopated Phonk mixes.
- Imported video may be too short for the assigned segment/source-offset/speed; a frozen or empty image can result. Check segment in/out and source duration manually.
- The browser's `MediaRecorder.isTypeSupported()` is a *capability hint*, not a guarantee that encoding will succeed; heavy compositions, unsupported codecs and low memory can still fail. See MDN MediaRecorder API documentation.
- Video export occurs in real time, and performance/frame rate can vary. Do not assume production-grade accuracy without running device-specific end-to-end tests.
- Current app supports one imported audio stream. Multiple independently mixed audio sources, dedicated video soundtrack mixing, AI-generated videos, cloud collaboration and authorized platform publishing are **not** implemented by this upgrade.
- SRT is external; no karaoke word-level timestamp detection exists. CSV is an informal inspection/edit-decision list, not a fully standardized industry transfer format.

## Files added or modified

- Added: `src/lib/director.ts`, `tests/director.test.mjs`, `src/app/guides/auto-director-phonk-editor/page.tsx`, `docs/AUTO-DIRECTOR-PRO-V04.md`, `docs/TEST-RESULTS-V04.md`, `CHANGELOG.md`, and a synthetic `director-preview-v04.png` produced by the source renderer.
- Updated: `src/lib/types.ts`, `src/lib/project.ts`, `src/lib/advanced.ts`, `src/lib/beat-sync.ts`, `src/lib/render.ts`, `src/components/Studio.tsx`, `src/app/globals.css`, public SEO pages and sitemap, README and package version.

## Production gate

Unit, isolated-render and schema tests are passing. Full Next.js build, React component/browser E2E and real media export testing have **not** been performed in this restricted environment because Next.js/React dependencies could not be installed. See `docs/TEST-RESULTS-V04.md`. Do not treat source tests as production certification.
