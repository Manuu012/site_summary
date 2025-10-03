/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';

@Module({
  controllers: [CrawlerController],
  providers: [CrawlerService],
  exports: [CrawlerService], // Make sure this line exists
})
export class CrawlerModule {}
