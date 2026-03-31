import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiQuery,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

export class ContactMessageResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Jane Smith' })
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Project Inquiry' })
  subject: string | null;

  @ApiProperty({
    example: "Hi, I'd love to discuss a potential project with you.",
  })
  message: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress: string | null;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class ContactSubmitResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: 'Message received! We will get back to you within 24 hours.',
  })
  message: string;
}

export class PaginatedContactMessagesDto {
  @ApiProperty({ type: [ContactMessageResponseDto] })
  data: ContactMessageResponseDto[];

  @ApiProperty({ example: { total: 42, page: 1, limit: 20, totalPages: 3 } })
  meta: { total: number; page: number; limit: number; totalPages: number };

  @ApiProperty({ example: 5, description: 'Total number of unread messages' })
  unreadCount: number;
}

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit contact form (Public)',
    description:
      'Submits a contact form message. On success, sends a confirmation email to the sender and a notification email to the admin. The sender IP and user agent are captured for spam detection. Rate limited to 5 submissions per minute per IP.',
  })
  @ApiCreatedResponse({
    description: 'Message submitted successfully',
    type: ContactSubmitResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation error (missing required fields, invalid email)',
  })
  create(
    @Body() createContactMessageDto: CreateContactMessageDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.ip || req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'];
    return this.contactService.create(
      createContactMessageDto,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List contact messages (Admin)',
    description:
      'Returns all contact form submissions with pagination. Filter by read/unread status. Ordered by creation date descending.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: Boolean,
    description: 'Filter by read status. Omit to return all.',
    example: false,
  })
  @ApiOkResponse({
    description: 'Paginated contact messages with unread count',
    type: PaginatedContactMessagesDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isRead') isRead?: string,
  ) {
    return this.contactService.findAll(
      user,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      isRead !== undefined ? isRead === 'true' : undefined,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get contact message by ID (Admin)',
    description:
      'Retrieves a single contact message. Does not automatically mark it as read.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the contact message' })
  @ApiOkResponse({
    description: 'Contact message',
    type: ContactMessageResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.contactService.findOne(id, user);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark message as read (Admin)',
    description:
      'Sets the isRead flag to true on a contact message. Idempotent — calling multiple times has no additional effect.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the contact message' })
  @ApiOkResponse({
    description: 'Message marked as read',
    type: ContactMessageResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.contactService.markAsRead(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete contact message (Admin)',
    description:
      'Permanently deletes a contact message. This action is irreversible.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the contact message' })
  @ApiNoContentResponse({ description: 'Message deleted' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.contactService.remove(id, user);
  }
}
