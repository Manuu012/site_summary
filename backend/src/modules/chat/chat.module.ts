// chat.module.ts
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AIService } from '../ai/ai.service';
import { CrawlerService } from '../crawler/crawler.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AIService, CrawlerService, PrismaService],
})
export class ChatModule {}
