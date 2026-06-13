#!/bin/bash
# Direct Frontend runner - no venv needed for Node.js

PROJECT_DIR="/Users/alok/Desktop/smart-ai-doc-insights"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🎨 Running Smart AI Document Insights Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if node/npm exist
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Error: npm not found"
    echo ""
    echo "Install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Using npm: $(command -v npm)"
echo "✅ Frontend directory: $FRONTEND_DIR"
echo ""

cd "$FRONTEND_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies (first time only)..."
    npm install
    echo ""
fi

echo "🔄 Starting frontend server..."
echo "🌐 App will be available at: http://localhost:3000"
echo ""

npm run dev

