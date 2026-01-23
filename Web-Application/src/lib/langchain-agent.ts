import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

// Google Custom Search Tool
const createGoogleSearchTool = (apiKey: string, searchEngineId: string) => {
  return new DynamicStructuredTool({
    name: "google_search",
    description: "Search Google for current information about courses, assignments, deadlines, and academic topics.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
    func: async ({ query }) => {
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const results = data.items.slice(0, 3).map((item: any) => 
            `Title: ${item.title}\nSnippet: ${item.snippet}\nLink: ${item.link}`
          ).join("\n\n");
          return results;
        }
        return "No results found.";
      } catch (error) {
        console.error("Search error:", error);
        return "Error performing search.";
      }
    },
  });
};

// Simple agent that can use tools
async function runWithTools(
  llm: ChatGoogleGenerativeAI,
  tools: DynamicStructuredTool[],
  query: string
): Promise<string> {
  // First, ask the LLM if it needs to search
  const decisionPrompt = ChatPromptTemplate.fromTemplate(
    `You are a helpful AI learning assistant for college courses. 
    
User question: {query}

Do you need to search for current information to answer this question? 
If the question is about:
- Current course schedules, deadlines, or assignments
- Recent topics or updates
- Specific factual information you're unsure about

Respond with ONLY "SEARCH: <search query>" if you need to search, or "ANSWER: <your answer>" if you can answer directly.`
  );

  const decision = await llm.invoke(
    await decisionPrompt.format({ query })
  );

  const decisionText = decision.content.toString();

  // Check if we need to search
  if (decisionText.startsWith("SEARCH:")) {
    const searchQuery = decisionText.replace("SEARCH:", "").trim();
    const searchTool = tools[0];
    const searchResults = await searchTool.func({ query: searchQuery });

    // Now generate final answer with search results
    const answerPrompt = ChatPromptTemplate.fromTemplate(
      `You are a helpful AI learning assistant for college courses.

User question: {query}

Search results:
{searchResults}

Based on the search results above, provide a comprehensive and friendly answer to the student's question. Be conversational and supportive.`
    );

    const finalAnswer = await llm.invoke(
      await answerPrompt.format({ 
        query, 
        searchResults 
      })
    );

    return finalAnswer.content.toString();
  } else if (decisionText.startsWith("ANSWER:")) {
    return decisionText.replace("ANSWER:", "").trim();
  } else {
    // Fallback: use the decision text as answer
    return decisionText;
  }
}

// Main function to generate responses
export async function generateResponse(
  query: string,
  geminiApiKey?: string,
  googleSearchApiKey?: string,
  searchEngineId?: string,
  lectureContent?: string
): Promise<string> {
  try {
    // Validate API key
    if (!geminiApiKey) {
      throw new Error("Gemini API key is required");
    }

    // Initialize Gemini LLM
    const llm = new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      temperature: 0.7,
      model: "gemini-2.5-pro", // Example model name, replace with the correct one if needed
    });

    // Create tools if search credentials are provided
    const tools = (googleSearchApiKey && searchEngineId) 
      ? [createGoogleSearchTool(googleSearchApiKey, searchEngineId)]
      : [];

    // If lecture content is available, use it as primary context
    if (lectureContent) {
      // First try to answer using lecture content
      const lecturePrompt = ChatPromptTemplate.fromTemplate(
        `You are a helpful AI learning assistant for college courses. Answer the following question primarily based on the lecture content provided. 
If the lecture content doesn't contain the information needed to answer the question completely, indicate that you'll need to search for additional information.

Lecture Content:
{lectureContent}

Question: {query}

Important Instructions:
1. Base your answer primarily on the lecture content provided above.
2. If the lecture content contains the information needed, provide a comprehensive answer using that information.
3. If the lecture content is insufficient or doesn't address the question, respond with "SEARCH_NEEDED" and then we'll use web search to supplement.
4. Be friendly, supportive, and educational in your response.

Your response:`
      );

      const lectureResponse = await llm.invoke(
        await lecturePrompt.format({ 
          query, 
          lectureContent 
        })
      );

      const lectureResponseText = lectureResponse.content.toString();
      
      // If the response indicates search is needed and tools are available, use them
      if (lectureResponseText.includes("SEARCH_NEEDED") && tools.length > 0) {
        return await runWithTools(llm, tools, query);
      } else {
        // Return the lecture-based response (with any "SEARCH_NEEDED" text removed)
        return lectureResponseText.replace("SEARCH_NEEDED", "").trim();
      }
    }

    // If no lecture content and no search tools, just use LLM directly
    if (tools.length === 0) {
      const prompt = ChatPromptTemplate.fromTemplate(
        `You are a helpful AI learning assistant for college courses. Answer the following question in a friendly, supportive, and comprehensive way.

Question: {query}

Answer:`
      );

      const response = await llm.invoke(
        await prompt.format({ query })
      );

      return response.content.toString();
    }

    // Use tools if available (and no lecture content was provided)
    return await runWithTools(llm, tools, query);

  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}

// Alternative: Simple chat without tools
export async function simpleChat(
  query: string,
  geminiApiKey: string
): Promise<string> {
  try {
    if (!geminiApiKey) {
      throw new Error("Gemini API key is required");
    }

    const llm = new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      temperature: 0.7,
      model: "chat-bison", // Example model name, replace with the correct one if needed
    });

    const prompt = ChatPromptTemplate.fromTemplate(
      `You are a helpful AI learning assistant for college courses. You help students with:
- Understanding course concepts
- Study tips and resources
- Assignment guidance
- Course-related questions

Be friendly, supportive, and encouraging in your responses.

Student question: {query}

Your response:`
    );

    const response = await llm.invoke(
      await prompt.format({ query })
    );

    return response.content.toString();
  } catch (error) {
    console.error("Error in simple chat:", error);
    throw error;
  }
}