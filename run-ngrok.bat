@echo off
rem Run from this script's own directory, wherever the repo is checked out.
cd /d "%~dp0"

where ngrok >nul 2>nul
if errorlevel 1 (
    echo ERROR: ngrok was not found on PATH.
    echo Install it from https://ngrok.com/download, or add ngrok.exe to PATH.
    pause
    exit /b 1
)

echo ============================================
echo   frames-front-focus  |  port 8080
echo ============================================
echo.

echo [1/2] Starting Vite dev server...
start "frames-front-focus (Vite)" cmd /c "npx vite dev --port 8080 --host 0.0.0.0"

echo Waiting for Vite to be ready...
:wait
timeout /t 1 /nobreak >nul
curl -s -o NUL http://localhost:8080/ 2>nul
if errorlevel 1 goto wait

echo Vite is up.
echo.

echo [2/2] Starting ngrok tunnel...
start "frames-front-focus (Ngrok)" cmd /c "ngrok http 8080"

timeout /t 4 /nobreak >nul
for /f "tokens=*" %%a in ('curl -s http://localhost:4040/api/tunnels 2^>nul') do set "TUNNEL_JSON=%%a"
for /f "tokens=2 delims=," %%a in ('echo %TUNNEL_JSON% ^| findstr "public_url"') do set "URL=%%a"
for /f "tokens=2 delims=: " %%a in ('echo %URL%') do set "URL=%%a"
set URL=%URL:"=%
set URL=%URL:,=%

echo.
echo ============================================
echo   PUBLIC URL: %URL%
echo ============================================
echo.
echo Both windows are running. Close them to stop.
echo.
pause
