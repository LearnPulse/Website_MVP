# LearnPulse MVP (Sprint 1)

Monorepo for LearnPulse Sprint 1: FastAPI backend + Next.js frontend.

## Structure
- `backend/` FastAPI, RAG ingestion, Knowledge Graph, User Memory Store (Postgres), ChromaDB
- `frontend/` Next.js App Router + shadcn-style UI
- `docs/` architecture and specs

## Backend (FastAPI)

### Requirements
- Python 3.11+
- Postgres running locally (or update `DATABASE_URL`)
- Gemini API key

### Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Migrations
```bash
cd backend
alembic upgrade head
```

### Run
```bash
cd backend
uvicorn app.main:app --reload
```

## Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Sprint 1 Capabilities
- Document upload + ingestion
- Chunking + Gemini embeddings + ChromaDB
- Knowledge Graph source node creation
- User Memory Store in Postgres
- Learning Orchestration Agent (minimal)
- Lightweight web interface

## Notes
- ChromaDB is local and can be swapped later.
- Knowledge Graph is a JSON file for Sprint 1.
