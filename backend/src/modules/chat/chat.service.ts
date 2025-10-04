// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Saves a new chat message to the database
   * Typically used when a user asks a question, with answer potentially empty initially
   * @param data - Object containing message details
   * @param data.question - The user's question
   * @param data.answer - The AI-generated answer (can be empty initially)
   * @param data.userId - ID of the user who asked the question
   * @param data.websiteId - ID of the website being discussed
   * @returns The created chat message record
   */
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

  /**
   * Updates an existing chat message, typically to add the AI-generated answer
   * Useful for async operations where answer comes after message creation
   * @param messageId - ID of the message to update
   * @param answer - The complete answer to store in the message
   * @returns The updated chat message record
   */
  async updateMessage(messageId: number, answer: string) {
    return await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { answer: answer },
    });
  }

  /**
   * Retrieves complete chat history for a specific website
   * Shows all conversations that happened around a particular website
   * @param websiteId - ID of the website to get chat history for
   * @returns Array of chat messages with user details, ordered chronologically
   */
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

  /**
   * Retrieves all chat messages for a specific user across all websites
   * Shows user's personal chat history and which websites they've interacted with
   * @param userId - ID of the user to get chats for
   * @returns Array of user's chat messages with website details, newest first
   */
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

  /**
   * Retrieves recent chat messages from across the system
   * Useful for admin dashboards or activity monitoring
   * @param limit - Maximum number of messages to return (default: 20)
   * @returns Array of recent chat messages with user and website details
   */
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
