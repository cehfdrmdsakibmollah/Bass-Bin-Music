# BASS BIN MUSIC v0.3 — Actual Check Results

- Date: 2026-10-22 (Asia/Dhaka)
- Test command: `npm test` → **25 pass / 0 fail / 0 skipped** on Node.js v22.16.0.
- Core strict TypeScript CLI check: `tsc --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --lib ES2022,DOM src/lib/beat-sync.ts src/lib/types.ts src/lib/project.ts src/lib/render.ts src/lib/audio-analysis.ts src/lib/advanced.ts src/lib/templates.ts src/lib/media.ts` → **passed**.
- TypeScript `transpileModule` syntax parser across `src/`: **30 TS/TSX files, 0 syntax errors** (syntax-only, not full React or Next typecheck).
- User logo: original `image(20261021-182149).png` and copies in `public` + `demo/assets` have the same SHA-256: `e08a15bf0a1332f78f62c6fc29208b0e2e56f7aee052d2b13e394e9f1ed62669`.
- Pixel rendering: transient FX output differs at the onset vs no-sync frame, and deterministic repeat renders pixel-identically with software Canvas.
- `npm install --package-lock-only`: **timed out** (registry inaccessible). No `package-lock.json` has been fabricated. Running `npm install` on an internet-connected development machine will generate it.

**Not checked:** full Next.js dependency install, production build, ESLint with project dependencies, Chrome/Firefox/Safari browser E2E, real device touch gestures, actual audio/video file recording quality, video source duration overflow, Google OAuth, YouTube publishing, GitHub push or Vercel deployment. These remain genuine QA blockers before commercial launch.
