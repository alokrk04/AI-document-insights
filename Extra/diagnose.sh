#!/bin/bash
# System diagnostic script for Smart AI Doc Insights

echo "🔍 System Diagnostic Report"
echo "=================================="
echo ""

echo "📦 Checking Installed Components:"
echo ""

# Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3: $(python3 --version 2>&1)"
else
    echo "❌ Python3: NOT FOUND"
fi

# Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js: NOT FOUND (Required - Install from nodejs.org)"
fi

# npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm: NOT FOUND (Required - Install with Node.js)"
fi

# Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama: $(ollama --version)"
else
    echo "❌ Ollama: NOT FOUND (Required - Install from ollama.ai)"
fi

# Git
if command -v git &> /dev/null; then
    echo "✅ Git: $(git --version)"
else
    echo "❌ Git: NOT FOUND"
fi

# Xcode
if command -v xcode-select &> /dev/null; then
    echo "✅ Xcode Tools: $(xcode-select --print-path)"
else
    echo "❌ Xcode Tools: NOT FOUND (Required - Run: xcode-select --install)"
fi

echo ""
echo "🔗 Port Status:"
echo ""

# Check ports
if command -v lsof &> /dev/null; then
    if lsof -i :8000 &> /dev/null; then
        echo "⚠️  Port 8000: IN USE"
    else
        echo "✅ Port 8000: Available"
    fi

    if lsof -i :3000 &> /dev/null; then
        echo "⚠️  Port 3000: IN USE"
    else
        echo "✅ Port 3000: Available"
    fi
else
    echo "ℹ️  lsof not available - cannot check ports"
fi

echo ""
echo "📁 Project Structure:"
echo ""

if [ -f "/Users/alok/Desktop/smart-ai-doc-insights/backend/requirements.txt" ]; then
    echo "✅ Backend files: Found"
else
    echo "❌ Backend files: Missing"
fi

if [ -f "/Users/alok/Desktop/smart-ai-doc-insights/frontend/package.json" ]; then
    echo "✅ Frontend files: Found"
else
    echo "❌ Frontend files: Missing"
fi

echo ""
echo "=================================="
echo "⚠️  MISSING REQUIREMENTS:"
echo ""
echo "Before running the project, install:"
echo "1. Xcode Command Line Tools"
echo "2. Node.js (v20+) from nodejs.org"
echo "3. Ollama from ollama.ai"
echo ""

