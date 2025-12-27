#!/usr/bin/env python3
"""
Generate Manim animations using Google Gemini API
This script integrates Gemini API with Manim to create branded animations from natural language prompts.
"""

import os
import sys
import json
import subprocess
import tempfile
import shutil
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

class ManimGenerator:
    def __init__(self):
        """Initialize the Manim generator with Gemini API"""
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Manim configuration
        self.manim_executable = os.getenv('MANIM_EXECUTABLE', 'manim')
        self.output_dir = Path('animations')
        self.output_dir.mkdir(exist_ok=True)
        
        print("ManimGenerator initialized successfully!")
        print(f"Output directory: {self.output_dir}")

    def generate_manim_code(self, prompt, animation_title):
        """Generate Manim code from natural language prompt using Gemini"""
        
        gemini_prompt = f"""
        Convert this natural language description into Manim Python code:
        "{prompt}"
        
        Requirements:
        - Use Manim Community v0.19.0 syntax
        - Include proper imports: from manim import *
        - Create a complete Scene class named "AnimationScene"
        - Use numpy for mathematical operations: import numpy as np
        - Keep animations smooth, detailed and educational
        - Use appropriate colors: RED, BLUE, GREEN, YELLOW, WHITE, ORANGE, PURPLE, PINK
        - Make animations between 10-20 seconds long for detailed explanation
        - Include proper timing with self.wait() calls
        - Use clear variable names and comments
        - AVOID using .add_coordinates() or any LaTeX/TeX features
        - Use simple Text() objects for labels instead of mathematical notation
        - Use basic shapes and animations that don't require external dependencies
        - Add smooth transitions and transformations
        - Include multiple steps to show the process clearly
        
        CRITICAL BRANDING REQUIREMENTS:
        1. At the very start (before any animation), add a title screen:
           - Display "{animation_title}" in large bold text (font_size=48) in center
           - Use WHITE color for the title
           - Show it for 2 seconds with self.wait(2)
           - Then fade it out with FadeOut
        
        2. Add permanent branding in top-right corner that stays throughout:
           - "Smart Scribes" in bold (font_size=24, weight=BOLD, color=WHITE)
           - Below it: "iHub Hackathon" in smaller text (font_size=16, color=GRAY)
           - Position at UP*3.2 + RIGHT*5 for top line
           - Position at UP*2.8 + RIGHT*5 for bottom line
           - These should appear after title screen and stay visible throughout entire animation
           - Use VGroup to group them together
        
        3. Make the main animation detailed with:
           - Step-by-step progression
           - Clear visual indicators
           - Smooth color transitions
           - Multiple intermediate states
           - Explanatory text labels where appropriate
        
        Return only the complete Python code without any markdown formatting or explanations.
        The code must start with imports and end with the complete AnimationScene class.
        """
        
        try:
            print("Generating detailed Manim code with Gemini...")
            response = self.model.generate_content(gemini_prompt)
            manim_code = response.text
            
            # Clean up the response (remove markdown formatting if present)
            if "```python" in manim_code:
                manim_code = manim_code.split("```python")[1].split("```")[0]
            elif "```" in manim_code:
                manim_code = manim_code.split("```")[1].split("```")[0]
            
            # Remove any leading/trailing whitespace
            manim_code = manim_code.strip()
            
            print("Detailed Manim code with branding generated successfully!")
            return manim_code
            
        except Exception as e:
            print(f"Error generating Manim code: {e}")
            return None

    def execute_manim_code(self, manim_code, output_name="animation"):
        """Execute Manim code and save only the final video"""
        
        print(f"Executing Manim code for: {output_name}")
        
        try:
            # Create temporary directory for Manim execution
            with tempfile.TemporaryDirectory() as temp_dir:
                script_path = os.path.join(temp_dir, "scene.py")
                
                # Write the Manim script
                with open(script_path, "w", encoding='utf-8') as script_file:
                    script_file.write(manim_code)
                
                print(f"Script written to: {script_path}")
                
                # Execute Manim with high quality settings
                print("Rendering animation in high quality...")
                result = subprocess.run(
                    [
                        self.manim_executable, 
                        "-pqh",  # High quality
                        script_path,
                        "AnimationScene"  # Specific scene name
                    ],
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    timeout=180  # 3 minutes timeout for detailed animations
                )
                
                if result.returncode == 0:
                    print("Animation rendered successfully!")
                    
                    # Find the final video file (1080p60)
                    media_dir = os.path.join(temp_dir, "media", "videos", "scene", "1080p60")
                    
                    if os.path.exists(media_dir):
                        video_files = [f for f in os.listdir(media_dir) if f.endswith('.mp4')]
                        
                        if video_files:
                            # Get the most recent video file (should be only one)
                            video_file = video_files[0]
                            src_path = os.path.join(media_dir, video_file)
                            
                            # Save with clean name
                            final_path = self.output_dir / f"{output_name}.mp4"
                            shutil.copy2(src_path, final_path)
                            
                            print(f"✓ Final video saved: {final_path}")
                            
                            return {
                                "success": True,
                                "output": "Animation generated successfully",
                                "file": str(final_path),
                                "manim_output": result.stdout
                            }
                        else:
                            return {
                                "success": False,
                                "error": "No video file found after rendering",
                                "manim_output": result.stdout
                            }
                    else:
                        # Try alternate path structure
                        media_dir = os.path.join(temp_dir, "media", "videos")
                        video_files = []
                        for root, dirs, files in os.walk(media_dir):
                            for file in files:
                                if file.endswith('.mp4'):
                                    video_files.append(os.path.join(root, file))
                        
                        if video_files:
                            # Get the most recent/largest video (final render)
                            src_path = max(video_files, key=os.path.getsize)
                            final_path = self.output_dir / f"{output_name}.mp4"
                            shutil.copy2(src_path, final_path)
                            
                            print(f"✓ Final video saved: {final_path}")
                            
                            return {
                                "success": True,
                                "output": "Animation generated successfully",
                                "file": str(final_path),
                                "manim_output": result.stdout
                            }
                        
                        return {
                            "success": False,
                            "error": "No media directory found after rendering",
                            "manim_output": result.stdout
                        }
                else:
                    print(f"Manim execution failed:")
                    print(f"STDOUT: {result.stdout}")
                    print(f"STDERR: {result.stderr}")
                    return {
                        "success": False,
                        "error": result.stderr,
                        "manim_output": result.stdout
                    }
                    
        except subprocess.TimeoutExpired:
            print("Animation rendering timed out")
            return {"success": False, "error": "Timeout - animation took too long to render"}
        except Exception as e:
            print(f"Error during Manim execution: {e}")
            return {"success": False, "error": str(e)}

    def generate_animation(self, prompt, animation_title, output_name="animation"):
        """Complete pipeline: Generate Manim code and execute it"""
        
        print(f"\n{'='*80}")
        print(f"Generating animation: {animation_title}")
        print(f"Prompt: {prompt}")
        print(f"{'='*80}\n")
        
        # Step 1: Generate Manim code with branding
        manim_code = self.generate_manim_code(prompt, animation_title)
        if not manim_code:
            return {"success": False, "error": "Failed to generate Manim code"}
        
        # Step 2: Execute Manim code
        result = self.execute_manim_code(manim_code, output_name)
        
        # Add the generated code to the result for debugging
        result["generated_code"] = manim_code
        
        return result

def main():
    """Main function to run the linear regression animation"""
    
    print("\n" + "="*80)
    print("  MANIM ANIMATION GENERATOR WITH GOOGLE GEMINI  ")
    print("  Branded Animations for Smart Scribes - iHub Hackathon  ")
    print("="*80 + "\n")
    
    try:
        # Initialize the generator
        generator = ManimGenerator()
        
        # Animation configuration
        animation_title = "Linear Regression Visualization"
        output_name = "linear_regression"
        
        prompt = """
        Create a detailed animation of linear regression:
        
        1. Start with an empty coordinate system
        2. Gradually add 10-15 scattered data points in blue
        3. Show a red line with random slope appearing (poor fit)
        4. Animate the line adjusting over 5-6 iterations:
           - Show the line rotating and shifting
           - Add small indicators showing error reduction
           - Make each adjustment smooth and clear
        5. As the line reaches optimal fit, smoothly transition color from red through orange to green
        6. At the end, highlight the final green line with a glow effect
        7. Show brief "Optimal Fit Achieved" text that fades in and out
        
        Make it educational and visually engaging with smooth transitions.
        """
        
        # Generate the animation
        result = generator.generate_animation(prompt, animation_title, output_name)
        
        # Display results
        print("\n" + "="*80)
        print("  ANIMATION GENERATION RESULTS  ")
        print("="*80 + "\n")
        
        if result["success"]:
            print("✓ SUCCESS! Animation generated successfully!\n")
            print(f"📁 Output location: {generator.output_dir}")
            print(f"🎬 Video file: {Path(result['file']).name}\n")
            print(f"📂 Full path: {os.path.abspath(result['file'])}\n")
            print("="*80)
            
        else:
            print("✗ FAILED! Animation generation failed.\n")
            print(f"Error: {result.get('error', 'Unknown error')}\n")
            
            if "generated_code" in result:
                print("Generated code (for debugging):")
                print("-" * 80)
                print(result["generated_code"])
                print("-" * 80)
        
        print("\n✓ Process completed!")
        
    except Exception as e:
        print(f"✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()