# System Architecture & Ingestion Pipeline (Sprint 1)

This section describes the end-to-end architecture of LearnPulse, including how user-uploaded documents are ingested for RAG and represented in the Knowledge Graph.

## High-Level System Architecture

The system is organized into three layers:

- Interface Layer: user interaction and API entry
- Decision Layer: agentic orchestration and control flow
- Context Layer: retrieval, structure, and personalization

All context sources are coordinated by the Learning Orchestration Agent before any LLM call.

```
+---------------------------+
|         Frontend          |
|         (Next.js)         |
|  - Upload docs            |
|  - Select goal & topic    |
|  - View learning output   |
+-------------+-------------+
              |
              v
+---------------------------+
|         Backend           |
|         (FastAPI)         |
|  - API routing            |
|  - Upload handling        |
|  - Session handling       |
+-------------+-------------+
              |
              v
+---------------------------------------------+
|    Learning Orchestration Agent (LangGraph) |
|  - Analyze user request                      |
|  - Decide learning format                    |
|  - Coordinate retrieval                      |
+-----------+------------------+---------------+
            |                  |               |
            v                  v               v
+------------------+  +---------------------+  +---------------------+
|   Vector Store   |  |  Knowledge Graph    |  |  User Memory Store  |
|   (ChromaDB)     |  |  (JSON / LangGraph) |  |  (Postgres / JSON)  |
+---------+--------+  +----------+----------+  +----------+----------+
          |                     |                        |
          +----------+----------+------------+-----------+
                     v
+---------------------------+
|        Gemini LLM         |
|  Input includes:          |
|  - Retrieved chunks       |
|  - KG structure           |
|  - User prefs & goals     |
+-------------+-------------+
              |
              v
+---------------------------+
|   Learning Output Agent   |
|  (cheat sheet / summary)  |
+-------------+-------------+
              |
              v
+---------------------------+
|   User Memory Store       |
|  - Update learner state   |
+---------------------------+
```

## Context Layer Responsibilities

The system uses three distinct persistence layers, each with a separate role:

- Vector Store (ChromaDB): stores embedded document chunks for semantic retrieval (RAG)
- Knowledge Graph: stores structural relationships and provenance
  - Concept nodes (curated, read-only in Sprint 1)
  - Source nodes (dynamically added during ingestion)
- User Memory Store: stores learner-specific state
  - goals
  - preferences
  - mastery and engagement history

The Learning Orchestration Agent coordinates all three sources before calling the LLM.

## Document Ingestion Pipeline (RAG + Knowledge Graph)

1. Document Upload
   - User uploads a document via the frontend
   - Backend receives and validates the file
2. Chunking
   - The document is split into semantically meaningful text chunks
3. Embedding
   - Each chunk is embedded into a vector representation
   - Embeddings are stored in ChromaDB along with metadata (e.g., source ID)
4. Knowledge Graph Source Node Creation
   - A Source node is created in the Knowledge Graph representing the document
   - Source node metadata may include document name, upload timestamp, uploader ID
5. Source Linking
   - The Source node is linked to relevant topics and high-level concepts
6. Availability for Retrieval
   - The document is now available for RAG-based retrieval
   - No LLM reasoning is required during ingestion

This process records provenance and structure without asserting new conceptual knowledge.

## Knowledge Graph Update Policy

The Knowledge Graph distinguishes between two types of nodes:

- Concept Nodes: curated, read-only in Sprint 1
- Source Nodes: dynamically added during ingestion

Adding a Source node does not assert new knowledge. It only records where retrieved information comes from. Future updates are gated:

```
LLM Output
-> Structured Concept Extraction
-> Candidate Graph Deltas
-> Validation (rules, confidence, or human-in-the-loop)
-> Commit to Knowledge Graph
```

## Key Architectural Principle

The LLM is never called in isolation. Every generation is grounded in:
- retrieved text (Vector Store)
- structural knowledge (Knowledge Graph)
- learner context (User Memory Store)

All coordination and decision-making is handled by the Learning Orchestration Agent.
