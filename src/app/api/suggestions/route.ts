import { NextRequest, NextResponse } from 'next/server';
import { llmService, EmailContext, LLMProvider } from '@/lib/llm-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, emailBody, threadHistory, provider = 'groq' } = body;

    // Validate input
    if (!subject && !emailBody) {
      return NextResponse.json(
        { error: 'Either subject or email body is required' },
        { status: 400 }
      );
    }

    const context: EmailContext = {
      subject,
      body: emailBody,
      threadHistory,
    };

    const result = await llmService.generateEmailSuggestions(
      context,
      provider as LLMProvider
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating suggestions:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}