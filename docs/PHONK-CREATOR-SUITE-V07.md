# BASS BIN MUSIC — Phonk Creator Suite v0.7

> 22 editable Phonk visualizer templates · 10 original FX recipes · two-deck WAV mashup · opt-in music discovery. All processing remains browser-local unless you open an external discovery link.

## New tabs in Studio

### Music — Phonk Music Lab

1. Open **Music**, import **Deck A** and **Deck B** from your computer (MP3, WAV, M4A, OGG depending on browser codecs). Each source must be under 45 MB and 10 minutes.
2. Adjust Track A/B **In** and **Out** seconds. Adjust **crossfade overlap**, **Deck B playback speed / pitch** (0.75–1.5×), independent Deck A/B gains and bass-shelf dB.
3. Click **Play mix** for an audio preview, then **Download 16-bit stereo WAV** for a rendered 44.1 kHz WAV file.
4. **Use Mashup in Video Studio** renders the same WAV and imports it into your project's music track, allowing BeatSync, effects, captions, auto cuts and MP4 export.

The two original source files are not modified and no files are uploaded to the server. WAV mixing uses the browser's OfflineAudioContext, includes a compressor and allows up to 180 seconds of output per mashup. Speed changes affect both tempo and pitch. The Music tab is a focused two-track editor, **not full BandLab, a DAW, key detection, professional beat matching, live VST plugins or multi-track mastering.** Long tracks can require significant device memory.

### FX Lab — Phonk Effects & Transitions

10 original presets for combinations of neon colors, chromatic offsets, zoom, grain, punch and camera motion:

- Velocity Whip, Ghost Glitch, Neon Spin, Night Drift
- Hard Phonk Punch, Prism Halo, VHS Afterdark
- Dark Reverb, Laser Tunnel, Aurora Shift

Each recipe updates real editable project settings. Transitions can be assigned to all image/text/video clips or a selected one. New clip transitions are **Whip**, **Glitch** and **Spin**, in addition to existing Fade/Slide/Zoom. Original media files are untouched. Preview and export render with the same deterministic drawing algorithms. Undo is supported.

### Templates — Avee and NCS-style visuals

22 editable templates, including six new original compositions:

- Avee Inspired Bass Reactor
- Midnight Cat Pulse
- NCS Inspired Prism Halo
- Aurora Night Halo
- Cobra Phonk Glitch
- Purple Drift Spectrum

There are three new visualizer rendering modes: **Avee Orbital Reactor**, **NCS-style Halo** and **Phonk Cat Pulse**. All geometry is original Canvas code. No Avee preset files, NCS assets or brand artwork are bundled. These are visual style inspirations, **not officially affiliated with Avee Player or NCS**.

### Discover — Phonk Trend Finder

The Discover tab opens official music platforms and searches:

- [YouTube Charts](https://charts.youtube.com/) — charts including popular Shorts music
- [YouTube search](https://www.youtube.com/results?search_query=phonk+2026)
- [SoundCloud Phonk search](https://soundcloud.com/search/sounds?q=phonk)
- [Pixabay music](https://pixabay.com/music/search/phonk/)
- [NCS usage restrictions](https://ncs.io/usage-policy/2/types-of-content)

These are **live external links**, not a built-in trending database or continuously refreshed ranked recommendations. No automated scraping, platform audio downloading, copyrighted stream ripping, or unlicensed music distribution is included.

## Copyright and no-copyright music disclaimer

**Mixing two songs does not remove copyright.** The musical compositions and recordings of both must be licensed for remixing and publication. Check the exact licence for each track, credits, attribution, derivative use and target platform. Pixabay permits modification under its license with conditions and no standalone redistribution. NCS's general independent-creator usage policy explicitly disallows simple music reuploads/standalone music visualizers and can restrict alterations to recordings. Do not assume NCS music is permitted merely because the project includes an NCS-style visualizer.

## Quality verification

- GitHub Actions unit suite: 57 tests, **51 passed**, **6 skipped** (optional software canvas checks), 0 failures.
- React/TypeScript, ESLint and Next.js production build passed on the committed source.
- Chromium Playwright suite: **6/6 passed**, covering real WebM/MP4 export, WAV two-song mashup, new visualizer/FX/Discover panels and the Shorts/replay flows.
- Vercel production deployment: published via repository main. This proves app builds, not audio mastering quality or universal device/browser codec compatibility.

## Existing features preserved

Original BASS BIN MUSIC logo, beat detection, local project save, 15/30/60-second Shorts suggestions, manual cuts, Auto Director, video export (including H.264 MP4 where supported) and former templates are retained.

## Troubleshooting

- If **Music** or **Discover** tabs do not show on the production site, refresh with Ctrl+Shift+R.
- If two-track preview plays no audio, use a current desktop Chrome/Edge, ensure the browser is not muted and audio source decodes.
- If MP4 encoding fails due to browser codecs, download WebM as backup and convert outside the browser.
- For a 180+ second mashup, shorten source clips before rendering; Studio's overall timeline can still be up to 10 minutes.

Last updated: 2026-10-22.
