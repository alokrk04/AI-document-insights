#!/bin/bash
# Quick start script - Run this after installing prerequisites

PROJECT_DIR="/Users/alok/Desktop/smart-ai-doc-insights"

echo "🚀 Starting Smart AI Document Insights..."
echo ""

# 1. Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found - Install from nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found - Install with Node.js"
    exit 1
fi

if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found - Install from ollama.ai"
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# 2. Setup backend
echo "📦 Setting up backend..."
cd "$PROJECT_DIR/backend"

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "✅ Backend ready"
echo ""

# 3. Setup frontend
echo "📦 Setting up frontend..."
cd "$PROJECT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install -q
fi

echo "✅ Frontend ready"
echo ""

# 4. Instructions
echo "=================================="
echo "✅ Project Setup Complete!"
echo "=================================="
echo ""
echo "To run the project, open TWO separate terminals:"
echo ""
echo "📍 Terminal 1 - Backend:"
echo "   cd $PROJECT_DIR/backend"
echo "   source .venv/bin/activate"
echo "   python main.py"
echo ""
echo "📍 Terminal 2 - Frontend:"
echo "   cd $PROJECT_DIR/frontend"
echo "   npm run dev"
echo ""
echo "🌐 Then open: http://localhost:3000"
echo ""
echo "⚠️  Make sure Ollama is running:"
echo "   ollama serve"
echo ""

