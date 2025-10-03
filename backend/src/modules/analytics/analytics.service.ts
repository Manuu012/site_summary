// analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // 1. Get how many websites a user has visited
  async getUserVisitedWebsitesCount(userId: number) {
    const result = await this.prisma.chatMessage.groupBy({
      by: ['websiteId'],
      where: {
        userId: userId,
      },
      _count: {
        websiteId: true,
      },
    });

    return {
      totalVisitedWebsites: result.length,
      websites: result.map((item) => ({
        websiteId: item.websiteId,
        interactionCount: item._count.websiteId,
      })),
    };
  }

  // 2. Get how many times user visited each website with details
  async getUserWebsiteVisits(userId: number) {
    const visits = await this.prisma.chatMessage.groupBy({
      by: ['websiteId'],
      where: {
        userId: userId,
      },
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
    });

    // Get website details
    const websitesWithDetails = await Promise.all(
      visits.map(async (visit) => {
        const website = await this.prisma.website.findUnique({
          where: { id: visit.websiteId },
          select: {
            id: true,
            url: true,
            title: true,
            crawledAt: true,
          },
        });

        return {
          websiteId: visit.websiteId,
          websiteUrl: website?.url || 'Unknown',
          websiteTitle: website?.title || 'No Title',
          visitCount: visit._count.id,
          lastVisited: visit._max.createdAt,
          firstCrawled: website?.crawledAt,
        };
      }),
    );

    return {
      totalInteractions: visits.reduce(
        (sum, visit) => sum + visit._count.id,
        0,
      ),
      websites: websitesWithDetails.sort((a, b) => b.visitCount - a.visitCount),
    };
  }

  // Additional: Get user's chat statistics
  async getUserChatStats(userId: number) {
    const totalMessages = await this.prisma.chatMessage.count({
      where: { userId: userId },
    });

    const firstInteraction = await this.prisma.chatMessage.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    const lastInteraction = await this.prisma.chatMessage.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      totalMessages,
      firstInteraction: firstInteraction?.createdAt,
      lastInteraction: lastInteraction?.createdAt,
    };
  }
}
