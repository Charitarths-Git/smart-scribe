import os
import re
import fitz  # PyMuPDF
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
import torch


class BookEmbeddingProcessor:
    def __init__(self, embedding_model_name="all-MiniLM-L6-v2"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🔥 Using device: {self.device}")
        self.embedding_model = SentenceTransformer(embedding_model_name, device=self.device)
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50, length_function=len)

    # ---------------- IMAGE + FORMULA + TEXT EXTRACTION ----------------
    def extract_text_images_formulas(self, pdf_path, output_dir="output"):
        image_output_dir = os.path.join(output_dir, "book_images")
        os.makedirs(image_output_dir, exist_ok=True)
        doc = fitz.open(pdf_path)
        pages_data = []

        print(f"📖 Extracting text, images, and formulas from {len(doc)} pages...")

        for page_index in range(len(doc)):
            page = doc.load_page(page_index)
            text = page.get_text("text")
            formulas = self._extract_formulas(text)
            image_paths = []

            # Extract images with page linkage
            for image_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                img_filename = f"page_{page_index+1}img{image_index+1}.{image_ext}"
                img_path = os.path.join(image_output_dir, img_filename)
                with open(img_path, "wb") as f:
                    f.write(image_bytes)
                image_paths.append({
                    "file_path": img_path,
                    "page": page_index + 1,
                    "image_id": f"{page_index+1}_{image_index+1}"
                })

            pages_data.append({
                "page": page_index + 1,
                "text": text,
                "formulas": [{"formula": f, "page": page_index + 1} for f in formulas],
                "images": image_paths
            })

        print(f"✅ Extracted {len(pages_data)} pages with linked images & formulas.")
        return pages_data

    def _extract_formulas(self, text):
        """Extract formula-like text patterns heuristically."""
        formulas = []
        for line in text.splitlines():
            if any(sym in line for sym in ['=', '+', '-', '×', '÷', '∑', '∫', '√', '^', '→', '<', '>']):
                clean = line.strip()
                if len(clean) > 5 and not clean.lower().startswith("figure"):
                    formulas.append(clean)
        return formulas

    # ---------------- EMBEDDING PIPELINE ----------------
    def chunk_and_embed_book(self, pdf_path, book_name, output_dir="output"):
        print(f"\n📘 Processing book: {book_name}")
        os.makedirs(output_dir, exist_ok=True)
        pages_data = self.extract_text_images_formulas(pdf_path, output_dir)

        all_chunks = []
        for page_data in pages_data:
            chunks = self.text_splitter.split_text(page_data["text"])
            for chunk_idx, chunk in enumerate(chunks):
                # Each chunk inherits its page’s formulas & images
                all_chunks.append({
                    "book_name": book_name,
                    "page": page_data["page"],
                    "chunk_id": f"{page_data['page']}_{chunk_idx}",
                    "text": chunk,
                    "formulas": page_data["formulas"],
                    "images": page_data["images"]
                })

        print(f"✅ Created {len(all_chunks)} text chunks from {len(pages_data)} pages.")
        print("⚙ Generating embeddings...")
        texts = [chunk["text"] for chunk in all_chunks]
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True, convert_to_numpy=True)

        for i, chunk in enumerate(all_chunks):
            chunk["embedding"] = embeddings[i]

        self.save_book_embeddings(all_chunks, os.path.join(output_dir, book_name))
        return all_chunks

    # ---------------- SAVE / LOAD ----------------
    def save_book_embeddings(self, chunks, base_path):
        os.makedirs(os.path.dirname(base_path), exist_ok=True)
        embeddings = np.array([c["embedding"] for c in chunks])
        metadata = [{k: v for k, v in c.items() if k != "embedding"} for c in chunks]

        np.save(f"{base_path}_embeddings.npy", embeddings)
        with open(f"{base_path}_metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        print(f"💾 Saved {len(embeddings)} embeddings with linked images/formulas → {base_path}")

    def load_book_embeddings(self, base_path):
        embeddings = np.load(f"{base_path}_embeddings.npy")
        with open(f"{base_path}_metadata.json", "r", encoding="utf-8") as f:
            metadata = json.load(f)
        print(f"📂 Loaded {len(embeddings)} embeddings from {base_path}")
        return embeddings, metadata