/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('crawl')
  @HttpCode(HttpStatus.CREATED)
  async crawlWebsite(@Body() body: { url: string }) {
    if (!body.url) {
      return {
        success: false,
        message: 'URL is required',
      };
    }

    try {
      const result = await this.crawlerService.crawlWebsite(body.url);
      return {
        success: true,
        message: 'Website crawled successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('websites')
  async getWebsites() {
    try {
      const websites = await this.crawlerService.getWebsites();
      return {
        success: true,
        data: websites,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      service: 'Crawler',
      timestamp: new Date().toISOString(),
    };
  }
}
