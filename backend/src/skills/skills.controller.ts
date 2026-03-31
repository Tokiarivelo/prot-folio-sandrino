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
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // Skills endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create skill with optional icon upload (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: { type: 'string', format: 'binary', description: 'Icon file' },
        categoryId: { type: 'string' },
        name: { type: 'string' },
        level: {
          type: 'string',
          enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        },
        yearsExperience: { type: 'integer' },
        iconUrl: { type: 'string', description: 'URL if not uploading file' },
        order: { type: 'integer' },
      },
      required: ['categoryId', 'name', 'level'],
    },
  })
  createSkill(
    @Body() createSkillDto: CreateSkillDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.createSkill(createSkillDto, user.userId, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all skills (Public/Auth)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'username', required: false, type: String })
  @ApiQuery({ name: 'targetUserId', required: false, type: String })
  @ApiOkResponse({ description: 'Array of skills' })
  findAllSkills(
    @Query('categoryId') categoryId?: string,
    @Query('username') username?: string,
    @Query('targetUserId') targetUserId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    if (categoryId) {
      return this.skillsService.findSkillsByCategory(
        categoryId,
        user,
        username,
        targetUserId,
      );
    }
    return this.skillsService.findAllSkills(user, username, targetUserId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get skill by ID (Public/Auth)' })
  findOneSkill(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.skillsService.findOneSkill(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update skill with optional icon upload (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: { type: 'string', format: 'binary', description: 'Icon file' },
        categoryId: { type: 'string' },
        name: { type: 'string' },
        level: {
          type: 'string',
          enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        },
        yearsExperience: { type: 'integer' },
        iconUrl: { type: 'string', description: 'URL if not uploading file' },
        order: { type: 'integer' },
      },
    },
  })
  updateSkill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.updateSkill(id, updateSkillDto, user, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill (Admin)' })
  removeSkill(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.skillsService.removeSkill(id, user);
  }

  // Skill Categories endpoints
  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create skill category with optional icon upload (Admin)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: { type: 'string', format: 'binary', description: 'Icon file' },
        name: { type: 'string' },
        iconUrl: { type: 'string', description: 'URL if not uploading file' },
        order: { type: 'integer' },
      },
      required: ['name'],
    },
  })
  createCategory(
    @Body() createSkillCategoryDto: CreateSkillCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.createCategory(
      createSkillCategoryDto,
      user.userId,
      file,
    );
  }

  @Get('categories/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all skill categories with skills (Public/Auth)',
  })
  @ApiQuery({ name: 'username', required: false, type: String })
  @ApiQuery({ name: 'targetUserId', required: false, type: String })
  @ApiOkResponse({
    description: 'Array of skill categories with nested skills',
  })
  findAllCategories(
    @Query('username') username?: string,
    @Query('targetUserId') targetUserId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.skillsService.findAllCategories(user, username, targetUserId);
  }

  @Get('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get skill category by ID (Public/Auth)' })
  findOneCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.skillsService.findOneCategory(id, user);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update skill category with optional icon upload (Admin)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: { type: 'string', format: 'binary', description: 'Icon file' },
        name: { type: 'string' },
        iconUrl: { type: 'string', description: 'URL if not uploading file' },
        order: { type: 'integer' },
      },
    },
  })
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSkillCategoryDto: UpdateSkillCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.updateCategory(
      id,
      updateSkillCategoryDto,
      user,
      file,
    );
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill category (Admin)' })
  removeCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.skillsService.removeCategory(id, user);
  }
}
