# 🔧 Workaround for Restricted Shell Environment

## Problem Identified

Your macOS shell is missing basic Unix utilities:
- ❌ `uname` - used by venv activate script
- ❌ `sed` - used by various tools
- ❌ `sleep` - used in scripts
- ❌ Other standard tools

This is preventing the standard venv activation and running scripts.

---

## ✅ Solution: Direct Runners

I've created **3 ways** to run the project without relying on the activate script:

### **Option 1: Python Runner (RECOMMENDED)**

```bash
python3 /Users/alok/Desktop/smart-ai-doc-insights/run_backend.py
```

This is the cleanest method - it directly imports and runs FastAPI without shell complications.

---

### **Option 2: Shell Script Runner**

```bash
bash /Users/alok/Desktop/smart-ai-doc-insights/run-backend.sh
```

This calls the venv Python directly without using the activate script.

---

### **Option 3: Direct Python Interpreter**

```bash
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python main.py
```

Direct path to venv Python executable.

---

## 🚀 Complete Setup (3 Terminals)

### **Terminal 1: Ollama (AI Service)**
```bash
ollama serve
```

### **Terminal 2: Backend**
```bash
python3 /Users/alok/Desktop/smart-ai-doc-insights/run_backend.py
```

Expected: 
```
✅ Starting backend server...
🌐 Server will run on: http://0.0.0.0:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### **Terminal 3: Frontend**
```bash
bash /Users/alok/Desktop/smart-ai-doc-insights/run-frontend.sh
```

Or if that doesn't work:
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/frontend
npm install
npm run dev
```

---

## 🔍 Why This Happens

Your environment appears to be **sandboxed or restricted**, possibly due to:
- Containerized environment (Docker, VM)
- Restricted security policies
- Corrupted PATH configuration
- Missing system libraries

---

## ✅ Environment Status

| Component | Status | Fix |
|-----------|--------|-----|
| Python 3 | ✅ Working | Already available |
| .venv | ✅ Created | Ready to use |
| Backend code | ✅ Ready | No issues |
| Frontend code | ✅ Ready | No issues |
| Node.js | ❓ Unknown | Install from nodejs.org |
| Ollama | ❓ Unknown | Install from ollama.ai |
| Xcode Tools | ❓ Unknown | Run `xcode-select --install` |
| Shell utils | ❌ Missing | Workaround: use direct runners |

---

## 🛠️ Troubleshooting Direct Runners

### **"Python not found" error**
```bash
# Try explicit path
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python main.py
```

### **"ModuleNotFoundError" when running backend**
Dependencies may not be installed. Try:
```bash
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/pip install -r requirements.txt
```

### **Cannot import main**
Make sure you're in the backend directory:
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/backend
/Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python main.py
```

### **"npm: command not found"**
Node.js is not installed. Download from: https://nodejs.org/

### **"ollama: command not found"**
Ollama is not installed. Download from: https://ollama.ai/

---

## 📍 File Locations

All runners are in the main project directory:

```
/Users/alok/Desktop/smart-ai-doc-insights/
├── run_backend.py ........... Python runner (RECOMMENDED)
├── run-backend.sh ........... Bash runner
├── run-frontend.sh .......... Frontend runner
├── diagnose.sh .............. System checker
└── quickstart.sh ............ Automated setup
```

---

## 💡 Next Steps

1. **Ensure prerequisites installed:**
   - Node.js: `npm --version`
   - Ollama: `ollama --version`

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **Start Backend** (Terminal 2):
   ```bash
   python3 /Users/alok/Desktop/smart-ai-doc-insights/run_backend.py
   ```

4. **Start Frontend** (Terminal 3):
   ```bash
   bash /Users/alok/Desktop/smart-ai-doc-insights/run-frontend.sh
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## 🎯 If Still Having Issues

The direct runners bypass all shell issues. If they don't work:

1. **Check Python is working:**
   ```bash
   python3 --version
   /Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/python --version
   ```

2. **Check dependencies:**
   ```bash
   /Users/alok/Desktop/smart-ai-doc-insights/.venv/bin/pip list | grep -i fastapi
   ```

3. **Verify project structure:**
   ```bash
   ls /Users/alok/Desktop/smart-ai-doc-insights/backend/main.py
   ls /Users/alok/Desktop/smart-ai-doc-insights/frontend/package.json
   ```

---

## 📞 Summary

| Method | Works With Restrictions? | Use When |
|--------|---------------------------|----------|
| `source .venv/bin/activate` | ❌ No | Standard setup |
| `bash run-backend.sh` | ✅ Maybe | Shell available |
| `python3 run_backend.py` | ✅ Yes | Direct Python |
| `/path/to/venv/bin/python main.py` | ✅ Yes | Direct interpreter |

**Recommendation: Try `python3 run_backend.py` first** - it's most likely to work in restricted environments.


