from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
import numpy as np
import json
from pdf_embedding import BookEmbeddingProcessor


class LectureBookMatcher:
    def __init__(self, similarity_threshold=0.3, seconds_per_embedding=10, segment_duration_minutes=5):
        """
        Initialize LectureBookMatcher
        
        Args:
            similarity_threshold: Minimum similarity score to include book references
            seconds_per_embedding: Duration each embedding covers (10 seconds)
            segment_duration_minutes: Duration of each lecture segment (5 minutes)
        """
        self.similarity_threshold = similarity_threshold
        self.book_embeddings = None
        self.book_metadata = None
        self.audio_transcripts = None
        
        self.seconds_per_embedding = seconds_per_embedding
        self.segment_duration_seconds = segment_duration_minutes * 60
        self.embeddings_per_segment = self.segment_duration_seconds // self.seconds_per_embedding
        
        print(f"✅ Configuration: {self.embeddings_per_segment} embeddings per {segment_duration_minutes}-minute segment")
        print(f"   (Each segment = {self.embeddings_per_segment} × {seconds_per_embedding}s = {self.segment_duration_seconds}s)")

    def load_book_database(self, book_embeddings_path):
        """Load book embeddings from file"""
        processor = BookEmbeddingProcessor()
        book_embeddings, book_metadata = processor.load_book_embeddings(book_embeddings_path)
        self.book_embeddings = normalize(book_embeddings, axis=1)
        self.book_metadata = book_metadata
        print(f"✅ Loaded {len(self.book_embeddings)} book chunks")
    
    def load_audio_transcripts(self, transcripts_path):
        """
        Load audio transcripts from JSON file
        
        Expected format (from audio_transcripts.json):
        {
            "total_segments": 389,
            "segment_duration_seconds": 10,
            "segments": [
                {"segment_id": 0, "start_time": 0, "end_time": 10, "text": "SO, THEIR MOMENT..."},
                {"segment_id": 1, "start_time": 10, "end_time": 20, "text": "RIGHT. SO, NOW..."},
                ...
            ]
        }
        """
        try:
            with open(transcripts_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Extract segments from JSON
                segments = data.get('segments', [])
                
                # Create dictionary mapping segment_id to text (10-second clips)
                self.audio_transcripts = {}
                for seg in segments:
                    seg_id = seg.get('segment_id')
                    text = seg.get('text', '').strip()
                    if seg_id is not None and text:
                        self.audio_transcripts[seg_id] = text
                
                print(f"✅ Loaded audio transcripts for {len(self.audio_transcripts)} 10-second segments")
                
                # Show sample
                if self.audio_transcripts:
                    sample_ids = sorted(list(self.audio_transcripts.keys()))[:3]
                    for sample_id in sample_ids:
                        preview = self.audio_transcripts[sample_id][:80]
                        print(f"   Seg {sample_id}: {preview}...")
                
        except FileNotFoundError:
            print(f"⚠️  Warning: Could not find {transcripts_path}")
            self.audio_transcripts = {}
        except Exception as e:
            print(f"⚠️  Warning: Could not load audio transcripts: {e}")
            self.audio_transcripts = {}

    def find_relevant_book_sections(self, lecture_embeddings_batch, top_k=5):
        """
        Find book sections relevant to a batch of lecture embeddings
        
        Args:
            lecture_embeddings_batch: Array of embeddings for one 5-minute segment
            top_k: Number of top matches to return
            
        Returns:
            List of relevant book sections with similarity scores
        """
        all_similarities = []
        
        # Calculate similarities for each embedding in the batch
        for emb in lecture_embeddings_batch:
            emb_norm = normalize(emb.reshape(1, -1))[0]
            similarities = cosine_similarity(
                emb_norm.reshape(1, -1),
                self.book_embeddings
            )[0]
            all_similarities.append(similarities)
        
        # Average similarities across all embeddings in this segment
        avg_similarities = np.mean(all_similarities, axis=0)
        print(f"  Similarity: min={np.min(avg_similarities):.4f}, max={np.max(avg_similarities):.4f}")
        
        # Get top K matches
        top_indices = np.argsort(avg_similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            if avg_similarities[idx] >= self.similarity_threshold:
                results.append({
                    'similarity': float(avg_similarities[idx]),
                    'text': self.book_metadata[idx]['text'],
                    'page': self.book_metadata[idx]['page'],
                    'book_name': self.book_metadata[idx]['book_name']
                })
                print(f"    ✓ Match: {self.book_metadata[idx]['book_name']}, Page {self.book_metadata[idx]['page']}, sim={avg_similarities[idx]:.3f}")
        
        return results

    def should_include_context(self, current_embedding_batch, previous_embedding_batches):
        """
        Determine if previous segments should be included as context based on similarity
        
        Args:
            current_embedding_batch: Embeddings for current segment
            previous_embedding_batches: List of previous segments' embedding batches
            
        Returns:
            List of previous segment indices to include as context
        """
        if not previous_embedding_batches:
            return []
        
        # Average embeddings for current segment
        current_avg = np.mean(current_embedding_batch, axis=0)
        current_avg_norm = normalize(current_avg.reshape(1, -1))[0]
        
        context_to_include = []
        
        # Check similarity with previous segments (going backwards)
        for idx, prev_batch in enumerate(reversed(previous_embedding_batches)):
            # Average embeddings for previous segment
            prev_avg = np.mean(prev_batch, axis=0)
            prev_avg_norm = normalize(prev_avg.reshape(1, -1))[0]
            
            similarity = cosine_similarity(
                current_avg_norm.reshape(1, -1),
                prev_avg_norm.reshape(1, -1)
            )[0][0]
            
            if similarity >= self.similarity_threshold:
                prev_segment_idx = len(previous_embedding_batches) - 1 - idx
                context_to_include.append(prev_segment_idx)
            else:
                # Stop if similarity drops below threshold
                break
        
        return sorted(context_to_include)

    def aggregate_audio_transcripts(self, start_embedding_idx, end_embedding_idx):
        """
        Aggregate audio transcripts for a 5-minute segment from 10-second clips
        
        Args:
            start_embedding_idx: Starting index of embeddings for this segment
            end_embedding_idx: Ending index of embeddings for this segment
            
        Returns:
            Combined audio transcript text for the segment
        """
        if not self.audio_transcripts:
            return ""
        
        # Each embedding is 10 seconds, so embedding index = segment_id in audio_transcripts
        audio_texts = []
        
        for embed_idx in range(start_embedding_idx, end_embedding_idx):
            if embed_idx in self.audio_transcripts:
                audio_texts.append(self.audio_transcripts[embed_idx])
        
        # Join all audio texts from this segment with space
        combined_text = " ".join(audio_texts)
        return combined_text

    def process_lecture_segments(self, fused_embeddings_path, video_embeddings_path):
        """
        Process all lecture segments and match with books
        
        Each 5-minute segment contains 30 embeddings (10 seconds each)
        This function aggregates the 30 10-second audio transcripts into one 5-minute segment
        
        Returns:
            List of segment data with book references, transcripts, and context
        """
        # Load embeddings
        fused_embeddings = np.load(fused_embeddings_path)
        video_embeddings = np.load(video_embeddings_path)
        
        total_embeddings = len(video_embeddings)
        print(f"\n✅ Total embeddings loaded: {total_embeddings}")
        
        # Calculate number of segments
        num_segments = total_embeddings // self.embeddings_per_segment
        remainder = total_embeddings % self.embeddings_per_segment
        if remainder > 0:
            num_segments += 1
        
        print(f"📊 Processing {num_segments} lecture segments...")
        print(f"   Duration per segment: {self.segment_duration_seconds} seconds")
        print(f"   Embeddings per segment: {self.embeddings_per_segment}")
        print(f"   Audio segments to aggregate: {self.embeddings_per_segment} × 10 seconds each\n")
        
        all_matches = []
        embedding_history = []
        
        for seg_idx in range(num_segments):
            # Get embeddings for this segment
            start_idx = seg_idx * self.embeddings_per_segment
            end_idx = min(start_idx + self.embeddings_per_segment, total_embeddings)
            
            segment_embeddings = video_embeddings[start_idx:end_idx]
            
            print(f"--- Segment {seg_idx + 1}/{num_segments} ---")
            print(f"  Embeddings: {start_idx}-{end_idx} ({len(segment_embeddings)} embeddings)")
            
            # Find relevant book sections
            book_matches = self.find_relevant_book_sections(segment_embeddings, top_k=5)
            
            # Determine context from previous segments
            context_indices = self.should_include_context(segment_embeddings, embedding_history)
            
            # ✅ FIXED: Aggregate audio transcripts for this 5-minute segment
            # Map embedding indices to audio transcript segment IDs (they're the same!)
            audio_text = self.aggregate_audio_transcripts(start_idx, end_idx)
            
            # Calculate timestamps in minutes
            timestamp_start = seg_idx * self.segment_duration_seconds // 60
            timestamp_end = (seg_idx + 1) * self.segment_duration_seconds // 60
            
            segment_data = {
                "segment_id": seg_idx,
                "timestamp_start": timestamp_start,
                "timestamp_end": timestamp_end,
                "lecture_audio_text": audio_text,  # ← Aggregated from 30 10-second clips
                "book_references": book_matches,
                "context_segments": context_indices,
                "num_embeddings_in_segment": len(segment_embeddings)
            }
            
            all_matches.append(segment_data)
            embedding_history.append(segment_embeddings)
            
            # Debug output
            if audio_text:
                audio_preview = audio_text[:100].replace('\n', ' ')
                print(f"  Audio: {len(audio_text)} chars - {audio_preview}...")
            else:
                print(f"  Audio: NOT FOUND (check audio_transcripts.json)")
            print(f"  Book refs: {len(book_matches)}")
            print(f"  Context: {context_indices}\n")
        
        print(f"\n✅ Processed {num_segments} segments successfully")
        return all_matches
