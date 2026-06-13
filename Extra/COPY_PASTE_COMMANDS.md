# 📋 Copy-Paste Commands (For Your Restricted Environment)

Since your shell is missing basic tools, use these **direct commands** that don't rely on `uname`, `sed`, or the activate script.

---

## 🎯 QUICK START (Copy & Paste)

### **Terminal 1: Start Ollama**
```bash
ollama serve
```

### **Terminal 2: Start Backend**
```bash
python3 /Users/alok/Desktop/smart-ai-doc-insights/run_backend.py
```

### **Terminal 3: Start Frontend**
```bash
bash /Users/alok/Desktop/smart-ai-doc-insights/run-frontend.sh
```

### **Browser: Open App**
```
http://localhost:3000
```

---

## ✅ Individual Commands to Copy

### **Check Python**
```bash
python3 --version
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python --version
```

### **Install Backend Dependencies**
```bash
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/pip install -r /Users/alok/Desktop/smart-ai-doc-insights/backend/requirements.txt
```

### **Install Frontend Dependencies**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/frontend
npm install
```

### **Run Backend (with full path)**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/backend
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python main.py
```

### **Run Frontend (with full path)**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/frontend
npm run dev
```

### **Check Health**
```bash
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/api/health').read())"
```

---

## 🔧 Troubleshooting Commands

### **List installed packages**
```bash
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/pip list
```

### **Check if ports are free**
```bash
lsof -i :8000
lsof -i :3000
lsof -i :11434
```

### **Kill process on port**
```bash
kill -9 $(lsof -t -i :8000)
kill -9 $(lsof -t -i :3000)
```

### **Check npm installation**
```bash
npm --version
node --version
```

### **Check Ollama installation**
```bash
ollama --version
```

---

## 📊 Status Check Script

Copy this into a `.sh` file and run it:

```bash
#!/bin/bash

echo "🔍 System Status Check"
echo "=================================="
echo ""

echo "Python:"
python3 --version
echo ""

echo "Virtual Environment:"
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python --version
echo ""

echo "Node.js:"
node --version 2>/dev/null || echo "❌ Not installed"
echo ""

echo "npm:"
npm --version 2>/dev/null || echo "❌ Not installed"
echo ""

echo "Ollama:"
ollama --version 2>/dev/null || echo "❌ Not installed"
echo ""

echo "Backend code:"
ls /Users/alok/Desktop/smart-ai-doc-insights/backend/main.py && echo "✅ Found" || echo "❌ Missing"
echo ""

echo "Frontend code:"
ls /Users/alok/Desktop/smart-ai-doc-insights/frontend/package.json && echo "✅ Found" || echo "❌ Missing"
echo ""

echo "Backend dependencies:"
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/pip list 2>/dev/null | grep -q fastapi && echo "✅ Installed" || echo "❌ Not installed"
echo ""
```

---

## 🆘 If Something Doesn't Work

1. Copy **exact path** - no shortcuts or `~`
2. Use **full paths** - like `/Users/alok/Desktop/...` not `~/Desktop/...`
3. Keep **exactly 3 terminals** running
4. Don't close any terminal until you see the app

---

## 📞 Direct Terminal Commands to Run NOW

### **Just copy, paste, and run each in separate terminals:**

**Terminal 1:**
```
ollama serve
```

**Terminal 2:**
```
python3 /Users/alok/Desktop/smart-ai-doc-insights/run_backend.py
```

**Terminal 3:**
```
bash /Users/alok/Desktop/smart-ai-doc-insights/run-frontend.sh
```

**Then open browser to:**
```
http://localhost:3000
```

That's it! 🚀


