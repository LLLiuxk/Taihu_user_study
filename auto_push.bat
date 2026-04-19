@echo off
:: Get today's local date (Format: YYYY-MM-DD)
for /f "delims=" %%a in ('powershell -Command "Get-Date -format 'yyyy-MM-dd'"') do set current_date=%%a

echo ====================================================
echo Starting auto-sync to GitHub...
echo Date: %current_date%
echo ====================================================

:: Change directory to where the script is located
cd /d "%~dp0"

echo [1/3] Adding all changes...
git add .

echo [2/3] Committing changes with date...
git commit -m "Auto Update: %current_date%"

echo [3/3] Pushing to cloud repository (Please wait)...
git push

echo ====================================================
echo SUCCESS! Auto-sync complete. Vercel deployment triggered.
echo Safe to close this window.
echo ====================================================
pause
