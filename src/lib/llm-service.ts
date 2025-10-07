import Groq from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';
import OpenAI from 'openai';

export type LLMProvider = 'groq' | 'mistral' | 'qwen';

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
  private mistralClient: Mistral | null = null;
  private qwenClient: OpenAI | null = null;

  constructor() {
    // Initialize Groq client if API key is available
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }

    // Initialize Mistral client if API key is available
    if (process.env.MISTRAL_API_KEY) {
      this.mistralClient = new Mistral({
        apiKey: process.env.MISTRAL_API_KEY,
      });
    }

    // Initialize Qwen client via OpenRouter if API key is available
    if (process.env.OPENROUTER_API_KEY) {
      this.qwenClient = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
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
      case 'mistral':
        return this.generateWithMistral(context);
      case 'qwen':
        return this.generateWithQwen(context);
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
          content: 'You are an AI email assistant. Generate 3 professional, contextually appropriate email reply suggestions. Each suggestion should be concise (1-3 sentences). IMPORTANT: All suggestions MUST be in English, regardless of the input email language. If the email is in French, Spanish, German, or any other language, translate your understanding and respond in English. You can understand and process JSON formatted email data - parse the JSON structure and extract relevant information to generate appropriate responses. Return ONLY a JSON array of strings, nothing else.',
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

  private async generateWithMistral(context: EmailContext): Promise<SuggestionResponse> {
    if (!this.mistralClient) {
      throw new Error('Mistral API key not configured. Add MISTRAL_API_KEY to .env.local');
    }

    const prompt = this.buildPrompt(context);
    const systemPrompt = 'You are an AI email assistant. Generate 3 professional, contextually appropriate email reply suggestions. Each suggestion should be concise (1-3 sentences). IMPORTANT: All suggestions MUST be in English, regardless of the input email language. If the email is in French, Spanish, German, or any other language, translate your understanding and respond in English. You can understand and process JSON formatted email data - parse the JSON structure and extract relevant information to generate appropriate responses. Return ONLY a JSON array of strings, nothing else.';

    const chatResponse = await this.mistralClient.chat.complete({
      model: 'mistral-small-latest', // Free tier model
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    const rawContent = chatResponse.choices?.[0]?.message?.content || '[]';

    // Handle content which can be string or array of content chunks
    const content = typeof rawContent === 'string'
      ? rawContent
      : Array.isArray(rawContent) && rawContent.length > 0 && 'text' in rawContent[0]
        ? rawContent[0].text
        : '[]';

    // Try to parse JSON from the response
    let suggestions: string[] = [];
    try {
      // Look for JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, create suggestions from the text
      suggestions = [content.trim()];
    }

    return {
      suggestions: Array.isArray(suggestions) ? suggestions : [suggestions],
      provider: 'Mistral Small',
    };
  }

  private async generateWithQwen(context: EmailContext): Promise<SuggestionResponse> {
    if (!this.qwenClient) {
      throw new Error('OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local');
    }

    const prompt = this.buildPrompt(context);

    const completion = await this.qwenClient.chat.completions.create({
      model: 'qwen/qwen3-30b-a3b', // Free Qwen 4B model - Faster but smaller
      messages: [
        {
          role: 'system',
          content: 'You are an AI email assistant. Generate 3 professional, contextually appropriate email reply suggestions. Each suggestion should be concise (1-3 sentences). IMPORTANT: All suggestions MUST be in English, regardless of the input email language. If the email is in French, Spanish, German, or any other language, translate your understanding and respond in English. You can understand and process JSON formatted email data - parse the JSON structure and extract relevant information to generate appropriate responses. Return ONLY a JSON array of strings, nothing else.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';

    // Try to parse JSON from the response
    let suggestions: string[] = [];
    try {
      // First try direct JSON parse
      suggestions = JSON.parse(content);
    } catch (e) {
      // If that fails, look for JSON array in the response
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, split by newlines and filter
          suggestions = content
            .split('\n')
            .filter(line => line.trim().length > 10)
            .slice(0, 3);
        }
      } catch (e2) {
        // Last resort: use the whole content
        suggestions = [content.trim()];
      }
    }

    return {
      suggestions: Array.isArray(suggestions) && suggestions.length > 0
        ? suggestions
        : ['Unable to generate suggestions. Please try again.'],
      provider: 'Qwen 3 (30B)',
    };
  }

  private buildPrompt(context: EmailContext): string {
    let prompt = 'Generate 3 email reply suggestions based on:\n\n';

    // Check if body is JSON format
    let isJsonBody = false;
    if (context.body) {
      try {
        JSON.parse(context.body);
        isJsonBody = true;
      } catch (e) {
        isJsonBody = false;
      }
    }

    if (context.subject) {
      prompt += `Subject: ${context.subject}\n`;
    }

    if (context.body) {
      if (isJsonBody) {
        prompt += `Email Content (JSON format):\n${context.body}\n`;
      } else {
        prompt += `Email Content: ${context.body}\n`;
      }
    }

    if (context.threadHistory && context.threadHistory.length > 0) {
      prompt += `\nPrevious Messages:\n${context.threadHistory.join('\n---\n')}`;
    }

    prompt += '\n\nReturn only a JSON array of 3 suggestion strings.';

    return prompt;
  }
}

export const llmService = new LLMService();