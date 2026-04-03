from app.utils import load_graph, add_concept_to_graph, add_edge_to_graph

def run_sync():
    print("🚀 Starting LearnPulse Graph Sync...")
    
    # 1. Load the data
    kg = load_graph("data/kg/graph.json")
    if not kg:
        return
    
    # 2. Step One: Create the Dots (Nodes)
    # You MUST create the nodes before you can draw lines between them.
    print(f"\n📦 Syncing {len(kg.concept_nodes)} Concepts...")
    for node in kg.concept_nodes:
        add_concept_to_graph(node)
        print(f"  + Node Added: {node.name}")

    # 3. Step Two: Draw the Lines (Edges)
    print(f"\n🔗 Syncing {len(kg.edges)} Relationships...")
    for edge in kg.edges:
        add_edge_to_graph(edge)
        print(f"  + Edge Added: {edge.source} -> {edge.target}")

    print("\n✅ Sync Complete! Your Knowledge Graph is fully wired.")

if __name__ == "__main__":
    run_sync()