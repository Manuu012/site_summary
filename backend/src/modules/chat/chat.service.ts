// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(data: {
    question: string;
    answer: string;
    userId: number;
    websiteId: number;
  }) {
    return await this.prisma.chatMessage.create({
      data: {
        question: data.question,
        answer: data.answer,
        userId: data.userId,
        websiteId: data.websiteId,
      },
    });
  }

  async updateMessage(messageId: number, answer: string) {
    return await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { answer: answer },
    });
  }

  async getChatHistory(websiteId: number) {
    return await this.prisma.chatMessage.findMany({
      where: { websiteId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUserChats(userId: number) {
    return await this.prisma.chatMessage.findMany({
      where: { userId },
      include: {
        website: {
          select: {
            id: true,
            url: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecentMessages(limit: number = 20) {
    return await this.prisma.chatMessage.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        website: {
          select: {
            id: true,
            url: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
