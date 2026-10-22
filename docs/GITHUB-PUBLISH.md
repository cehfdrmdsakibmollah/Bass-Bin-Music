# Publish v0.4 to GitHub

Target: https://github.com/cehfdrmdsakibmollah/Bass-Bin-Music

The connected repository was empty before its README was initialized. This package contains the full v0.4 sources and binary artwork, ready to publish from Windows. **Until the script runs successfully, a remote README alone does not mean the project source has been uploaded.**

## Easy Windows method

1. Download the **BASS_BIN_MUSIC_GitHub_Ready_v0.4.zip** from ChatGPT.
2. Extract it. Open its **bass-bin-music** folder.
3. Install Git for Windows and sign in to GitHub when prompted.
4. Double-click **publish-to-github.bat**.
5. Review the staged summary. Type `YES` to approve the upload.
6. Check the repository in your browser after Git reports a successful push.

The script clones `main` and overlays the project, without deleting unrelated remote files. It ignores local secrets and generated build folders. It does not modify your existing local working directory or use a personal-access token saved in source code.

## Manual method

Clone the existing repository, copy **the contents** of `bass-bin-music` into the clone, then run:

```powershell
git add --all
git status
git commit -m "feat: import BASS BIN MUSIC Auto Director Pro v0.4"
git push origin main
```

## CI status

The included GitHub Actions workflow runs npm tests, typecheck, lint, and build when source files are pushed. This does not mean those checks already passed on GitHub. Review the Actions tab for the actual results.

Do not upload `.env`, API keys, admin SDK JSON files, tokens, or private media to the public GitHub repository.
