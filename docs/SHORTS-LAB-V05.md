# BASS BIN MUSIC — Shorts Lab v0.5

## New workflow: use the best part of your OWN music

1. Open **Studio → Assets** and import an MP3/WAV. The composition attempts to fit the real decoded song duration rather than staying at 20 seconds.
2. Open **Shorts** in the Studio sidebar. Pick 15/30/60 seconds.
3. Review the top three suggested ranges (score is based only on offline drum/beat estimates). **These are NOT verified YouTube or TikTok trending stats.**
4. Click **Use this hook** to make a 9:16 vertical composition, or use **Use hook + Auto Sync imported footage** when you already uploaded videos/images.
5. Undo to revert. Use **Restore full song** to re-extend the song's audio. A full-song composition can be up to 600 seconds (10 minutes); longer sources need trimming outside the editor first.

## Manual creator workflow

- **Mark In / Mark Out** at the playhead, or enter exact source times.
- **Crop source to In / Out** keeps the current aspect ratio and edits project metadata, not the original audio file.
- Select an audio clip on the timeline and press **S** or **Split** to split it. The second piece advances its source offset correctly.
- Select the earlier audio piece and choose **Join next audio**. Contiguous source pieces merge; different-in-source portions are placed adjacently but remain separate editable clips.
- Inspector can set each segment's source In, source Out, volume and fades.
- After the playhead reaches the end, pressing Play again restarts at 0. Tick **Loop** to repeat preview playback.
- Adjust the overall timeline under Inspector → Project duration, or change aspect using **Ratio** or **Set 9:16**.

## Footage suggestions and rights

The Shorts Lab links to Pexels searches for creator-licensed drifting, neon, night driving, smoke and motorcycle footage. These are only inspiration links. There is **no direct stock-footage scraping, importing, copyright circumvention or verified viral-trends discovery**. Review footage rights, permission for people/brands/trademarks, and platform rules yourself; import selected clips through Assets. See https://www.pexels.com/license/.

## Technical constraints

- One source audio file is supported per project. Splitting/concatenating pieces from that source works; mixed multi-source music projects are **not** supported.
- Audio beat/drop/BPM detection is heuristic, not a professional stem separator or cloud AI.
- Export uses a real-time browser MediaRecorder. Multi-minute high-resolution exports can be memory-intensive and codec support varies; test short exports first.
- Full-length editing maxes out at ten minutes. This is not unlimited-duration editing.
- The **Playwright Chromium export smoke test** confirms a downloaded video file for a short demo, not listening verification of audio quality or sync.
- Undo and editable JSON projects are supported, but after exporting JSON you still need local browser media assets to restore footage.
