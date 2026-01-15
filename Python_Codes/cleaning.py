import json
import re
from langdetect import detect

def is_english(text):
    """Return True if text is primarily English."""
    try:
        return detect(text) == "en"
    except:
        return False
def clean_transcript_text(text):
    """Remove repetitions, non-English parts, and extra symbols safely."""
    # Skip if text is empty or only spaces
    if not text or not text.strip():
        return ""

    # Clean punctuation and keep only letters/numbers/spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)

    # Split into words
    words = text.split()
    if not words:  # extra safety check
        return ""

    # Remove consecutive duplicate words (like "the the the")
    cleaned_words = [words[0]]
    for w in words[1:]:
        if w != cleaned_words[-1]:
            cleaned_words.append(w)

    cleaned_text = ' '.join(cleaned_words)

    # Check if English (skip non-English text)
    if not is_english(cleaned_text):
        return ""

    return cleaned_text.strip()


def clean_transcript_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned_data = {}
    for key, segment in data.items():
        transcript = segment.get("transcript", "").lower()
        cleaned_text = clean_transcript_text(transcript)
        segment["transcript"] = cleaned_text
        cleaned_data[key] = segment

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Cleaned transcripts saved to: {output_path}")



