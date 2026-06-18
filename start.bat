@echo off
echo TG Thumbnail Tool baslatiliyor...

REM Backend
start "Backend" cmd /k "cd /d %~dp0backend && pip install -r requirements.txt -q && uvicorn main:app --reload --port 8000"

REM Kisa bekleme (backend baslarken)
timeout /t 3 /nobreak > nul

REM Frontend
start "Frontend" cmd /k "cd /d %~dp0frontend && npm install --silent && npm run dev"

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Her iki pencere de hazir oldugunda tarayicida http://localhost:5173 adresine gidin.
pause
