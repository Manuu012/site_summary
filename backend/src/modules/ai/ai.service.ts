import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class AIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.HUGGING_FACE_API_KEY;

    if (!apiKey) {
      console.warn(
        'HUGGING_FACE_API_KEY not configured - using mock responses',
      );
      return;
    }

    try {
      this.client = new OpenAI({
        baseURL: 'https://router.huggingface.co/v1',
        apiKey: apiKey,
      });
      console.log('✅ Hugging Face Inference API client initialized');
    } catch (error) {
      console.error('Failed to initialize Hugging Face client:', error);
    }
  }

  /**
   * Processes a user question using AI and returns an answer
   * @param question - The user's question
   * @param crawledContent - Website content for context
   * @param userId - ID of the user asking the question
   * @param websiteId - ID of the website being queried
   * @param chatService - Service for saving chat messages
   * @returns AI-generated answer or fallback message
   */
  async answerQuestion(
    question: string,
    crawledContent: string,
    userId: number,
    websiteId: number,
    chatService: ChatService,
  ): Promise<string> {
    console.log('🔍 [DEBUG] Starting AI answerQuestion');

    // First, create a chat message with empty answer
    let chatMessage;
    try {
      chatMessage = await chatService.saveMessage({
        question: question,
        answer: '', // Empty initially
        userId: userId,
        websiteId: websiteId,
      });
      console.log('💾 [DEBUG] Chat message created with ID:', chatMessage.id);
    } catch (error) {
      console.error('💥 [DEBUG] Failed to save chat message:', error);
    }

    if (!this.client) {
      // Update the saved message with mock response
      return '';
    }

    try {
      const context = this.simpleExtract(crawledContent);

      const chatCompletion = await this.client.chat.completions.create({
        model: 'meta-llama/Llama-3.3-70B-Instruct:groq',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant... WEBSITE CONTEXT: ${context}`,
          },
          { role: 'user', content: question },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      console.log('✅ [DEBUG] Groq API call successful');
      const answer = chatCompletion.choices[0]?.message?.content;
      console.log('🤖 [DEBUG] LLM Response:', answer);
      return answer || 'Currently unavailable. Please try again later.';
    } catch (error: any) {
      console.error('💥 [DEBUG] AI API Error:', error);

      return 'Currently unavailable. Please try again later.';
    }
  }

  private simpleExtract(content: string): string {
    // Extract first 2000 characters to stay within token limits
    return content.substring(0, 2000);
  }

  /**
   * Checks the health/status of the AI service
   * @returns Object containing status and details
   */
  async healthCheck(): Promise<{ status: string; details?: string }> {
    if (!process.env.HUGGING_FACE_API_KEY) {
      return {
        status: 'WARNING',
        details: 'HUGGING_FACE_API_KEY not configured - using mock responses',
      };
    }

    if (!this.client) {
      return {
        status: 'ERROR',
        details: 'Hugging Face client not initialized',
      };
    }

    try {
      // Test the API with a simple request
      await this.client.chat.completions.create({
        model: 'meta-llama/Llama-3.3-70B-Instruct:groq',
        messages: [{ role: 'user', content: 'Say "OK" if working.' }],
        max_tokens: 5,
      });

      return {
        status: 'OK',
        details: 'Hugging Face Inference API is accessible',
      };
    } catch (error) {
      return {
        status: 'WARNING',
        details: `Hugging Face API test failed: ${error.message}`,
      };
    }
  }
}
