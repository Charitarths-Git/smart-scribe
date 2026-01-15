from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
import numpy as np
import json
from .pdf_embedding import BookEmbeddingProcessor


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
        self.full_data = None
        
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
    
    def load_full_data(self, full_data_path):
        """
        Load full_data.json which contains both transcript and video_text for each segment

        Expected format:
        {
            "segment_1": {
                "transcript": "HELLO STUDENTS...",
                "video_text": "arafed man walking..."
            },
            "segment_2": {...},
            ...
        }
        """
        try:
            with open(full_data_path, 'r', encoding='utf-8') as f:
                self.full_data = json.load(f)

            print(f"✅ Loaded full_data.json with {len(self.full_data)} segments")

            # Show sample
            if self.full_data:
                sample_keys = sorted(list(self.full_data.keys()), key=lambda x: int(x.split('_')[1]))[:3]
                for key in sample_keys:
                    transcript_preview = self.full_data[key]['transcript'][:80]
                    print(f"   {key}: {transcript_preview}...")

        except FileNotFoundError:
            print(f"⚠ Warning: Could not find {full_data_path}")
            self.full_data = {}
        except Exception as e:
            print(f"⚠ Warning: Could not load full_data.json: {e}")
            self.full_data = {}

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

    def aggregate_segment_data(self, start_embedding_idx, end_embedding_idx):
        """
        Aggregate data from full_data.json for a 5-minute segment

        Args:
            start_embedding_idx: Starting index (corresponds to segment_1, segment_2, etc.)
            end_embedding_idx: Ending index

        Returns:
            Dictionary with combined transcript and video_text
        """
        if not self.full_data:
            return {"transcript": "", "video_text": ""}

        transcripts = []
        video_texts = []

        # full_data.json uses 1-based indexing (segment_1, segment_2, ...)
        # while our embedding indices are 0-based
        for i in range(start_embedding_idx, end_embedding_idx):
            segment_key = f"segment_{i + 1}"  # Convert to 1-based
            if segment_key in self.full_data:
                data = self.full_data[segment_key]
                transcripts.append(data.get('transcript', ''))
                video_texts.append(data.get('video_text', ''))

        return {
            "transcript": " ".join(transcripts),
            "video_text": " ".join(video_texts),}

    def process_lecture_segments(self, fused_embeddings_path, video_embeddings_path):
        """
        Process all lecture segments and match with books
        Each 5-minute segment contains 30 embeddings (10 seconds each)

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
        print(f"   Data to aggregate: {self.embeddings_per_segment} × 10 seconds each\n")

        all_matches = []
        embedding_history = []

        for seg_idx in range(num_segments):
            # Get embeddings for this segment
            start_idx = seg_idx * self.embeddings_per_segment
            end_idx = min(start_idx + self.embeddings_per_segment, total_embeddings)
            segment_embeddings = video_embeddings[start_idx:end_idx]

            print(f"--- Segment {seg_idx + 1}/{num_segments} ---")
            print(f"   Embeddings: {start_idx}-{end_idx} ({len(segment_embeddings)} embeddings)")

            # Find relevant book sections
            book_matches = self.find_relevant_book_sections(segment_embeddings, top_k=5)

            # Determine context from previous segments
            context_indices = self.should_include_context(segment_embeddings, embedding_history)

            # Aggregate data from full_data.json
            segment_data_combined = self.aggregate_segment_data(start_idx, end_idx)

            # Calculate timestamps in minutes
            timestamp_start = seg_idx * self.segment_duration_seconds // 60
            timestamp_end = (seg_idx + 1) * self.segment_duration_seconds // 60

            segment_data = {
                "segment_id": seg_idx,
                "timestamp_start": timestamp_start,
                "timestamp_end": timestamp_end,
                "lecture_audio_text": segment_data_combined['transcript'],
                "lecture_video_text": segment_data_combined['video_text'],
                "book_references": book_matches,
                "context_segments": context_indices,
                "num_embeddings_in_segment": len(segment_embeddings)
            }

            all_matches.append(segment_data)
            embedding_history.append(segment_embeddings)

            # Debug output
            if segment_data_combined['transcript']:
                audio_preview = segment_data_combined['transcript'][:100].replace('\n', ' ')
                print(f"   Transcript: {len(segment_data_combined['transcript'])} chars - {audio_preview}...")
            else:
                print(f"   Transcript: NOT FOUND")

            print(f"   Book refs: {len(book_matches)}")
            print(f"   Context: {context_indices}\n")

        print(f"\n✅ Processed {num_segments} segments successfully")
        return all_matches
