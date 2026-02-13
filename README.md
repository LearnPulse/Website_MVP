# LearnPulse MVP (Sprint 1)

Monorepo for LearnPulse Sprint 1: FastAPI backend + Next.js frontend.

## Structure
- `backend/` FastAPI, RAG ingestion, Knowledge Graph, User Memory Store (Postgres), ChromaDB
- `frontend/` Next.js App Router + shadcn-style UI
- `docs/` architecture and specs

### Backend Packages
- `backend/app/agents/` Orchestration + output agents
- `backend/app/services/` Infrastructure services (Chroma, embeddings, KG, memory)

## A–Z Local Setup

### 1) Install System Prereqs
- Python 3.11+
- Node 18+
- Postgres 14+

macOS (Homebrew):
```bash
brew install python@3.11 node postgresql@16
brew services start postgresql@16
```

### 2) Create Database
```bash
psql postgres
```

```sql
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER USER postgres CREATEDB;
CREATE DATABASE learnpulse OWNER postgres;
\q
```

### 3) Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` with your Gemini key:
```
GEMINI_API_KEY=YOUR_KEY
```

### 4) Run Migrations
```bash
cd backend
export PYTHONPATH=.
alembic upgrade head
```

### 5) Run Backend
```bash
cd backend
uvicorn app.main:app --reload
```

Health check:
```bash
curl http://127.0.0.1:8000/health
```

### 6) Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
```

Ensure `frontend/.env.local` has:
```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

### 7) Run Frontend
```bash
cd frontend
npm run dev
```

Open http://localhost:3000

### 8) End-to-End Test
- Upload a PDF in the UI (Document Ingestion card).
- Click **Upload + Ingest**.
- Click **Generate Output**.
- You should see a generated response and status updates.

## Troubleshooting

### Frontend “Failed to fetch”
- Confirm backend is running: `curl http://127.0.0.1:8000/health`
- Ensure `NEXT_PUBLIC_API_BASE` is set and restart `npm run dev`
- If frontend is on HTTPS (Vercel), backend must be HTTPS too

### Chroma errors / read-only
- Set a writable `CHROMA_DIR` in `backend/.env`
- Default path uses `backend/data/chroma`

### No embeddings (Count: 0)
- Re-ingest after adding PDF support
- Some PDFs are image-only (need OCR later)

## Sprint 1 Capabilities
- Document upload + ingestion
- PDF + text chunking + Gemini embeddings + ChromaDB
- Knowledge Graph source node creation
- User Memory Store in Postgres
- Learning Orchestration Agent (minimal)
- Lightweight web interface

## Notes
- ChromaDB is local and can be swapped later.
- Knowledge Graph is a JSON file for Sprint 1.
