# BASS BIN MUSIC — Phonk Montage: footage first

This replaces the misleading practice of calling a green circular equalizer a "Phonk template".

## What the three styles actually do

- **Hard Phonk Montage:** Select real imported shots on the estimated strongest kick/drop positions, punch keyframes, short Glitch transition, punchy contrast settings.
- **Night Drift Edit:** More breathing room between cuts, parallax/motion keyframes and Whip transitions. Add your own driving footage.
- **Memphis VHS Edit:** Longer analog cuts, controlled film grain, softer fade entries and low-frequency pulsing.

These are **real multi-clip timeline edits** using the user's media rather than abstract ring skins. The user must supply at least two distinct images/videos and one music file. If requirements are missing, the action explains them and keeps the project unchanged. We do not silently invent or scrape footage.

## Create and export

1. Open the live Studio. Because old autosaved projects remain, click **+ New Phonk** to start a fresh project if the previous circular edit is still open (confirmation protects the current project).
2. Open **Templates → Phonk Montage**.
3. Use **Import images / videos** and select at least two creator-owned files. Use Assets for a music track.
4. Pick Hard Phonk, Night Drift or Memphis VHS. Click **Create actual beat-synced Phonk edit**.
5. Every created shot appears as an editable segment on the timeline. Adjust split, start, source time, transitions and motion in Inspector. Undo restores the prior arrangement.
6. The composition uses 9:16 portrait for Reels/Shorts and retains the MP4 export mode. Mobile uses its existing slide-up tool panels.

## Actual video and audio behavior

- Strong/detected bass markers are prioritized for cuts. When no usable markers exist, a fixed-pacing fallback is clearly labeled—not misrepresented as AI analysis.
- The tool cycles between your separate imported assets. The visualizer layer becomes hidden so full-frame car/portrait footage isn't obscured by another circular spectrum.
- A source video longer or shorter than its allocated shot will reuse valid source offsets and loop **only montage clips**; ordinary uploaded video behavior is preserved.
- Imported videos obtain source duration from media metadata for more reliable trims.
- Audio stays on its own timeline, not combined with copyrighted songs.
- Output still uses browser MediaRecorder + local optional H.264/AAC transcode (device-dependent). There is no server-side commercial footage library.

## Honest scope

This is a footage-first Phonk montage editor, not a CapCut clone, not live trending song downloads, not native optical-flow time remapping or full BandLab. It cannot guarantee copyright-free status by mixing songs. Continue to test real mobile devices and visual quality manually.

## Quality checks

Unit tests require two different real source assets, a real music track, continuous clips with no gaps, source offsets bounded by video metadata, bounded layers, distinct choreography, real beat cuts and an explicitly disclosed fallback. Chromium workflow checks the project controls and generated tracks using actual imported file inputs.
