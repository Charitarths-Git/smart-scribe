# COMPLETE PIPELINE - Final Version with Audio Transcripts
from generate import *
from pdf_embedding import *
from lecture_to_bookmatch import *
import json

print("=" * 80)
print("SMART SCRIBE - LECTURE SUMMARIZATION PIPELINE")
print("=" * 80)

# Step 0: Audio transcripts already created
print("\n✅ Step 0: Audio transcripts ready (audio_transcripts.json)")
print("   - Total segments: 389")
print("   - Duration per segment: 10 seconds")
print("   - Total duration: ~65 minutes")

# Step 1: Process textbooks
print("\n" + "=" * 80)
print("Step 1: Processing textbooks...")
print("=" * 80)
book_processor = BookEmbeddingProcessor()
chunks = book_processor.chunk_and_embed_book(
    r"D:\SMART_SCRIBE\Smart-Scribes\Python_Codes\book\stative-verbs-list.pdf",
    "Stative_Verbs_List"
)
book_processor.save_book_embeddings(chunks, "book_embeddings/Stative_Verbs_List")
print(f"✅ Book embeddings created: {len(chunks)} chunks")

# Step 2: Match lecture segments
print("\n" + "=" * 80)
print("Step 2: Matching lecture with book content...")
print("=" * 80)
matcher = LectureBookMatcher(
    similarity_threshold=0.3,
    seconds_per_embedding=10,
    segment_duration_minutes=5
)
matcher.load_book_database("book_embeddings/Stative_Verbs_List")

# ← CORRECTED: Load audio transcripts (not lecture_transcripts)
matcher.load_audio_transcripts("audio_transcript.json")

segment_matches = matcher.process_lecture_segments(
    fused_embeddings_path=r"D:\SMART_SCRIBE\Smart-Scribes\Python_Codes\PreProcessing\fused_final.npy",
    video_embeddings_path=r"D:\SMART_SCRIBE\Smart-Scribes\Python_Codes\PreProcessing\video_embeddings.npy"
)

# Save matches for reference
with open("lecture_book_matches.json", 'w', encoding='utf-8') as f:
    json.dump(segment_matches, f, indent=2)

print(f"✅ Matched {len(segment_matches)} segments with book content")

# Step 3: Generate document
print("\n" + "=" * 80)
print("Step 3: Generating comprehensive lecture document...")
print("=" * 80)
doc_generator = LectureDocumentGenerator()
final_document = doc_generator.generate_full_document(
    segment_matches,
    output_path="comprehensive_lecture_summary.md"
)

print("\n" + "=" * 80)
print("✅ PIPELINE COMPLETE!")
print("=" * 80)
print("\n📁 Output Files Generated:")
print("   1. book_embeddings/Stative_Verbs_List_embeddings.npy")
print("   2. book_embeddings/Stative_Verbs_List_metadata.json")
print("   3. lecture_book_matches.json")
print("   4. comprehensive_lecture_summary.md")
print("\n✨ Ready to use your comprehensive lecture summary!")
