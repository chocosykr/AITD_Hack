from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
import json
from main import app_pipeline 

app = FastAPI(title="Smart Lost & Found AI Pipeline")

@app.post("/process_item")
async def process_item(
    file: UploadFile = File(...),
    location: str = Form(...),
    item_type: str = Form(...), # "lost" or "found"
    timestamp: str = Form(...)
):
    # 1. Read image bytes
    image_bytes = await file.read()
    
    # 2. Construct the Agent State
    # IMPORTANT: These keys must match your AgentState TypedDict exactly.
    initial_state = {
        "image_bytes": image_bytes, # Your privacy_node handles converting this to a list
        "processed_images": [],     # Plural to match main.py
        "embedding": None,          
        "metadata": {
            "location": location,
            "time": timestamp,
            "type": item_type
        },
        "match_results": None,   
        "final_matches": [],
        "verdict": "" # Added to match AgentState
    }
    
    # 3. Run the Multi-Agent Orchestration
    # This triggers: Privacy -> Ingestion -> Vision -> Auditor
    try:
        result = app_pipeline.invoke(initial_state)
        # Check if any node set an error in the verdict
        status = "error" if "Error" in result.get("verdict", "") else "success"
        
        return {
            "status": status,
            "system_verdict": result.get("verdict", "No verdict generated"),
            "confidence_matches": result.get("final_matches", [])
        }
    except Exception as e:
        return {"status": "error", "system_verdict": f"Pipeline Crash: {str(e)}"}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)