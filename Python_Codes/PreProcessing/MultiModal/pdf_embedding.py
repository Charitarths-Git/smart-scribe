import PyPDF2
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

import json
from pathlib import Path
from .generate import *


import os

class BookEmbeddingProcessor:
    def __init__(self, embedding_model_name="all-MiniLM-L6-v2"):
        self.embedding_model = SentenceTransformer(embedding_model_name)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # tokens per chunk
            chunk_overlap=50,  # overlap between chunks
            length_function=len,
        )
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF with page numbers"""
        text_data = []
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                if text.strip():
                    text_data.append({
                        'page': page_num + 1,
                        'text': text
                    })
        return text_data
    
    def chunk_and_embed_book(self, pdf_path, book_name):
        """Process entire book: extract, chunk, and create embeddings"""
        print(f"Processing book: {book_name}")
        
        # Extract text
        pages_data = self.extract_text_from_pdf(pdf_path)
        
        # Chunk text
        all_chunks = []
        for page_data in pages_data:
            chunks = self.text_splitter.split_text(page_data['text'])
            for chunk_idx, chunk in enumerate(chunks):
                all_chunks.append({
                    'book_name': book_name,
                    'page': page_data['page'],
                    'chunk_id': f"{page_data['page']}_{chunk_idx}",
                    'text': chunk
                })
        
        print(f"Created {len(all_chunks)} chunks from {len(pages_data)} pages")
        
        # Create embeddings
        texts = [chunk['text'] for chunk in all_chunks]
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        
        # Combine chunks with embeddings
        for idx, chunk in enumerate(all_chunks):
            chunk['embedding'] = embeddings[idx]
        
        return all_chunks
    
    def save_book_embeddings(self, chunks_with_embeddings, output_path):
        """Save embeddings and metadata"""
        # Ensure directory exists before saving
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        embeddings = np.array([chunk['embedding'] for chunk in chunks_with_embeddings])
        metadata = [{k: v for k, v in chunk.items() if k != 'embedding'} 
                    for chunk in chunks_with_embeddings]
        
        np.save(f"{output_path}_embeddings.npy", embeddings)
        with open(f"{output_path}_metadata.json", 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(embeddings)} embeddings to {output_path}")
    
    def load_book_embeddings(self, base_path):
        """Load previously saved embeddings"""
        embeddings = np.load(f"{base_path}_embeddings.npy")
        with open(f"{base_path}_metadata.json", 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        return embeddings, metadata

