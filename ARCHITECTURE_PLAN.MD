# LearnPulse — Architecture & Codebase Context

> Drop this file into the root of the repo. When starting a Claude Code session, say:
> **"Read LEARNPULSE_ARCHITECTURE.md before touching any code."**

---

## What is LearnPulse?

LearnPulse is an **agentic microlearning platform** for CS/engineering students. It replaces passive content consumption with structured, adaptive learning. Instead of a chatbot, it uses a multi-agent pipeline with retrieval-augmented generation, a knowledge graph, and persistent learner memory to produce personalized study artifacts — cheatsheets, flashcards, quizzes, diagrams, and audio scripts — grounded in the user's own uploaded materials.

**Stack:** FastAPI · Next.js App Router + shadcn UI · LangGraph · ChromaDB · Postgres + Alembic · Gemini API

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
 ├── Auth middleware
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
           └──► add_concepts() tool ──► Knowledge graph
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

## Knowledge Graph — Data Model

```python
# Concept node
{
  "id": "uuid",
  "name": "Attention mechanism",
  "description": "1-2 sentence explanation",
  "chunk_ids": ["abc123", "def456"],  # bridge back to ChromaDB
  "source_id": "document_uuid"
}

# Relationship edge
{
  "from": "concept_id",
  "to": "concept_id",
  "type": "prerequisite | related | part_of | example_of"
}
```

`prerequisite` edges define learning path order. A concept unlocks when its prerequisite reaches ≥ 50 mastery. A concept is considered mastered at ≥ 70.

---

## Postgres Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  goal_text TEXT NOT NULL,
  target_concept_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_concepts (
  id UUID PRIMARY KEY,
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
and relationships. Return ONLY valid JSON:

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
- On submit: calls `/ingest` endpoint

**Step 4 — Processing**
- Animated step list showing exactly what is happening:
  1. Chunking and embedding documents
  2. Storing vectors in ChromaDB
  3. Extracting concepts with Gemini
  4. Building knowledge graph
  5. Mapping prerequisites and relationships
- Resolves to: "Your learning path is ready" + concept count + "Start learning" CTA
- Transitions to: learning path screen

**Step indicator:** 3-pip progress bar at the top. Completed pips show a checkmark and turn teal. Active pip is filled teal. Future pips are muted.

#### 2. Learning path (post-ingest) — main screen

Duolingo-style vertical concept track. Each concept is a card on the path.

**Goal header**
- Goal text shown at top
- Overall progress bar: `mastered / total concepts` as a percentage
- e.g. "38% — 3 of 8 concepts mastered"

**Concept cards** (one per KG concept node, ordered by prerequisite edges)
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
| Audio | Play button + transcript toggle |

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
    └── Audio.tsx
```

### API calls from frontend

```
POST /ingest          — upload files, trigger ingest pipeline
POST /ask             — send concept + goal to orchestrator, get artifact back
GET  /progress/:id    — get user's full mastery state for learning path render
POST /mastery/update  — fire after artifact interaction (view, quiz, flashcard)
POST /auth/register   — onboarding: create user
POST /auth/login      — return JWT
```

---

## File Structure

```
LearnPulse/Website_MVP/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry, routes
│   │   ├── agent/               # orchestration agent (LangGraph)
│   │   ├── knowledge_graph.py   # KG store + query/write logic
│   │   ├── rag/                 # ingest, chunking, embedding
│   │   ├── models/              # Postgres models (Alembic)
│   │   └── tools/               # shared @tool functions
│   └── alembic/
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # root — redirects to /onboarding or /learn
│   │   ├── onboarding/          # 4-step pre-ingest flow
│   │   └── learn/               # learning path + artifact views
│   └── components/
│       ├── onboarding/          # StepIndicator, GoalInput, PreferenceSelector, UploadZone, ProcessingSteps
│       ├── learning-path/       # GoalHeader, ConceptCard, ArtifactButton, InlineQuiz
│       └── artifacts/           # Cheatsheet, Flashcards, Quiz, Diagram, Audio
├── docs/
└── LEARNPULSE_ARCHITECTURE.md   # ← this file
```