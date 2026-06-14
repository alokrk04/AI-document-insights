# 🚀 Smart AI Document Insights - Complete Setup Guide

## ⚠️ System Status Check

Your current environment is **missing critical components**:

| Component | Status | Required | Action |
|-----------|--------|----------|--------|
| Python | ✅ Available | ✓ | Already working |
| Node.js/npm | ❌ Missing | ✓ | **Install required** |
| Ollama | ❌ Missing | ✓ | **Install required** |
| Xcode Tools | ❌ Missing | ✓ | **Install required** |

---

## 🔧 Installation Steps (In Order)

### **Step 1: Install Xcode Command Line Tools**
```bash
xcode-select --install
```
Wait for installation to complete (10-15 minutes).

### **Step 2: Install Ollama**
Download from: **https://ollama.ai** (Direct download)

After install, start Ollama:
```bash
ollama serve
# In new terminal, pull models:
ollama pull llama3
ollama pull nomic-embed-text
```

### **Step 3: Install Node.js & npm**
Download from: **https://nodejs.org/**
(Recommended: LTS version, v20+)

Verify installation:
```bash
node --version
npm --version
```

### **Step 4: Setup Backend**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/backend
pip install -r requirements.txt
```

### **Step 5: Setup Frontend**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/frontend
npm install
```

---

## ▶️ Running the Project

### **Terminal 1: Start Backend**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/backend
python main.py
```
Expected: Server running at `http://localhost:8000`

### **Terminal 2: Start Frontend**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/frontend
npm run dev
```
Expected: App running at `http://localhost:3000`

---

## ✅ Verification

Once both servers are running:

**Check Backend Health:**
```bash
curl http://localhost:8000/api/health
# Expected: {"status":"healthy","service":"Smart AI Document Insights"}
```

**Check Ollama Status:**
```bash
curl http://localhost:8000/api/ollama/status
```

**Access Frontend:**
Open browser: `http://localhost:3000`

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "command not found: pip" | Ensure Python venv is activated: `source .venv/bin/activate` |
| "Ollama connection refused" | Ollama must be running: `ollama serve` in separate terminal |
| "Port 8000 already in use" | Change port in `backend/main.py` line 39 |
| "npm: command not found" | Node.js not installed - download from nodejs.org |
| "ModuleNotFoundError" | Run `pip install -r requirements.txt` |

---

## 📞 Need Help?

If you encounter issues:
1. Verify all 3 prerequisites are installed (Xcode Tools, Node.js, Ollama)
2. Check that virtual environment is activated
3. Ensure Ollama is running in background
4. Check port 8000 and 3000 are free


