import chromadb
import umap
import matplotlib.pyplot as plt
import numpy as np

def generate_map():
    # 1. Connect to the local database
    client = chromadb.PersistentClient(path="./chroma_db")
    try:
        collection = client.get_collection(name="campus_items")
    except Exception:
        print("Collection not found. Ensure you have run seed_data.py.")
        return
    
    # 2. Extract data
   # 2. Extract data
    data = collection.get(include=['embeddings', 'metadatas'])
    
    # FIX: Check length of the list instead of the truth value of the array
    if data['embeddings'] is None or len(data['embeddings']) < 2:
        print("DB has insufficient data for UMAP (need at least 2 items).")
        return

    embeddings = np.array(data['embeddings'])
    # Using 'type' (lost/found) for colors, but could also use 'description' for labels
    labels = [m.get('type', 'unknown') for m in data['metadatas']]
    
    print(f"Reducing {len(embeddings)} DINOv2 vectors (768-dim) to 2D...")
    
    # 3. UMAP Projection
    # 'cosine' metric is essential here since DINOv2 vectors are normalized
    reducer = umap.UMAP(n_neighbors=5, min_dist=0.3, metric='cosine', random_state=42)
    embedding_2d = reducer.fit_transform(embeddings)
    
    # 4. Visualization
    fig, ax = plt.subplots(figsize=(10, 7))
    for label in set(labels):
        mask = [l == label for l in labels]
        ax.scatter(
            embedding_2d[mask, 0], 
            embedding_2d[mask, 1], 
            label=f"Status: {label}",
            s=100, 
            alpha=0.7,
            edgecolors='white'
        )
    
    ax.set_title("Project Chimera: DINOv2 Latent Space Mapping", fontsize=14)
    ax.set_xlabel("UMAP Dimension 1")
    ax.set_ylabel("UMAP Dimension 2")
    ax.legend()
    ax.grid(True, linestyle='--', alpha=0.6)
    
    # Save the output
    plt.savefig("assets/cluster_map.png")
    print("✅ Cluster map successfully generated in assets/cluster_map.png")

if __name__ == "__main__":
    generate_map()