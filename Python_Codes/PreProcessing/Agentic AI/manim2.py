# Smart Scribes - Ultra Robust Agent with Error Handling
# Validates code, shows errors, auto-fixes issues

import os
import sys
import json
import subprocess
import tempfile
import shutil
import re
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
import traceback

load_dotenv()

class SmartScribesUltraAgent:
    """
    Ultra Robust Agent with Advanced Error Handling
    - Validates code before rendering
    - Shows detailed error messages
    - Auto-fixes common issues
    - Always saves code for manual debugging
    """

    def __init__(self):
        """Initialize"""
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in .env")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

        self.safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        self.manim_executable = os.getenv('MANIM_EXECUTABLE', 'manim')
        self.output_dir = Path('smart_scribes_animations')
        self.output_dir.mkdir(exist_ok=True)

        print("✅ Ultra Agent initialized!")
        print(f"📁 Output: {self.output_dir}")

    def analyze_lecture_content(self, file_path):
        """Robust analysis"""
        print(f"\n🧠 Analyzing: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        print(f"   Size: {len(content)} chars")

        # Try Gemini
        print("   🤖 Trying Gemini...")
        analysis = self._try_gemini_analysis(content)

        if analysis:
            print("   ✅ Gemini successful!")
            return analysis

        # Fallback
        print("   ⚠️ Using heuristics")
        analysis = self._heuristic_analysis(content)
        print("   ✅ Analysis complete!")

        return analysis

    

    def _try_gemini_analysis(self, content):
        """Try Gemini with small chunk, showing errors when Gemini fails"""
        safe_content = content[:10000]

        prompt = f"""Summarize the main educational or informational topics discussed in this text.
Avoid referencing any sensitive or private details.

    CONTENT:
    {safe_content}

    Return JSON:
    {{"topics": ["Topic 1", "Topic 2"]}}

    ONLY JSON."""

        for attempt in range(2):
            try:
                print(f"🔹 Attempt {attempt+1}: Sending request to Gemini...")

                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=1000
                    ),
                    safety_settings=self.safety_settings
                )

                if hasattr(response, "prompt_feedback"):
                    print("🛡️ Prompt Feedback:", response.prompt_feedback)
                if hasattr(response, "safety_ratings"):
                    print("🛡️ Response Safety Ratings:", response.safety_ratings)

                if not response.candidates:
                    print("⚠️ No candidates returned from Gemini.")
                    continue

                candidate = response.candidates[0]
                if candidate.finish_reason in [2, 3]:
                    print(f"⚠️ Gemini stopped early (finish_reason={candidate.finish_reason}).")
                    continue

                if hasattr(response, 'text'):
                    text = response.text
                elif candidate.content and candidate.content.parts:
                    text = candidate.content.parts[0].text
                else:
                    print("⚠️ No valid text content found in response.")
                    continue

                json_text = self._extract_json(text)
                data = json.loads(json_text)

                if 'topics' in data and data['topics']:
                    print("✅ Successfully extracted topics from Gemini response.")
                    return self._build_analysis(data['topics'], content)
                else:
                    print("⚠️ JSON parsed but no 'topics' key found or list empty.")

            except Exception as e:
                print(f"❌ Error during Gemini analysis attempt {attempt+1}: {e}")
                traceback.print_exc()
                continue

        print("❌ All Gemini attempts failed.")
        return None

    def _build_analysis(self, topic_names, content):
        """Build analysis structure"""
        animations = []

        for i, topic in enumerate(topic_names[:8], 1):
            topic_lower = topic.lower()

            if any(kw in topic_lower for kw in ['definition', 'concept', 'intro']):
                anim_type = 'concept_visualization'
            elif any(kw in topic_lower for kw in ['process', 'how', 'steps']):
                anim_type = 'process_flow'
            elif any(kw in topic_lower for kw in ['formula', 'equation']):
                anim_type = 'formula_derivation'
            elif any(kw in topic_lower for kw in ['problem', 'example']):
                anim_type = 'problem_solving'
            else:
                anim_type = 'concept_visualization'

            animations.append({
                'title': topic,
                'topic': topic,
                'reasoning': f"Visual helps understand {topic}",
                'animation_type': anim_type,
                'key_elements': [topic, 'Visual demo', 'Explanation'],
                'suggested_approach': 'Clear visuals, smooth transitions',
                'duration_estimate': '500 seconds',
                'priority': 'high' if i <= 3 else 'medium'
            })

        return {
            'analysis_summary': {
                'total_topics': len(topic_names),
                'topics_needing_animation': len(animations),
                'reasoning': 'Selected visual/conceptual topics'
            },
            'topics': [{'name': t} for t in topic_names],
            'animations_to_create': animations
        }

    def _heuristic_analysis(self, content):
        """Fallback heuristic"""
        topics = []
        lines = content.split('\n')

        for line in lines[:200]:
            if line.strip().startswith('##'):
                topic = line.replace('#', '').strip()
                topic = re.sub(r'\(.*?\)', '', topic).strip()
                if 10 < len(topic) < 100:
                    topics.append(topic)
            elif re.match(r'^\d+\.\s+[A-Z]', line.strip()):
                topic = re.sub(r'^\d+\.\s+', '', line.strip())
                topic = re.sub(r'\(.*?\)', '', topic).strip()
                if 10 < len(topic) < 100:
                    topics.append(topic)

        if not topics:
            topics = ['Main Concept', 'Key Principles', 'Applications']

        return self._build_analysis(topics[:8], content)

    def _extract_json(self, text):
        """Extract JSON"""
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]

        first = text.find('{')
        last = text.rfind('}')
        if first != -1 and last != -1:
            return text[first:last+1]

        return text.strip()

    def create_animation_plan(self, title, anim_type):
        """
        Agent 1: Understands topic & builds structured animation plan
        """
        prompt = f"""
    You are an expert educational animation designer.

    Create a 20-second Manim animation plan for the topic below.

    TOPIC: "{title}"
    TYPE: "{anim_type}"

    Return JSON with:
    {{
    "title": "...",
    "objective": "...",
    "animation_type": "...",
    "key_visuals": ["..."],
    "color_theme": ["..."],
    "steps": ["Step 1...", "Step 2..."],
    "narration_style": "..."
    }}

    Be concise. Only output JSON, no text.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=800
                ),
                safety_settings=self.safety_settings
            )

            if hasattr(response, "text"):
                text = response.text.strip()
            else:
                text = response.candidates[0].content.parts[0].text.strip()

            import json
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            plan = json.loads(text)
            print(f"   🧠 Plan generated for: {title}")
            return plan
        except Exception as e:
            print(f"   ⚠️ Plan generation failed: {e}")
            # Fallback minimal plan
            return {
                "title": title,
                "objective": f"Visualize concept of {title}",
                "animation_type": anim_type,
                "key_visuals": ["Text", "Circle", "Arrow"],
                "color_theme": ["BLUE", "YELLOW"],
                "steps": [f"Show title '{title}'", "Display key idea", "Simple transition"],
                "narration_style": "Calm and explanatory"
            }


    def generate_manim_code(self, animation_plan):
        """
        Agent 2: Takes plan → Generates validated Manim code
        """
        title = animation_plan.get("title", "Concept")
        anim_type = animation_plan.get("animation_type", "concept_visualization")
        visuals = ", ".join(animation_plan.get("key_visuals", []))
        colors = ", ".join(animation_plan.get("color_theme", []))
        steps = "\n".join(animation_plan.get("steps", []))
        narration = animation_plan.get("narration_style", "")

        # Create improved structured prompt for Gemini
        prompt = f"""
    You are an expert Python developer using Manim.

    Generate a working 20-second Manim script for the animation plan below.

    ANIMATION PLAN:
    Title: {title}
    Type: {anim_type}
    Visuals: {visuals}
    Colors: {colors}
    Steps:
    {steps}
    Narration Style: {narration}

    Requirements:
    - Import: from manim import *
    - Class name: AnimationScene(Scene)
    - Use only Text(), Circle(), Square(), Arrow(), FadeIn(), FadeOut(), Write()
    - Show title for 2s, then animate per plan
    - Add bottom-right corner branding: "Smart Scribes | iHub Hackathon"
    - No markdown, only Python code
        """

        for attempt in range(3):
            try:
                if attempt > 0:
                    import time
                    time.sleep(2 ** attempt)
                    print(f"      ⏳ Retry {attempt}/3...")

                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=0.4,
                        max_output_tokens=2500
                    ),
                    safety_settings=self.safety_settings
                )

                # Extract text
                if hasattr(response, 'text') and response.text:
                    code = response.text
                elif response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                    code = "".join(part.text for part in response.candidates[0].content.parts if hasattr(part, "text"))
                else:
                    print("      ⚠️ Empty Gemini response (no parts)")
                    continue


                # --- Clean code blocks ---
                if "```python" in code:
                    code = code.split("```python")[1].split("```")[0]
                elif "```" in code:
                    code = code.split("```")[1].split("```")[0]
                code = code.strip()

                # --- Auto-clean forbidden patterns ---
                import re
                code = re.sub(r'MathTex\s*\((.*?)\)', r'Text(\1)', code, flags=re.DOTALL)
                code = re.sub(r'Tex\s*\((.*?)\)', r'Text(\1)', code, flags=re.DOTALL)
                code = re.sub(r'\\\\', '', code)  # remove LaTeX-style backslashes
                code = code.replace('r"', '"').replace("r'", "'")

                # ✅ THEN validate
                if self._validate_and_fix_code(code):
                    print(f"      ✅ Valid code generated")
                    return code
                else:
                    print(f"      ⚠️ Code validation failed")
                    continue

            except Exception as e:
                print(f"      ⚠️ Error generating code: {str(e)[:100]}")
                continue

        # Fallback template
        print("      📝 Using fallback template")
        return self._generate_template(title)

    def _validate_and_fix_code(self, code):
        """Validate code structure"""
        checks = [
            ('from manim import' in code or 'import manim' in code, "Missing manim import"),
            ('class AnimationScene' in code, "Missing AnimationScene class"),
            ('def construct' in code, "Missing construct method"),
            ('self.play' in code or 'self.add' in code, "No animations"),
        ]

        for check, msg in checks:
            if not check:
                print(f"         ⚠️ {msg}")
                return False

        # Check for problematic patterns
        problems = [
            ('MathTex' in code, "MathTex found (use Text instead)"),
            ('Tex(' in code, "Tex found (use Text instead)"),
            ('.add_coordinates' in code, "add_coordinates found (remove)"),
        ]

        for problem, msg in problems:
            if problem:
                print(f"         ⚠️ {msg}")
                return False

        return True

    def _generate_template(self, title):
        """Safe template"""
        safe_title = title[:40].replace('"', "'")

        return f"""from manim import *
import numpy as np

class AnimationScene(Scene):
    def construct(self):
        # Title
        title = Text("{safe_title}", font_size=44, color=WHITE)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Branding
        brand1 = Text("Smart Scribes", font_size=22, weight=BOLD, color=WHITE)
        brand1.to_corner(UP + RIGHT)
        brand2 = Text("iHub Hackathon", font_size=14, color=GRAY)
        brand2.next_to(brand1, DOWN, buff=0.15)
        self.add(VGroup(brand1, brand2))

        # Concept
        concept = Text("{safe_title[:35]}", font_size=28, color=BLUE)
        self.play(Write(concept))
        self.wait(1.5)

        # Visual
        shape = Circle(radius=0.8, color=YELLOW)
        shape.next_to(concept, DOWN, buff=0.8)
        self.play(Create(shape))
        self.wait(1)

        # Transform
        shape2 = Square(side_length=1.6, color=GREEN)
        shape2.move_to(shape.get_center())
        self.play(Transform(shape, shape2))
        self.wait(1.5)

        # End
        summary = Text("Concept Visualized", font_size=24, color=GREEN)
        summary.to_edge(DOWN)
        self.play(Write(summary))
        self.wait(2)
        self.play(*[FadeOut(m) for m in self.mobjects])
"""

    def execute_manim(self, code, output_name):
        """Execute with detailed error handling"""
        print(f"      🎬 Rendering (may take 60-90s)...")

        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                script = os.path.join(temp_dir, "scene.py")

                # Write code
                with open(script, "w", encoding='utf-8') as f:
                    f.write(code)

                # Run manim with low quality for speed
                result = subprocess.run(
                    [self.manim_executable, "-pql", script, "AnimationScene"],
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    timeout=120
                )

                if result.returncode == 0:
                    # Find video
                    media = os.path.join(temp_dir, "media", "videos")
                    videos = []
                    for root, dirs, files in os.walk(media):
                        for f in files:
                            if f.endswith('.mp4'):
                                videos.append(os.path.join(root, f))

                    if videos:
                        src = max(videos, key=os.path.getsize)
                        dest = self.output_dir / f"{output_name}.mp4"
                        shutil.copy2(src, dest)
                        print(f"      ✅ Video: {dest.name}")
                        return {"success": True, "file": str(dest)}
                    else:
                        print(f"      ❌ No video file found")
                        return {"success": False, "error": "No video"}
                else:
                    # Show error
                    error_lines = result.stderr.split('\n')
                    print(f"      ❌ Manim error:")
                    for line in error_lines[-10:]:  # Last 10 lines
                        if line.strip():
                            print(f"         {line[:70]}")

                    return {"success": False, "error": result.stderr[-500:]}

        except subprocess.TimeoutExpired:
            print(f"      ❌ Timeout (>2 min)")
            return {"success": False, "error": "Timeout"}
        except Exception as e:
            print(f"      ❌ Error: {str(e)[:100]}")
            return {"success": False, "error": str(e)}

    def generate_animations_from_lecture(self, lecture_file):
        """Main pipeline"""

        print("\n" + "="*80)
        print("  🎬 SMART SCRIBES - ULTRA ROBUST GENERATOR")
        print("  With Validation & Error Handling")
        print("="*80)

        # Analyze
        analysis = self.analyze_lecture_content(lecture_file)

        with open('lecture_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2)

        animations = analysis.get('animations_to_create', [])

        if not animations:
            print("\n⚠️ No animations")
            return {"success": True, "animations": []}

        # Show plan
        print(f"\n📋 Plan:")
        for i, p in enumerate(animations, 1):
            print(f"{i}. {p['title']} ({p['animation_type']})")

        response = input(f"\n🎬 Create {len(animations)} animations? [Y/n]: ")
        if response.lower() == 'n':
            return {"success": False}

        # Create
        print(f"\n🎬 Creating...")
        results = []

        for i, plan in enumerate(animations, 1):
            print(f"\n{'='*80}")
            print(f"Animation {i}/{len(animations)}: {plan['title'][:50]}")
            print(f"{'='*80}")

            print("   🧠 Generating code...")
            code = self.generate_manim_code(plan)

            if not code:
                print("   ❌ Code generation failed")
                continue

            # Save code
            name = f"anim_{i:02d}_{plan['title'][:25].lower().replace(' ', '_')}"
            name = re.sub(r'[^a-zA-Z0-9_]', '_', name)
            code_file = self.output_dir / f"{name}.py"

            with open(code_file, 'w', encoding='utf-8') as f:
                f.write(code)
            print(f"   💾 Code: {code_file.name}")

            # Render
            render_result = self.execute_manim(code, name)

            results.append({
                'index': i,
                'title': plan['title'],
                'success': render_result['success'],
                'video': render_result.get('file'),
                'code': str(code_file),
                'error': render_result.get('error') if not render_result['success'] else None
            })

        # Summary
        success = sum(1 for r in results if r['success'])
        failed = len(results) - success

        print(f"\n{'='*80}")
        print(f"📊 Summary:")
        print(f"   Success: {success}/{len(results)}")
        print(f"   Failed: {failed}")
        print(f"   Output: {self.output_dir}/")
        print(f"{'='*80}")

        if failed > 0:
            print(f"\n💡 Failed animations:")
            for r in results:
                if not r['success']:
                    print(f"   • {r['title'][:50]}")
                    print(f"     Code: {r['code']}")
                    print(f"     Can fix manually and run: manim -pql {r['code']}")

        with open('results.json', 'w') as f:
            json.dump(results, f, indent=2)

        return {"success": True, "animations": results}


def main():
    """Entry point"""

    print("\n" + "="*80)
    print("  🎬 SMART SCRIBES - ULTRA ROBUST")
    print("  With Validation & Detailed Errors")
    print("="*80)

    if len(sys.argv) > 1:
        file = sys.argv[1]
    else:
        file = "comprehensive_lecture_summary.txt"

    if not os.path.exists(file):
        print(f"❌ Not found: {file}")
        return

    try:
        agent = SmartScribesUltraAgent()
        result = agent.generate_animations_from_lecture(file)

        if result['success']:
            print("\n✨ Done! Check smart_scribes_animations/")
        else:
            print(f"\n❌ Failed")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
