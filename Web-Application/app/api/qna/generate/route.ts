import { NextRequest, NextResponse } from 'next/server';
import { generateQnA } from '@/lib/qna-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, questionFormat } = body;

    // Validate input
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!questionFormat || !['mcq', 'subjective', 'mathematical'].includes(questionFormat)) {
      return NextResponse.json(
        { error: 'Valid question format is required (mcq, subjective, or mathematical)' },
        { status: 400 }
      );
    }

    // Get API keys from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const googleSearchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Generate questions and answers
    const questions = await generateQnA(
      topic,
      questionFormat,
      geminiApiKey,
      googleSearchApiKey,
      searchEngineId
    );

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions could be generated for this topic' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      questions,
      success: true,
      topic,
      format: questionFormat
    });

  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}