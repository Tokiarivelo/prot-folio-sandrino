import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateContactMessageDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    let recipientId = dto.recipientId;

    if (!recipientId) {
      const firstAdmin = await this.prisma.adminUser.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      recipientId = firstAdmin?.id;
    }

    return this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        userId: recipientId,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(
    user: AuthenticatedUser,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ContactMessageWhereInput = {};

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (user.role !== 'ADMIN') {
      where.userId = user.userId;
    }

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.count({
        where: { ...where, isRead: false },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (user.role !== 'ADMIN' && message.userId !== user.userId) {
      throw new ForbiddenException('You do not have access to this message');
    }

    return message;
  }

  async markAsRead(id: string, user: AuthenticatedUser) {
    await this.findOne(id, user);

    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    await this.findOne(id, user);

    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }
}
