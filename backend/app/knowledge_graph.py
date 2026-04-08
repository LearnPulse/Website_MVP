"""
NetworkX-based knowledge graph for LearnPulse.

Persisted as a JSON flat file at settings.kg_path using NetworkX's
node_link format.  All concept nodes are created by the Concept Extractor
sub-agent during document ingest — never hardcoded.
"""

import json
import threading
from pathlib import Path
from typing import Any

import networkx as nx

from app.core.config import settings

_lock = threading.Lock()


# ── Persistence ───────────────────────────────────────────────────────────

def load_kg() -> nx.DiGraph:
    """Load the knowledge graph from disk. Returns an empty DiGraph if not found."""
    path = Path(settings.kg_path)
    if not path.exists() or path.stat().st_size == 0:
        return nx.DiGraph()
    data = json.loads(path.read_text())
    # NetworkX 3.4+ uses "edges" as the default key (older files used "links")
    edge_key = "edges" if "edges" in data else "links"
    return nx.node_link_graph(data, directed=True, multigraph=False, edges=edge_key)


def save_kg(G: nx.DiGraph) -> None:
    """Persist the knowledge graph to disk (thread-safe)."""
    path = Path(settings.kg_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = nx.node_link_data(G)
    with _lock:
        path.write_text(json.dumps(data, indent=2))


# ── Write ─────────────────────────────────────────────────────────────────

def add_concept(
    G: nx.DiGraph,
    concept_id: str,
    name: str,
    description: str,
    chunk_ids: list[str],
    source_id: str,
) -> None:
    """Add or update a concept node."""
    G.add_node(
        concept_id,
        name=name,
        description=description,
        chunk_ids=chunk_ids,
        source_id=source_id,
    )


def add_edge(G: nx.DiGraph, from_id: str, to_id: str, edge_type: str) -> None:
    """Add a directed edge between two concepts."""
    G.add_edge(from_id, to_id, type=edge_type)


# ── Read ──────────────────────────────────────────────────────────────────

def get_concept(G: nx.DiGraph, concept_id: str) -> dict[str, Any] | None:
    """Return a concept node dict, or None if not found."""
    if concept_id not in G:
        return None
    attrs = dict(G.nodes[concept_id])
    attrs["id"] = concept_id
    return attrs


def get_all_concepts(G: nx.DiGraph) -> list[dict[str, Any]]:
    """Return all concept nodes as a list of dicts."""
    return [{"id": nid, **dict(attrs)} for nid, attrs in G.nodes(data=True)]


def get_ordered_concepts(G: nx.DiGraph) -> list[str]:
    """
    Topological sort of concept IDs respecting prerequisite edges.
    Falls back to arbitrary order if the graph has cycles.
    """
    try:
        return list(nx.topological_sort(G))
    except nx.NetworkXUnfeasible:
        return list(G.nodes())


def get_prerequisites(G: nx.DiGraph, concept_id: str) -> list[str]:
    """All concepts that must be mastered before this one."""
    return list(nx.ancestors(G, concept_id))


def get_unlocks(G: nx.DiGraph, concept_id: str) -> list[str]:
    """Concepts that this concept is a direct prerequisite for."""
    return list(G.successors(concept_id))


def get_neighborhood(G: nx.DiGraph, concept_id: str, depth: int = 1) -> dict[str, Any]:
    """
    Return a subgraph around concept_id up to `depth` hops.
    Used by query_concepts tool to assemble context.
    """
    nodes = {concept_id}
    frontier = {concept_id}
    for _ in range(depth):
        next_frontier: set[str] = set()
        for n in frontier:
            next_frontier.update(G.predecessors(n))
            next_frontier.update(G.successors(n))
        nodes.update(next_frontier)
        frontier = next_frontier

    subgraph = G.subgraph(nodes)
    return {
        "nodes": [{"id": nid, **dict(attrs)} for nid, attrs in subgraph.nodes(data=True)],
        "edges": [
            {"from": u, "to": v, "type": d.get("type", "")}
            for u, v, d in subgraph.edges(data=True)
        ],
        "chunk_ids": list(
            {cid for _, attrs in subgraph.nodes(data=True) for cid in attrs.get("chunk_ids", [])}
        ),
    }


def search_concepts(G: nx.DiGraph, query: str, top_k: int = 5) -> list[dict[str, Any]]:
    """
    Simple keyword search over concept names and descriptions.
    Returns up to top_k matching concept dicts.
    """
    query_lower = query.lower()
    scored: list[tuple[int, dict]] = []
    for nid, attrs in G.nodes(data=True):
        name = attrs.get("name", "").lower()
        desc = attrs.get("description", "").lower()
        score = query_lower in name or any(w in name for w in query_lower.split())
        score += query_lower in desc
        if score:
            scored.append((score, {"id": nid, **dict(attrs)}))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:top_k]]
