import uuid
import torch
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Optional
from PIL import Image

# Imports from your agents package
from agents.privacy_agent import PrivacyAgent
from agents.inegstion_agent import IngestionAgent
from agents.vision_agent import VisionAgent
from agents.auditor_agent import AuditorAgent

# --- 1. DEFINE THE SHARED STATE ---
class AgentState(TypedDict):
    image_bytes: bytes
    processed_images: List[Image.Image] 
    embedding: Optional[torch.Tensor] # Keeping it as Tensor for Auditor math
    metadata: dict
    match_results: Optional[dict]
    final_matches: dict
    verdict: str

# --- 2. INITIALIZE YOUR AGENTS ---
priv_agent = PrivacyAgent()
ingest_agent = IngestionAgent()
vision_agent = VisionAgent()
audit_agent = AuditorAgent()

# --- 3. DEFINE NODE FUNCTIONS ---

def privacy_node(state: AgentState):
    print("[Node] Redacting sensitive data...")
    raw_data = state.get('image_bytes')
    
    # Handle single bytes (FastAPI) or list of bytes (Test scripts)
    raw_list = [raw_data] if isinstance(raw_data, bytes) else raw_data

    try:
        clean_images = [priv_agent.process(img) for img in raw_list]
        return {"processed_images": clean_images, "verdict": "Images Processed"}
    except Exception as e:
        print(f"Privacy Node Error: {e}")
        return {"verdict": f"Error in Privacy Node: {str(e)}"}

def ingestion_node(state: AgentState):
    print("[Node] Generating DINOv2 embeddings...")
    if not state.get('processed_images'):
        return {"verdict": "Error: No images found to embed"}
    
    try:
        # Ingestion returns a 768-dim DINOv2 Tensor
        vectors = ingest_agent.get_embeddings(state['processed_images'])
        return {"embedding": vectors}
    except Exception as e:
        print(f"Ingestion Node Error: {e}")
        return {"verdict": f"Error in Ingestion Node: {str(e)}"}

def vision_node(state: AgentState):
    print("[Node] Vector Search & Logging...")
    meta = state['metadata']
    emb = state['embedding']
    item_id = str(uuid.uuid4())
    
    # 1. Search first
    results = vision_agent.search_matches(emb, item_type=meta['type'])
    
    # 2. Log to DB
    success = vision_agent.add_to_db(item_id, emb, meta)
    
    # CRITICAL: This verdict is what app.py checks for 'error'
    verdict = "Logged" if success else "Error: DB Write Failed"
    
    return {"match_results": results, "verdict": verdict}

def auditor_node(state: AgentState):
    print("[Node] DINOv2 Multi-View Audit...")
    # If no results came from the DB, we stop here
    if not state.get('match_results') or not state['match_results'].get('ids'):
        return {"final_matches": {"score": 0.0, "verdict": "No matches"}, "verdict": "Item Logged"}
    
    # Perform the 0.4G + 0.4R + 0.2Q weighted comparison
    analysis = audit_agent.validate(state['embedding'], state['match_results'])
    return {"final_matches": analysis, "verdict": analysis['verdict']}

# --- 4. CONSTRUCT THE GRAPH ---
workflow = StateGraph(AgentState)

workflow.add_node("privacy_gate", privacy_node)
workflow.add_node("feature_extractor", ingestion_node)
workflow.add_node("vector_search", vision_node)
workflow.add_node("logic_auditor", auditor_node)

workflow.set_entry_point("privacy_gate")
workflow.add_edge("privacy_gate", "feature_extractor")
workflow.add_edge("feature_extractor", "vector_search")
workflow.add_edge("vector_search", "logic_auditor")
workflow.add_edge("logic_auditor", END)

app_pipeline = workflow.compile()

# --- 5. EXECUTION EXAMPLE ---
if __name__ == "__main__":
    # Test Data: Someone finds a phone in the canteen
    with open("test_image.jpg", "rb") as f:
        img_data = f.read()

    input_state = {
        "image_bytes": img_data,
        "metadata": {
            "location": "Canteen", 
            "time": "2026-04-29T14:00:00", 
            "type": "found"
        }
    }

    result = app_pipeline.invoke(input_state)
    print("\n--- Pipeline Finished ---")
    print(f"Matches Found: {result['final_matches']}")