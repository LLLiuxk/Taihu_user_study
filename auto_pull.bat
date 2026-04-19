@echo off
echo ====================================================
echo Starting auto-pull from GitHub...
echo ====================================================

:: Change directory to where the script is located
cd /d "%~dp0"

echo [1/1] Pulling latest changes from cloud repository...
git pull origin main

echo ====================================================
echo SUCCESS! Auto-pull complete. Local files updated.
echo Safe to close this window.
echo ====================================================
pause
