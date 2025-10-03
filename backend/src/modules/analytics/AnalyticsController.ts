// analytics.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Endpoint 1: How many websites user visited
  @Get('user/:userId/visited-websites-count')
  async getUserVisitedWebsitesCount(@Param('userId') userId: string) {
    console.log('🚀 GET /analytics/user/:userId/visited-websites-count');
    console.log('📝 User ID:', userId);
    console.log('⏰ Timestamp:', new Date().toISOString());

    const userIdNum = parseInt(userId);
    console.log('🔢 Parsed User ID:', userIdNum);

    const result =
      await this.analyticsService.getUserVisitedWebsitesCount(userIdNum);

    console.log('✅ Response data:', JSON.stringify(result, null, 2));
    console.log('--- End of visited-websites-count ---');

    return result;
  }

  // Endpoint 2: How many times visited each website with details
  @Get('user/:userId/website-visits')
  async getUserWebsiteVisits(@Param('userId') userId: string) {
    console.log('🚀 GET /analytics/user/:userId/website-visits');
    console.log('📝 User ID:', userId);
    console.log('⏰ Timestamp:', new Date().toISOString());

    const userIdNum = parseInt(userId);
    console.log('🔢 Parsed User ID:', userIdNum);

    const result = await this.analyticsService.getUserWebsiteVisits(userIdNum);

    console.log('✅ Response data length:', result.websites?.length || 0);
    console.log('📊 Total interactions:', result.totalInteractions);
    console.log('--- End of website-visits ---');

    return result;
  }

  // Additional: Combined user analytics
  @Get('user/:userId/summary')
  async getUserAnalyticsSummary(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId);

    const [visitedWebsites, websiteVisits, chatStats] = await Promise.all([
      this.analyticsService.getUserVisitedWebsitesCount(userIdNum),
      this.analyticsService.getUserWebsiteVisits(userIdNum),
      this.analyticsService.getUserChatStats(userIdNum),
    ]);

    return {
      user: { id: userIdNum },
      summary: {
        totalWebsitesVisited: visitedWebsites.totalVisitedWebsites,
        totalChatInteractions: chatStats.totalMessages,
        firstActivity: chatStats.firstInteraction,
        lastActivity: chatStats.lastInteraction,
      },
      websiteStats: websiteVisits,
      chatStats: chatStats,
    };
  }
}
