import numpy as np
import torch
from pathlib import Path
from tqdm import tqdm 
import sys
from frames_embeddings import VideoTextExtractor
from audio_embeddings import AudioVectorizer
from pipeline_functions import preprocess_video_with_ffmpeg, load_frames_from_folder, create_batches

VIDEO_DIM = 384
AUDIO_DIM = 384
VIDEO_SNIPPET_FILE = "video/video_chunk_002.mp4"
AUDIO_SNIPPET_FILE = "audio/audio_chunk_002.webm"
OUTPUT_FILE = "fused_final.npy"


print("\nLoading all models... (This may take a moment)")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(device)
    
video_extractor = VideoTextExtractor()
audio_vectorizer = AudioVectorizer()
    
print(f"✅ All models loaded successfully. Using device: {device}")

    # --- 5. Pre-process Audio & Video ---
print("\nPre-processing audio...")
audio, sr = audio_vectorizer.load_audio(AUDIO_SNIPPET_FILE)
cleaned_audio = audio_vectorizer.clean_audio(audio,sr)
audio_segments = audio_vectorizer.split_audio(cleaned_audio, sr)
print(f"Audio pre-processed into {len(audio_segments)} 10-second segments.")
print("\nPre-processing video...")
frame_folder = preprocess_video_with_ffmpeg(VIDEO_SNIPPET_FILE, target_fps=0.2)
frame_gen = load_frames_from_folder(frame_folder)
video_batches = list(create_batches(frame_gen, batch_size=2))
print(f"Video pre-processed into {len(video_batches)} 2-frame batches.")
        
num_segments = min(len(video_batches), len(audio_segments))
if num_segments == 0:
    print("Error: No segments found to process.")
    sys.exit(1)
            
print(f"\n--- Starting full processing for {num_segments} segments ---")
        
for i in tqdm(range(num_segments), desc="Processing & Fusing Segments"):
    video_batch = video_batches[i]
    audio_segment = audio_segments[i]
            
        
    text_fragments, image_captions = video_extractor.extract_info_from_batch(video_batch)
    cleaned_text = video_extractor.combine_and_clean_info(text_fragments, image_captions)
    print(cleaned_text)
        
    if cleaned_text:
        video_vec_np = video_extractor.get_text_embedding(cleaned_text)
    else:
        video_vec_np = np.zeros(VIDEO_DIM) 
        
    audio_vec_np = np.array(audio_vectorizer.get_transcript_embedding(audio_segment,sr))
    v_interaction = audio_vec_np * video_vec_np
    v_fused = np.concatenate((audio_vec_np, video_vec_np, v_interaction))

