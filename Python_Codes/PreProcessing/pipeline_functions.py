import cv2
import subprocess  # To run terminal commands
import os          # To create/manage folders
import shutil      # To delete the temporary folder
import glob  
from pathlib import Path      # To find all the frame files

def preprocess_video_with_ffmpeg(video_path, target_fps=2.0, output_folder="frames_temp"):
    """
    Uses FFmpeg to extract frames from a video at a target FPS.
    Saves frames to a new folder.
    
    Returns: The path to the folder containing the extracted frames.
    """
    print(f"Pre-processing video with FFmpeg. Target FPS: {target_fps}")
    if os.path.exists(output_folder):
        print(f"Removing existing temp folder: {output_folder}")
        shutil.rmtree(output_folder)
    print(f"Creating new temp folder: {output_folder}")
    os.makedirs(output_folder)
    command = [
    'C:/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe', # make the path change here,
    "-i", video_path,
    "-filter:v", f"fps={target_fps}",
    os.path.join(output_folder, "frame_%05d.png")  # Use frames_temp/frame_00001.png etc.
]


    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    print(f" FFmpeg processing complete. Frames are in: {output_folder}")
    return output_folder

def load_frames_from_folder(folder_path):
    """
    Generator to read all .png frames from a folder created by FFmpeg.
    """
    frame_files = sorted(glob.glob(f"{folder_path}/*.png"))
    
    if not frame_files:
        print(f"Warning: No frames found in {folder_path}")
        return

    print(f"Loading {len(frame_files)} frames from {folder_path}...")
    
    for file_path in frame_files:
        frame = cv2.imread(file_path)
        if frame is not None:
            yield frame
        else:
            print(f"Warning: Could not read frame {file_path}")

def create_batches(frame_generator, batch_size):
    batch = []
    for frame in frame_generator:
        batch.append(frame)
        if len(batch) == batch_size:
            yield batch
            batch = []
    if batch:
        yield batch


def clean_directory(dir_path: Path):
    """
    Removes all files and subdirectories within the specified directory path.
    The directory itself is left intact.
    """
    if dir_path.exists():
        for item in dir_path.iterdir():
            if item.is_file():
                # Only remove files that look like segmented media
                if item.suffix in ['.mp4', '.webm', '.mkv', '.wav', '.mp3']:
                    item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        print(f"🧹 Cleaned media files from: {dir_path}")

# --- Core Function to Extract and Chunk Media ---
def extract_and_chunk_media(
    full_video_file_path: str,
    video_id: str,
    chunk_duration_minutes: int = 5,
    video_output_dir: str = "video",
    audio_output_dir: str = "audio"
):
    """
    Cleans output directories and splits the full video file into
    time-aligned video and audio chunks using FFmpeg's segment muxer.

    Args:
        full_video_file_path (str): The path to the *source* video file (which includes the audio).
        video_id (str): A unique ID used for naming the output chunks.
        chunk_duration_minutes (int): The duration of each segment in minutes.
        video_output_dir (str): The directory to save video segments ('video').
        audio_output_dir (str): The directory to save audio segments ('audio').

    Returns:
        tuple: A tuple containing lists of the paths to the saved video chunks
               and audio chunks.
    """
    # --- 1. Setup and Cleanup Directories ---
    source_path = Path(full_video_file_path)
    if not source_path.exists():
        print(f"Error: Source file not found at {full_video_file_path}")
        return [], []

    video_dir = Path(video_output_dir)
    audio_dir = Path(audio_output_dir)

    # Ensure the output directories exist
    video_dir.mkdir(parents=True, exist_ok=True)
    audio_dir.mkdir(parents=True, exist_ok=True)

    print(f"Starting chunking pipeline for video_id: {video_id}")
    print("-" * 50)

    # **CLEANUP STEP**
    clean_directory(video_dir)
    clean_directory(audio_dir)
    print("-" * 50)

    # --- 2. Calculate Parameters ---
    chunk_duration_seconds = chunk_duration_minutes * 60
    chunk_time_str = str(chunk_duration_seconds)

    # Output naming pattern for FFmpeg
    video_chunk_pattern = str(video_dir / f"{video_id}_chunk_%03d.mp4")
    audio_chunk_pattern = str(audio_dir / f"{video_id}_chunk_%03d.webm")

    # --- 3. FFmpeg Commands for Chunking ---
    
    # Command 1: Split VIDEO stream into chunks
    # -i: input file
    # -map 0:v:0: selects the first video stream from the input
    # -c copy: copies the stream data without re-encoding (very fast)
    # -f segment: uses the segment muxer
    # -segment_time: duration of each segment
    # -reset_timestamps 1: ensures each chunk starts with time 0
    video_cmd = [
        'C:/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe',
        "-i", str(source_path),
        "-map", "0:v:0",
        "-c", "copy",
        "-f", "segment",
        "-segment_time", chunk_time_str,
        "-reset_timestamps", "1",
        video_chunk_pattern
    ]

    # Command 2: Split AUDIO stream into chunks
    # -map 0:a:0: selects the first audio stream from the input
    # Note: Using webm/opus format for audio is efficient, adjust codec (-c:a) if needed
    audio_cmd = [
        'C:/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe',
        "-i", str(source_path),
        "-map", "0:a:0",
        "-c", "copy",
        "-f", "segment",
        "-segment_time", chunk_time_str,
        "-reset_timestamps", "1",
        audio_chunk_pattern
    ]

    # --- 4. Execute FFmpeg Commands ---
    print(f"Executing FFmpeg for Video Chunks ({chunk_duration_minutes} min)...")
    try:
        subprocess.run(video_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Video chunking complete.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during video chunking: {e}")
        return [], []

    print(f"Executing FFmpeg for Audio Chunks ({chunk_duration_minutes} min)...")
    try:
        subprocess.run(audio_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Audio chunking complete.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during audio chunking: {e}")
        return [], []

    # --- 5. Collect and Return Chunk Paths ---
    saved_video_chunk_paths = [str(p) for p in video_dir.glob(f"{video_id}_chunk_*.mp4")]
    saved_audio_chunk_paths = [str(p) for p in audio_dir.glob(f"{video_id}_chunk_*.webm")]
    
    print("-" * 50)
    print(f"Summary: Created {len(saved_video_chunk_paths)} video chunks and {len(saved_audio_chunk_paths)} audio chunks.")
    print(f"Video Chunks: {saved_video_chunk_paths}")
    print(f"Audio Chunks: {saved_audio_chunk_paths}")

    return saved_video_chunk_paths, saved_audio_chunk_paths


