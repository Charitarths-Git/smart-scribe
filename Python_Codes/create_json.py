"""
auto_gemini_topic_pipeline.py
Fully autonomous, multi-agent Gemini 2.5 Flash pipeline.
Agents:
  0 → Overall topic generator
  1 → Subtopic extractor
  2 → Topic synthesizer (parallel)
  3 → Reference mapper (per-topic)
"""

import os, re, json, textwrap
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

try:
    from google import genai
    from google.genai.types import Content, Part
except Exception as e:
    raise ImportError("google-genai not installed; install or adapt the client import") from e

# ---------------- CONFIG ----------------
INPUT_FILE_PATH ="all_data.txt"   
MAX_TOPICS = 10
WORKERS = 4
load_dotenv()
# ----------------------------------------

class GeminiLectureProcessor:
    def __init__(self, input_path: str):
        self.input_path = input_path
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.client = self._init_client()
        self.segments = self._load_and_parse_lecture_txt()
        self.candidate_refs = self._collect_candidate_refs()

    # ---------- utilities ----------
    def _init_client(self):
        return genai.Client(api_key=self.api_key)

    def _read_file(self):
        with open(self.input_path, "r", encoding="utf-8") as f:
            return f.read().replace("\r\n", "\n").replace("\r", "\n")

    # ---------- parsing ----------
    def _load_and_parse_lecture_txt(self) -> List[Dict[str, Any]]:
        text = self._read_file()
        headings = list(re.finditer(r"SEGMENT\s+(\d+):\s*([0-9: -]+)\n", text, re.I))
        segs = []
        if not headings:
            return [{"id": 1, "time_range": "0:00:00 - end", "full_text": text,
                     "transcript": text, "references": self._extract_refs(text)}]
        for i, m in enumerate(headings):
            start = m.start()
            end = headings[i + 1].start() if i + 1 < len(headings) else len(text)
            block = text[start:end].strip()
            segs.append({
                "id": int(m.group(1)),
                "time_range": m.group(2).strip(),
                "full_text": block,
                "transcript": self._extract_transcript(block),
                "references": self._extract_refs(block),
            })
        return segs

    def _extract_transcript(self, block):
        m = re.search(r"AUDIO TRANSCRIPT\s*(.*)$", block, re.I | re.S)
        if m: return m.group(1).strip()
        m2 = re.search(r"What Was Discussed\s*(.*?)(?:\n[A-Z ]{3,}:|\Z)", block, re.I | re.S)
        return m2.group(1).strip() if m2 else block.strip()

    def _extract_refs(self, block):
        refs = []
        for pat in [r"REFERENCES\s*(.*?)(?:\n\n|\Z)", r"Related Textbook Content\s*(.*?)(?:\n[A-Z ]{3,}:|\Z)"]:
            m = re.search(pat, block + "\n\n", re.I | re.S)
            if m:
                for line in m.group(1).splitlines():
                    line = line.strip("- ").strip()
                    if line and line not in refs:
                        refs.append(line)
        return refs

    def _collect_candidate_refs(self):
        refs = []
        for s in self.segments:
            for r in s.get("references", []):
                if r and r not in refs:
                    refs.append(r)
        return refs

    # ---------- Agent 0 ----------
    def agent0_overall_topic(self, combined_text: str) -> str:
        prompt = f"""
        Read the lecture content below and create a concise, descriptive overall topic title (max 10 words).
        Return ONLY JSON like: {{ "overall_topic": "Your title" }}
        LECTURE CONTENT:
        {combined_text}
        """
        resp = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[Content(role="user", parts=[Part(text=textwrap.dedent(prompt))])])
        data = self._safe_json(resp.text)
        if isinstance(data, dict) and "overall_topic" in data:
            return data["overall_topic"].strip()
        return "Untitled Lecture"

    # ---------- Agent 1 ----------
    def agent1_extract_topics(self, overall_topic, combined_text):
        prompt = f"""
        Overall topic: "{overall_topic}"
        From the lecture below, output ONLY a JSON array of 3–{MAX_TOPICS} concise subtopics (3–6 words each).
        LECTURE CONTENT:
        {combined_text}
        """
        resp = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[Content(role="user", parts=[Part(text=textwrap.dedent(prompt))])])
        arr = self._safe_json(resp.text)
        return [re.sub(r"\s+", " ", t).strip() for t in arr if isinstance(t, str)] if isinstance(arr, list) else []

    # ---------- Agent 2 ----------
    def agent2_topic_detail(self, overall_topic, topic, context):
        prompt = f"""
        Write ONLY JSON:
        {{
          "topic": "{topic}",
          "details": "2–4 detailed paragraphs explaining the concept, separated by newlines",
          "question": "One conceptual question about the topic"
        }}
        CONTEXT:
        {context}
        """
        resp = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[Content(role="user", parts=[Part(text=textwrap.dedent(prompt))])])
        data = self._safe_json(resp.text)
        return {
            "topic": topic,
            "details": (data.get("details", "") if isinstance(data, dict) else "").strip(),
            "question": (data.get("question", "") if isinstance(data, dict) else "").strip()
        }

    # ---------- Agent 3 ----------
    def agent3_map_refs(self, topic, context, candidate_refs):
        cand = "\n".join([f"{i+1}. {r}" for i, r in enumerate(candidate_refs)]) or "No refs"
        prompt = f"""
        For topic "{topic}", pick relevant references from the list below.
        Output ONLY a JSON array of exact strings (subset of candidates).

        CONTEXT:
        {context}

        CANDIDATE REFERENCES:
        {cand}
        """
        resp = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[Content(role="user", parts=[Part(text=textwrap.dedent(prompt))])])
        arr = self._safe_json(resp.text)
        return arr if isinstance(arr, list) else []

    # ---------- helper ----------
    def _safe_json(self, text: str):
        try:
            return json.loads(text)
        except Exception:
            try:
                return json.loads(text[text.index("{"):text.rindex("}") + 1])
            except Exception:
                try:
                    return json.loads(text[text.index("["):text.rindex("]") + 1])
                except Exception:
                    return {}

    def _build_context(self, topic):
        words = [w for w in re.split(r"\W+", topic.lower()) if len(w) > 3]
        matched = [s["full_text"] for s in self.segments if any(w in s["full_text"].lower() for w in words)]
        if not matched:
            matched = [s["full_text"] for s in self.segments]
        return "\n\n".join(matched)[:6000]

    # ---------- orchestrator ----------
    def run(self):
        print(f"📖 Loading lecture: {self.input_path}")
        combined_text = "\n\n".join([s["full_text"] for s in self.segments])

        print("🤖 Agent0: generating overall topic...")
        overall_topic = self.agent0_overall_topic(combined_text)
        print("   →", overall_topic)

        print("🤖 Agent1: extracting subtopics...")
        topics = self.agent1_extract_topics(overall_topic, combined_text)
        print(f"   → {len(topics)} topics: {topics}")

        results = []
        print(f"🚀 Agent2+3: running in parallel ({WORKERS} workers)...")
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futures = {ex.submit(self._process_topic, overall_topic, t): t for t in topics}
            for fut in as_completed(futures):
                t = futures[fut]
                try:
                    res = fut.result()
                    results.append(res)
                    print(f"   ✓ {t}")
                except Exception as e:
                    print(f"   ✗ {t} failed: {e}")

        final = {"overall_topic": overall_topic, "topics": results,
                 "meta": {"segments": len(self.segments), "source_file": os.path.abspath(self.input_path)}}
        out = "final.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(final, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved structured JSON to: {out}")
        return out

    def _process_topic(self, overall_topic, topic):
        context = self._build_context(topic)
        detail = self.agent2_topic_detail(overall_topic, topic, context)
        refs = self.agent3_map_refs(topic, context, self.candidate_refs)
        detail["book_references"] = refs
        return detail


    
