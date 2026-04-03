# LearnPulse

An AI-powered adaptive learning app that turns your own documents into a personalised learning path. Upload a PDF or text file, and LearnPulse extracts the concepts, builds a knowledge graph, tracks your mastery, and generates learning artifacts — cheatsheets, flashcards, quizzes, diagrams, and audio transcripts — tailored to where you are in the material.

---

## How it works

```
Upload doc
    │
    ▼
RAG ingest pipeline
  ├─ chunk + embed (Gemini text-embedding-004 → ChromaDB)
  └─ concept extractor sub-agent (Gemini → structured JSON)
          │
          ▼
    Knowledge Graph (NetworkX DiGraph, persisted as JSON)
    nodes: concepts  |  edges: prerequisite / related / part_of / example_of
          │
          ▼
    Learning path (topological sort of the graph)
          │
          ▼
    User clicks an artifact button (cheatsheet / flashcards / quiz / diagram / audio)
          │
          ▼
    LangGraph ReAct orchestrator
      reason → query_concepts → fetch_chunks → get_user_state → generate → artifact
          │
          ▼
    Structured artifact payload returned to the frontend
          │
          ▼
    Mastery score updated (view +8 / flashcard +15 / quiz_pass +35 / quiz_fail +8)
    Concepts unlock when mastery ≥ 50, marked done at ≥ 70
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth | NextAuth.js + Google OAuth → backend JWT |
| Backend | FastAPI, Python 3.11, asyncpg, SQLAlchemy 2 async |
| Agent framework | LangGraph (ReAct loop), LangChain Google GenAI |
| LLM + Embeddings | Gemini 1.5 Flash + text-embedding-004 (free tier) |
| Vector store | ChromaDB (embedded in backend container) |
| Knowledge graph | NetworkX DiGraph, serialised to JSON |
| Database | PostgreSQL (Neon serverless in production) |
| Deployment | Vercel (frontend) + Google Cloud Run (backend) |

---

## Repository layout

```
Website_MVP/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── orchestrator.py       # LangGraph ReAct graph
│   │   │   ├── concept_extractor.py  # Gemini structured extraction
│   │   │   ├── state.py              # OrchestratorState TypedDict
│   │   │   └── artifacts/            # cheatsheet / flashcards / quiz / diagram / audio
│   │   ├── api/
│   │   │   ├── routes.py             # /ingest  /ask  /progress  /mastery/update
│   │   │   ├── auth_routes.py        # POST /auth/google
│   │   │   └── deps.py               # JWT bearer dependency
│   │   ├── core/config.py            # Pydantic settings
│   │   ├── db/
│   │   │   ├── session.py            # async SQLAlchemy engine (SSL-aware for Neon)
│   │   │   └── models.py             # Base + model imports for Alembic
│   │   ├── knowledge_graph.py        # NetworkX load/save/query helpers
│   │   ├── models/user.py            # User, UserGoal, UserConcept, UserPreferences
│   │   ├── rag/ingest.py             # chunk → embed → ChromaDB → extract concepts
│   │   ├── services/                 # chroma_service, embedding_service, auth_service
│   │   └── tools/
│   │       ├── retrieval.py          # @tool: query_concepts, fetch_chunks
│   │       └── user_state.py         # @tool: get_user_state, update_mastery, add_concepts
│   ├── alembic/versions/             # DB migrations (0001 → 0002 → 0003)
│   ├── data/
│   │   ├── chroma/                   # ChromaDB embeddings (gitignored)
│   │   ├── kg/graph.json             # knowledge graph (empty seed committed)
│   │   └── uploads/                  # temporary upload storage (gitignored)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # sign-in / JWT check
│   │   ├── onboarding/page.tsx       # goal → preferences → upload → processing
│   │   └── learn/page.tsx            # learning path track
│   ├── components/
│   │   ├── learning-path/            # ConceptCard, GoalHeader, ArtifactButton
│   │   ├── artifacts/                # Cheatsheet, Flashcards, Quiz, Diagram, Audio
│   │   └── onboarding/               # GoalInput, PreferenceSelector, UploadZone, …
│   ├── hooks/
│   │   ├── useAuth.ts                # Google OAuth → backend JWT exchange
│   │   ├── useProgress.ts            # GET /progress/:id
│   │   └── useArtifact.ts            # POST /ask with Map-based cache
│   └── lib/
│       ├── api-client.ts             # typed fetch wrapper with auth headers
│       └── types.ts                  # shared TypeScript types
├── DEPLOYMENT.md                     # step-by-step Vercel + Cloud Run + Neon guide
└── ARCHITECTURE_PLAN.MD
```

---

## Local development

### Prerequisites

- Python 3.11+
- Node 20+
- PostgreSQL 14+ running locally (or a Neon connection string)

macOS (Homebrew):
```bash
brew install python@3.11 node postgresql@16
brew services start postgresql@16
```

### 1. Database

```bash
psql postgres
```
```sql
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER USER postgres CREATEDB;
CREATE DATABASE learnpulse OWNER postgres;
\q
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — at minimum set GEMINI_API_KEY and GOOGLE_CLIENT_ID
```

Run migrations:
```bash
export PYTHONPATH=.
alembic upgrade head
```

Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. First run

1. Sign in with Google.
2. Enter a learning goal (e.g. *"Learn dynamic programming for interviews"*).
3. Set your preferences (format + session length).
4. Upload a PDF or text document.
5. LearnPulse extracts concepts and builds your learning path.
6. Click any concept card → choose an artifact format → start learning.

---

## Agent architecture

### RAG ingest (on upload)

1. **Read** — pypdf for PDFs, raw UTF-8 for text files
2. **Chunk** — 800-char windows with 100-char overlap
3. **Embed** — Gemini `text-embedding-004` → stored in ChromaDB with chunk metadata
4. **Extract** — Gemini `gemini-1.5-flash` with `response_mime_type="application/json"` extracts 3–10 concepts + prerequisite/related relationships
5. **Write to KG** — `add_concepts` tool writes nodes + directed edges to `graph.json`

### Orchestrator (on /ask)

LangGraph ReAct loop:

```
reason_node  →  [tool_calls?]
                    yes → ToolNode → collect_tool_results → reason_node
                    no  → generate_node → artifact_node → END
```

Tools available to the LLM:

| Tool | Does |
|---|---|
| `query_concepts(question)` | Keyword-searches KG → expands 1-hop neighborhood → returns nodes + chunk_ids |
| `fetch_chunks(chunk_ids)` | Retrieves raw text from ChromaDB by ID |
| `get_user_state(user_id)` | Reads mastery scores + preferences from Postgres |

After retrieval, `generate_node` assembles context and calls Gemini with a mastery-aware tutor prompt. `artifact_node` dispatches the output to one of 5 formatters, each calling Gemini with `response_mime_type="application/json"` for reliable structured output.

### Mastery model

| Action | Score delta |
|---|---|
| View an artifact | +8 |
| Complete flashcards | +15 |
| Quiz pass | +35 |
| Quiz fail | +8 |

- Concept **unlocks** (becomes active) when all prerequisites reach ≥ 50
- Concept marked **done** at mastery ≥ 70

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Vercel + Google Cloud Run + Neon setup guide.

**Free tier summary:**

| Service | Free allowance |
|---|---|
| Vercel | Unlimited hobby deployments |
| Google Cloud Run | 2M requests/month + 360k vCPU-seconds |
| Neon | 0.5 GB, never sleeps |
| Gemini 1.5 Flash | 15 RPM / 1M tokens/day |

---

## Environment variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example) for the full list with inline comments.

Key variables:

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | backend | LLM + embeddings |
| `GOOGLE_CLIENT_ID` | backend + frontend | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | frontend | OAuth (next-auth only) |
| `DATABASE_URL` | backend | asyncpg connection string |
| `DATABASE_SSL` | backend | Set `true` for Neon |
| `JWT_SECRET_KEY` | backend | Sign backend JWTs |
| `NEXTAUTH_SECRET` | frontend | Sign next-auth session tokens |
| `NEXT_PUBLIC_API_URL` | frontend | Backend base URL |
