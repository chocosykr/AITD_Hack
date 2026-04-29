import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image

class PrivacyAgent:
    def __init__(self, model_path='yolo11n.pt'):
        self.model = YOLO(model_path)

    def process(self, image_bytes: bytes) -> Image.Image:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = self.model(img, conf=0.3, verbose=False)
        for result in results:
            for box in result.boxes:
                if int(box.cls[0]) == 0: # Class 0 is Person
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    roi = img[y1:y2, x1:x2]
                    if roi.size > 0:
                        # Heavy blur for privacy
                        img[y1:y2, x1:x2] = cv2.GaussianBlur(roi, (99, 99), 0)
        
        return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))