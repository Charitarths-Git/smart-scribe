import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/langchain-agent';

export async function POST(req: NextRequest) {
  try {
    const { message, lectureContent } = await req.json();
    
    // Get API keys from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const googleSearchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }
    
    // Generate response with lecture content as context
    const response = await generateResponse(
      message,
      geminiApiKey,
      googleSearchApiKey,
      searchEngineId,
      lectureContent
    );
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}