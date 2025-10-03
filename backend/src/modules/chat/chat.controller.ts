// chat.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AIService } from '../ai/ai.service';
import { CrawlerService } from '../crawler/crawler.service';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private aiService: AIService,
    private crawlerService: CrawlerService,
  ) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askQuestion(
    @Body()
    body: {
      question: string;
      websiteId: number;
      websiteUrl?: string;
      userId: number;
    },
  ) {
    try {
      let website;

      // Get or crawl website
      if (body.websiteId) {
        website = await this.crawlerService.getWebsiteById(body.websiteId);
      }

      if (!website && body.websiteUrl) {
        website = await this.crawlerService.crawlWebsite(body.websiteUrl);
        body.websiteId = website.id;
      }

      if (!website) {
        throw new Error(
          'Website not found. Please provide a valid website URL.',
        );
      }

      // Get AI response and save to database
      const answer = await this.aiService.answerQuestion(
        body.question,
        website.content,
        body.userId,
        body.websiteId,
        this.chatService,
      );

      return {
        success: true,
        data: {
          question: body.question,
          answer: answer,
          websiteId: body.websiteId,
          userId: body.userId,
        },
        message: 'Question answered successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('history')
  async getChatHistory(@Body() body: { websiteId: number; userId: number }) {
    try {
      const history = await this.chatService.getChatHistory(body.websiteId);
      return {
        success: true,
        data: history,
        message: 'Chat history retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
