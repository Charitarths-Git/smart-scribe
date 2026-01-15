import numpy as np
import torch
from pathlib import Path
from tqdm import tqdm 
import sys
from frames_embeddings import VideoTextExtractor
from audio_embeddings import AudioVectorizer
from pipeline_functions import *
from MultiModal.generate import *
from MultiModal.pdf_embedding import *
from MultiModal.lecture_to_bookmatch import *
import json
from manim2 import *
from google_storage_code import *
import os
from create_json import *
from cleaning import *
from lastjson import *

local_dir_audio = "audio_full" 
local_dir_video = "video_full"
OUTPUT_FUSED_FILE = "fused_final.npy"
OUTPUT_AUDIO_FILE = "audio_embeddings.npy"
OUTPUT_VIDEO_FILE = "video_embeddings.npy"
FULL_JSON = "full_data.json"
VIDEO_DIM = 384
AUDIO_DIM = 384
BUCKET_NAME = "smartscibe_input"

def run_pipeline():
#     AUDIO_SNIPPET_FILE = os.path.join(local_dir_audio,"audio.wav" )
#     VIDEO_SNIPPET_FILE = os.path.join(local_dir_video, "video.mp4")

#     print("\nLoading all models... (This may take a moment)")
#     device = "cuda" if torch.cuda.is_available() else "cpu"
#     print(device)
            
#     video_extractor = VideoTextExtractor()
#     audio_vectorizer = AudioVectorizer()
            
#     print(f"✅ All models loaded successfully. Using device: {device}")

#         # --- 5. Pre-process Audio & Video ---
#     print("\nPre-processing audio...")
#     audio, sr = audio_vectorizer.load_audio(AUDIO_SNIPPET_FILE)
#     cleaned_audio = audio_vectorizer.clean_audio(audio,sr)
#     audio_segments = audio_vectorizer.split_audio(cleaned_audio, sr)
#     print(f"Audio pre-processed into {len(audio_segments)} 10-second segments.")

#     print("\nPre-processing video...")
#     frame_folder = preprocess_video_with_ffmpeg(VIDEO_SNIPPET_FILE, target_fps=0.2)
#     frame_gen = load_frames_from_folder(frame_folder)
#     video_batches = list(create_batches(frame_gen, batch_size=2))
#     print(f"Video pre-processed into {len(video_batches)} 2-frame batches.")
                
#     num_segments = min(len(video_batches), len(audio_segments))
#     if num_segments == 0:
#         print("Error: No segments found to process.")
#         sys.exit(1)
                    
#     print(f"\n--- Starting full processing for {num_segments} segments ---")

#     fused_vectors = []  # List to collect fused vectors
#     audio_embeddings_all = []  # Store audio vectors
#     video_embeddings = []  # Store video vectors

#     audio_data = {}

#     for i in tqdm(range(num_segments), desc="Processing & Fusing Segments"):
#         video_batch = video_batches[i]
#         audio_segment = audio_segments[i]
                    
#         text_fragments, image_captions = video_extractor.extract_info_from_batch(video_batch)
#         cleaned_text = video_extractor.combine_and_clean_info(text_fragments, image_captions)
#         print(cleaned_text)
                    
#         if cleaned_text:
#                 video_vec_np = video_extractor.get_text_embedding(cleaned_text)
#         else:
#                 video_vec_np = np.zeros(VIDEO_DIM) 
                
#         audio_text_new, audio_embeddings = audio_vectorizer.get_transcript_embedding(audio_segment,sr)
            
#         audio_vec_np = np.array(audio_embeddings)
#         v_interaction = audio_vec_np * video_vec_np
#         v_fused = np.concatenate((audio_vec_np, video_vec_np, v_interaction))
            
#         fused_vectors.append(v_fused)
#         audio_embeddings_all.append(audio_vec_np)
#         video_embeddings.append(video_vec_np)

#         audio_data[f"segment_{i+1}"] = {
#                 "transcript": audio_text_new.strip(),
#                 "video_text": cleaned_text.strip(),
#         }

#     with open(FULL_JSON, "w", encoding="utf-8") as f:
#         json.dump(audio_data, f, ensure_ascii=False, indent=4)

#     np.save(OUTPUT_FUSED_FILE, np.stack(fused_vectors))
#     np.save(OUTPUT_AUDIO_FILE, np.stack(audio_embeddings_all))
#     np.save(OUTPUT_VIDEO_FILE, np.stack(video_embeddings))

#     clean_transcript_file(
#     input_path="full_data.json",
#     output_path="full_data.json"
#     )

#     book_processor = BookEmbeddingProcessor()
#     chunks = book_processor.chunk_and_embed_book(
#             "book/LectureCh10.pdf",
#             "LectureCh10"
#     )
#     book_processor.save_book_embeddings(chunks, "book_embeddings/Stative_Verbs_List")
#     print(f"✅ Book embeddings created: {len(chunks)} chunks")

#         # Step 2: Match lecture segments
#     print("\n" + "=" * 80)
#     print("Step 2: Matching lecture with book content...")
#     print("=" * 80)
#     matcher = LectureBookMatcher(
#             similarity_threshold=0.3,
#             seconds_per_embedding=10,
#             segment_duration_minutes=5
#     )
#     matcher.load_book_database("book_embeddings/Stative_Verbs_List")

#     matcher.load_full_data(FULL_JSON)

#     segment_matches = matcher.process_lecture_segments(
#             fused_embeddings_path="fused_final.npy",
#             video_embeddings_path="video_embeddings.npy"
#     )

#     with open("lecture_book_matches.json", 'w', encoding='utf-8') as f:
#             json.dump(segment_matches, f, indent=2)

#     print(f"✅ Matched {len(segment_matches)} segments with book content")

#     print("\n" + "=" * 80)
#     print("Step 3: Generating comprehensive lecture document...")
#     print("=" * 80)
#     doc_generator = LectureDocumentGenerator()
#     final_document = doc_generator.generate_full_document(
#             segment_matches,
#             output_path="all_data.txt"
#     )

#     clean_directory("smart_scribes_animations")

    file = "all_data.txt"    
    agent = SmartScribesUltimateAgent()
    result = agent.generate_animations_from_lecture(file)
    if result['success']:
            print("\n✨ Done! Check smart_scribes_animations/")

    # upload_videos_to_bucket(BUCKET_NAME,task[0],task[1])

    processor = GeminiLectureProcessor("all_data.txt")
    processor.run()

    summary_path = "final.json"
    animations_path = "results.json"
    output_path = Path(summary_path).with_name("merged_all_in_one_gemini.json")

    gemini_merge_all(summary_path, animations_path, output_path)

    # with open("comprehensive_lecture_summary_topic_structured.json", "r", encoding="utf-8") as f:
    #     data_full = json.load(f)
    # with open("results.json", "r", encoding="utf-8") as f:
    #     data_animation = json.load(f)

    # if isinstance(data_full, list) and isinstance(data_animation, list):
    #     merged_data = data_full + data_animation

    # return merged_data
        
run_pipeline()