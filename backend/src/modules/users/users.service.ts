import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUserWithEmail(
    firstName: string,
    lastName: string,
    email: string,
    avatar?: string,
  ) {
    try {
      // Check if user already exists with this email
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // If user exists, return the existing user
        return existingUser;
      }

      // Create new user
      const user = await this.prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          avatar,
        },
      });

      return user;
    } catch (error) {
      throw new HttpException(
        `Failed to create user: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return users;
    } catch (error) {
      throw new HttpException(
        `Failed to get users: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          messages: {
            include: {
              website: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { messages: true },
          },
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw new HttpException(
        `Failed to get user: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw new HttpException(
        `Failed to get user: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
