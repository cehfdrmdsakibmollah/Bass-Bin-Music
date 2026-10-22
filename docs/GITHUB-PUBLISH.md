# GitHub source repository — BASS BIN MUSIC v0.4

**Status: uploaded successfully to `main`.** The full Auto Director Pro v0.4 source, tests, demo, documentation, original artwork, and sample audio were committed to:

https://github.com/cehfdrmdsakibmollah/Bass-Bin-Music

Initial full-source commit: `dd1cb16e77f0c0b839646ae6e658aea16209b2fa`.

## Clone and run

```bash
git clone https://github.com/cehfdrmdsakibmollah/Bass-Bin-Music.git
cd Bass-Bin-Music
npm install
npm run dev
```

Open http://localhost:3000/studio.

## Run release checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The GitHub Actions workflow `.github/workflows/validate.yml` runs tests, typechecks, linting and a Next.js production build on source changes. **Check the Actions tab for the actual outcome; a committed source tree does not imply a successful production build.**

## Updating the repository from Windows

For later updates, place modified project files inside your local clone, then:

```powershell
git status
git add --all
git commit -m "feat: update BASS BIN MUSIC"
git push origin main
```

The optional `publish-to-github.bat` helper can also overlay an extracted source folder onto a new clone and requests explicit YES confirmation before pushing.

Never commit `.env`, personal-access tokens, API keys, private service-account JSON, or third-party copyrighted media. This repository is public.
