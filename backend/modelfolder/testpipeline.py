import os
from main import app_pipeline
from PIL import Image

def run_e2e_test():
    # 1. Setup paths to your 'found' images
    test_paths = [
        r"assets/shoe1.jpeg",
        # r"assets/box1.jpeg"  # Add more paths here to test the "Multi-View" DINOv2 logic
        # Add more paths here to test the "Multi-View" DINOv2 logic
    ]
    
    # 2. Load images as BYTES (to feed the start of the graph)
    image_bytes_list = []
    for p in test_paths:
        if os.path.exists(p):
            with open(p, "rb") as f:
                image_bytes_list.append(f.read())
    
    if not image_bytes_list:
        print("❌ Test failed: No images found at specified paths. Check the 'assets/' folder.")
        return

    # 3. Construct state correctly for the entry node (privacy_gate)
    # If testing a single image, you can pass just the bytes.
    # For multi-view, pass the list of bytes.
    initial_state = {
        "image_bytes": image_bytes_list, 
        "processed_images": [], # Will be populated by the privacy node
        "metadata": {
            "location": "Canteen",
            "time": "2026-04-29T17:00:00",
            "type": "found"
        },
        "match_results": None,
        "final_matches": [],
        "verdict": ""
    }

    print("🚀 Starting End-to-End Pipeline Trace...")
    
    # 4. Execute the Graph
    try:
        final_output = app_pipeline.invoke(initial_state)

        # 5. Validate Results
        print("\n--- [PIPELINE RESULT] ---")
        print(f"Verdict: {final_output.get('verdict', 'No verdict generated')}")
        
        matches = final_output.get('final_matches', [])
        if isinstance(matches, dict) and "score" in matches:
            print(f"Confidence Score: {matches['score']:.4f}")
            print(f"System Conclusion: {matches['verdict']}")
        else:
            print(f"Matches found: {matches}")
            
    except Exception as e:
        print(f"❌ Pipeline crashed: {e}")

if __name__ == "__main__":
    run_e2e_test()