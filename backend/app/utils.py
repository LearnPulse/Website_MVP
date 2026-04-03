import os
import json
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from neo4j import GraphDatabase

# --- 1. SETUP CREDENTIALS ---
# This safely finds your .env file and loads your Neo4j passwords into memory.
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

# --- 2. DEFINE THE DATA MODELS (The Blueprint) ---
# We define exactly what a Node looks like.
class ConceptNode(BaseModel):
    id: str
    name: str
    difficulty: Optional[str] = "Beginner"
    type: str

# We define exactly what an Edge looks like (Connecting A to B).
class Edge(BaseModel):
    source: str
    target: str
    type: str

# The Knowledge Graph is a collection of Nodes and Edges.
class KnowledgeGraph(BaseModel):
    concept_nodes: List[ConceptNode]
    edges: List[Edge] = [] # Defaults to empty list if none exist

# --- 3. CONNECT TO NEO4J ---
driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"), 
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

# --- 4. GRAPH FUNCTIONS ---

def add_concept_to_graph(node: ConceptNode):
    """Creates a Concept dot on the map."""
    with driver.session() as session:
        # MERGE ensures we don't create duplicates.
        query = """
        MERGE (c:Concept {id: $id})
        SET c.name = $name, c.difficulty = $diff
        """
        session.run(query, id=node.id, name=node.name, diff=node.difficulty)

def add_edge_to_graph(edge: Edge):
    """Draws the line between two Concept dots."""
    with driver.session() as session:
        # 1. MATCH finds the two concepts we want to connect.
        # 2. MERGE draws the specific relationship line between them.
        query = f"""
        MATCH (source:Concept {{id: $source_id}})
        MATCH (target:Concept {{id: $target_id}})
        MERGE (source)-[r:{edge.type}]->(target)
        """
        session.run(query, source_id=edge.source, target_id=edge.target)

def load_graph(file_path: str):
    """Translates the JSON file into our Python Blueprint."""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None
    with open(file_path, "r") as f:
        data = json.load(f)
        return KnowledgeGraph(**data)
    
def get_full_graph():
    """Fetches the entire graph from Neo4j in a frontend-friendly format."""
    with driver.session() as session:
        # 1. Get all the Concept dots
        node_query = """
        MATCH (n:Concept) 
        RETURN n.id AS id, n.name AS name, n.difficulty AS difficulty
        """
        nodes_result = session.run(node_query)
        nodes = [
            {"id": record["id"], "name": record["name"], "difficulty": record["difficulty"]} 
            for record in nodes_result
        ]

        # 2. Get all the connection lines
        edge_query = """
        MATCH (source:Concept)-[r]->(target:Concept) 
        RETURN source.id AS source, target.id AS target, type(r) AS label
        """
        edges_result = session.run(edge_query)
        links = [
            {"source": record["source"], "target": record["target"], "label": record["label"]} 
            for record in edges_result
        ]

        # 3. Package it together for the frontend
        return {"nodes": nodes, "links": links}
    
def add_source_node(filename: str, topic_name: str, user_id: str):
    """
    Creates a Source node for the uploaded file and links it to a Concept.
    """
    with driver.session() as session:
        # 1. MERGE creates the Source Node (prevents duplicates)
        # 2. MATCH finds the Concept Node the user typed in the frontend
        # 3. MERGE (s)-[:COVERS]->(c) draws the connecting line
        query = """
        MERGE (s:Source {id: $filename})
        SET s.name = $filename, s.type = 'Document', s.userId = $user_id
        
        WITH s
        MATCH (c:Concept) 
        WHERE toLower(c.name) = toLower($topic_name)
        
        MERGE (s)-[:COVERS]->(c)
        """
        session.run(query, filename=filename, topic_name=topic_name, user_id=user_id)