@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install Node.js 22 LTS and open this file again.
  pause
  exit /b 1
)
echo Installing BASS BIN MUSIC dependencies (internet connection required)...
call npm install
if errorlevel 1 (
  echo Installation failed. Check your internet connection and npm registry access.
  pause
  exit /b 1
)
echo Launching http://localhost:3000
call npm run dev
