import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(
    createContactMessageDto: CreateContactMessageDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { name, email, subject, message } = createContactMessageDto;

    // Save message to database
    const contactMessage = await this.prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || 'Contact Form Submission',
        message,
        ipAddress,
        userAgent,
      },
    });

    // Send notification email to admin
    try {
      await this.emailService.sendContactNotification(
        name,
        email,
        subject || 'Contact Form Submission',
        message,
      );
    } catch (error) {
      console.error('Failed to send admin notification:', error);
    }

    // Send confirmation email to user
    try {
      await this.emailService.sendContactConfirmation(name, email);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }

    return {
      success: true,
      message: 'Your message has been sent successfully',
      id: contactMessage.id,
    };
  }

  async findAll(page = 1, limit = 20, isRead?: boolean) {
    const skip = (page - 1) * limit;

    const where = isRead !== undefined ? { isRead } : {};

    const [messages, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async markAsRead(id: string) {
    try {
      return await this.prisma.contactMessage.update({
        where: { id },
        data: { isRead: true },
      });
    } catch {
      throw new NotFoundException('Message not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.contactMessage.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Message not found');
    }
  }
}
