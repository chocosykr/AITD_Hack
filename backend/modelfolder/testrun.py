from main import app_pipeline
import os
from PIL import Image

def test_demo():
    # Load a test image (ensure this file exists!)
    with open("assets/shoe1.jpeg", "rb") as f:
        img_data = f.read()

img_paths = ["assets/shoe1_front.jpg", "assets/shoe1_side.jpg"]
img_data_list = [open(p, "rb").read() for p in img_paths if os.path.exists(p)]
    state = {
        "image_bytes": img_data,
        "processed_images": [], # Placeholder for Privacy Node
        "embedding": None,      # Placeholder for Ingestion Node
        "metadata": {
            "location": "Canteen",
            "time": "2026-04-29T16:00:00",
            "type": "found"
        },
        "match_results": None,  # Placeholder for Vision Node
        "final_matches": [],    # Placeholder for Auditor Node
        "verdict": ""
    }
    print("Starting Multi-Agent Recovery Pipeline...")
    final_state = app_pipeline.invoke(state)
    print(f"\nFinal Verdict: {final_state['verdict']}")
    print(f"Matches: {final_state['final_matches']}")

if __name__ == "__main__":
    test_demo()