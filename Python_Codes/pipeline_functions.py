import cv2
import subprocess  # To run terminal commands
import os          # To create/manage folders
import shutil      # To delete the temporary folder
import glob  
from pathlib import Path      # To find all the frame files
import re
import json

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

def parse_all_data(file_path):
    """Parses the al_data.txt file for summaries and key points."""
    segments = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        return []

    raw_segments = re.split(r'\n## Segment \d+:', content)
    
    for i, raw_segment in enumerate(raw_segments[1:], 1):
        segment_data = {'id': i, 'summary': '', 'key_points': ''}
        
        summary_match = re.search(r'SUMMARY:\s*(.*?)\n\nKEY POINTS:', raw_segment, re.DOTALL | re.IGNORECASE)
        if summary_match:
            segment_data['summary'] = summary_match.group(1).strip()
            
        key_points_match = re.search(r'KEY POINTS:\s*(.*?)\n\n(RELEVANT TEXTBOOK REFERENCES:|### 📚 References)', raw_segment, re.DOTALL | re.IGNORECASE)
        if key_points_match:
            kp_text = key_points_match.group(1).strip()
            kp_lines = [line.strip() for line in kp_text.split('\n') if line.strip().startswith(('-', '*'))]
            segment_data['key_points'] = "\n".join(kp_lines)
            
        segments.append(segment_data)
        
    print(f"Parsed {len(segments)} segments from {file_path}")
    return segments

def combine_lecture_data(analysis_file, all_data_file, lecture_book_matches_file, results_file, output_file):
    """
    Combines analysis plan, AL summary text, lecture book matches for references, 
    and animation results into one master file.

    Args:
        analysis_file (str): Path to the lecture_analysis.json (JSON 1)
        al_data_file (str): Path to the al_data.txt summary file.
        lecture_book_matches_file (str): Path to lecture_book_matches.json (for references).
        results_file (str): Path to the results.json (JSON 3 - animation results)
        output_file (str): Path to save the final combined.json
    """
    
    print(f"\nLoading files:\n- {analysis_file}\n- {all_data_file}\n- {lecture_book_matches_file}\n- {results_file}")

    # --- Load Input Files ---
    try:
        with open(analysis_file, 'r', encoding='utf-8') as f:
            analysis_data = json.load(f)
        with open(results_file, 'r', encoding='utf-8') as f:
            results_data = json.load(f)
        with open(lecture_book_matches_file, 'r', encoding='utf-8') as f:
            lecture_book_matches_data = json.load(f)
    except FileNotFoundError as e:
        print(f"Error loading JSON file: {e}")
        return
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON file: {e}")
        return

    # Parse the AL data text file for summaries/key points
    parsed_al_segments = parse_all_data(all_data_file)
    if not parsed_al_segments:
        print("Error: Could not parse segments from al_data.txt. Aborting.")
        return

    # --- Initialize Output Structure ---
    output_data = {
        "topic": "Unknown Topic",
        "book_references": {},
        "content_data": []
    }

    # --- Determine Overall Topic ---
    try:
        # Prioritize topic from analysis plan
        output_data['topic'] = analysis_data['animations_to_create'][0]['topic']
    except (IndexError, KeyError, TypeError):
        # Fallback: Attempt from first lecture_book_match reference
        try:
             ref_text = lecture_book_matches_data[0]['book_references'][0]['text']
             output_data['topic'] = ref_text.split('\n')[-1].strip()
        except (IndexError, KeyError, AttributeError):
             pass # Will remain "Unknown Topic"

    print(f"\nDetermined Overall Topic: {output_data['topic']}")

    # --- Create a quick-lookup map for video results ---
    results_lookup = {item['title']: item for item in results_data}

    # --- Process each animation topic ---
    animations_to_create = analysis_data.get('animations_to_create', [])
    if not isinstance(animations_to_create, list):
         print("Warning: 'animations_to_create' is not a list in analysis file.")
         animations_to_create = []

    for anim_plan in animations_to_create:
        if not isinstance(anim_plan, dict) or 'title' not in anim_plan:
             print(f"Warning: Skipping invalid animation plan item: {anim_plan}")
             continue
             
        title = anim_plan['title']
        print(f"Processing topic: {title}")
        
        # Prepare search key
        search_key = title.split(' (')[0]
        search_key = re.sub(r'[^a-zA-Z0-9 ]', ' ', search_key).lower().strip()
        search_key = re.sub(r'\s+', ' ', search_key)
        
        topic_summary_parts = []
        topic_key_points_parts = []
        topic_references = []
        seen_ref_ids = set() 

        # --- 5a. Search parsed AL segments for matching text ---
        for segment in parsed_al_segments:
            search_text = (segment.get('summary', '') + ' ' + segment.get('key_points', '')).lower()
            search_text = re.sub(r'[^a-zA-Z0-9 ]', ' ', search_text)
            search_text = re.sub(r'\s+', ' ', search_text)

            if search_key in search_text:
                if segment.get('summary'):
                    topic_summary_parts.append(segment['summary'])
                if segment.get('key_points'):
                     topic_key_points_parts.append(segment['key_points'])

        # --- 5b. Search lecture_book_matches for references ---
        for segment in lecture_book_matches_data:
            audio_text = segment.get('lecture_audio_text', '').lower()
            video_text = segment.get('lecture_video_text', '').lower()
            search_text = re.sub(r'[^a-zA-Z0-9 ]', ' ', audio_text + " " + video_text)
            search_text = re.sub(r'\s+', ' ', search_text)

            if search_key in search_text:
                # Add unique book references from this matching segment
                for ref in segment.get('book_references', []):
                    # Use (book, page) as a unique identifier to avoid duplicates
                    ref_id = (ref.get('book_name'), ref.get('page'))
                    if ref_id not in seen_ref_ids and ref.get('book_name') and ref.get('page') is not None:
                        # Ensure we add the whole reference object
                        topic_references.append({
                            "similarity": ref.get("similarity"),
                            "text": ref.get("text"),
                            "page": ref.get("page"),
                            "book_name": ref.get("book_name")
                        })
                        seen_ref_ids.add(ref_id)
        
        # Sort references by similarity (descending) if needed
        topic_references.sort(key=lambda x: x.get('similarity', 0), reverse=True)

        # --- 6. Assemble the data for this topic ---
        anim_result = results_lookup.get(title)
        video_path = anim_result['video'] if anim_result else None
        
        # Combine found text parts from al_data.txt
        final_text = ""
        if topic_summary_parts:
            final_text += "SUMMARY:\n" + "\n\n".join(topic_summary_parts)
        if topic_key_points_parts:
             if final_text: final_text += "\n\n---\n\n" # Add separator
             final_text += "KEY POINTS:\n" + "\n\n".join(topic_key_points_parts)

        if not final_text:
            final_text = "No matching summary or key points found for this topic in al_data.txt."
            
        # Add to content_data list
        output_data['content_data'].append({
            "title": title,
            "text": final_text, # Text comes from al_data.txt
            "imgs": [],  # Still no image data source
            "animations": [video_path] if video_path else []
        })
        
        # Add the collected book references (from lecture_book_matches) to the top level
        output_data['book_references'][title] = topic_references

    # --- 7. Save the final combined JSON ---
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"\n✅ Successfully combined all data into {output_file}")


def clean_directory(directory_path):
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  # remove file or symlink
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)  # remove subdirectory
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')