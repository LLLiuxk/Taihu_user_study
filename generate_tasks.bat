@echo off
cd /d "%~dp0"
echo ============================================
echo   Auto Generate Study Tasks
echo   Scans models/ and updates app.js
echo ============================================
echo.
python auto_generate_tasks.py
echo.
pause
