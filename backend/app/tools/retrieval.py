"""
Stateless retrieval tools shared across all agents.
query_concepts — traverse the knowledge graph
fetch_chunks   — retrieve raw text chunks from ChromaDB by ID
"""

from langchain_core.tools import tool

from app.knowledge_graph import load_kg, search_concepts, get_neighborhood
from app.services.chroma_service import get_chroma_store


@tool
def query_concepts(question: str) -> dict:
    """
    Search the knowledge graph for concepts relevant to the question.
    Returns matching concept nodes, their relationships, and associated chunk_ids.
    """
    G = load_kg()
    if G.number_of_nodes() == 0:
        return {"nodes": [], "edges": [], "chunk_ids": []}

    matches = search_concepts(G, question, top_k=5)
    if not matches:
        return {"nodes": [], "edges": [], "chunk_ids": []}

    # Expand to neighbourhood for richer context
    all_chunk_ids: set[str] = set()
    all_nodes: list[dict] = []
    all_edges: list[dict] = []
    seen_nodes: set[str] = set()

    for concept in matches:
        neighborhood = get_neighborhood(G, concept["id"], depth=1)
        for n in neighborhood["nodes"]:
            if n["id"] not in seen_nodes:
                all_nodes.append(n)
                seen_nodes.add(n["id"])
        all_edges.extend(neighborhood["edges"])
        all_chunk_ids.update(neighborhood["chunk_ids"])

    return {
        "nodes": all_nodes,
        "edges": all_edges,
        "chunk_ids": list(all_chunk_ids),
    }


@tool
def fetch_chunks(chunk_ids: list[str]) -> list[str]:
    """
    Retrieve raw text chunks from ChromaDB by their IDs.
    Returns a list of chunk text strings.
    """
    if not chunk_ids:
        return []
    store = get_chroma_store()
    results = store.collection.get(ids=chunk_ids, include=["documents"])
    return results.get("documents", [])
