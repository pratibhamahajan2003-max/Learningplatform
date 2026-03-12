#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   LearnAI - Starting Platform...         ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# Go to backend folder
cd "$(dirname "$0")/backend"

# Check Python
if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
    echo "  ERROR: Python not found!"
    echo "  Mac: brew install python   OR   https://python.org"
    echo "  Linux: sudo apt install python3 python3-pip"
    exit 1
fi

PYTHON=$(command -v python3 || command -v python)

echo "  [1/3] Python found: $($PYTHON --version)"
echo "  [2/3] Installing Flask..."
$PYTHON -m pip install flask flask-cors --quiet

echo "  [3/3] Starting server..."
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  Open your browser at:                   ║"
echo "  ║                                          ║"
echo "  ║    http://localhost:5000                 ║"
echo "  ║                                          ║"
echo "  ║  Press CTRL+C to stop                    ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

$PYTHON app.py
