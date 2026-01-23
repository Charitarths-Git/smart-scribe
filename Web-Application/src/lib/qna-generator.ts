import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Google Custom Search Tool
const createGoogleSearchTool = (apiKey: string, searchEngineId: string) => {
  return new DynamicStructuredTool({
    name: "google_search",
    description: "Search Google for current information about academic topics and educational content. Use this to find relevant, up-to-date information about any topic.",
    schema: z.object({
      query: z.string().describe("The search query for academic or educational content"),
    }),
    func: async ({ query }) => {
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const results = data.items.slice(0, 5).map((item: any) => 
            `Title: ${item.title}\nSnippet: ${item.snippet}\nSource: ${item.link}`
          ).join("\n\n---\n\n");
          return results;
        }
        return "No results found for this query.";
      } catch (error) {
        console.error("Search error:", error);
        return "Error performing search. Please try again.";
      }
    },
  });
};

// Function to recommend topics based on lecture content
export async function recommendTopics(
  lectureContent: string,
  geminiApiKey: string
): Promise<string[]> {
  try {
    if (!geminiApiKey) {
      throw new Error("Gemini API key is required");
    }

    if (!lectureContent || lectureContent.trim().length === 0) {
      throw new Error("Lecture content is required");
    }

    const llm = new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      temperature: 0.7,
      model: "gemini-2.0-flash-exp",
    });

    const topicPrompt = ChatPromptTemplate.fromTemplate(
      `You are an expert educational content analyzer specializing in identifying key topics for assessment.

Analyze the following lecture content and identify 5-7 distinct topics that would be excellent for generating quiz questions.

LECTURE CONTENT:
{lectureContent}

REQUIREMENTS:
1. Topics should be specific and focused (not too broad)
2. Cover different aspects and difficulty levels of the content
3. Include both fundamental concepts and practical applications
4. Be relevant to students learning this material
5. Be suitable for generating assessment questions

CRITICAL: Respond ONLY with a valid JSON array of strings. No explanation, no markdown, just the array.

Example format:
{{["Topic Name 1", "Topic Name 2", "Topic Name 3", "Topic Name 4", "Topic Name 5"]}}

JSON Response:`
    );

    const formattedPrompt = await topicPrompt.format({ 
      lectureContent: lectureContent.substring(0, 8000) // Limit content length
    });

    const response = await llm.invoke(formattedPrompt);
    const responseText = response.content.toString().trim();
    
    // Extract JSON array from response
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON array
      const match = cleanedText.match(/\[[\s\S]*\]/);
      if (match) {
        const topics = JSON.parse(match[0]);
        if (Array.isArray(topics) && topics.length > 0) {
          // Filter out empty strings and ensure all are strings
          return topics.filter(t => typeof t === 'string' && t.trim().length > 0);
        }
      }
      
      console.error("Could not parse topics from response:", responseText);
      return [];
    } catch (parseError) {
      console.error("Error parsing topics JSON:", parseError);
      console.error("Response was:", responseText);
      return [];
    }
  } catch (error) {
    console.error("Error recommending topics:", error);
    throw error;
  }
}

// Function to generate questions and answers using AI with search
export async function generateQnA(
  topic: string,
  questionFormat: string,
  geminiApiKey: string,
  googleSearchApiKey?: string,
  searchEngineId?: string
): Promise<any[]> {
  try {
    if (!geminiApiKey) {
      throw new Error("Gemini API key is required");
    }

    if (!topic || topic.trim().length === 0) {
      throw new Error("Topic is required");
    }

    const llm = new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      temperature: 0.7,
      model: "gemini-2.0-flash-exp",
    });

    // Define format-specific instructions
    let formatInstructions = "";
    let numberOfQuestions = "3-5";
    
    if (questionFormat === "mcq") {
      formatInstructions = `
Generate ${numberOfQuestions} high-quality Multiple Choice Questions (MCQ).

For EACH question, provide:
{{
  "id": "unique_id",
  "question": "Clear, specific question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0,
  "explanation": "Detailed explanation of why the correct answer is right and why others are wrong"
}}

RULES:
- All 4 options must be plausible
- Only ONE option should be clearly correct
- Correct answer index is 0-based (0=A, 1=B, 2=C, 3=D)
- Explanation should be educational and thorough
- Questions should test understanding, not just memorization`;

    } else if (questionFormat === "subjective") {
      formatInstructions = `
Generate ${numberOfQuestions} thought-provoking Subjective Questions.

For EACH question, provide:
{{
  "id": "unique_id",
  "question": "Open-ended question requiring explanation or analysis",
  "solution": "Comprehensive model answer with key points, explanations, and examples"
}}

RULES:
- Questions should encourage critical thinking
- Solutions should be detailed and educational
- Include relevant examples and explanations
- Cover different aspects of the topic`;

    } else if (questionFormat === "mathematical") {
      formatInstructions = `
Generate ${numberOfQuestions} Mathematical Problems.

For EACH problem, provide:
{{
  "id": "unique_id",
  "question": "Clear mathematical problem statement with necessary information",
  "solution": "Step-by-step solution showing all work and reasoning"
}}

RULES:
- Problems should be solvable with provided information
- Solutions must show all steps clearly
- Include formulas and calculations
- Explain the reasoning at each step`;
    }

    // Search for information about the topic if available
    let searchContext = "";
    if (googleSearchApiKey && searchEngineId) {
      try {
        const searchTool = createGoogleSearchTool(googleSearchApiKey, searchEngineId);
        const searchQuery = `${topic} educational content ${questionFormat === 'mcq' ? 'multiple choice questions' : 
                questionFormat === 'subjective' ? 'subjective questions' : 'mathematical problems'}`;
        searchContext = await searchTool.func({ query: searchQuery });
      } catch (searchError) {
        console.error("Search failed, continuing without search context:", searchError);
      }
    }

    // Generate questions with or without search context
    const prompt = ChatPromptTemplate.fromTemplate(
      `You are an expert educational content creator.

Topic: {topic}

${searchContext ? `Reference Information from web search:
${searchContext}

Use this information to create accurate, well-informed questions.

` : ''}${formatInstructions}

CRITICAL: Respond ONLY with a valid JSON array. No explanation, no markdown, just the array.

JSON Response:`
    );

    const formattedPrompt = await prompt.format({
      topic,
    });

    const response = await llm.invoke(formattedPrompt);
    const responseText = response.content.toString();
    
    return parseQuestionsFromResponse(responseText);

  } catch (error) {
    console.error("Error generating Q&A:", error);
    throw error;
  }
}

// Helper function to parse questions from LLM response
function parseQuestionsFromResponse(responseText: string): any[] {
  try {
    // Clean up the response
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON array
    const match = cleanedText.match(/\[[\s\S]*\]/);
    if (match) {
      const questions = JSON.parse(match[0]);
      
      if (Array.isArray(questions) && questions.length > 0) {
        // Validate and clean questions
        return questions.map((q, idx) => ({
          ...q,
          id: q.id || `q_${idx + 1}`
        }));
      }
    }
    
    console.error("Could not parse questions from response:", responseText);
    return [];
  } catch (parseError) {
    console.error("Error parsing questions JSON:", parseError);
    console.error("Response was:", responseText);
    return [];
  }
}