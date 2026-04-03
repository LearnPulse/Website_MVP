# LearnPulse — Architecture & Codebase Context

> Drop this file into the root of the repo. When starting a Claude Code session, say:
> **"Read ARCHITECTURE_PLAN.MD before touching any code."**

---

## What is LearnPulse?

LearnPulse is an **agentic microlearning platform** for CS/engineering students. It replaces passive content consumption with structured, adaptive learning. Instead of a chatbot, it uses a multi-agent pipeline with retrieval-augmented generation, a knowledge graph, and persistent learner memory to produce personalized study artifacts — cheatsheets, flashcards, quizzes, diagrams, and audio scripts — grounded in the user's own uploaded materials.

**Stack:** FastAPI · Next.js App Router + shadcn UI · LangGraph · ChromaDB · NetworkX · Postgres + Alembic · Gemini API · Google OAuth (next-auth)

---

## Full System Architecture

### Main pipeline (query flow)

```
User
 │
 ▼
Frontend (Next.js App Router · shadcn UI · learning path UI)
 │
 ▼
FastAPI  ·  /ingest   /ask   /progress   /auth
 ├── Auth middleware (JWT — issued after Google OAuth validation)
 └── User prefs loader ──────────────────────────────► Postgres (on session start)
 │
 ▼
┌────────────────────────────────────────────────────────────────────┐
│  Learning Orchestration Agent  (LangGraph ReAct loop)              │
│                                                                    │
│   Reason ──► Act ──► Observe ──► (loop back) ──► proceed          │
│   goal · mastery · format    call tool or delegate to sub-agent    │
└───────────────────────┬────────────────────────────────────────────┘
                        │ tool calls (stateless, direct)
                        ▼
         ┌──────────────────────────────────────────┐
         │            Retrieval tools               │
         │                                          │
         │  query_concepts()  ──► Knowledge graph   │
         │  fetch_chunks()    ──► ChromaDB           │
         │  get_user_state()  ──► Postgres           │
         └──────────────────┬───────────────────────┘
                            │ context assembled:
                            │ KG subgraph + raw chunks + user mastery/prefs
                            ▼
                  ┌──────────────────────┐
                  │     Gemini API       │
                  │                      │
                  │  grounded generation │
                  │  mastery-aware prompt│
                  └──────────┬───────────┘
                             │ structured output
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Artifact generator sub-agents  (LangGraph nodes · own state)          │
│                                                                        │
│   Audio  │  Flashcards  │  Quiz  │  Cheatsheet  │  Diagram            │
│                                                                        │
│   Each formats Gemini output into its artifact type.                   │
│   Sub-agents can call tools (fetch_chunks, update_mastery).            │
└────────────────────────────────────────────────────────────────────────┘
                             │ after user interacts with artifact
                             ▼
                   update_mastery() ──► Postgres
```

### Ingest path (on document upload)

```
PDF / text upload
 │
 ▼
Chunk + split  (overlapping windows)
 │
 ├──► Gemini embed ──► ChromaDB  (vectors stored)
 │
 └──► Concept Extractor sub-agent  (LangGraph node · calls Gemini)
           │
           │  extracts structured JSON:
           │  {
           │    concepts: [{ id, name, description, chunk_ids }],
           │    relationships: [{ from, to, type }]
           │  }
           │
           └──► add_concepts() tool ──► Knowledge graph (NetworkX + JSON)
                                        (nodes + edges + chunk_ids written)
```

---

## Agent vs Tool — The Core Distinction

| | Tools | Sub-agents |
|---|---|---|
| **What** | Stateless `@tool` functions | Full LangGraph nodes |
| **Has own prompt** | No | Yes |
| **Has own state** | No | Yes |
| **Can call tools** | N/A | Yes |
| **Called by** | Orchestrator OR any sub-agent | Orchestrator only |
| **Examples** | `query_concepts`, `fetch_chunks`, `get_user_state`, `update_mastery`, `add_concepts` | Concept Extractor, Artifact Generators |

The orchestrator **delegates tasks** to sub-agents and **directly calls** retrieval tools. Sub-agents can call tools themselves as needed.

---

## Shared Tool Belt

All agents share access to these tools:

```python
@tool
def query_concepts(question: str) -> dict:
    """Traverse knowledge graph. Returns relevant concept nodes, relationships, chunk_ids."""

@tool
def fetch_chunks(chunk_ids: list[str]) -> list[str]:
    """Retrieve raw text chunks from ChromaDB by chunk_id."""

@tool
def get_user_state(user_id: str) -> dict:
    """Return user mastery scores per concept + learning preferences from Postgres."""

@tool
def update_mastery(user_id: str, concept_id: str, delta: int, source: str) -> None:
    """Write mastery update to Postgres user_concepts.
    source: 'view' (+8), 'flashcard' (+15), 'quiz_pass' (+35), 'quiz_fail' (+8)
    """

@tool
def add_concepts(chunks: list[str], source_id: str) -> None:
    """Called by Concept Extractor. Writes nodes + edges + chunk_ids to knowledge graph."""
```

---

## Knowledge Graph — Data Model & Implementation

### Storage: NetworkX + JSON persistence

The knowledge graph uses **NetworkX** (`nx.DiGraph`) in memory, persisted as a JSON flat file at `backend/data/kg/graph.json`. No external graph database. NetworkX provides topological sort, ancestor/descendant traversal, and neighbor lookup out of the box.

```python
import networkx as nx

# load
def load_kg() -> nx.DiGraph:
    data = json.loads(Path(settings.kg_path).read_text())
    return nx.node_link_graph(data)

# save
def save_kg(G: nx.DiGraph) -> None:
    data = nx.node_link_data(G)
    Path(settings.kg_path).write_text(json.dumps(data, indent=2))

# key operations (all built-in)
ordered  = list(nx.topological_sort(G))        # learning path order
prereqs  = nx.ancestors(G, concept_id)         # all prerequisites
unlocks  = list(G.successors(concept_id))      # what this concept unlocks
neighbors = list(G.neighbors(concept_id))      # nearby concepts for context
```

### graph.json starts empty — no hardcoded concepts

Concepts are **only** created by the Concept Extractor sub-agent when a user uploads a document. The initial `graph.json` contains only the empty structure:

```json
{ "directed": true, "multigraph": false, "graph": {}, "nodes": [], "links": [] }
```

### Node attributes stored on each NetworkX node

```python
# concept node (id is the NetworkX node key)
G.add_node(concept_id, **{
    "name": "Attention mechanism",
    "description": "1-2 sentence explanation",
    "chunk_ids": ["abc123", "def456"],   # bridge back to ChromaDB
    "source_id": "document_uuid"
})
```

### Edge attributes

```python
G.add_edge(from_id, to_id, type="prerequisite")
# type values: prerequisite | related | part_of | example_of
```

`prerequisite` edges define learning path order. A concept unlocks when its prerequisite reaches ≥ 50 mastery. A concept is considered mastered at ≥ 70.

---

## Postgres Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_sub TEXT UNIQUE NOT NULL,   -- Google's stable user ID (OAuth sub claim)
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  goal_text TEXT NOT NULL,
  target_concept_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  concept_id TEXT NOT NULL,
  mastery_score INTEGER DEFAULT 0,   -- 0–100
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  UNIQUE(user_id, concept_id)
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  preferred_formats JSONB DEFAULT '["cheatsheet"]',
  detail_level TEXT DEFAULT 'concise',
  session_length TEXT DEFAULT 'micro'
);
```

The old `user_memory` table is replaced by these four tables. Migration: Alembic revision 0002 creates the new tables, revision 0003 drops `user_memory` after the new flow is verified end-to-end.

No `hashed_password` — authentication is exclusively via Google OAuth. `passlib` is not needed.

---

## Mastery Signal Weights

| User action | Delta |
|---|---|
| Viewed artifact | +8 pts |
| Completed flashcard deck | +15 pts |
| Passed quiz ≥ 70% | +35 pts |
| Failed quiz | +8 pts |

Concept unlocks next: ≥ 50. Concept mastered: ≥ 70.

---

## Concept Extractor Prompt (Gemini)

```
Given the following text chunks from an uploaded document, extract the key concepts
and relationships. Return ONLY valid JSON (use response_mime_type="application/json"):

{
  "concepts": [
    {
      "id": "<uuid>",
      "name": "<concept name>",
      "description": "<1-2 sentence explanation>",
      "chunk_ids": ["<chunk_id>"]
    }
  ],
  "relationships": [
    {
      "from": "<concept_id>",
      "to": "<concept_id>",
      "type": "prerequisite | related | part_of | example_of"
    }
  ]
}

Chunks:
{chunks}
```

Always use `response_mime_type="application/json"` in the Gemini SDK call to enforce structured output. Do not rely on prompt-only JSON enforcement.

---

## Orchestrator System Prompt

```
You are the Learning Orchestration Agent for LearnPulse.

User goal: {goal}
Current mastery state: {mastery_summary}
User preferences: {preferences}
User question / topic: {query}

You have access to: query_concepts, fetch_chunks, get_user_state.

Steps:
1. Call query_concepts to find relevant concept nodes and relationships
2. Call fetch_chunks with the chunk_ids from those nodes
3. Call get_user_state to confirm mastery and preferences
4. Pass assembled context to Gemini for generation
5. Route Gemini output to the appropriate artifact generator sub-agent(s)

Prioritise concepts where mastery < 50. Build on concepts where mastery >= 70.
Always ground output in retrieved context. Never hallucinate.
```

### LangGraph Orchestrator State

```python
class OrchestratorState(TypedDict):
    user_id: str
    concept_id: str
    goal: str
    query: str
    preferred_formats: list[str]
    mastery_summary: dict          # from get_user_state
    retrieved_concepts: list[dict] # from query_concepts
    chunk_texts: list[str]         # from fetch_chunks
    gemini_output: str             # raw Gemini response
    artifact_type: str             # routing decision
    artifact_payload: dict         # structured output from sub-agent
    messages: list                 # LangGraph message list for ReAct
```

### Async tool / session injection pattern

LangGraph tools must not accept `AsyncSession` as a parameter (it would appear in the LLM's tool schema). Use `contextvars.ContextVar` to store the active session, set it in the route handler before calling the orchestrator, and read it inside tool functions.

---

## Frontend — UI Design & Flow

There is no chat interface. The user never types freeform messages. All interaction is structured — goal input, artifact interaction, concept clicks, quiz answers. The orchestrator always receives a structured signal, never an open-ended message thread.

### UI screens

#### 1. Onboarding (pre-ingest) — 4-step flow

The entire pre-ingest experience is a single stepped flow. Nothing else is shown until it completes.

**Step 1 — Goal**
- Single textarea: "What do you want to learn?"
- Quick-select suggestion chips below (e.g. "Transformer architecture", "DSA for interviews")
- Continue button disabled until goal is ≥ 6 chars
- User must be signed in via Google OAuth before reaching this step (next-auth session required)
- `useAuth` hook auto-exchanges Google `id_token` for backend JWT (`lp_token`) on first login
- Writes to: `user_goals`

**Step 2 — Preferences**
- Multi-select chips for artifact formats: Cheatsheet · Flashcards · Quiz · Diagram · Audio
- Single-select for session length: Micro (5 min) · Standard (20 min) · Deep (1 hr+)
- Single-select for detail level: Concise · Detailed
- Writes to: `user_preferences`

**Step 3 — Upload**
- Drag-and-drop zone + click to browse
- Accepts PDF and TXT, up to 10 files
- Each uploaded file shown as a removable pill
- "Build my learning path" CTA disabled until ≥ 1 file added
- On submit: calls `POST /ingest` for each file

**Step 4 — Processing**
- Animated step list showing exactly what is happening:
  1. Chunking and embedding documents
  2. Storing vectors in ChromaDB
  3. Extracting concepts with Gemini
  4. Building knowledge graph
  5. Mapping prerequisites and relationships
- Resolves to: "Your learning path is ready" + concept count + "Start learning" CTA
- Transitions to: learning path screen

**Step indicator:** 3-pip progress bar at the top (steps 1–3 map to pips; step 4 is the processing screen after all pips complete). Completed pips show a checkmark and turn teal. Active pip is filled teal. Future pips are muted.

#### 2. Learning path (post-ingest) — main screen

Duolingo-style vertical concept track. Each concept is a card on the path.

**Goal header**
- Goal text shown at top
- Overall progress bar: `mastered / total concepts` as a percentage
- e.g. "38% — 3 of 8 concepts mastered"

**Concept cards** (one per KG concept node, ordered by prerequisite edges via `nx.topological_sort`)
- Left column: teal dot (done) · teal outline dot (active) · muted dot (locked)
- Connector line between dots: teal if done, muted if not
- Card states:
  - `done` — mastery ≥ 70, teal pill "92% mastered"
  - `active` — mastery > 0 and < 70, amber pill "45% in progress"
  - `locked` — prerequisite not met (< 50 mastery), greyed out

**Expanded card** (click to open)
- Mastery progress bar
- Artifact buttons: one per preferred format, teal + checkmark when viewed
- Inline quiz: single question with 4 options
  - Correct → green highlight, +35 mastery, may unlock next concept
  - Wrong → red highlight, +8 mastery
- "go deeper" button on any concept term → triggers new artifact

**Unlock gate:** next concept card unlocks when previous reaches ≥ 50 mastery.

#### 3. Artifact view

Generated inline within the expanded concept card or as a full-screen overlay depending on format:

| Format | Presentation |
|---|---|
| Cheatsheet | Inline card with structured key-value layout |
| Flashcards | Flip card deck, self-rated (got it / review again) |
| Quiz | 4-option MCQ, scored immediately |
| Diagram | SVG concept map rendered inline |
| Audio | Play button + transcript toggle (transcript only for MVP; no TTS synthesis) |

Every artifact view fires `update_mastery(user_id, concept_id, +8, 'view')` on first open.

### Design principles

- **No chat box.** Questions are asked by clicking concepts, completing quizzes, or rating flashcards.
- **Teal (#1D9E75) is the primary action color.** Used for progress, active states, CTAs.
- **0.5px borders throughout.** Cards, inputs, chips — never 1px.
- **Flat surfaces.** No gradients, no shadows, no blur.
- **Sentence case everywhere.** No ALL CAPS, no Title Case in labels.
- **Disabled states are real.** CTAs are disabled until prerequisites are met — goal entered, file uploaded, etc.

### Component library

Use shadcn/ui as the base. Key components needed:

```
components/
├── onboarding/
│   ├── StepIndicator.tsx       # 3-pip progress bar
│   ├── GoalInput.tsx           # textarea + suggestion chips
│   ├── PreferenceSelector.tsx  # format chips + session/detail toggles
│   ├── UploadZone.tsx          # drag-drop + file pills
│   └── ProcessingSteps.tsx     # animated ingest progress list
├── learning-path/
│   ├── GoalHeader.tsx          # goal text + overall progress bar
│   ├── ConceptCard.tsx         # card with dot, mastery bar, artifacts
│   ├── ArtifactButton.tsx      # format pill, viewed state
│   └── InlineQuiz.tsx          # MCQ with immediate scoring
└── artifacts/
    ├── Cheatsheet.tsx
    ├── Flashcards.tsx
    ├── Quiz.tsx
    ├── Diagram.tsx
    └── Audio.tsx               # transcript only for MVP
```

### API calls from frontend

```
POST /auth/google     — accepts Google ID token from next-auth, validates via google-auth,
                        upserts user row (by google_sub), returns backend JWT stored as lp_token
POST /ingest          — upload files, trigger ingest pipeline
POST /ask             — send concept_id + goal to orchestrator, get artifact back
GET  /progress/:id    — get user's full mastery state for learning path render
POST /mastery/update  — fire after artifact interaction (view, quiz, flashcard)
```

---

## File Structure

```
LearnPulse/Website_MVP/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry, mounts all routers
│   │   ├── agent/                   # LangGraph orchestration (singular — not "agents")
│   │   │   ├── orchestrator.py      # ReAct loop, OrchestratorState, build_graph()
│   │   │   ├── concept_extractor.py # LangGraph node: Gemini → structured concept JSON
│   │   │   └── artifacts/           # one file per artifact sub-agent
│   │   │       ├── cheatsheet.py
│   │   │       ├── flashcards.py
│   │   │       ├── quiz.py
│   │   │       ├── diagram.py
│   │   │       └── audio.py         # returns transcript only
│   │   ├── knowledge_graph.py       # NetworkX DiGraph: load, save, query, topological sort
│   │   ├── rag/                     # ingest, chunking, embedding (replaces services/ingestion_service.py)
│   │   │   └── ingest.py
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   └── user.py              # User, UserGoal, UserConcept, UserPreferences
│   │   ├── tools/                   # shared @tool functions
│   │   │   ├── retrieval.py         # query_concepts, fetch_chunks
│   │   │   └── user_state.py        # get_user_state, update_mastery, add_concepts
│   │   ├── api/
│   │   │   ├── routes.py            # /ingest, /ask, /progress, /mastery/update
│   │   │   ├── auth_routes.py       # /auth/register, /auth/login
│   │   │   └── deps.py              # get_current_user JWT dependency
│   │   ├── services/                # keep: chroma_service.py, embedding_service.py
│   │   │   ├── chroma_service.py    # keep as-is
│   │   │   └── embedding_service.py # keep as-is
│   │   └── core/
│   │       └── config.py            # add jwt_secret_key, jwt_algorithm, jwt_expire_minutes
│   └── alembic/
│       └── versions/
│           ├── 0001_create_user_memory.py   # existing
│           ├── 0002_new_schema.py           # creates users/user_goals/user_concepts/user_preferences
│           └── 0003_drop_user_memory.py     # drops user_memory after new flow verified
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # root — checks localStorage for JWT, redirects to /onboarding or /learn
│   │   ├── onboarding/
│   │   │   └── page.tsx         # 4-step pre-ingest flow
│   │   └── learn/
│   │       └── page.tsx         # learning path + artifact views
│   ├── components/
│   │   ├── onboarding/          # StepIndicator, GoalInput, PreferenceSelector, UploadZone, ProcessingSteps
│   │   ├── learning-path/       # GoalHeader, ConceptCard, ArtifactButton, InlineQuiz
│   │   ├── artifacts/           # Cheatsheet, Flashcards, Quiz, Diagram, Audio
│   │   └── ui/                  # shadcn base components (button, card, input, textarea)
│   ├── hooks/
│   │   ├── useAuth.ts           # login, register, logout; stores JWT in localStorage
│   │   ├── useProgress.ts       # GET /progress/:id, returns ConceptProgress[]
│   │   └── useArtifact.ts       # POST /ask, caches by concept_id + artifact_type
│   └── lib/
│       ├── api-client.ts        # typed API calls, injects Authorization header
│       ├── types.ts             # ConceptNode, ArtifactPayload subtypes, OnboardingState, etc.
│       └── utils.ts             # cn() helper (keep as-is)
├── docs/
└── ARCHITECTURE_PLAN.MD         # ← this file
```

### Files to delete during revamp

**Backend:**
- `app/agents/orchestration_agent.py` → replaced by `app/agent/orchestrator.py`
- `app/agents/output_agent.py` → replaced by `app/agent/artifacts/`
- `app/services/memory_service.py` → replaced by `app/tools/user_state.py`
- `app/services/retrieval_service.py` → replaced by `app/tools/retrieval.py`
- `app/services/kg_service.py` → replaced by `app/knowledge_graph.py`
- `app/schemas/learn.py` → replaced by models in `app/models/`
- `app/schemas/memory.py` → replaced by models in `app/models/`
- `app/utils.py` (Neo4j integration — not used in architecture)
- `sync_kg.py` (Neo4j sync script — not used in architecture)

**Frontend:**
- `app/cheatsheet/` → replaced by inline artifact components
- `app/artifacts/` → replaced by inline artifact components
- `app/learning-session/` → replaced by `app/learn/`
- `app/profile/` → preferences handled during onboarding
- `app/graph/` → force-graph explorer not in architecture
- `components/DashboardLayout.tsx` → replaced by learn page layout
- `components/LearningArtifacts.tsx` → replaced by `components/artifacts/`
- `components/DocumentUpload.tsx` → replaced by `components/onboarding/UploadZone.tsx`
- `components/Button.tsx`, `Card.tsx`, `Input.tsx`, `Textarea.tsx`, `index.ts` → replaced by `components/ui/`
- `components/ui/LearnPulseGraph.tsx` → force-graph not in architecture
- `hooks/useDashboardData.ts` → replaced by `useAuth`, `useProgress`, `useArtifact`
- `hooks/useLearningContent.ts` → replaced by `useArtifact`

---

## Implementation Phases

### Phase 0 — Foundation (config, packages, design tokens)
**No new features. Makes the base runnable and consistent before structural changes.**

- `backend/requirements.txt`: add `langgraph>=0.2`, `langchain-google-genai>=2.0`, `langchain-core>=0.3`, `networkx>=3.3`, `google-auth>=2.0`, `python-jose[cryptography]>=3.3` (no passlib — Google OAuth only)
- `backend/app/core/config.py`: add `jwt_secret_key`, `jwt_algorithm`, `jwt_expire_minutes`
- `backend/data/kg/graph.json`: reset to empty NetworkX-compatible structure
- `frontend/tailwind.config.ts`: change `primary` from `#307de8` → `#1D9E75`; add `borderWidth: { '0.5': '0.5px' }`
- `frontend/app/globals.css`: add shadcn CSS custom properties (`--primary`, `--background`, `--foreground`, `--border`, `--ring`)
- `frontend/components/ui/button.tsx`: fix broken token references (`bg-accent`, `text-ink`, `hover:bg-accentDeep`)

### Phase 1 — Database schema + auth
- Alembic 0002: create `users` (with `google_sub`), `user_goals`, `user_concepts`, `user_preferences`
- `app/models/user.py`: SQLAlchemy mapped classes
- `app/services/auth_service.py`: validate_google_token(), create_access_token(), decode_token()
- `app/api/auth_routes.py`: POST /auth/google (validates Google ID token, upserts user, returns JWT)
- `app/api/deps.py`: get_current_user JWT dependency
- Frontend: `next-auth` with Google provider, `useAuth` hook, api-client auth header injection
- Frontend env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Backend env: `GOOGLE_CLIENT_ID` (for server-side token validation)

### Phase 2 — Tools + Knowledge Graph rewrite
- `app/knowledge_graph.py`: NetworkX DiGraph, load/save/query/topological sort
- `app/tools/retrieval.py`: query_concepts, fetch_chunks
- `app/tools/user_state.py`: get_user_state, update_mastery, add_concepts
- `app/rag/ingest.py`: updated ingest — calls Concept Extractor after embedding
- Delete: `app/services/kg_service.py`, `app/services/retrieval_service.py`, `app/utils.py`, `sync_kg.py`

### Phase 3 — LangGraph orchestrator + artifact sub-agents + API routes
- `app/agent/state.py`: OrchestratorState TypedDict
- `app/agent/orchestrator.py`: LangGraph ReAct loop, build_graph()
- `app/agent/concept_extractor.py`: LangGraph node, Gemini JSON extraction
- `app/agent/artifacts/`: cheatsheet, flashcards, quiz, diagram, audio
- `app/api/routes.py`: POST /ask, GET /progress/:id, POST /mastery/update, POST /ingest (updated)
- Delete: `app/agents/`, `app/schemas/`, `app/services/memory_service.py`

### Phase 4 — Frontend rebuild
- Delete old pages: cheatsheet, artifacts, learning-session, profile, graph
- Delete old components: DashboardLayout, LearningArtifacts, DocumentUpload, Button, Card, Input, Textarea, LearnPulseGraph
- `app/page.tsx`: JWT check → redirect to /onboarding or /learn
- `app/onboarding/page.tsx`: 4-step flow
- `app/learn/page.tsx`: learning path
- All new components in `components/onboarding/`, `components/learning-path/`, `components/artifacts/`
- New hooks: useAuth, useProgress, useArtifact
- Updated: lib/types.ts, lib/api-client.ts

### Phase 5 — Cleanup
- Alembic 0003: drop `user_memory` table
- Design spec audit: 0.5px borders, sentence case, no gradients, teal throughout
