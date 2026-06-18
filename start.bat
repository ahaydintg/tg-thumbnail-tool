@echo off
echo TG Thumbnail Tool baslatiliyor...

SET PYTHON=C:\Users\newto\AppData\Local\Programs\Python\Python312\python.exe
SET PIP=C:\Users\newto\AppData\Local\Programs\Python\Python312\Scripts\pip.exe

REM Backend
start "TG Backend" cmd /k "cd /d %~dp0backend && "%PIP%" install -r requirements.txt -q && "%PYTHON%" -m uvicorn main:app --reload --port 8000"

REM Kisa bekleme
timeout /t 4 /nobreak > nul

REM Frontend
start "TG Frontend" cmd /k "cd /d %~dp0frontend && npm install --silent && npm run dev"

echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Her iki pencere hazir oldugunda tarayicida http://localhost:5173 adresini acin.
pause
