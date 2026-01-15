from datetime import timedelta
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

class LectureDocumentGenerator:
    def __init__(self,api_key = api_key, model_name="gemini-2.0-flash-exp"):
       
        
        if api_key is None:
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                raise ValueError(
                    "❌ GEMINI_API_KEY not found!\n"
                    "Set it as environment variable:\n"
                    "  export GEMINI_API_KEY='your_key_here'\n"
                    "Or pass it directly to LectureDocumentGenerator(api_key='your_key')"
                )
        
        try:
            # Configure Gemini
            genai.configure(api_key=api_key)
            print(f"✓ API configured")
            
            # Create model instance
            self.model_name = model_name
            self.model = genai.GenerativeModel(self.model_name)
            print(f"✓ Model created: {self.model_name}")
            
            # Test the model with a simple prompt (skip if fails - will retry with actual content)
            try:
                test_response = self.model.generate_content("Test", safety_settings=[
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                ])
                print(f"✓ Model test successful")
            except:
                print(f"⚠  Model test skipped (will be tested with actual content)")
            
            print(f"✅ Using Gemini API with model: {self.model_name}")
        except Exception as e:
            print(f"❌ Error initializing Gemini model: {e}")
            print(f"   Error type: {type(e)._name_}")
            raise
        
        # Load audio transcripts separately
        self.audio_transcripts = {}
    def load_audio_transcripts(self, audio_json_path):
        """
        Load audio transcripts from JSON file

        Expected JSON format:
        {
            "segment_1": {
                "transcript": "HELLO STUDENTS...",
                "video_text": "arafed man walking..."
            },
            "segment_2": {...},
            ...
        }

        Args:
            audio_json_path: Path to the full_data.json file
        """
        try:
            with open(audio_json_path, 'r', encoding='utf-8') as f:
                self.audio_transcripts = json.load(f)

            # Validate structure
            if not isinstance(self.audio_transcripts, dict):
                raise ValueError("JSON file must contain a dictionary")

            # Check if entries have expected structure
            sample_key = list(self.audio_transcripts.keys())[0] if self.audio_transcripts else None
            if sample_key:
                sample_entry = self.audio_transcripts[sample_key]
                if not isinstance(sample_entry, dict) or 'transcript' not in sample_entry:
                    raise ValueError("Each entry must be a dictionary with 'transcript' key")

            print(f"✅ Loaded {len(self.audio_transcripts)} audio transcripts from {audio_json_path}")

            # Show detailed sample
            if self.audio_transcripts:
                first_key = list(self.audio_transcripts.keys())[0]
                first_entry = self.audio_transcripts[first_key]

                transcript_preview = first_entry.get('transcript', '')[:100]
                video_text_preview = first_entry.get('video_text', '')[:100]

                print(f"\n   Sample Entry: {first_key}")
                print(f"   - Transcript: {transcript_preview}...")
                print(f"   - Video Text: {video_text_preview}...")

                # Show statistics
                total_transcript_chars = sum(len(entry.get('transcript', '')) for entry in self.audio_transcripts.values())
                total_video_chars = sum(len(entry.get('video_text', '')) for entry in self.audio_transcripts.values())

                print(f"\n   Statistics:")
                print(f"   - Total segments: {len(self.audio_transcripts)}")
                print(f"   - Total transcript characters: {total_transcript_chars:,}")
                print(f"   - Total video text characters: {total_video_chars:,}")
                print(f"   - Average transcript length: {total_transcript_chars // len(self.audio_transcripts)} chars/segment")

        except FileNotFoundError:
            print(f"⚠  Warning: {audio_json_path} not found. Will proceed without audio transcripts.")
            self.audio_transcripts = {}
        except json.JSONDecodeError as e:
            print(f"⚠  Warning: Invalid JSON format in {audio_json_path}: {e}")
            self.audio_transcripts = {}
        except ValueError as e:
            print(f"⚠  Warning: Invalid data structure in {audio_json_path}: {e}")
            self.audio_transcripts = {}
        except Exception as e:
            print(f"⚠  Warning: Could not load audio transcripts: {e}")
            self.audio_transcripts = {}

    def format_timestamp(self, minutes):
        """Convert minutes to HH:MM:SS format"""
        return str(timedelta(minutes=minutes))
    
    def _create_fallback_summary(self, segment_data, lecture_audio_text, book_refs):
        """Create a fallback summary when API fails"""
        summary = f"Overview\n\n"
        summary += f"Lecture segment from {self.format_timestamp(segment_data.get('timestamp_start', 0))} to {self.format_timestamp(segment_data.get('timestamp_end', 0))}.\n\n"
        if lecture_audio_text:
            summary += f"What Was Discussed\n\n{lecture_audio_text[:300]}...\n\n"
        if book_refs:
            summary += f"Related Textbook Content\n\n"
            for ref in book_refs[:2]:
                summary += f"- {ref['book_name']}, Page {ref['page']}: {ref['text'][:200]}...\n"
        return summary
    
    def generate_segment_summary(self, segment_data, all_segments, max_length=1000):
        """Generate summary using Gemini API with BOTH audio transcript and book references"""
        
        # Extract data - handle MULTIPLE possible key names
        book_refs = segment_data.get('book_references', [])
        
        # Try to get transcript from segment_data first
        lecture_audio_text = (
            segment_data.get('lecture_audio_text') or 
            segment_data.get('transcript') or 
            segment_data.get('audio_transcript') or 
            segment_data.get('text') or 
            ''
        )
        
        # If not in segment_data, try to get from loaded audio transcripts
        if not lecture_audio_text and self.audio_transcripts:
            segment_id = segment_data.get('segment_id', 0)
            
            # Try different key formats
            possible_keys = [
                f"segment_{segment_id + 1}",  # segment_1, segment_2, etc.
                f"segment_{segment_id}",      # segment_0, segment_1, etc.
                str(segment_id),               # 0, 1, 2, etc.
                str(segment_id + 1)            # 1, 2, 3, etc.
            ]
            
            for key in possible_keys:
                if key in self.audio_transcripts:
                    lecture_audio_text = self.audio_transcripts[key]
                    print(f"  ✓ Found transcript using key: {key}")
                    break
        
        # Get video text if available
        video_text = ""
        
        segment_id = segment_data.get('segment_id', 0)
        timestamp_start = segment_data.get('timestamp_start', segment_id * 10)
        timestamp_end = segment_data.get('timestamp_end', (segment_id + 1) * 10)
        
        print(f"\n--- DEBUG Segment {segment_id + 1} ---")
        print(f"Segment keys available: {list(segment_data.keys())}")
        print(f"Audio transcript length: {len(lecture_audio_text)} chars")
        print(f"Video text length: {len(video_text)} chars")
        print(f"Book references found: {len(book_refs)}")
        
        # Build context from previous segments
        context_text = ""
        if segment_data.get('context_segments'):
            context_text = "\n\nPrevious Segments Context:\n"
            for ctx_idx in segment_data['context_segments'][:2]:
                if ctx_idx < len(all_segments):
                    ctx_seg = all_segments[ctx_idx]
                    ctx_start = ctx_seg.get('timestamp_start', ctx_idx * 10)
                    ctx_end = ctx_seg.get('timestamp_end', (ctx_idx + 1) * 10)
                    context_text += f"- Segment {ctx_idx}: {self.format_timestamp(ctx_start)} - {self.format_timestamp(ctx_end)}\n"
        
        # Build book references text
        book_refs_text = ""
        if book_refs:
            book_refs_text = "\n\nRelated Textbook Content:\n"
            for ref in book_refs[:3]:
                book_refs_text += f"\n[{ref['book_name']}, Page {ref['page']}] (Relevance: {ref['similarity']:.2f})\n"
                book_refs_text += f"Quote: {ref['text'][:400]}\n"
                print(f"  ✓ Added book ref: page {ref['page']}, sim={ref['similarity']:.2f}")
        else:
            print("  ⚠  No book references found for this segment")
        
        # Create comprehensive prompt with BOTH lecture audio AND book content
        # NO ASTERISKS to avoid Gemini safety filters
        
        # If no transcript, adjust prompt to focus on textbook content
        if not lecture_audio_text:
            prompt = f"""You are an expert academic content summarizer. Create a comprehensive educational summary based on textbook content.

Segment Information:
- Segment Number: {segment_id + 1}
- Time Range: {self.format_timestamp(timestamp_start)} to {self.format_timestamp(timestamp_end)}

Note: Audio transcript not available for this segment. Please create an educational summary based on the related textbook content below.

{book_refs_text}

{context_text}

Your Task:
Generate a detailed educational summary that:
1. Summarizes the key concepts from the textbook content provided
2. Explains main topics in a clear, structured way
3. Makes connections between different concepts
4. Uses academic yet accessible language


Format: Write in plain text with proper headings and bullet points where appropriate.

Summary:"""
        else:
            prompt = f"""You are an expert academic summarizer. Create a comprehensive lecture summary.

Lecture Segment Information:
- Segment Number: {segment_id + 1}
- Time: {self.format_timestamp(timestamp_start)} - {self.format_timestamp(timestamp_end)}

What the Lecturer Actually Said (Audio Transcript):
{lecture_audio_text}

{book_refs_text}

{context_text}

Your Task:
Generate a detailed, well-structured summary that:
1. Captures what was discussed in the lecture (from the transcript above)
2. Explains main topics and key concepts covered
3. References the textbook content provided (mention pages and relevance)
4. Connects to previous segments if context is provided
5. Uses clear, academic yet friendly language


Format: Write in plain text with proper headings and bullet points where appropriate. Use simple text formatting without special characters.

Summary:"""

        print(f"Prompt length: {len(prompt)} chars")
        if lecture_audio_text:
            print(f"Audio content included: YES ✓")
        else:
            print(f"Audio content included: NO ✗")
        
        # Call Gemini API
        try:
            # Verify model exists
            if not hasattr(self, 'model') or self.model is None:
                raise AttributeError("Model not properly initialized. Please check API key and initialization.")
            
            print(f"Calling Gemini API...")
            
            # Configure generation settings
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                
            }
            
            # Configure safety settings to be minimal for educational content
            # Using BLOCK_ONLY_HIGH to allow educational/academic content
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]
            
            # Generate content
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Check if response was blocked
            if not response.candidates or not response.candidates[0].content.parts:
                print(f"⚠  Response blocked. Finish reason: {response.candidates[0].finish_reason if response.candidates else 'UNKNOWN'}")
                print(f"   Safety ratings: {response.candidates[0].safety_ratings if response.candidates else 'N/A'}")
                raise ValueError(f"Content blocked by safety filters (finish_reason={response.candidates[0].finish_reason if response.candidates else 'UNKNOWN'})")
            
            summary = response.text
            print(f"✓ Summary generated: {len(summary)} chars")
            print(f"Preview: {summary[:150]}...")
            
        except AttributeError as e:
            print(f"❌ Model initialization error: {e}")
            print("   Please ensure the API key is valid and the model is properly initialized.")
            summary = self._create_fallback_summary(segment_data, lecture_audio_text, book_refs)
        except ValueError as e:
            # Handle Gemini safety filter blocks (finish_reason=2)
            print(f"❌ Content blocked by Gemini safety filters: {e}")
            print("   This usually happens when:")
            print("   - No audio transcript is available")
            print("   - Content is too sparse or repetitive")
            print("   - Creating fallback summary...")
            summary = self._create_fallback_summary(segment_data, lecture_audio_text, book_refs)
        except Exception as e:
            print(f"❌ Error calling Gemini API: {e}")
            print(f"   Error type: {type(e)._name_}")
            summary = self._create_fallback_summary(segment_data, lecture_audio_text, book_refs)
        
        print("--- END DEBUG ---\n")
        return summary

    def generate_full_document(self, all_segments_data, output_path="lecture_summary.txt"):
        """Generate complete lecture summary document with all segments as TXT file"""
        
        print(f"\n{'='*80}")
        print(f"GENERATING COMPREHENSIVE LECTURE DOCUMENT")
        print(f"{'='*80}")
        
        # Convert dict to list if needed
        if isinstance(all_segments_data, dict):
            print(f"Converting dict format to list...")
            segments_list = []
            for key in sorted(all_segments_data.keys(), key=lambda x: int(x.split('')[1]) if '' in x else int(x)):
                segment = all_segments_data[key]
                # Extract segment_id from key if not present
                if 'segment_id' not in segment:
                    segment['segment_id'] = int(key.split('')[1]) - 1 if '' in key else int(key)
                segments_list.append(segment)
            all_segments_data = segments_list
        
        # Create document header
        document = "=" * 80 + "\n"
        document += "COMPREHENSIVE LECTURE SUMMARY\n"
        document += "=" * 80 + "\n\n"
        document += f"Total Segments: {len(all_segments_data)}\n"
        document += f"Total Duration: {len(all_segments_data) * 10 // 60} minutes {(len(all_segments_data) * 10) % 60} seconds\n\n"
        
        # Table of Contents
        document += "TABLE OF CONTENTS\n"
        document += "-" * 80 + "\n\n"
        for seg in all_segments_data:
            seg_id = seg.get('segment_id', 0)
            ts_start = seg.get('timestamp_start', seg_id * 10)
            ts_end = seg.get('timestamp_end', (seg_id + 1) * 10)
            document += f"- Segment {seg_id + 1} "
            document += f"({self.format_timestamp(ts_start)} - {self.format_timestamp(ts_end)})\n"
        
        document += "\n" + "=" * 80 + "\n\n"
        
        # Generate summary for each segment
        total_segments = len(all_segments_data)
        for idx, seg in enumerate(all_segments_data, 1):
            seg_id = seg.get('segment_id', idx - 1)
            ts_start = seg.get('timestamp_start', seg_id * 10)
            ts_end = seg.get('timestamp_end', (seg_id + 1) * 10)
            
            print(f"Generating summary for segment {seg_id + 1}... ({idx}/{total_segments})")
            summary = self.generate_segment_summary(seg, all_segments_data)
            
            # Add segment header
            document += f"SEGMENT {seg_id + 1}: "
            document += f"{self.format_timestamp(ts_start)} - {self.format_timestamp(ts_end)}\n"
            document += "-" * 80 + "\n\n"
            
            # Add summary
            document += summary + "\n\n"
            
            # Add book references
            if seg.get('book_references'):
                document += "REFERENCES\n"
                for ref in seg['book_references']:
                    document += f"- {ref['book_name']}, Page {ref['page']} (Relevance: {ref['similarity']:.2%})\n"
                document += "\n"
            
            # Add audio transcript
            lecture_text = seg.get('lecture_audio_text') or seg.get('transcript', '')
            if lecture_text:
                document += "AUDIO TRANSCRIPT\n"
                document += f"{lecture_text}\n\n"
            
            document += "=" * 80 + "\n\n"
        
        # Write to file
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(document)
        
        print(f"\n✅ Comprehensive lecture document saved to {output_path}")
        print(f"📄 File size: {len(document)} characters")
        print(f"📊 Document contains {len(all_segments_data)} segments with summaries and references")
        
        return document


def process_json_file(json_file_path, api_key=None, output_path=None, audio_transcript_path=None):
    """
    Helper function to process your JSON file format
    
    Args:
        json_file_path: Path to your JSON file with segment_1, segment_2, etc.
        api_key: Optional Gemini API key
        output_path: Optional custom output path. If None, auto-generates from input path
        audio_transcript_path: Optional path to audio_transcript.json file
    
    Returns:
        str: Path to the generated output file
    """
    print(f"📂 Loading data from {json_file_path}...")
    
    # Load JSON data
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convert your format to expected format
    all_segments = []
    for key in sorted(data.keys(), key=lambda x: int(x.split('')[1]) if '' in x else int(x)):
        segment = data[key]
        segment_num = int(key.split('')[1]) - 1 if '' in key else int(key)
        
        # Get transcript from multiple possible sources
        transcript = segment.get('transcript') or segment.get('lecture_audio_text') or segment.get('text') or ''
        video_text = segment.get('video_text', '')
        
        segment_data = {
            'segment_id': segment_num,
            'timestamp_start': segment_num * 10,  # Assuming 10-minute segments
            'timestamp_end': (segment_num + 1) * 10,
            'transcript': transcript,
            'lecture_audio_text': transcript,
            'video_text': video_text,
            'book_references': segment.get('book_references', [])
        }
        all_segments.append(segment_data)
    
    print(f"✓ Loaded {len(all_segments)} segments")
    print(f"✓ Sample segment keys: {list(all_segments[0].keys()) if all_segments else 'None'}")
    if all_segments:
        print(f"✓ First segment transcript length: {len(all_segments[0].get('transcript', ''))} chars")
    
    # Initialize generator
    generator = LectureDocumentGenerator(api_key=api_key)
    
    # Load audio transcripts if provided
    if audio_transcript_path:
        generator.load_audio_transcripts(audio_transcript_path)
    
    # Use provided output path or auto-generate
    if output_path is None:
        output_path = json_file_path.replace('.json', '_summary.txt')
    
    generator.generate_full_document(all_segments, output_path=output_path)
    
    return output_path