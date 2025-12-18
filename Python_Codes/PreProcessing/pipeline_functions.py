import cv2
import subprocess  # To run terminal commands
import os          # To create/manage folders
import shutil      # To delete the temporary folder
import glob        # To find all the frame files

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
    r"D:\ffmpeg-2025-10-19-git-dc39a576ad-essentials_build\ffmpeg-2025-10-19-git-dc39a576ad-essentials_build\bin\ffmpeg.exe",
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