import torch
import torch.nn.functional as F
from transformers import AutoImageProcessor, AutoModel
from PIL import Image

class IngestionAgent:
    def __init__(self, model_name="facebook/dinov2-base"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = AutoImageProcessor.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)
        self.model.eval()

    def get_embeddings(self, images):
        if not isinstance(images, list):
            images = [images]
        
        inputs = self.processor(images=images, return_tensors="pt").to(self.device)
        
        with torch.inference_mode():
            outputs = self.model(**inputs)
            # DINOv2 uses the CLS token at index 0 for global features
            emb = outputs.last_hidden_state[:, 0]
            emb = F.normalize(emb, p=2, dim=1)
            
        return emb.cpu()