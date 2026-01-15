"""
gemini_auto_merge_all_in_one.py
Directly sends both JSONs (summary + animations) to Gemini 2.5 Flash.
Gemini itself merges animations into the correct topics and returns a full JSON.
"""

import os
import json
from pathlib import Path
from google import genai
from google.genai.types import Content, Part
from dotenv import load_dotenv

load_dotenv()


def init_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)


def gemini_merge_all(summary_path, animations_path, output_path):
    client = init_gemini_client()

    # Load both JSON files
    with open(summary_path, "r", encoding="utf-8") as f:
        summary_data = json.load(f)
    with open(animations_path, "r", encoding="utf-8") as f:
        animations = json.load(f)

    # Combine data into one big prompt
    prompt = f"""
You are an intelligent data structurer. 
You will receive two JSON datasets: 
1️⃣ A detailed lecture summary (topics, details, questions, references)
2️⃣ A list of animations (title, video path, code, duration)

Your task:
- For each topic in the lecture JSON, find the most relevant animations from the animation JSON.
- If multiple animations fit one topic, include all of them.
- Return ONE final merged JSON in this exact structure:

{{
  "overall_topic": "...",
  "topics": [
    {{
      "topic": "...",
      "details": "...",
      "question": "...",
      "book_references": [...],
      "animations": [
        {{
          "title": "...",
          "video": "...",
          "code": "...",
          "duration": "..."
        }}
      ]
    }}
  ]
}}

Only output the JSON — no explanations, comments, or markdown.
If no animation matches a topic, output an empty array for "animations".
"""

    # Send both JSON files as structured inputs
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            Content(role="user", parts=[
                Part(text=prompt),
                Part(text=json.dumps({"lecture_summary": summary_data}, ensure_ascii=False)),
                Part(text=json.dumps({"animations": animations}, ensure_ascii=False))
            ])
        ]
    )

    # Try to extract and parse JSON
    text = (resp.text or "").strip()
    try:
        merged_data = json.loads(text)
    except Exception:
        import re
        try:
            json_part = re.search(r"\{.*\}", text, re.S).group()
            merged_data = json.loads(json_part)
        except Exception as e:
            raise ValueError("❌ Could not parse Gemini's JSON output.") from e

    # Save merged JSON
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(merged_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Merged JSON saved to: {output_path}")
    print(f"📊 Topics merged: {len(merged_data.get('topics', []))}")
    return merged_data


