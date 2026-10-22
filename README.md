> **New in Shorts Lab v0.5:** music-aware 15/30/60 second hook suggestions (offline heuristic, not verified viral trends), optional apply to vertical 9:16 video, optional Auto Sync of **your imported** clips, full-song editing up to 10 minutes, manual source In/Out crop, audio split/join, loop and end-of-track replay. [Shorts Lab guide](docs/SHORTS-LAB-V05.md). All changes preserve Undo and your original media. Creator-licensed stock footage search is optional and external; no automatic third-party video harvesting.

# BASS BIN MUSIC — Auto Director Pro v0.4

> **Latest release:** Extended from the user’s v0.3 Phonk BeatSync ZIP. The original logo is intact. This is an **advanced source release**, not a production-verified deployment.

**New:** rhythm-focused shot director; four per-clip motion recipes; arrangement map; independent kick/snare/hat/drop responses; beat quantization and snapping; ripple editing; video speed; visual and audio fades; mirror; scanline/chromatic-edge/letterbox effects; SRT captions and CSV clip-list exports; less expensive timeline markers and an SEO tutorial.

**Full usage & limitations:** [Auto Director Pro v0.4 guide](docs/AUTO-DIRECTOR-PRO-V04.md) · [Test report](docs/TEST-RESULTS-V04.md) · [Changelog](CHANGELOG.md).

**Verification:** 41/41 automated tests passed; core TypeScript typecheck passed. Npm install was blocked in the execution environment, so **Next.js build, live UI, browser recording and cross-browser behavior have not yet been verified**. Complete these on your own machine before launch.

---

# BASS BIN MUSIC 🎵 · Beat-Synced Phonk Studio v0.3

**Local-first Phonk music visualizer and video creator** with a dark neon brand, 16 editable templates, real-time Web Audio analysis, timeline editing, browser project storage, and supported browser video export.

> **Release status:** Advanced source implementation / pre-release. Isolated Node tests and software-rendering test passed. This package **has not** passed a Next.js production build or actual browser MediaRecorder export test because npm packages could not be downloaded in the provided environment. No live deployment, Firebase connection, MongoDB connection, or YouTube OAuth publishing is claimed. See `docs/RELEASE-STATUS.md`.

## Contents

- `src/app/` — Next.js 16 App Router pages, SEO metadata, sitemap/robots/manifest.
- `src/components/Studio.tsx` — interactive editor, multi-track timeline, upload/preview/export controls, IndexedDB autosave.
- `src/lib/render.ts` — pure Canvas 2D renderer, seven audio-reactive visual modes, layered image/video backgrounds, captions and effects.
- `src/lib/storage.ts` — local IndexedDB persistence for project metadata and authorized media blobs.
- `src/lib/project.ts` — track editing, version validation and safe import.
- `src/lib/advanced.ts` — split/trim keyframe logic, interpolated movement, opacity and clip transitions.
- `src/lib/audio-analysis.ts` — local waveform/transient detection and estimated BPM (not beat-perfect).
- `src/lib/beat-sync.ts` — kick/snare/hat onset estimates, drop markers, beat envelope, manual BPM grid, auto-montage, drop caption generator and CSV export.
- `src/lib/templates.ts` — 16 editable original visualizer styles.
- `src/components/Dashboard.tsx` — local project browser.
- `src/components/MusicHub.tsx` — link-only personal music hub.
- `demo/` — small offline browser demo (not the full Next.js app). Start with `index.html`; it is a standalone working proof of the Canvas UI/export flow, subject to browser codec support.
- `render-preview.png` — earlier visualizer preview from Canvas renderer.
- `beat-sync-preview.png` — real renderer-frame comparison for a kick/drop with Beat Sync disabled/enabled (not a screenshot of a production web page).
- `tests/` and `docs/` — logic tests, release notes, architecture, integration and SEO guidance.

## Requirements

- Node.js 22 LTS (the project specifies Node 20.9+, but use Node 22 for the included test runner's TypeScript stripping)
- npm with internet access during initial installation
- Current Chrome or Edge preferred for exporting. Safari/Firefox require format/codec validation.
- No paid subscription, cloud database or API key required for the local editor.

## Windows setup (PowerShell / VS Code)

```powershell
# 1. Extract bass-bin-music.zip and open the folder in VS Code.
cd path\to\bass-bin-music

# 2. Install dependencies (requires internet connection).
npm install

# 3. Run local development server.
npm run dev
```

Visit **http://localhost:3000**. Use **Create a Video** to open `/studio`. The `npm install` step generates `package-lock.json`; commit that generated file when you publish to GitHub. The network-restricted build environment could not generate a verified lockfile.

## macOS / Linux

```bash
cd bass-bin-music
npm install
npm run dev
```

## Run tests & production build

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run start
```

The Node built-in tests exercise project validation, 16 template definitions, aspect ratios, timeline operations, keyframe interpolation, visual splitting, PCM transient analysis and renderer modes. A software-render test runs only when the optional renderer dependency is available in the execution environment; skipped elsewhere. Unit passing alone does **not** prove browser export or cross-device compatibility.

## First video — quick guide

1. Open `/studio` and import an **MP3, WAV or other supported audio file** you own or have rights to use. Max size: 100MB.
2. Click Play and adjust effects. Use **Templates** to choose an editable preset.
3. Optionally import your image (max 20MB) or supported video (max 250MB). Edit text layer, start time, duration and track order in the inspector.
4. Choose **16:9**, **9:16** or **1:1** and resolution/framerate.
5. Select **Export to device**. Depending on browser, WebM or MP4 may be supported; if recording is unavailable, the button is disabled with a clear explanation.
6. The editor runs the recording in real time; **leave the tab active** and keep sufficient memory/free disk space.

**Autosave** stores project JSON and imported media blobs in IndexedDB. **Save JSON** is metadata only and does NOT back up the media bytes. Use My Projects to reopen saved configurations. Back up your source assets separately. Browser storage may be cleared automatically or by the user.

## Beat-Synced Phonk Studio — what is new in v0.3

- **Percussive onset extraction:** kick/snare/high-frequency transient estimates, onset intensity and possible bass-drop markers from local decoded PCM (no external AI).
- **Four beat-lock FX personalities:** Drift Shake, Hard Phonk, Cinematic Drop and Minimal; camera shake, bass zoom, accent lines, circular impacts and restrained highlights.
- **Beat-map editing:** enable/disable, strength, global offset ±1 second, 20ms nudges, add/remove beat at the playhead, mark/unmark drops, B keyboard shortcut.
- **Tap Tempo:** tap at least four times and generate an adjustable manual BPM beat grid when automatic detection is unreliable.
- **Beat-Synced Auto Montage:** alternate uploaded images/videos, create cuts every 1/2/4/8 kick/snare events, choose zoom/fade/slide/hard transitions; capped to protect browser performance; timeline Undo supported. Original audio and media blobs remain unchanged.
- **Drop title overlays:** create editable, animated text layers at identified bass drops.
- **Beat CSV export:** download marker timings for other editors; metadata project export also preserves the editable beat map.
- **SEO tutorial:** `/guides/beat-sync-phonk-video` explains the workflow and its limitations.
- **24 tests:** includes beat analysis, montage, persistence validation, rhythm grid and pixel-level deterministic render test.

For a complete walkthrough and safeguards see `docs/BEAT-SYNC-STUDIO-V03.md`.

## Advanced tools inherited from v0.2

- **16 original configurable templates:** including Cyber Spiral, Midnight Mirror, Laser Tunnel, Trance Rings, Rainy Drift and Digital Voltage.
- **7 visualizer modes:** bars, circle, wave, particles, mirrored bars, energy spiral and neon rings.
- **8 palette presets** plus manual colors, backdrop selection (grid / aurora / solid), cinematic vignette, low-density grain and audio-reactive camera pulse.
- **Multi-track editing:** drag layers horizontally to change start times, manually set duration/offset, reorder, duplicate, delete, split non-audio layers at playhead; beat snap (when signal can be analyzed).
- **Keyframe animation:** move playhead, add keyframe, adjust x/y, scale, rotation and opacity. Linear interpolation with text/image/video transform and fade, slide or zoom clip transitions; blend modes (normal, screen, multiply, overlay).
- **Text designer:** editable captions, three font families, color and font size, position and motion.
- **Music processing:** 3-band Web Audio EQ (+/-18 dB), adjustable audio gain (0–200%), optional dynamics compressor; applies to playback and output audio, subject to browser export support.
- **Waveform & BPM:** PCM offline analysis for audio <= 35 MB; shows waveform and estimated attack markers. Beat detection is approximate and may return no BPM for unusual music.
- **Export options:** 24/30/60 FPS, 2/5/8 Mbps requested bitrate (the browser may choose a different actual bitrate), 720/1080/1280 pixel width and PNG frame capture.
- **Editing shortcuts:** Space preview, S split, left/right arrow frame step, Shift + arrows one-second step, Ctrl/Cmd+Z undo and Ctrl/Cmd+Shift+Z redo.

**Limitations:** Automatic kick/snare/drop labels are frequency-based approximations, not guaranteed musical downbeats. Video source duration may be shorter than a generated cut. Audio uses **one source at a time**; no live multi-audio mixing, true destructive audio cutting, pitch-preserving time-stretch, AI generation or guaranteed frame-accurate export. Splitting video creates visual segments of the same local source; decoding/synchronization remains browser-dependent. Beat snapping applies to the editable project beat map when markers are available (from PCM analysis or manual BPM grid). Advanced tools are part of the Next.js editor, **not the smaller standalone demo**.

## Audio/export engineering notes

- The editor uses `createMediaElementSource` → `AnalyserNode` → `GainNode` → speakers + `MediaStreamAudioDestinationNode`.
- The renderer uses an animated HTMLCanvasElement. The exporter combines `canvas.captureStream(fps)` video with optional Web Audio MediaStream tracks and a compatible `MediaRecorder` MIME type.
- Browser recording happens in real time. Depending on media timing/browser behavior, audio synchronization may drift and must be tested with real files before production.
- No unauthorised YouTube/SoundCloud/audio extraction is included.
- Imported video is a silent visual layer; the editor periodically seeks video to match timeline offsets, but browser decoding/synchronization can still drift. Imported video sound is not mixed into exports.
- FFmpeg.wasm and server-side deterministic transcoding are not included. Export is **not** guaranteed on every browser.

## Environment & deployment

No environment variables are needed for localhost. Before launching a public production domain, copy `.env.example` to `.env.local` and set a valid final HTTPS `NEXT_PUBLIC_SITE_URL=https://your-real-domain.tld`. Until it is set, pages intentionally use `noindex` and sitemap is empty to avoid search engines indexing unknown/canonical localhost domains.

For Vercel: create a **new** GitHub repository, upload this project, connect that repository to Vercel, add `NEXT_PUBLIC_SITE_URL` to production environment settings, then deploy. Before promoting, run `npm run check` and inspect the live results. No Vercel deployment is included here.

## Free-tier architecture

Core editing requires **zero mandatory paid services**. Uploaded media stays in the browser by default. Optional third-party features (Google sign-in, MongoDB sync, YouTube OAuth uploads) have **not** been implemented and could require provider setup, verification or quota management. No claim of free unlimited cloud storage, upload API allowance, or first-page SEO ranking is made.

## Accessibility

Semantic navigation, skip-capable keyboard focus, labels, contrast-conscious dark palette, reduced-motion CSS support, and touch-focused mobile layouts are implemented in source. WCAG audits and real-device tests are pending.

## Important documents

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/RELEASE-STATUS.md`](docs/RELEASE-STATUS.md)
- [`docs/QA.md`](docs/QA.md)
- [`docs/SEO-LAUNCH.md`](docs/SEO-LAUNCH.md)
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/ADVANCED-STUDIO-GUIDE.md`](docs/ADVANCED-STUDIO-GUIDE.md)

## Original brand asset

`public/bass-bin-logo.png`, `src/app/icon.png` and `demo/assets/bass-bin-logo.png` are direct byte-for-byte copies of the supplied brand image. Its exact original SHA-256 hash is:

`e08a15bf0a1332f78f62c6fc29208b0e2e56f7aee052d2b13e394e9f1ed62669`

## Try the standalone browser demo without Next.js

The package includes a smaller proof-of-concept editor in `demo/` (the full feature set lives in `src/`). ES modules require a local web server — double-clicking the HTML file may fail due to `file://` browser security.

**Windows:** double-click `run-demo-windows.bat` (Python required), then open `http://localhost:8080`. Or serve the `demo` folder using the VS Code **Live Server** extension.

**macOS/Linux/Android Termux (if Python installed):**

```bash
cd demo
python3 -m http.server 8080
```

Open `http://localhost:8080`. Android users can try the hosted/deployed application in their mobile browser, but a desktop environment is recommended for Node/Next development and Vercel configuration.

## Create a new GitHub repository

No matching BASS BIN MUSIC repository exists in the connected account. Create a fresh **private** repository named `bass-bin-music` on GitHub, then from the extracted project folder run:

```bash
git init
git add .
git commit -m "Initial BASS BIN MUSIC local-first creator platform"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bass-bin-music.git
git push -u origin main
```

Run `npm install` and include its generated `package-lock.json` before pushing for reproducible Vercel builds. Never push `.env.local` or credentials.

### Original audio fixture

`public/demo-beat.wav` is a short synth rhythm **generated programmatically for this project**. Use the **Try original demo beat** button in the studio (or offline demo) to hear bass-reactive effects without importing third-party copyrighted music. This file is an illustrative synthetic test fixture, not a commercial music release.

## Feature status (v0.3)

| Feature | Current status |
|---|---|
| Beat estimation, manual timing grid and correction | Implemented; synthetic PCM/logic tests passed |
| Beat-reactive preview renderer and export path integration | Implemented; pixel render tests passed, browser export unverified |
| Auto montage of uploaded visual assets | Implemented; isolated timeline generation tests passed, live media QA needed |
| Audio source upload, waveform and EQ | Implemented in browser code; real device playback needs testing |
| 16 templates, 7 spectrum modes, keyframes, local storage | Implemented in source; browser QA pending |
| YouTube OAuth publish, cloud account sync, AI stem extraction, AI video generation | Not implemented; setup/verification required |
| Production `next build`, mobile QA, MediaRecorder A/V-sync and deployment | Not verified in this environment |

The shipped v0.3 contains source code and new tests, **not a guarantee** that all uploaded files/phones can successfully export. Run the full browser QA checklist before production deployment.
