@echo off
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   LearnAI - Starting Platform...         ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0backend"

echo  [1/3] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Python not found! Please install Python 3.8+
    echo  Download from: https://www.python.org/downloads/
    pause & exit
)

echo  [2/3] Installing dependencies...
pip install flask flask-cors --quiet

echo  [3/3] Starting server...
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║  Open your browser at:                   ║
echo  ║                                          ║
echo  ║    http://localhost:5000                 ║
echo  ║                                          ║
echo  ║  Press CTRL+C to stop the server         ║
echo  ╚══════════════════════════════════════════╝
echo.

python app.py
pause
