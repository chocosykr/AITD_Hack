import chromadb
import torch
import numpy as np

class VisionAgent:
    def __init__(self, collection_name="campus_items"):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(
            name=collection_name, 
            metadata={"hnsw:space": "cosine"}
        )

    def add_to_db(self, item_id, embedding, metadata):
        try:
            if torch.is_tensor(embedding):
                if embedding.ndim > 1:
                    embedding = embedding.mean(dim=0)
                embedding = embedding.detach().cpu().numpy().flatten().tolist()
            
            # ChromaDB requires list of lists [[...]]
            self.collection.add(
                ids=[item_id], 
                embeddings=[embedding], 
                metadatas=[metadata]
            )
            return True
        except Exception as e:
            print(f"❌ Vision Error (Add): {e}")
            return False

    def search_matches(self, embedding, item_type):
        # Search 'lost' if current is 'found', and vice-versa
        target = "lost" if item_type == "found" else "found"
        
        if torch.is_tensor(embedding):
            if embedding.ndim > 1:
                embedding = embedding.mean(dim=0)
            embedding = embedding.detach().cpu().numpy().flatten().tolist()
            
        return self.collection.query(
            query_embeddings=[embedding], 
            n_results=5, 
            where={"type": target},
            include=["embeddings", "metadatas", "distances"]
        )