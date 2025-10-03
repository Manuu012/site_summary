import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { CrawlerModule } from '../crawler/crawler.module'; // This import is crucial

@Module({
  imports: [CrawlerModule], // Add CrawlerModule here
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AiModule {}
