# BASS BIN MUSIC

**A free-first, beat-synced Phonk video editor and music visualizer.**

This GitHub repository has been initialized for the BASS BIN MUSIC v0.4 source project. The complete v0.4 source currently resides in the user's downloadable ChatGPT project archive and **has not yet been pushed into this repository**. To upload it, extract the v0.4 ZIP on your computer and run the included Windows publishing helper (or use the manual Git commands below).

## What v0.4 includes

- Next.js App Router / TypeScript responsive dark-neon website
- Local audio upload, music analysis, beat and bass-drop markers
- Phonk spectrum visualizers, live Canvas effects and editable templates
- Multi-track timeline, auto beat-cuts and Auto Director Pro
- Keyframe camera movements, speed adjustment, ripple editing and transitions
- Browser-oriented video export, local project saving and CSV/SRT export
- SEO routes, starter tests, and documentation

**Status:** Source release / pre-production. The full Next.js production build and real-browser video-export compatibility have not been independently verified.

## Once the full source is uploaded

```bash
npm install
npm run dev
```

Open http://localhost:3000/studio in your browser.

## Manual source upload to this repository

1. Download and extract **BASS_BIN_MUSIC_Auto_Director_Pro_v0.4.zip** from your ChatGPT conversation.
2. Open the extracted `bass-bin-music` folder.
3. Copy its files into a local clone of this repository, excluding any private `.env` files, `node_modules`, or `.next`.
4. Run:

```bash
git clone https://github.com/cehfdrmdsakibmollah/Bass-Bin-Music.git
cd Bass-Bin-Music
# Copy the extracted project's CONTENTS into this folder, then:
git add .
git commit -m "feat: import BASS BIN MUSIC Auto Director Pro v0.4"
git push origin main
```

Never commit API keys, passwords, Firebase service-account credentials, or other private secrets.
