from google.cloud import storage
import os
from collections import defaultdict 
import shutil
import json
import re
import shutil
from pipeline_functions import clean_directory
from dotenv import load_dotenv

load_dotenv()

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

def get_course_lectures(bucket_name, max_files=2):
    storage_client = storage.Client()
    prefix = "courses/"
    blobs = storage_client.list_blobs(bucket_name, prefix=prefix)

    # Dictionary to count files under each lecture folder
    lecture_file_count = defaultdict(int)

    for blob in blobs:
        parts = blob.name.split('/')
        # Expecting structure: courses/<course_name>/lectures/<lecture_id>/file.ext
        if len(parts) >= 4 and parts[0] == "courses" and parts[2] == "lectures":
            course_name = parts[1]
            lecture_id = parts[3]
            lecture_file_count[(course_name, lecture_id)] += 1

    # Filter to only include lectures that have exactly `max_files` files
    result = [(course, lecture) for (course, lecture), count in lecture_file_count.items() if count == max_files]

    print(result)
    return result

def download_lecture_files(bucket_name, course_name, lecture_id):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    
    audio_dir = "audio_full"
    video_dir = "video_full"
    
    # Clean directories if they exist
    for folder in [audio_dir, video_dir]:
        if os.path.exists(folder):
            shutil.rmtree(folder)
        os.makedirs(folder, exist_ok=True)

    prefix = f"courses/{course_name}/lectures/{lecture_id}/"
    blobs = list(bucket.list_blobs(prefix=prefix))

    if not blobs:
        print(f"No lectures found for course '{course_name}' and lecture '{lecture_id}'.")
        return

    for blob in blobs:
        file_path = blob.name

        # Skip directory placeholders
        if file_path.endswith("/"):
            continue

        if file_path.endswith(".mp3"):
            filename = "audio.mp3"
            local_path = os.path.join("audio_full", filename)
            print(f"Downloading audio: {file_path} -> {local_path}")
            blob.download_to_filename(local_path)

        elif file_path.endswith(".mp4"):
            filename = "video.mp4"
            local_path = os.path.join("video_full", filename)
            print(f"Downloading video: {file_path} -> {local_path}")
            blob.download_to_filename(local_path)


def upload_videos_to_bucket(bucket_name, course_name,lecture_id, local_video_dir = "smart_scribes_animations"):
    """
    Upload all .mp4 files from local_video_dir to the given bucket inside
    courses/{course_name}/lectures/ folder.

    Args:
        bucket_name (str): Name of the GCS bucket
        local_video_dir (str): Path to local directory containing .mp4 files
        course_name (str): Name of the target course (must already exist)
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    gcs_paths = []

    for filename in os.listdir(local_video_dir):
        if filename.endswith(".mp4"):
            local_path = os.path.join(local_video_dir, filename)
            destination_blob_path = f"courses/{course_name}/lectures/{lecture_id}/Animations/{filename}"

            blob = bucket.blob(destination_blob_path)
            blob.upload_from_filename(local_path)
            gcs_path = f"gs://{bucket_name}/{destination_blob_path}"
            gcs_paths.append(gcs_path)

            print(f"Uploaded: {local_path} -> gs://{bucket_name}/{destination_blob_path}")

    return gcs_paths

def upload_images_to_bucket(bucket_name, course_name, lecture_id, local_video_dir="segregated_images"):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    gcs_paths = []

    for filename in os.listdir(local_video_dir):
        if filename.lower().endswith((".png", ".jpeg", ".jpg")):
            local_path = os.path.join(local_video_dir, filename)
            destination_blob_path = f"courses/{course_name}/lectures/{lecture_id}/Images/{filename}"

            blob = bucket.blob(destination_blob_path)
            blob.upload_from_filename(local_path)

            gcs_path = f"gs://{bucket_name}/{destination_blob_path}"
            gcs_paths.append(gcs_path)

            print(f"✅ Uploaded: {local_path} → {gcs_path}")

    print(f"\nAll {len(gcs_paths)} images uploaded successfully.")
    return gcs_paths

def download_book(bucket_name, course_name):
    storage_client = storage.Client()
    
    try:
        bucket = storage_client.bucket(bucket_name)
    except Exception as e:
        print(f"Error accessing bucket '{bucket_name}': {e}")
        return

    book_dir = "book"
    if os.path.exists(book_dir):
        shutil.rmtree(book_dir)
    os.makedirs(book_dir, exist_ok=True)

    prefix = f"courses/{course_name}/slides/"
    blobs = bucket.list_blobs(prefix=prefix)

    found = False
    for blob in blobs:
        if blob.name.endswith(".pdf"):
            local_path = os.path.join(book_dir, "LectureCh10.pdf")
            print(f"Downloading book: {blob.name} -> {local_path}")
            blob.download_to_filename(local_path)
            found = True

    if not found:
        print(f"No PDF files found in '{prefix}'")

def filtered_images(target_dir = "segregated_images"):
    with open("output/LectureCh10_metadata.json", "r", encoding="utf-8") as f:
        data_image = json.load(f)

    with open("merged_all_in_one_gemini.json","r",encoding="utf-8") as f:
        data_reference = json.load(f)

    page_numbers = set()

    for topic in data_reference.get("topics", []):
        for ref in topic.get("book_references", []):
            # Extract digits after 'Page' (e.g., "Page 385")
            match = re.search(r'Page\s*(\d+)', ref)
            if match:
                page_numbers.add(int(match.group(1)))

    sorted_pages = sorted(page_numbers)

    image_names = []

    for el in data_image:
        if int(el["page"]) in sorted_pages:
            if el["images"]:
                for image in el["images"]:
                        image_names.append((image,int(el["page"])))
            

        
    print(image_names)
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    os.makedirs(target_dir, exist_ok=True)

    images_passed = []

    copied = []
    for image, page in image_names:
        if image not in images_passed: 
            source_path = os.path.join("output/book_images", image)
            if os.path.isfile(source_path):
                shutil.copy2(source_path, os.path.join(target_dir, image))
                copied.append(image)
                images_passed.append(image)
        
    return image_names


def replace_paths_images(bucket_name, course_name, lecture_id):
    image_names = filtered_images()
    paths = upload_images_to_bucket(bucket_name, course_name, lecture_id)
    gcs_map = {}
    for path in paths:
        image_name = os.path.basename(path)
        gcs_map[image_name] = path
    page_to_gcs = {}
    for image_name, page_num in image_names:
        if image_name in gcs_map:
            page_to_gcs.setdefault(page_num, []).append(gcs_map[image_name])
        else:
            print(f"⚠️ Image {image_name} not found in uploaded paths")

    print("\n✅ Replacement mapping created successfully.")
    return page_to_gcs


def create_json_and_upload_images(bucket_name, course_name, lecture_id, json_path = "merged_all_in_one_gemini.json"):

    page_to_gcs = replace_paths_images(bucket_name, course_name, lecture_id)
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for topic in data.get("topics", []):
        updated_refs = []
        for ref in topic.get("book_references", []):
            match = re.search(r'Page\s*(\d+)', ref)
            if match:
                page_num = int(match.group(1))
                if page_num in page_to_gcs:
                    updated_refs.extend(page_to_gcs[page_num])
                else:
                    updated_refs.append(ref)
            else:
                updated_refs.append(ref)
        topic["book_references"] = updated_refs

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def update_json_and_upload_video(bucket_name, course_name, lecture_id, json_path="merged_all_in_one_gemini.json"):
    gcs_paths = upload_videos_to_bucket(bucket_name, course_name, lecture_id)
    gcs_map = {os.path.basename(path): path for path in gcs_paths}
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for topic in data.get("topics", []):
        for anim in topic.get("animations", []):
            if anim.get("video"):
                video_name = os.path.basename(anim["video"]).replace("\\", "/")
                if video_name in gcs_map:
                    anim["video"] = gcs_map[video_name]
                    print(f"🔗 Updated: {video_name} → {gcs_map[video_name]}")
                else:
                    print(f"⚠️ No GCS match found for: {video_name}")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)