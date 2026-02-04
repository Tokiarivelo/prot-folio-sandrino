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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.createSkill(createSkillDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills (Public)' })
  findAllSkills(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      return this.skillsService.findSkillsByCategory(categoryId);
    }
    return this.skillsService.findAllSkills();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get skill by ID (Public)' })
  findOneSkill(@Param('id') id: string) {
    return this.skillsService.findOneSkill(id);
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
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.updateSkill(id, updateSkillDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill (Admin)' })
  removeSkill(@Param('id') id: string) {
    return this.skillsService.removeSkill(id);
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
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.createCategory(createSkillCategoryDto, file);
  }

  @Get('categories/all')
  @ApiOperation({ summary: 'Get all skill categories with skills (Public)' })
  findAllCategories() {
    return this.skillsService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get skill category by ID (Public)' })
  findOneCategory(@Param('id') id: string) {
    return this.skillsService.findOneCategory(id);
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
    @Param('id') id: string,
    @Body() updateSkillCategoryDto: UpdateSkillCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.skillsService.updateCategory(id, updateSkillCategoryDto, file);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill category (Admin)' })
  removeCategory(@Param('id') id: string) {
    return this.skillsService.removeCategory(id);
  }
}
