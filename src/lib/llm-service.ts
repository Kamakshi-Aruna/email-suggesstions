import Groq from 'groq-sdk';

export type LLMProvider = 'groq' | 'openai' | 'claude';

export interface EmailContext {
  subject?: string;
  body?: string;
  threadHistory?: string[];
}

export interface SuggestionResponse {
  suggestions: string[];
  provider: string;
}

class LLMService {
  private groqClient: Groq | null = null;

  constructor() {
    // Initialize Groq client if API key is available
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }
  }

  async generateEmailSuggestions(
    context: EmailContext,
    provider: LLMProvider = 'groq'
  ): Promise<SuggestionResponse> {
    switch (provider) {
      case 'groq':
        return this.generateWithGroq(context);
      case 'openai':
        return this.generateWithOpenAI(context);
      case 'claude':
        return this.generateWithClaude(context);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async generateWithGroq(context: EmailContext): Promise<SuggestionResponse> {
    if (!this.groqClient) {
      throw new Error('Groq API key not configured. Add GROQ_API_KEY to .env.local');
    }

    const prompt = this.buildPrompt(context);

    const completion = await this.groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI email assistant. Generate 3 professional, contextually appropriate email reply suggestions. Each suggestion should be concise (1-3 sentences). Return ONLY a JSON array of strings, nothing else.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Free Llama 3.3 model on Groq
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    const suggestions = JSON.parse(content);

    return {
      suggestions: Array.isArray(suggestions) ? suggestions : [],
      provider: 'Groq (Llama 3.3)',
    };
  }

  private async generateWithOpenAI(context: EmailContext): Promise<SuggestionResponse> {
    // Placeholder for OpenAI integration
    // Install: npm install openai
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    throw new Error('OpenAI integration not yet implemented. Add your API key and uncomment the code.');
  }

  private async generateWithClaude(context: EmailContext): Promise<SuggestionResponse> {
    // Placeholder for Claude integration
    // Install: npm install @anthropic-ai/sdk
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    throw new Error('Claude integration not yet implemented. Add your API key and uncomment the code.');
  }

  private buildPrompt(context: EmailContext): string {
    let prompt = 'Generate 3 email reply suggestions based on:\n\n';

    if (context.subject) {
      prompt += `Subject: ${context.subject}\n`;
    }

    if (context.body) {
      prompt += `Email Content: ${context.body}\n`;
    }

    if (context.threadHistory && context.threadHistory.length > 0) {
      prompt += `\nPrevious Messages:\n${context.threadHistory.join('\n---\n')}`;
    }

    prompt += '\n\nReturn only a JSON array of 3 suggestion strings.';

    return prompt;
  }
}

export const llmService = new LLMService();