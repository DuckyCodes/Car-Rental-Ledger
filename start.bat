@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js 22 LTS from https://nodejs.org/ then reopen this file.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies for first run...
  call npm install
  if errorlevel 1 (echo Install failed. Check your internet connection and Node.js version. & pause & exit /b 1)
)
call npm run dev
pause
