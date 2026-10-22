# BASS BIN MUSIC v0.4 - safe one-click GitHub publishing helper
# Requires Git for Windows and the existing owner's permission to push.
param(
    [string]$Repository = 'https://github.com/cehfdrmdsakibmollah/Bass-Bin-Music.git',
    [string]$Branch = 'main'
)
$ErrorActionPreference = 'Stop'
$source = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path (Join-Path $source 'package.json')) -or -not (Test-Path (Join-Path $source 'src\components\Studio.tsx'))) {
    throw 'Please run this script from the extracted bass-bin-music project folder.'
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Git for Windows is not installed. Install it from https://git-scm.com/download/win then try again.'
}
$working = Join-Path ([System.IO.Path]::GetTempPath()) ('bass-bin-publish-' + [guid]::NewGuid().ToString('N'))
$clone = Join-Path $working 'Bass-Bin-Music'
New-Item -ItemType Directory -Path $working -Force | Out-Null
Write-Host 'Cloning your existing GitHub repository...' -ForegroundColor Cyan
& git clone --branch $Branch --single-branch $Repository $clone
if ($LASTEXITCODE -ne 0) { throw 'Git clone failed. Check network access, repository URL and GitHub sign-in.' }
Write-Host 'Copying the v0.4 project without private environment files...' -ForegroundColor Cyan
# Robocopy copies binary images and audio correctly, including nested source folders.
& robocopy $source $clone /E /XD .git node_modules .next .vercel coverage .turbo /XF .env .env.local .env.production .env.development .env.test '*.pem' '*.key' '*serviceAccount*.json' 'firebase-adminsdk-*.json' '*.zip' /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -gt 7) { throw 'File copying failed.' }
Write-Host 'Staging files and checking for changes...' -ForegroundColor Cyan
& git -C $clone add --all
if ($LASTEXITCODE -ne 0) { throw 'Git add failed.' }
$changes = (& git -C $clone status --porcelain)
if (-not $changes) {
    Write-Host 'The repository already contains these project files. Nothing to push.' -ForegroundColor Green
    exit 0
}
Write-Host 'IMPORTANT: review the staged list below before publishing to your PUBLIC GitHub repository:' -ForegroundColor Yellow
& git -C $clone diff --cached --stat
$confirm = Read-Host 'Push these files to GitHub? Enter YES to continue'
if ($confirm -cne 'YES') {
    Write-Host ('Canceled. Staged checkout preserved at: ' + $clone) -ForegroundColor Yellow
    exit 1
}
& git -C $clone commit -m 'feat: import BASS BIN MUSIC Auto Director Pro v0.4'
if ($LASTEXITCODE -ne 0) { throw 'Commit failed. Configure git user.name and user.email if necessary.' }
Write-Host 'Pushing main branch to GitHub...' -ForegroundColor Cyan
& git -C $clone push origin $Branch
if ($LASTEXITCODE -ne 0) {
    throw ('Push failed. Your work is kept here: ' + $clone + ' . Check your GitHub sign-in and retry git push origin main.')
}
Write-Host 'Success! Project is now in your GitHub repository:' -ForegroundColor Green
Write-Host 'https://github.com/cehfdrmdsakibmollah/Bass-Bin-Music'
Write-Host ('Temporary clone: ' + $clone)
