import cv2
import torch
from transformers import AutoProcessor, AutoModelForVision2Seq, BlipProcessor, BlipForConditionalGeneration, TrOCRProcessor, VisionEncoderDecoderModel
from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np
import re
from pathlib import Path
import easyocr 

# Suppress a specific transformers warning
from transformers.utils import logging
logging.set_verbosity_error()

class VideoTextExtractor:
    
    def __init__(self):
        import torch
        from transformers import VisionEncoderDecoderModel, TrOCRProcessor, BlipProcessor, BlipForConditionalGeneration
        from sentence_transformers import SentenceTransformer
        import easyocr

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        use_gpu = torch.cuda.is_available()
        
        if self.device == "cpu":
            print("="*50)
            print("WARNING: No GPU detected. This will be EXTREMELY slow.")
            print("="*50)
        else:
            print(f"Using device: {self.device}")

        print("Loading Text Detector (easyocr)...")
        self.text_detector = easyocr.Reader(['en'], gpu=use_gpu)

        print("Loading HTR model (microsoft/trocr-large-handwritten)...")
        # Force safetensors to avoid PyTorch 2.6 requirement
        self.htr_processor = TrOCRProcessor.from_pretrained(
            "microsoft/trocr-large-handwritten",
            use_safetensors=True
        )
        self.htr_model = VisionEncoderDecoderModel.from_pretrained(
            "microsoft/trocr-large-handwritten",
            use_safetensors=True
        ).to(self.device)

        print("Loading Image Captioning model (Salesforce/blip-image-captioning-large)...")
        # BLIP models also support safetensors
        self.caption_processor = BlipProcessor.from_pretrained(
            "Salesforce/blip-image-captioning-large",
            use_safetensors=True
        )
        self.caption_model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-large",
            use_safetensors=True
        ).to(self.device)

        print("Loading NLP embedding model (all-MiniLM-L6-v2)...")
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device=self.device)

    def extract_info_from_batch(self, frame_batch):
        unique_text_fragments = set()
        unique_image_captions = set()
        
        for frame in frame_batch:
            detections = self.text_detector.readtext(frame, detail=1, paragraph=False)
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            for (bbox, _, _) in detections:
                (tl, tr, br, bl) = bbox
                x_min = int(min(tl[0], bl[0]))
                y_min = int(min(tl[1], tr[1]))
                x_max = int(max(tr[0], br[0]))
                y_max = int(max(bl[1], br[1]))
                padding = 2
                cropped_image = pil_image.crop((
                    max(0, x_min - padding), 
                    max(0, y_min - padding), 
                    min(pil_image.width, x_max + padding), 
                    min(pil_image.height, y_max + padding)
                ))

                if cropped_image.width > 10 and cropped_image.height > 10:
                    pixel_values = self.htr_processor(cropped_image, return_tensors="pt").pixel_values.to(self.device)
                    with torch.no_grad():
                        outputs = self.htr_model.generate(pixel_values, max_length=128)
                        
                    text = self.htr_processor.batch_decode(outputs, skip_special_tokens=True)[0].strip()
                        
                    if text and len(text) > 2: # Filter out small noise
                        unique_text_fragments.add(text)
            caption_inputs = self.caption_processor(pil_image, return_tensors="pt").to(self.device)
            with torch.no_grad():
                caption_ids = self.caption_model.generate(**caption_inputs, max_length=75)
            caption = self.caption_processor.batch_decode(caption_ids, skip_special_tokens=True)[0].strip()
            if caption and len(caption) > 5:
                unique_image_captions.add(caption)
                    
                
        return list(unique_text_fragments), list(unique_image_captions)

    def combine_and_clean_info(self, text_list, caption_list):
        combined_text = " . ".join(sorted(caption_list) + sorted(text_list))
        combined_text = re.sub(r'\s+', ' ', combined_text).strip()
        return combined_text

    def get_text_embedding(self, text):
        embedding = self.embedding_model.encode(text)
        return embedding

