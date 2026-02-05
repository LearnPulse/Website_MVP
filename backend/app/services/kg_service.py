import json
import uuid
from typing import Dict, Any
from pathlib import Path
from app.core.config import settings


def load_kg() -> Dict[str, Any]:
    path = Path(settings.kg_path)
    if not path.exists():
        return {"concept_nodes": [], "source_nodes": [], "edges": []}
    return json.loads(path.read_text())


def save_kg(kg: Dict[str, Any]) -> None:
    path = Path(settings.kg_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(kg, indent=2))


def create_source_node(doc_name: str, uploader_id: str) -> Dict[str, Any]:
    return {
        "id": f"source_{uuid.uuid4().hex}",
        "type": "source",
        "doc_name": doc_name,
        "uploader_id": uploader_id
    }


def link_source_to_topic(kg: Dict[str, Any], source_id: str, topic: str) -> None:
    kg.setdefault("edges", []).append({
        "from": source_id,
        "to": topic,
        "type": "supports"
    })
