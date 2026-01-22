import { NextRequest, NextResponse } from 'next/server';
import { recommendTopics } from '@/lib/qna-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lectureContent } = body;

    // Validate input
    if (!lectureContent || typeof lectureContent !== 'string') {
      return NextResponse.json(
        { error: 'Lecture content is required' },
        { status: 400 }
      );
    }

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Generate topic recommendations
    const topics = await recommendTopics(lectureContent, geminiApiKey);

    return NextResponse.json({
      topics,
      success: true
    });

  } catch (error) {
    console.error('Error in topics API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate topic recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}