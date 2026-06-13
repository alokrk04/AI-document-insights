# 📋 QUICK START - 3 Steps to Running the Project

## What You Have
✅ Project files complete  
✅ Backend code ready  
✅ Frontend code ready  
✅ Python installed  

## What You Need
❌ Node.js/npm  
❌ Ollama (LLM service)  
❌ Xcode Tools  

---

## 🎯 EXACT STEPS TO FOLLOW

### **STEP 1: Install Xcode Command Line Tools**

Open Terminal and run:
```bash
xcode-select --install
```

Click "Install" in the dialog that appears.
**Wait 10-15 minutes for completion.**

Then verify:
```bash
gcc --version
```

---

### **STEP 2: Install Node.js**

1. Go to: **https://nodejs.org/**
2. Download the **LTS version** (v20+)
3. Run the installer and follow prompts
4. Verify by reopening Terminal and running:
```bash
node --version
npm --version
```

---

### **STEP 3: Install Ollama**

1. Go to: **https://ollama.ai/**
2. Download for macOS
3. Run installer
4. Then in Terminal:
```bash
ollama serve
# Keep this running!

# In ANOTHER Terminal window:
ollama pull llama3
ollama pull nomic-embed-text
```

---

## ▶️ NOW RUN THE PROJECT

Once all 3 installed above, open **3 separate Terminal windows**:

### **Window 1: Keep Ollama Running**
```bash
ollama serve
```

### **Window 2: Run Backend**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/backend
source .venv/bin/activate
python main.py
```

### **Window 3: Run Frontend**
```bash
cd /Users/alok/Desktop/smart-ai-doc-insights/frontend
npm install
npm run dev
```

---

## ✅ SUCCESS!

Once all 3 are running:
- Backend will show: `Uvicorn running on http://0.0.0.0:8000`
- Frontend will show: `ready - started server on 0.0.0.0:3000`
- **Open browser to: http://localhost:3000**

---

## 🔗 Installation Links

| Component | Link | Notes |
|-----------|------|-------|
| Xcode Tools | Run `xcode-select --install` | Already on Mac |
| Node.js | https://nodejs.org/ | Download LTS v20+ |
| Ollama | https://ollama.ai/ | Downloads for Mac |

---

## ✅ Verify It Works

After all running, in a 4th Terminal:
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"healthy"...}

curl http://localhost:8000/api/ollama/status
# Should show Ollama is connected
```

---

## 📁 Helper Scripts Created

I created scripts in your project folder:
- `SETUP.md` - Full setup guide
- `TROUBLESHOOTING.md` - Problem solving
- `quickstart.sh` - Automated setup (run after installing prerequisites)
- `diagnose.sh` - Check system status

---

## ⏭️ Next Steps

1. **Install the 3 components** above
2. **Open 3 Terminal windows**
3. **Run the 3 commands** in each window
4. **Open http://localhost:3000 in browser**

That's it! The project will be running.


