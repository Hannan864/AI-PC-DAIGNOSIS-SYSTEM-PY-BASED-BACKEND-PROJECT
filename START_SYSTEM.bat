@echo off
TITLE System Sentinel - Unified Ignition Sequence
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo    SYSTEM SENTINEL PLATFORM RECOVERY
echo ==========================================
echo.

:: 1. Start Backend Service
echo [STEP 1/2] Starting Python Diagnostic Service...
cd backend
if exist venv\Scripts\activate (
    start "Sentinel Backend" cmd /k "venv\Scripts\activate && python main.py"
) else (
    echo WARNING: Virtual environment not found. Attempting global python...
    start "Sentinel Backend" cmd /k "python main.py"
)
cd ..

:: 2. Wait for Backend to initialize
timeout /t 3 /nobreak > nul

:: 3. Start Frontend Service
echo [STEP 2/2] Launching Vite Dev Server...
start "Sentinel Frontend" cmd /k "npm run dev"

echo.
echo ------------------------------------------
echo SUCCESS: Ignition sequence completed.
echo ------------------------------------------
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check the newly opened windows for logs.
echo Press any key to exit this launcher...
pause > nul
