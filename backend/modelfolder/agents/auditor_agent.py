import torch
import numpy as np

class AuditorAgent:
    def validate(self, query_embs, match_results):
        # 1. Safety check for empty results
        if match_results is None or 'embeddings' not in match_results or not match_results['embeddings']:
            return {"score": 0.0, "verdict": "No matches found"}
            
        embeddings_list = match_results['embeddings']
        
        # 2. Check if the inner list is empty without triggering ambiguity error
        if len(embeddings_list) == 0 or len(embeddings_list[0]) == 0:
            return {"score": 0.0, "verdict": "No matches found"}

        # 3. FIX: Convert to Tensor AND force to float32 (matches the query dtype)
        try:
            # .float() solves the 'float != double' crash
            db_embs = torch.as_tensor(embeddings_list[0]).float() 
        except Exception as e:
            print(f"[Auditor Error] Tensor conversion failed: {e}")
            return {"score": 0.0, "verdict": "Error processing matches"}
        
        # 4. Ensure query_embs is 2D [NumQueries, 768] and float32
        if torch.is_tensor(query_embs):
            query_embs = query_embs.float()
        else:
            query_embs = torch.as_tensor(query_embs).float()

        if query_embs.ndim == 1:
            query_embs = query_embs.unsqueeze(0)

        # 5. Compute Similarity Matrix (Matrix Multiplication)
        # Both must now be float32
        sim_matrix = query_embs @ db_embs.T

        # 6. Multi-View Scoring Logic
        global_best = sim_matrix.max().item()
        avg_best_per_ref = sim_matrix.max(dim=0).values.mean().item()
        avg_best_per_query = sim_matrix.max(dim=1).values.mean().item()

        # Weighted calculation: 0.4G + 0.4R + 0.2Q
        final_score = (0.4 * global_best) + (0.4 * avg_best_per_ref) + (0.2 * avg_best_per_query)

        # 7. Thresholds for Verdict
        if final_score > 0.82: 
            verdict = "High-Confidence Match"
        elif final_score > 0.72: 
            verdict = "Potential Match"
        else: 
            verdict = "Different Items"

        return {"score": round(final_score, 4), "verdict": verdict}