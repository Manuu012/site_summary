/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as cheerio from 'cheerio';
import axios from 'axios';

@Injectable()
export class CrawlerService {
  constructor(private prisma: PrismaService) {}

  async crawlWebsite(url: string): Promise<any> {
    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new HttpException('Invalid URL', HttpStatus.BAD_REQUEST);
      }

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CrawlerBot/1.0)',
        },
      });

      const $ = cheerio.load(response.data);

      // Extract content
      const title = $('title').text() || 'No Title';
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

      // Extract links and images
      const links: string[] = [];
      const images: string[] = [];

      $('a[href]').each((i, element) => {
        const href = $(element).attr('href');
        if (href && this.isValidUrl(href)) {
          links.push(href);
        }
      });

      $('img[src]').each((i, element) => {
        const src = $(element).attr('src');
        if (src) images.push(src);
      });

      // Save to database
      const website = await this.prisma.website.upsert({
        where: { url },
        update: {
          title,
          content: bodyText.substring(0, 10000), // Limit content size
          metadata: {
            links: links.slice(0, 50),
            images: images.slice(0, 20),
            lastCrawled: new Date(),
          },
          crawledAt: new Date(),
        },
        create: {
          url,
          title,
          content: bodyText.substring(0, 10000),
          metadata: {
            links: links.slice(0, 50),
            images: images.slice(0, 20),
            lastCrawled: new Date(),
          },
        },
      });

      return website;
    } catch (error) {
      throw new HttpException(
        `Failed to crawl website: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getWebsites(): Promise<any[]> {
    return this.prisma.website.findMany({
      orderBy: { crawledAt: 'desc' },
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async getWebsiteByUrl(url: string): Promise<any> {
    try {
      const website = await this.prisma.website.findUnique({
        where: { url },
      });

      return website;
    } catch (error) {
      throw new HttpException(
        `Failed to get website: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getWebsiteById(id: number): Promise<any> {
    try {
      console.log(
        '🔍 [DEBUG] getWebsiteById called with id:',
        id,
        'Type:',
        typeof id,
      );

      // Convert id to number to ensure it's the correct type
      const websiteId = Number(id);

      if (isNaN(websiteId)) {
        throw new HttpException(
          `Invalid website ID: ${id}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(
        '🔍 [DEBUG] Converted websiteId:',
        websiteId,
        'Type:',
        typeof websiteId,
      );

      const website = await this.prisma.website.findUnique({
        where: { id: websiteId }, // Use the converted number
      });

      console.log('🔍 [DEBUG] Database query result:', website);

      if (!website) {
        throw new HttpException('Website not found', HttpStatus.NOT_FOUND);
      }

      return website;
    } catch (error) {
      console.error('💥 [DEBUG] Error in getWebsiteById:', error);
      throw new HttpException(
        `Failed to get website: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
