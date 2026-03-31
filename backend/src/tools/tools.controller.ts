import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolResponseDto } from './dto/tool-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@ApiTags('tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOperation({
    summary: 'List tools (Public/Auth)',
    description:
      'Returns all tools ordered by `order` ascending. Pass `activeOnly=true` to filter only visible tools (default for the public portfolio). Authenticated users see their own tools.',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter to active tools only',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: 'Filter tools by owner username',
  })
  @ApiQuery({
    name: 'targetUserId',
    required: false,
    type: String,
    description: 'Filter tools by owner user ID',
  })
  @ApiOkResponse({ description: 'Array of tools', type: [ToolResponseDto] })
  findAll(
    @Query('activeOnly') activeOnly?: string,
    @Query('username') username?: string,
    @Query('targetUserId') targetUserId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.toolsService.findAll(
      activeOnly === 'true',
      user,
      username,
      targetUserId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOperation({ summary: 'Get tool by id (Public/Auth)' })
  @ApiOkResponse({ description: 'Tool record', type: ToolResponseDto })
  @ApiNotFoundResponse({ description: 'Tool not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.toolsService.findOne(id, user);
  }

  // ── Admin ────────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a tool (Admin)',
    description:
      'Upload a tool icon and create the tool record. Accepts `multipart/form-data` with an `icon` file field.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'icon'],
      properties: {
        name: { type: 'string', example: 'React' },
        order: { type: 'integer', example: 0 },
        isActive: { type: 'boolean', example: true },
        icon: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Tool created', type: ToolResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation error or missing icon file',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  create(
    @Body() dto: CreateToolDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.toolsService.create(dto, user.userId, file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a tool (Admin)',
    description:
      'Update tool metadata and optionally replace the icon. All fields are optional.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        order: { type: 'integer' },
        isActive: { type: 'boolean' },
        icon: {
          type: 'string',
          format: 'binary',
          description: 'New icon (optional)',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Tool updated', type: ToolResponseDto })
  @ApiNotFoundResponse({ description: 'Tool not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateToolDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.toolsService.update(id, dto, user, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tool (Admin)' })
  @ApiNoContentResponse({ description: 'Tool deleted' })
  @ApiNotFoundResponse({ description: 'Tool not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.toolsService.remove(id, user);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reorder tools (Admin)',
    description: 'Bulk updates the display order of multiple tools.',
  })
  @ApiOkResponse({ description: 'Tools reordered' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  reorder(
    @Body() dto: { reorderings: { id: string; order: number }[] },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.toolsService.reorder(dto.reorderings, user.userId);
  }
}
