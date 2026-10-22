# Roadmap after Advanced Studio v0.2

## Implemented in this source package (requires final browser verification)

16 configurable templates, 7 audio spectrum modes, beat-aware waveform timeline with optional snapping, keyframed transforms, visual clip splitting, transitions, opacity/blend, draggable start offsets, font tools, video/image fitting, 8 palettes, Web Audio EQ/compression/gain, screenshot capture, selectable video bitrate/FPS and stronger project validation. Production installation and browser QA remain unfinished.

## Next engineering priority: reliability and real-world editing

1. Restore internet access and run strict Next.js build, lint, test and Playwright browser automation on Windows, Chrome/Edge/Firefox/Safari, Android and iPhone.
2. Replace HTMLMediaElement timebase with robust deterministic audio/video timeline mixing, supports multiple audio clips, pitch/time effects, crossfades and clip thumbnails.
3. Add nondestructive ripple edit, snapping handles, clip trim edges, zoomable timeline, groups, per-track keyframe editor and better touch gestures.
4. Add ZIP project bundles containing *consented* media, IndexedDB recovery/version migrations, undo persistence and quota warnings.
5. Add optional FFmpeg.wasm codec processing where device RAM allows with feature detection and worker isolation; support offline export testing.
6. Add automated media sync benchmarks, export progress/cancel tests, Android low-memory optimization, accessibility and Lighthouse audits.

## Only after user authorizes official integrations

- Firebase Google login, protected per-user routes, optional MongoDB metadata sync.
- YouTube Data API authorization + upload with explicit consent and server-side token handling; audit the quota and verification workflow.
- Verify each other music platform's actual upload permissions and implement only APIs the provider allows.
- Moderated public creator profiles, content rights reporting, abuse controls and audit logs.

## After v0.3

- Verify 9:16 beat-cut exports on desktop Chrome and Android Chrome using licensed phonk.
- Add optional tempo-confidence visualization and an audio latency calibration wizard.
- Extend video source safety to respect original clip durations; video freeze/blank in loops should be prevented.
- Consider opt-in professional timeline waveform caching (non-blocking analysis worker) and drag/drop multimaterial gallery.
- Cloud and publishing integrations remain future work pending OAuth and security review.
