# Smart AI Document Insights

A production-ready, full-stack AI document intelligence platform that runs **entirely locally** using Ollama. Upload documents (PDF, DOCX, CSV, JSON, TXT) and get automatic AI-powered insights or chat with your documents using RAG (Retrieval-Augmented Generation).

![Frontend](https://img.shields.io/badge/Frontend-Next.js_16-blue) ![Backend](https://img.shields.io/badge/Backend-FastAPI_0.115-green) ![AI](https://img.shields.io/badge/AI-Ollama_Local-purple) ![VectorDB](https://img.shields.io/badge/VectorDB-ChromaDB_0.5-orange)

---

## Features

- **Multi-format Support** — PDF, DOCX, CSV, JSON, TXT
- **AI Insights** — Executive summaries, key findings, action items, risks, highlighted sections (structured JSON output)
- **Document Chat** — Multi-turn Q&A with source citations and streaming responses
- **Hybrid Retrieval** — Semantic search + BM25 keyword search with score fusion (70/30 weighting)
- **Privacy First** — Everything runs locally through Ollama. No cloud APIs, no data leaves your machine
- **Dark/Light Mode** — Clean, modern enterprise UI with system-font rendering
- **Real-time Processing** — Live status updates (uploading → parsing → embedding → indexed) with 3-second polling
- **Docker Support** — One-command deployment via docker-compose
- **Document Persistence** — Document metadata survives server restarts via JSON file + ChromaDB recovery

---

## Demo

```
User uploads a contract PDF
  → Backend parses, chunks, embeds, indexes into ChromaDB
  → User clicks "Generate Insights"
    → Ollama returns executive summary, key findings, risks, action items
  → User asks "What are the termination clauses?"
    → Hybrid retriever finds relevant chunks
    → Ollama answers with source citations
```

---

## Architecture

```
                    ┌─────────────────────────────────┐
                    │       Browser (Port 3000)       │
                    │  Next.js 16 + React 19 + TS     │
                    │                                 │
                    │  Header │ UploadZone │ DocList  │
                    │  InsightsPanel │ ChatPanel      │
                    │  Zustand Store │ API Client     │
                    └──────────────┬──────────────────┘
                                   │ HTTP REST + SSE
                                   v
                    ┌───────────────────────────────-──┐
                    │     FastAPI Backend (Port 8000)  │
                    │                                  │
                    │  /api/upload     → process doc   │
                    │  /api/documents  → CRUD          │
                    │  /api/insights   → AI analysis   │
                    │  /api/chat       → RAG Q&A       │
                    │  /api/chat/stream→ SSE streaming │
                    │  /api/health     → health check  │
                    │  /api/ollama/status→ Ollama check│
                    └───────┬──────────┬──────────┬────┘
                            │          │          │
                    ┌───────┘          │          └──────────┐
                    v                  v                     v
            ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐
            │   Parsers    │  │   ChromaDB   │  │  Ollama (localhost)│
            │  pdf / docx  │  │  Persistent  │  │  :11434            │
            │  csv / json  │  │  Collections │  │                    │
            │  txt         │  │  Cosine dist │  │  /api/chat         │
            │              │  │  Per-doc     │  │  /api/embed        │
            │  → pages[]   │  │  doc_{id}    │  │  /api/tags         │
            │  → full_text │  │              │  │                    │
            └──────────────┘  └──────────────┘  │  llama3            │
                                                │  nomic-embed-text  │
                                                └────────────────────┘
```

---

## Processing Pipeline

```
  Upload                    Parse                    Chunk
  ┌────────┐               ┌────────┐              ┌────────┐
  │ Validate│  ──►  PyMuPDF  │  ──►  Recursive  │
  │ file    │       python-  │       Char       │
  │ type/   │       docx     │       Splitter   │
  │ size    │       csv/json │       (1000/200) │
  └────────┘       txt       │       + overlap  │
                   └────────┘       └────────┘
                                        │
                                        v
  Store                   Embed        Chunks
  ┌────────┐              ┌────────┐    │
  │ChromaDB│  ◄──── Ollama│  ◄──────┘
  │persist │       nomic- │
  │cosine  │       embed  │
  │dist    │       text   │
  └────────┘              └────────┘

  Retrieve (Hybrid)
  ┌──────────────────────────────┐
  │  1. Query embedding (Ollama) │
  │  2. Semantic (ChromaDB)      │
  │  3. BM25 keyword scoring     │
  │  4. Fuse: 0.7*sem + 0.3*bm25│
  │  5. Return top 5 chunks      │
  └──────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS | 16.2.7 / 19.2.7 / ^5 / v4 |
| **State** | Zustand, TanStack React Query | 5.0.14 / 5.101.0 |
| **Backend** | FastAPI, Pydantic, Uvicorn | 0.115.6 / 2.10.4 / 0.34.0 |
| **LLM Runtime** | Ollama (local) | — |
| **Chat Model** | llama3 (default, configurable) | — |
| **Embedding Model** | nomic-embed-text (default, configurable) | — |
| **Vector DB** | ChromaDB (persistent, cosine distance) | 0.5.23 |
| **PDF Parsing** | PyMuPDF (fitz) | 1.26.5 |
| **DOCX Parsing** | python-docx, mammoth | 1.1.2 / 1.8.0 |
| **CSV/JSON/TXT** | Built-in Python modules | — |
| **Async HTTP** | httpx, aiofiles | 0.28.1 / 24.1.0 |
| **Search** | rank-bm25 | 0.2.2 |
| **Containerization** | Docker, Docker Compose | — |

---

## Prerequisites

1. **Python 3.11+**
2. **Node.js 20+**
3. **Ollama** installed and running:
   ```bash
   # Install from https://ollama.ai
   ollama pull llama3          # or your preferred chat model
   ollama pull nomic-embed-text # embedding model (required)
   ```

---

## Quick Start

### Option 1: Local Development

**Terminal 1 — Start Ollama** (if not already running):
```bash
ollama serve
```

**Terminal 2 — Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Option 2: Docker Compose

```bash
# Ensure Ollama is running on the host (http://localhost:11434)
docker compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

---

## Configuration

All settings are configured via environment variables. See `.env.example` for defaults.

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `CHAT_MODEL` | `llama3` | LLM for chat and insights |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Model for generating embeddings |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Backend API base URL |

### Backend Constants (in `backend/config.py`)

| Constant | Value |
|---|---|
| `MAX_FILE_SIZE` | 100 MB |
| `ALLOWED_EXTENSIONS` | `.pdf`, `.docx`, `.csv`, `.json`, `.txt` |
| `CHUNK_SIZE` | 1000 characters |
| `CHUNK_OVERLAP` | 200 characters |
| `RATE_LIMIT_PER_MINUTE` | 30 requests |

---

## API Reference

All endpoints are prefixed with `/api`. Full interactive docs at `http://localhost:8000/docs` (Swagger) or `http://localhost:8000/redoc` (ReDoc).

### Health & Status

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/health` | Health check | `{"status": "healthy", "service": "..."}` |
| `GET` | `/api/ollama/status` | Ollama connectivity & model readiness | `{"available": bool, "chat_model_ready": bool, "embedding_model_ready": bool}` |

### Document CRUD

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| `POST` | `/api/upload` | Upload and process a document | `multipart/form-data` with field `file` | `DocumentResponse` |
| `GET` | `/api/documents` | List all documents | — | `DocumentResponse[]` |
| `GET` | `/api/documents/{id}` | Get document metadata | — | `DocumentResponse` |
| `DELETE` | `/api/documents/{id}` | Delete document + vectors | — | `{"message": "..."}` |
| `POST` | `/api/process/{id}` | Reprocess a document | — | `{"message": "...", "status": "..."}` |

### Insights & Chat

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/insights/{id}` | Generate structured AI insights | — | `InsightResponse` |
| `POST` | `/api/chat` | RAG-based chat | `{"document_id": str, "question": str, "conversation_id"?: str}` | `{"answer": str, "sources": [...], "conversation_id": str}` |
| `POST` | `/api/chat/stream` | Streaming chat (SSE) | Same as `/api/chat` | `text/event-stream` |

### Response Models

```typescript
// DocumentResponse
{
  id: string;              // UUID
  filename: string;        // Original filename
  status: "uploaded" | "parsing" | "embedding" | "indexed" | "failed";
  upload_time: string;     // ISO datetime
  file_size: number;       // Bytes
  page_count? : number;
  chunk_count? : number;
}

// InsightResponse
{
  document_id: string;
  executive_summary: string;
  key_findings: string[];
  action_items: string[];
  risks: string[];
  highlighted_sections: { quote: string; explanation: string; source: string }[];
}

// ChatResponse
{
  answer: string;                    // LLM-generated answer
  sources: {                         // Retrieved chunks used for context
    content: string;
    page_number?: number;
    section?: string;
    filename: string;
    score: number;                   // Relevance score (0-1)
  }[];
  conversation_id: string;           // UUID for multi-turn chat
}
```
---

## Project Structure

```
smart-ai-doc-insights/
├── .env.example                  # Environment variable template
├── docker-compose.yml            # Multi-container orchestration
│
├── backend/
│   ├── main.py                   # FastAPI app entry point (uvicorn)
│   ├── config.py                 # Central configuration constants
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # python:3.11-slim build
│   ├── .env                      # Backend env vars
│   │
│   ├── api/
│   │   └── routes.py             # All REST endpoints
│   ├── models/
│   │   └── schemas.py            # Pydantic models & enums
│   ├── services/
│   │   ├── document_service.py   # Document CRUD + processing pipeline
│   │   ├── chat_service.py       # RAG chat + streaming (SSE)
│   │   └── insights_service.py   # AI insight generation (structured JSON)
│   ├── parsers/
│   │   ├── __init__.py           # Parser registry (routes by extension)
│   │   ├── pdf_parser.py         # PyMuPDF (fitz)
│   │   ├── docx_parser.py        # python-docx
│   │   ├── csv_parser.py         # Built-in csv module
│   │   ├── json_parser.py        # Recursive flatten
│   │   └── txt_parser.py         # UTF-8 text reader
│   ├── rag/
│   │   ├── chunker.py            # RecursiveCharacterTextSplitter
│   │   └── retriever.py          # Hybrid retrieval (semantic + BM25)
│   ├── embeddings/
│   │   └── ollama_embeddings.py  # Ollama /api/embed wrapper
│   ├── vectorstore/
│   │   └── chroma_store.py       # ChromaDB persistent client
│   ├── utils/
│   │   └── file_utils.py         # File validation, I/O, UUID generation
│   └── data/                     # Created at runtime
│       ├── uploads/              # Uploaded files
│       └── chroma_data/          # ChromaDB persistent storage
│
├── frontend/
│   ├── package.json              # Dependencies (Next.js 16, React 19, Zustand 5...)
│   ├── next.config.ts            # Next.js config (standalone, Turbopack)
│   ├── tsconfig.json             # TypeScript strict mode
│   ├── Dockerfile                # Multi-stage node:20-alpine build
│   ├── .env.local                # NEXT_PUBLIC_API_URL
│   │
│   ├── app/
│   │   ├── layout.tsx            # Root layout (Tailwind CDN, dark mode, custom theme)
│   │   ├── page.tsx              # Main dashboard (client component)
│   │   └── globals.css           # Global styles, animations, scrollbar
│   │
│   ├── components/
│   │   ├── Header.tsx            # Top bar: logo, Ollama status, dark mode toggle
│   │   ├── DocumentList.tsx      # Sidebar: file list with status badges
│   │   ├── UploadZone.tsx        # Drag-and-drop upload area
│   │   ├── InsightsPanel.tsx     # Collapsible insight sections with color coding
│   │   └── ChatPanel.tsx         # Chat UI: messages, auto-scroll, source citations
│   │
│   ├── store/
│   │   └── app-store.ts          # Zustand global state (documents, chat, insights, UI)
│   ├── lib/
│   │   └── api.ts                # Typed API client + SSE stream reader
│   └── types/
│       └── index.ts              # TypeScript interfaces
│
└── README.md
```

---

## Detailed Component Guide

### Frontend Components

| Component | Props | Description |
|---|---|---|
| `Header` | `darkMode`, `toggleDarkMode`, `toggleSidebar` | App logo, Ollama status dot (green/red), dark mode toggle |
| `UploadZone` | `onUpload(file)`, `uploading` | Drag-and-drop zone + file picker, visual feedback on drag |
| `DocumentList` | `documents[]`, `selectedId`, `onSelect`, `onDelete` | File cards with type icon, size, pages, chunks, status badge |
| `InsightsPanel` | `insights`, `isLoading`, `onGenerate` | 5 collapsible color-coded sections (Summary, Findings, Actions, Risks, Highlights) |
| `ChatPanel` | `messages[]`, `onSend(question)`, `selectedDocumentId` | Message bubbles with avatars, sources, timestamps, auto-resizing input |

### Backend Services

| Service | Key Functions | Description |
|---|---|---|
| `document_service.py` | `create_document_entry()`, `process_document()`, `delete_document_data()`, `check_ollama_status()` | Document CRUD with JSON persistence + ChromaDB recovery on restart |
| `chat_service.py` | `chat()`, `chat_stream()` | RAG Q&A with conversation history, full-text fallback, SSE streaming |
| `insights_service.py` | `generate_insights()` | Structured JSON prompt to Ollama (summary, findings, actions, risks, highlights) |

### Parsers

| Parser | Library | Output `pages[]` format |
|---|---|---|
| `pdf_parser.py` | PyMuPDF (`fitz`) | `{text, page_number, section}` per page |
| `docx_parser.py` | python-docx | `{text, page_number: 1, section}` per paragraph/table |
| `csv_parser.py` | Built-in `csv` | Headers + row data with `row_number` |
| `json_parser.py` | Built-in `json` | Flattened `path: value` entries |
| `txt_parser.py` | Built-in | Paragraphs split by `\n\n` |

### Retrieval Pipeline (`rag/retriever.py`)

```
User Query
    │
    ├── 1. get_embedding(query) → 768-dim vector (Ollama nomic-embed-text)
    │
    ├── 2. query_collection() → top 15 semantic results (cosine distance)
    │
    ├── 3. Tokenize + BM25 score on those 15 results (k1=1.5, b=0.75)
    │
    ├── 4. Fuse: 0.7 × normalized_semantic + 0.3 × normalized_bm25
    │
    └── 5. Return top 5 chunks with scores
```

---

## Development

### Running Tests

```bash
# Backend
cd backend
python -m pytest tests/ -v

# Frontend
cd frontend
npm run lint
```

### Adding a New Parser

1. Create `backend/parsers/new_parser.py`
2. Export a function `parse_<format>(file_path) -> dict` returning `{"pages": [...], "full_text": str, "page_count": int, "source_type": str}`
3. Register it in `backend/parsers/__init__.py`'s `PARSERS` dict

### Adding a New Frontend Component

1. Create the component in `frontend/components/`
2. Add TypeScript types to `frontend/types/index.ts` if needed
3. Import and use in `frontend/app/page.tsx`

---

## Troubleshooting

| Problem | Solution |
|---|---|
| **Ollama not available** | Run `ollama serve` in a terminal. Check `http://localhost:11434/api/tags` |
| **Model not found** | `ollama pull llama3` and `ollama pull nomic-embed-text` |
| **ImportError: cannot import name 'PYDANTIC_V2'** | Reinstall fastapi: `pip install --force-reinstall fastapi==0.115.6` |
| **Frontend shows blank page** | Check browser console for errors. Ensure backend is running. |
| **Chat returns generic "not enough info"** | The document may not have been fully indexed. Check status badge. If it persists, the full-text fallback should handle it. |
| **Documents disappear after restart** | Fixed in current version — documents are persisted to `documents_store.json` and recovered from ChromaDB on startup. |
| **npm install fails** | Try `npm install --ignore-scripts` if a native module build fails. |

---

## Docker Architecture

When running with Docker Compose:
- Backend container connects to Ollama on the host via `host.docker.internal:11434`
- Frontend container fetches API from backend container via Docker network
- Persistent volumes: `uploads/` and `chroma_data/` for backend data

```bash
docker compose up --build   # Build and start both services
docker compose down         # Stop and remove containers
docker compose logs -f      # Follow logs
```

---

## License

MIT
# AI-document-insights
