# Architecture — BASS BIN MUSIC Advanced Studio v0.2

## Runtime architecture

- Next.js App Router server-rendered indexable public pages and `/studio` client-only creation workspace.
- Uploaded audio, images, and video are stored locally in IndexedDB; asset IDs are referenced from versioned JSON project metadata.
- Web Audio analysis graph: `HTMLAudioElement` → low shelf 180Hz → peaking EQ 1.1kHz → high shelf 4.8kHz → analyser → volume gain → optional compressor → speakers + MediaStream destination. Audio codec support depends on the browser.
- Audio analysis additionally decodes complete local files at size <= 35MB to extract approximate waveform maxima, onset markers and confidence-gated BPM estimates. This is local, not a cloud prediction.
- Animated Canvas 2D layer renderer (`render.ts`) supports 7 spectrum modes, 8 color presets, grid/aurora/solid backgrounds, particles, grain, vignette, zoom, shake, text and image/video transforms, interpolation and clip transitions.
- `/studio` contains transport, multi-track timeline, selection/reordering, draggable start offsets, inspector, keyframes, export panel, local save and recovery. React state is backed by a project ref for animation frames; undo/redo history holds immutable project snapshots.
- `project.ts` validates schemaVersion 1 plus v0.2 optional properties. Older v0.1 projects continue to be accepted. `advanced.ts` handles motion interpolation, beat snapping and visual clip splitting. `audio-analysis.ts` holds testable PCM analysis.
- Native MediaRecorder records Canvas.captureStream video and Web Audio destination audio with user-selectable *requested* bitrate/fps. Actual quality and timing vary by codec/browser; no deterministic offline encoding or server fallback.

## Explicit limitations

- **One audio file source** at a time. Audio trim and gain exist but multitrack mixing, crossfades, audio splitting and time stretching are absent.
- Layers from the same imported video share an HTMLVideoElement, so overlapping duplicate video segments cannot be independently synchronized.
- PCM BPM detection uses transient heuristics and is not guaranteed to detect the musical beat; source decoding may consume significant memory.
- Project JSON backs up settings only. IndexedDB stored assets stay in the same browser and are not embedded in JSON.
- Browser-specific frame delivery and A/V sync in exported videos are not validated. MediaRecorder's MIME probing is an eligibility check, **not proof of recording success**.
- No Firebase, MongoDB, API upload, moderator backend, user accounts or server-based transcoding. Manual platform uploads remain the supported path.
