#!/usr/bin/env python3
"""
Multi-Agent System for Lecture Content Processing
This system processes lecture text and generates structured content with titles, topics, images, and animations.
"""

import os
import sys
import json
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai

# Import manimTest.py for animation generation
try:
    from manimTest import ManimGenerator
except ImportError:
    print("Warning: manimTest.py not found. Animation generation will be disabled.")
    ManimGenerator = None

# Load environment variables
load_dotenv()

class LectureContentAgent:
    """First agent: Extracts overall title and topics from lecture text"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found. Using fallback processing.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def extract_title_and_topics(self, text: str) -> Dict[str, Any]:
        """Extract overall title and break down topics from lecture text"""
        
        prompt = f"""
        Analyze this lecture transcript and extract:
        1. Overall title of the lecture
        2. Main topics covered with their corresponding text sections
        
        Lecture text:
        {text[:2000]}...
        
        Return your response in this exact JSON format (no additional text):
        {{
            "overall_title": "Main Lecture Title",
            "topics": [
                {{
                    "topic_title": "Topic 1 Title",
                    "text_content": "Relevant text content for this topic from the lecture",
                    "start_time": "00:00",
                    "end_time": "10:00"
                }},
                {{
                    "topic_title": "Topic 2 Title", 
                    "text_content": "Relevant text content for this topic from the lecture",
                    "start_time": "10:00",
                    "end_time": "20:00"
                }}
            ]
        }}
        
        Rules:
        - Extract 3-7 main topics maximum
        - Each topic should be substantial and coherent
        - Include time ranges when available
        - Keep text content relevant and concise for each topic
        - Make topic titles descriptive and clear
        - Return ONLY the JSON, no additional text or formatting
        """
        
        if not self.model:
            # Fallback processing without API
            return self._fallback_extract_title_and_topics(text)
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up the response
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            # Try to find JSON in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                response_text = response_text[start_idx:end_idx]
            
            result = json.loads(response_text)
            return result
        except Exception as e:
            print(f"Error in title extraction: {e}")
            print(f"Response text: {response.text if 'response' in locals() else 'No response'}")
            return self._fallback_extract_title_and_topics(text)
    
    def _fallback_extract_title_and_topics(self, text: str) -> Dict[str, Any]:
        """Fallback method to extract topics using simple text analysis"""
        
        # Extract title from first line or look for key phrases
        title = "QuickSort Algorithm Lecture"
        if "QuickSort" in text:
            title = "QuickSort Algorithm Lecture"
        elif "professor said" in text.lower():
            title = "Algorithm Analysis Lecture"
        
        # Simple topic extraction based on time markers and key phrases
        topics = []
        
        # Look for time markers and extract content
        time_pattern = r'(\d{2}:\d{2}–\d{2}:\d{2})'
        sections = re.split(time_pattern, text)
        
        current_topic = ""
        current_time = ""
        
        for i, section in enumerate(sections):
            if re.match(r'\d{2}:\d{2}–\d{2}:\d{2}', section):
                current_time = section
            else:
                if section.strip() and len(section.strip()) > 50:
                    # Determine topic based on content
                    if "overview" in section.lower() or "intuition" in section.lower():
                        topic_title = "Overview and Intuition"
                    elif "pseudocode" in section.lower() or "partition" in section.lower():
                        topic_title = "Pseudocode and Partition"
                    elif "example" in section.lower() or "trace" in section.lower():
                        topic_title = "Worked Example"
                    elif "correctness" in section.lower() or "invariant" in section.lower():
                        topic_title = "Correctness and Invariants"
                    elif "complexity" in section.lower() or "time" in section.lower():
                        topic_title = "Time Complexity Analysis"
                    elif "improvement" in section.lower() or "practice" in section.lower():
                        topic_title = "Practical Improvements"
                    else:
                        topic_title = f"Topic {len(topics) + 1}"
                    
                    topics.append({
                        "topic_title": topic_title,
                        "text_content": section.strip()[:500] + "..." if len(section.strip()) > 500 else section.strip(),
                        "start_time": current_time.split('–')[0] if current_time else "00:00",
                        "end_time": current_time.split('–')[1] if current_time else "10:00"
                    })
        
        # If no topics found, create default ones
        if not topics:
            topics = [
                {
                    "topic_title": "QuickSort Overview",
                    "text_content": text[:500] + "..." if len(text) > 500 else text,
                    "start_time": "00:00",
                    "end_time": "20:00"
                }
            ]
        
        return {
            "overall_title": title,
            "topics": topics[:5]  # Limit to 5 topics
        }

class TopicProcessingAgent:
    """Second agent: Processes each topic to extract title, text, images, and determine if animation is needed"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found. Using fallback processing.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def process_topic(self, topic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single topic to extract structured information"""
        
        # First extract image IDs using regex
        text_content = topic_data.get('text_content', '')
        img_ids = self._extract_image_ids(text_content)
        
        prompt = f"""
        Analyze this lecture topic and extract structured information:
        
        Topic: {topic_data.get('topic_title', '')}
        Content: {topic_data.get('text_content', '')}
        
        Extract:
        1. A clear, descriptive title for this topic
        2. Text content broken into logical paragraphs
        3. Determine if this topic would benefit from an animation
        4. If animation is needed, suggest what should be animated
        
        Return in this exact JSON format (no additional text):
        {{
            "title": "Clear Topic Title",
            "text": [
                "First paragraph of content...",
                "Second paragraph of content...",
                "Third paragraph of content..."
            ],
            "needs_animation": true,
            "animation_description": "Description of what should be animated (if needed)"
        }}
        
        Rules:
        - Break text into 2-4 logical paragraphs
        - Only suggest animation for concepts that would benefit from visual demonstration
        - Animation descriptions should be clear and specific
        - Return ONLY the JSON, no additional text or formatting
        """
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up the response
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            # Try to find JSON in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                response_text = response_text[start_idx:end_idx]
            
            result = json.loads(response_text)
            # Add extracted image IDs to the result
            result["imgId"] = img_ids
            return result
        except Exception as e:
            print(f"Error processing topic: {e}")
            print(f"Response text: {response.text if 'response' in locals() else 'No response'}")
            return {
                "title": topic_data.get('topic_title', 'Unknown Topic'),
                "text": [topic_data.get('text_content', 'No content available')],
                "imgId": img_ids,
                "needs_animation": False,
                "animation_description": ""
            }
    
    def _extract_image_ids(self, text: str) -> List[str]:
        """Extract image IDs from text using regex"""
        # Pattern to match img followed by numbers and optional dash-number
        pattern = r'img\d+(?:-\d+)?'
        matches = re.findall(pattern, text)
        return list(set(matches))  # Remove duplicates

class AnimationPromptAgent:
    """Third agent: Generates detailed animation prompts for manimTest.py"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_animation_prompt(self, topic_title: str, animation_description: str) -> str:
        """Generate detailed animation prompt for manimTest.py"""
        
        prompt = f"""
        Create a detailed animation prompt for Manim based on this topic:
        
        Topic: {topic_title}
        Animation Description: {animation_description}
        
        Generate a comprehensive prompt that describes exactly what should be animated.
        The prompt should be suitable for generating Manim code that creates an educational animation.
        
        Focus on:
        - Clear visual elements to animate
        - Step-by-step progression of the animation
        - Educational value and clarity
        - Specific colors, shapes, and movements
        - Duration and timing considerations
        
        Return only the detailed animation prompt, no additional formatting.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating animation prompt: {e}")
            return f"Animate the concept: {animation_description}"

class MultiAgentSystem:
    """Main system that coordinates all agents"""
    
    def __init__(self):
        self.content_agent = LectureContentAgent()
        self.topic_agent = TopicProcessingAgent()
        self.animation_agent = AnimationPromptAgent()
        self.output_dir = "output"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize ManimGenerator if available
        self.manim_generator = None
        if ManimGenerator:
            try:
                self.manim_generator = ManimGenerator()
                print("ManimGenerator initialized successfully!")
            except Exception as e:
                print(f"Warning: Could not initialize ManimGenerator: {e}")
                self.manim_generator = None
    
    def read_text_file(self, file_path: str) -> str:
        """Read text content from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return ""
    
    def generate_animation_filename(self, topic_title: str) -> str:
        """Generate a filename for animation based on topic title"""
        # Clean title for filename
        clean_title = re.sub(r'[^\w\s-]', '', topic_title)
        clean_title = re.sub(r'[-\s]+', '_', clean_title)
        return f"{clean_title.lower()}_animation"
    
    def process_lecture(self, text_content: str) -> Dict[str, Any]:
        """Process lecture content through all agents"""
        
        print("Starting lecture processing...")
        print("=" * 60)
        
        # Step 1: Extract overall title and topics
        print("Step 1: Extracting title and topics...")
        lecture_structure = self.content_agent.extract_title_and_topics(text_content)
        
        print(f"Overall Title: {lecture_structure['overall_title']}")
        print(f"Found {len(lecture_structure['topics'])} topics")
        
        # Step 2: Process each topic
        print("\nStep 2: Processing individual topics...")
        processed_topics = []
        
        for i, topic in enumerate(lecture_structure['topics']):
            print(f"Processing topic {i+1}: {topic.get('topic_title', 'Unknown')}")
            
            # Process topic
            processed_topic = self.topic_agent.process_topic(topic)
            
            # Generate animation if needed
            if processed_topic.get('needs_animation', False):
                print(f"  Generating animation...")
                animation_filename = self.generate_animation_filename(processed_topic['title'])
                
                if self.manim_generator:
                    animation_prompt = self.animation_agent.generate_animation_prompt(
                        processed_topic['title'], 
                        processed_topic['animation_description']
                    )
                    
                    # Generate actual animation using manimTest.py
                    animation_result = self.manim_generator.generate_animation(
                        animation_prompt, 
                        animation_filename
                    )
                    
                    if animation_result.get('success', False):
                        processed_topic['animation'] = animation_filename
                        print(f"  Animation generated: {animation_filename}")
                    else:
                        processed_topic['animation'] = None
                        print(f"  Animation generation failed: {animation_result.get('error', 'Unknown error')}")
                else:
                    processed_topic['animation'] = None
                    print("  Animation generation skipped (ManimGenerator not available)")
            else:
                processed_topic['animation'] = None
            
            processed_topics.append(processed_topic)
        
        # Step 3: Create final structure
        final_result = {
            "overall_title": lecture_structure['overall_title'],
            "topics": processed_topics
        }
        
        return final_result
    
    def save_to_json(self, data: Dict[str, Any], filename: str = "output-data.json"):
        """Save processed data to JSON file"""
        output_path = os.path.join(self.output_dir, filename)
        try:
            with open(output_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
            print(f"Data saved to: {output_path}")
            return output_path
        except Exception as e:
            print(f"Error saving to JSON: {e}")
            return None
    
    def print_results(self, data: Dict[str, Any]):
        """Print results to terminal in the requested format"""
        print("\n" + "=" * 60)
        print("PROCESSING RESULTS")
        print("=" * 60)
        
        print(f"Overall Title: {data['overall_title']}")
        print(f"Number of Topics: {len(data['topics'])}")
        
        for i, topic in enumerate(data['topics']):
            print(f"\nTopic {i+1}:")
            print(f"  title: \"{topic['title']}\"")
            print(f"  text: {topic['text']}")
            print(f"  imgId: {topic['imgId']}")
            print(f"  animation: {topic.get('animation', None)}")

def main():
    """Main function to run the multi-agent system"""
    
    print("Multi-Agent Lecture Processing System")
    print("=" * 60)
    
    try:
        # Initialize the system
        system = MultiAgentSystem()
        
        # Read the text file
        text_file_path = "test1.txt"
        if not os.path.exists(text_file_path):
            print(f"Error: File {text_file_path} not found!")
            return
        
        print(f"Reading text from: {text_file_path}")
        text_content = system.read_text_file(text_file_path)
        
        if not text_content:
            print("Error: No content found in file!")
            return
        
        # Process the lecture
        result = system.process_lecture(text_content)
        
        # Print results
        system.print_results(result)
        
        # Save to JSON
        output_file = system.save_to_json(result)
        
        print(f"\nProcessing complete! Results saved to: {output_file}")
        
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
