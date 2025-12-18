
from datetime import timedelta
from groq import Groq
import os


class LectureDocumentGenerator:
    def __init__(self, api_key=None, model_name="openai/gpt-oss-120b"):
        """
        Initialize with Groq API (free, no credit card needed)
        Get free API key from: https://console.groq.com/
        
        Args:
            api_key: Groq API key (uses GROQ_API_KEY env var if not provided)
            model_name: Model to use (default: openai/gpt-oss-120b for best quality)
        """
        if api_key is None:
            api_key = "your_groq_api_key_here"
            if not api_key:
                raise ValueError(
                    "❌ GROQ_API_KEY not found!\n"
                    "Set it as environment variable:\n"
                    "  export GROQ_API_KEY='your_key_here'\n"
                    "Or pass it directly to LectureDocumentGenerator(api_key='your_key')"
                )
        
        self.client = Groq(api_key=api_key)
        self.model = model_name
        print(f"✅ Using Groq API with model: {self.model}")
    
    def format_timestamp(self, minutes):
        """Convert minutes to HH:MM:SS format"""
        return str(timedelta(minutes=minutes))
    
    def generate_segment_summary(self, segment_data, all_segments, max_length=1000):
        """Generate summary using Groq API with BOTH audio transcript and book references"""
        
        # Extract data
        book_refs = segment_data.get('book_references', [])
        lecture_audio_text = segment_data.get('lecture_audio_text', '')  # ← NEW!
        
        print(f"\n--- DEBUG Segment {segment_data['segment_id'] + 1} ---")
        print(f"Audio transcript length: {len(lecture_audio_text)} chars")
        print(f"Book references found: {len(book_refs)}")
        
        # Build context from previous segments
        context_text = ""
        if segment_data.get('context_segments'):
            context_text = "\n\n**Previous Segments Context:**\n"
            for ctx_idx in segment_data['context_segments'][:2]:
                ctx_seg = all_segments[ctx_idx]
                context_text += f"- Segment {ctx_idx}: {self.format_timestamp(ctx_seg['timestamp_start'])} - {self.format_timestamp(ctx_seg['timestamp_end'])}\n"
        
        # Build book references text
        book_refs_text = ""
        if book_refs:
            book_refs_text = "\n\n**Related Textbook Content:**\n"
            for ref in book_refs[:3]:
                book_refs_text += f"\n**{ref['book_name']}, Page {ref['page']}** (Relevance: {ref['similarity']:.2f})\n"
                book_refs_text += f"> {ref['text'][:400]}\n"
                print(f"  ✓ Added book ref: page {ref['page']}, sim={ref['similarity']:.2f}")
        else:
            print("  ⚠️  No book references found for this segment")
        
        # Create comprehensive prompt with BOTH lecture audio AND book content
        prompt = f"""You are an expert academic summarizer. Create a comprehensive lecture summary.

**Lecture Segment Information:**
- Segment Number: {segment_data['segment_id'] + 1}
- Time: {self.format_timestamp(segment_data['timestamp_start'])} - {self.format_timestamp(segment_data['timestamp_end'])}

**What the Lecturer Actually Said (Audio Transcript):**
"{lecture_audio_text if lecture_audio_text else '[No audio transcript available for this segment]'}"

{book_refs_text}

{context_text}

**Your Task:**
Generate a detailed, well-structured summary that:
1. Captures what was discussed in the lecture (from the transcript above)
2. Explains main topics and key concepts covered
3. References the textbook content provided (mention pages and relevance)
4. Connects to previous segments if context is provided
5. Uses clear, academic yet friendly language
6. Is approximately 200-300 words

**Format:** Write in markdown with proper headings and bullet points where appropriate.

**Summary:**"""

        print(f"Prompt length: {len(prompt)} chars")
        if lecture_audio_text:
            print(f"Audio content included: YES ✓")
        else:
            print(f"Audio content included: NO ✗")
        
        # Call Groq API
        try:
            message = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert academic lecturer and educational content creator. "
                            "Create comprehensive, well-structured lecture summaries that connect "
                            "lecture content with textbook references. Use clear academic language "
                            "with a friendly tone. Structure your response with clear headings and "
                            "bullet points for better readability."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=max_length,
                top_p=1,
                stream=False,
            )
            
            summary = message.choices[0].message.content
            print(f"Summary generated: {len(summary)} chars")
            print(f"Preview: {summary[:150]}...")
            
        except Exception as e:
            print(f"❌ Error calling Groq API: {e}")
            # Fallback summary
            summary = f"## Overview\n\n"
            summary += f"Lecture segment from {self.format_timestamp(segment_data['timestamp_start'])} to {self.format_timestamp(segment_data['timestamp_end'])}.\n\n"
            if lecture_audio_text:
                summary += f"### What Was Discussed\n\n{lecture_audio_text[:300]}...\n\n"
            if book_refs:
                summary += f"### Related Textbook Content\n\n"
                for ref in book_refs[:2]:
                    summary += f"- **{ref['book_name']}, Page {ref['page']}**: {ref['text'][:200]}...\n"
        
        print("--- END DEBUG ---\n")
        return summary

    def generate_full_document(self, all_segments_data, output_path="lecture_summary.md"):
        """Generate complete lecture summary document with all segments"""
        
        print(f"\n{'='*80}")
        print(f"GENERATING COMPREHENSIVE LECTURE DOCUMENT")
        print(f"{'='*80}")
        
        # Create document header
        document = "# Comprehensive Lecture Summary\n\n"
        document += f"**Total Segments:** {len(all_segments_data)}\n"
        document += f"**Total Duration:** {len(all_segments_data) * 10 // 60} minutes {(len(all_segments_data) * 10) % 60} seconds\n"
        document += f"**Generated:** {timedelta(seconds=0)}\n\n"
        
        # Table of Contents
        document += "## Table of Contents\n\n"
        for seg in all_segments_data:
            document += f"- [Segment {seg['segment_id'] + 1}] "
            document += f"({self.format_timestamp(seg['timestamp_start'])} - {self.format_timestamp(seg['timestamp_end'])})\n"
        
        document += "\n---\n\n"
        
        # Generate summary for each segment
        total_segments = len(all_segments_data)
        for idx, seg in enumerate(all_segments_data, 1):
            print(f"Generating summary for segment {seg['segment_id'] + 1}... ({idx}/{total_segments})")
            summary = self.generate_segment_summary(seg, all_segments_data)
            
            # Add segment header
            document += f"## Segment {seg['segment_id'] + 1}: "
            document += f"{self.format_timestamp(seg['timestamp_start'])} - {self.format_timestamp(seg['timestamp_end'])}\n\n"
            
            # Add summary
            document += summary + "\n\n"
            
            # Add book references as footnotes
            if seg.get('book_references'):
                document += "### 📚 References\n"
                for ref in seg['book_references']:
                    document += f"- **{ref['book_name']}**, Page {ref['page']} (Relevance: {ref['similarity']:.2%})\n"
                document += "\n"
            
            # Add audio transcript (optional - in collapsible section)
            if seg.get('lecture_audio_text'):
                document += f"<details>\n"
                document += f"<summary>📝 Audio Transcript</summary>\n\n"
                document += f"{seg['lecture_audio_text']}\n\n"
                document += f"</details>\n\n"
            
            document += "---\n\n"
        
        # Write to file
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(document)
        
        print(f"\n✅ Comprehensive lecture document saved to {output_path}")
        print(f"📄 File size: {len(document)} characters")
        print(f"📊 Document contains {len(all_segments_data)} segments with summaries and references")
        
        return document
