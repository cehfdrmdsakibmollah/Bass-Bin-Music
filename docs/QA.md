# QA checklist and test matrix

## Tests supplied

- `tests/project.test.mjs`: 7 pure logical tests for template count, stable editable settings, track operation boundaries, schema rejection, time formatting and composition dimensions.
- `tests/render.test.mjs`: 1 software-canvas test of audio-reactive drawing, skipped automatically where the optional canvas test runtime is absent.

## Viewport matrix (required before release)

| Width | Layout expectation | Result |
|---|---|---|
| 320 | Compact single-column studio, horizontal internal timeline only | NOT TESTED |
| 360 | Small Android phone | NOT TESTED |
| 375 | iPhone narrow viewport | NOT TESTED |
| 390 | Typical mobile | NOT TESTED |
| 430 | Larger mobile | NOT TESTED |
| 768 | Tablet stacked editor + panels | NOT TESTED |
| 1024 | Compact workstation, right tools beneath studio | NOT TESTED |
| 1280 | Wide desktop editor | NOT TESTED |
| 1440 | Wide desktop editor | NOT TESTED |
| 1920 | Large desktop | NOT TESTED |

## Manual end-to-end workflow

1. On a fresh browser origin, open homepage and all public links; inspect canonical tags and `robots` directives.
2. In Studio, play without importing media; observe simulated idle spectrum; seek/pause.
3. Import a short authorized MP3; confirm real frequencies react, playback starts only after user gesture and no network media POST occurs.
4. Import a JPG/PNG; toggle image-layer visibility and confirm compositing.
5. Select template; adjust colors and intensity; undo/redo the changes.
6. Add a text track, edit overlay, start/duration; duplicate, reorder and delete; refresh and confirm IndexedDB autosave.
7. Export 3–10s video; download and verify container, video dimensions, audio stream, A/V sync, pause/seek boundary, duration and playback in a media player.
8. Cancel export midway and verify preview returns safely.
9. Test unsupported codecs/large files, quota exceeded, disabled storage/private browsing and missing permissions.
10. Validate mobile Safari/Android Chrome/desktop Chrome/Edge/Firefox on actual devices or an automated browser grid.
11. Measure Lighthouse and real usage after HTTPS deployment.

## Accessibility

- Verify sequential Tab order, visible focus, labels, accessible form errors, tooltips, skip controls and touch areas (target ~44 CSS px).
- Confirm appropriate contrast and no horizontal **page** overflow at all viewports.
- Verify forced-contrast and prefers-reduced-motion environments.
- Screen-reader test in NVDA + Chrome/Firefox and VoiceOver + Safari.

The uploaded original logo is not an image test substitute. No actual browser screenshots are claimed in this release.
