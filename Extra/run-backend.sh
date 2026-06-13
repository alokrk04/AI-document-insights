#!/bin/bash
# Direct Python runner - bypasses venv activate script issues

PROJECT_DIR="/Users/alok/Desktop/smart-ai-doc-insights"

echo "🚀 Running Smart AI Document Insights Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Direct path to venv python
VENV_PYTHON="$PROJECT_DIR/.venv/bin/python"
BACKEND_DIR="$PROJECT_DIR/backend"

# Check if python exists
if [ ! -f "$VENV_PYTHON" ]; then
    echo "❌ Error: Virtual environment not found at $VENV_PYTHON"
    echo ""
    echo "Create it with:"
    echo "  python3 -m venv /Users/alok/Desktop/smart-ai-doc-insights/.venv"
    exit 1
fi

echo "✅ Using Python: $VENV_PYTHON"
echo "✅ Backend directory: $BACKEND_DIR"
echo ""
echo "🔄 Starting backend server..."
echo ""

# Run backend directly without activate script
cd "$BACKEND_DIR"
exec "$VENV_PYTHON" main.py

