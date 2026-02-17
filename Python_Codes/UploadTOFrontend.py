#!/usr/bin/env python3
"""
upload_lecture_content.py

Usage:
    pip install python-dotenv requests
    python upload_lecture_content.py --file lecture_content.json

This script does an UPSERT into the `lecture_content` table using Supabase PostgREST:
  POST <SUPABASE_URL>/rest/v1/lecture_content?on_conflict=lecture_id
Headers:
  - apikey: <SUPABASE_KEY>
  - Authorization: Bearer <SUPABASE_KEY>
  - Prefer: resolution=merge-duplicates
"""

import os
import json
import argparse
from dotenv import load_dotenv
import requests
from typing import List, Dict

load_dotenv()  # loads variables from .env

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("SUPABASE_URL and SUPABASE_KEY must be set in the .env file")

REST_ENDPOINT = f"{SUPABASE_URL.rstrip('/')}/rest/v1/lecture_content"
REST_LECTURES_ENDPOINT = f"{SUPABASE_URL.rstrip('/')}/rest/v1/lectures"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    # Merge duplicates on conflict (upsert behavior)
    "Prefer": "resolution=merge-duplicates, return=representation"
}

def read_json_file(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("JSON file must contain an array of objects at top-level")
    return data

def upload_batch(records: List[Dict]) -> requests.Response:
    """
    Upload a batch of records via POST with on_conflict=lecture_id (upsert).
    Returns the requests.Response object.
    """
    params = {"on_conflict": "lecture_id"}
    payload = json.dumps(records)
    resp = requests.post(REST_ENDPOINT, headers=HEADERS, params=params, data=payload, timeout=30)
    return resp


def lecture_exists(lecture_id: str) -> bool:
    """Check whether a lecture with the given lecture_id exists in the `lectures` table."""
    try:
        params = {"lecture_id": "eq." + lecture_id}
        # Use select to try to retrieve a single row
        resp = requests.get(REST_LECTURES_ENDPOINT, headers=HEADERS, params={"lecture_id": f"eq.{lecture_id}"}, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            return len(data) > 0
        else:
            print(f"Warning: could not check lecture existence (HTTP {resp.status_code}), assuming missing")
            return False
    except requests.RequestException as e:
        print("Warning: request failed when checking lecture existence:", e)
        return False


def create_lecture(lecture_id: str, title: str = None) -> bool:
    """Create a minimal lecture row with the given lecture_id and optional title.

    Returns True on success (201/200), False otherwise.
    """
    payload = {"lecture_id": lecture_id}
    if title:
        payload["title"] = title
    try:
        resp = requests.post(REST_LECTURES_ENDPOINT, headers=HEADERS, data=json.dumps([payload]), timeout=15)
        if resp.status_code in (200, 201):
            print(f"Created lecture '{lecture_id}'")
            return True
        else:
            print(f"Failed to create lecture {lecture_id}: HTTP {resp.status_code}")
            try:
                print("Response:", resp.json())
            except ValueError:
                print("Response text:", resp.text)
            return False
    except requests.RequestException as e:
        print("Request failed when creating lecture:", e)
        return False

def prepare_record(record: Dict) -> Dict:
    """
    Ensure content_data is proper JSON (it should already be),
    and remove any Python-only values if present.
    """
    rec = record.copy()
    # Ensure content_data is a JSON serializable object (dict/list/primitive)
    if "content_data" in rec and rec["content_data"] is None:
        rec["content_data"] = {}  # or keep null if you prefer
    return rec

def run_code():
    parser = argparse.ArgumentParser(description="Upload lecture_content JSON to Supabase")
    parser.add_argument("--file", "-f", required=False, default="merged_all_in_one_gemini.json", help="Path to JSON file (array of objects). Defaults to 'merged_all_in_one_gemini.json' if omitted.")
    parser.add_argument("--create-missing-lectures", action="store_true", help="If set, the script will attempt to create missing parent rows in `lectures` before uploading lecture_content.")
    parser.add_argument("--batch-size", "-b", type=int, default=50, help="How many rows to send per request")
    args = parser.parse_args()
    # Allow omission of --file by providing a sensible default. If the file
    # doesn't exist, show a clear error instead of failing later with a stacktrace.
    file_path = args.file or "merged_all_in_one_gemini.json"
    if not os.path.exists(file_path):
        raise SystemExit(f"Error: JSON file not found: {file_path} -- pass --file / create the default file")

    records = read_json_file(file_path)
    print(f"Read {len(records)} records from {file_path}")

    # Prepare records
    prepared = [prepare_record(r) for r in records]

    # Optionally ensure parent `lectures` rows exist to avoid FK constraint errors
    if args.create_missing_lectures:
        print("Checking for missing parent lectures (this may create rows)...")
        checked: set = set()
        for rec in prepared:
            lecture_id = rec.get("lecture_id")
            if not lecture_id:
                continue
            if lecture_id in checked:
                continue
            checked.add(lecture_id)
            if not lecture_exists(lecture_id):
                # Try to derive a title if present in the record
                title = rec.get("lecture_title") or rec.get("title")
                ok = create_lecture(lecture_id, title=title)
                if not ok:
                    print(f"Warning: failed to create parent lecture {lecture_id}. Upload may still fail.")

    # Upload in batches (helps with large files)
    batch_size = max(1, args.batch_size)
    for i in range(0, len(prepared), batch_size):
        batch = prepared[i:i + batch_size]
        print(f"Uploading batch {i // batch_size + 1} ({len(batch)} records)...")
        try:
            resp = upload_batch(batch)
        except requests.RequestException as e:
            print("Request failed:", e)
            raise SystemExit(1)

        if resp.status_code in (200, 201, 204):
            # 200/201 may return JSON of inserted/updated rows if 'return=representation' requested.
            try:
                if resp.text:
                    print("Response:", resp.json())
                else:
                    print(f"Batch uploaded successfully (status {resp.status_code})")
            except ValueError:
                print(f"Batch uploaded successfully (status {resp.status_code}) - no JSON returned")
        else:
            print(f"Error uploading batch: HTTP {resp.status_code}")
            # Show server error message/body if available
            try:
                print("Response body:", resp.json())
            except ValueError:
                print("Response text:", resp.text)
            raise SystemExit(1)

    print("All batches uploaded successfully.")
