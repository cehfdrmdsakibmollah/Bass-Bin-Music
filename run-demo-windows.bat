@echo off
setlocal
cd /d "%~dp0demo"
where py >nul 2>nul
if errorlevel 1 (
  echo Python is required to serve ES modules. Alternatively open the demo folder using VS Code Live Server.
  pause
  exit /b 1
)
echo Open http://localhost:8080 in your browser.
py -m http.server 8080
