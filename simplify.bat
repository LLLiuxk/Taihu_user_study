@echo off
cd /d "%~dp0"
echo ============================================
echo   STL Mesh Simplification Tool
echo   Backup: models_high_res_backup\
echo   Target: keep 35%% of faces
echo ============================================
echo.
python simplify_meshes.py
echo.
echo Done! Press any key to close.
pause >nul
