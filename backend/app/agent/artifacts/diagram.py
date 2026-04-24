import logging
from app.services.llm_service import groq_json

logger = logging.getLogger(__name__)

PROMPT = """\
You are generating a concept diagram for a student learning about: {concept_name}

Context:
{context}

Return ONLY valid JSON describing a simple directed graph suitable for SVG rendering:
{{
  "nodes": [
    {{"id": "<id>", "label": "<short label>"}},
    ...
  ],
  "edges": [
    {{"from": "<id>", "to": "<id>", "label": "<relationship>"}},
    ...
  ]
}}

Include 4–8 nodes. Keep labels short (1–4 words).
"""

SVG_TEMPLATE = """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#1D9E75"/>
    </marker>
  </defs>
  {elements}
</svg>"""


def _build_svg(nodes: list[dict], edges: list[dict]) -> str:
    cols = 3
    node_w, node_h, gap_x, gap_y = 140, 40, 40, 60
    positions: dict[str, tuple[int, int]] = {}
    elements: list[str] = []

    for i, node in enumerate(nodes):
        col = i % cols
        row = i // cols
        x = 30 + col * (node_w + gap_x)
        y = 30 + row * (node_h + gap_y)
        positions[node["id"]] = (x + node_w // 2, y + node_h // 2)
        elements.append(
            f'<rect x="{x}" y="{y}" width="{node_w}" height="{node_h}" '
            f'rx="6" fill="#f0faf6" stroke="#1D9E75" stroke-width="0.5"/>'
        )
        elements.append(
            f'<text x="{x + node_w // 2}" y="{y + node_h // 2 + 5}" '
            f'text-anchor="middle" font-size="12" fill="#111821">{node["label"]}</text>'
        )

    for edge in edges:
        src = positions.get(edge["from"])
        dst = positions.get(edge["to"])
        if src and dst:
            elements.append(
                f'<line x1="{src[0]}" y1="{src[1]}" x2="{dst[0]}" y2="{dst[1]}" '
                f'stroke="#1D9E75" stroke-width="1" marker-end="url(#arrow)"/>'
            )

    return SVG_TEMPLATE.format(elements="\n  ".join(elements))


def generate_diagram(concept: dict, context: str) -> dict:
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        context=context[:2000],
    )
    data = groq_json(prompt, temperature=0.2)
    logger.info("Diagram raw keys: %s", list(data.keys()) if data else "empty")
    nodes = data.get("nodes", [])
    edges = data.get("edges", [])
    if not nodes:
        logger.warning("Diagram: no nodes for concept %s — raw: %s", concept.get("name"), str(data)[:200])
        return {"type": "diagram", "svg": ""}
    svg = _build_svg(nodes, edges)
    return {"type": "diagram", "svg": svg}
