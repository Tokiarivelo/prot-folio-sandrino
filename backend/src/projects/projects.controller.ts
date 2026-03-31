import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectLinkDto } from './dto/create-project-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectStatus } from '@prisma/client';
import {
  ProjectResponseDto,
  PaginatedProjectsDto,
  ProjectLinkDto,
} from './dto/project-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create project (Admin)',
    description: 'Creates a new project record.',
  })
  @ApiCreatedResponse({
    description: 'Project created',
    type: ProjectResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.create(createProjectDto, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List projects (Public/Auth)',
    description:
      'Returns a paginated list of projects. Authenticated users see their own projects.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProjectStatus,
    example: 'PUBLISHED',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of projects per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    type: String,
    description:
      'Filter by tag slug (e.g. "react", "nextjs"). Get available tags from GET /tags.',
    example: 'react',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: 'Filter projects by owner username',
    example: 'johndoe',
  })
  @ApiQuery({
    name: 'targetUserId',
    required: false,
    type: String,
    description: 'Filter projects by owner user ID',
    example: 'user-id-1234',
  })
  @ApiOkResponse({
    description: 'Paginated list of projects',
    type: PaginatedProjectsDto,
  })
  findAll(
    @Query('status') status?: ProjectStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('username') username?: string,
    @Query('targetUserId') targetUserId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.projectsService.findAll(
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      tag,
      user,
      username,
      targetUserId,
    );
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get project by slug (Public)',
    description:
      'Retrieves a single project by its URL-safe slug. Use this endpoint for project detail pages. Includes all media, links, and tags.',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-safe slug of the project',
    example: 'e-commerce-platform',
  })
  @ApiOkResponse({ description: 'Project found', type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by ID (Public)',
    description:
      'Retrieves a single project by its UUID. Includes media, links, and tags.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the project',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Project found', type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a project (Admin)',
    description:
      'Partially updates a project. If `tags` is provided, replaces all existing tags. Omit `tags` to leave existing tags unchanged.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the project' })
  @ApiOkResponse({ description: 'Project updated', type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a project (Admin)',
    description:
      'Permanently deletes a project and all associated media (files from Supabase Storage are also deleted), links, and tags.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the project' })
  @ApiNoContentResponse({ description: 'Project deleted' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.remove(id, user);
  }

  // Project Links
  @Post(':id/links')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add a link to a project (Admin)',
    description:
      'Adds a new link (GitHub, demo, docs, etc.) to a project. Use the `type` field to control which icon is rendered in the UI.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the project' })
  @ApiCreatedResponse({ description: 'Link created', type: ProjectLinkDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  addLink(
    @Param('id') projectId: string,
    @Body() dto: CreateProjectLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.addLink(projectId, dto, user);
  }

  @Delete(':id/links/:linkId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a link from a project (Admin)',
    description: 'Permanently deletes a specific link from a project.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the project' })
  @ApiParam({
    name: 'linkId',
    description: 'UUID of the project link to delete',
  })
  @ApiNoContentResponse({ description: 'Link deleted' })
  @ApiNotFoundResponse({ description: 'Project or link not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  removeLink(
    @Param('id') projectId: string,
    @Param('linkId') linkId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.removeLink(projectId, linkId, user);
  }
}
