/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as cheerio from 'cheerio';
import axios from 'axios';

@Injectable()
export class CrawlerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crawls a website, extracts content, and stores it in the database
   * Uses upsert operation to update existing websites or create new ones
   * @param url - The website URL to crawl
   * @returns The created/updated website record
   * @throws HttpException for invalid URLs or crawl failures
   */
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

  /**
   * Retrieves all crawled websites from the database
   * @returns Array of website records, most recently crawled first
   */
  async getWebsites(): Promise<any[]> {
    return this.prisma.website.findMany({
      orderBy: { crawledAt: 'desc' },
    });
  }

  /**
   * Validates if a string is a properly formatted URL
   * @param url - The URL string to validate
   * @returns Boolean indicating if the URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves a website by its URL
   * @param url - The website URL to search for
   * @returns The website record if found
   * @throws HttpException if website not found or query fails
   */
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

  /**
   * Retrieves a website by its database ID with extensive debugging
   * Handles type conversion and validation for ID parameter
   * @param id - The website ID (string or number)
   * @returns The website record if found
   * @throws HttpException for invalid ID or website not found
   */
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
