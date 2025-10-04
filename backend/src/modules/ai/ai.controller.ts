/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { AIService } from './ai.service';
import { CrawlerService } from '../crawler/crawler.service';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly crawlerService: CrawlerService,
  ) {}
}
