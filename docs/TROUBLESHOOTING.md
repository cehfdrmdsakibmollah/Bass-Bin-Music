# Troubleshooting

**`npm install` fails with ENOTFOUND / ENOTCACHED** — Connect a developer machine to npm registry and run `npm install` without `--offline`. This sandbox cannot download packages and could not generate a production lockfile.

**`next` command not found** — Run `npm install` in the extracted project root; do not run `npm start` before a successful build.

**Homepage missing from Google** — Check `NEXT_PUBLIC_SITE_URL`, production canonical HTML, `robots.txt`, `noindex` and Search Console ownership. No rankings are guaranteed.

**Visualizer doesn't respond to audio** — Confirm the upload decoded successfully, press Play to allow AudioContext playback, confirm speakers are unmuted and check browser media codec support.

**Export disabled** — `HTMLCanvasElement.captureStream` or compatible `MediaRecorder` MIME unavailable in that browser. Try recent desktop Chrome or Edge and a simple 5-second project.

**Export is silent** — Check audio layer isn't muted, the source file plays in the browser, and whether the resulting WebM/MP4 player supports the selected audio codec.

**Export ends early** — Capture may end because of browser power-saving, memory limits or a recorder error. Try 720p, 24 fps and a short, locally owned audio sample. The timeline uses its own elapsed-time clock and can export the chosen duration even if audio ends sooner.

**Video looks choppy or memory is high** — Lower resolution to 720px, shorten duration, close other tabs and disable intense particles/effects; export may not work on low-memory devices.

**Project gone after reopening** — Check you are using the same origin/browser and that storage wasn't cleared or blocked. JSON does not include source media blobs; back up original files separately.

**`Google login` / `Publish to YouTube` absent** — Those integrations require authorized provider credentials and have not been implemented in this build. The Publish page offers a legitimate manual workflow.

**BPM unavailable or wrong** — Local peak detection is approximate and depends on audio transients. Try WAV/MP3 with clear drums; manually disable Beat snap for non-rhythmic songs. Audio over 35 MB skips offline analysis.

**Text/image animation appears static** — Add at least two keyframes at different playhead positions and set different positions/scale/rotation/opacity.

**Imported video seeking stutters** — Browser decoding and keyframe seeking may be limited; try a shorter compatible MP4/WebM clip, ideally with frequent video keyframes.
