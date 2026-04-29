import requests
import os

def seed_database():
    url = "http://localhost:8000/process_item"
    
    lost_items = [
        {"img": "assets/box1.jpeg", "loc": "Canteen", "time": "2026-04-29T10:00:00"},
        {"img": "assets/shoe1.jpeg", "loc": "Library", "time": "2026-04-29T11:30:00"},
        {"img": "assets/shoe2.jpeg", "loc": "Lab 1", "time": "2026-04-29T09:15:00"},
    ]
    
    print("🚀 Starting Database Seeding...")
    for item in lost_items:
        if not os.path.exists(item['img']):
            print(f"⚠️ Skipping {item['img']}: File not found.")
            continue
            
        with open(item['img'], "rb") as f:
            # We explicitly define the filename and content type
            files = {"file": (os.path.basename(item['img']), f, "image/jpeg")}
            data = {
                "location": item['loc'],
                "item_type": "lost",
                "timestamp": item['time']
            }
            try:
                response = requests.post(url, files=files, data=data)
                res_json = response.json()
                status = res_json.get("status")
                verdict = res_json.get("system_verdict", "No verdict")
                print(f"✅ Seeded {item['img']}: {status} | Verdict: {verdict}")
            except Exception as e:
                print(f"❌ Failed to reach server for {item['img']}: {e}")

if __name__ == "__main__":
    seed_database()