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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create skill (Admin)' })
  createSkill(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.createSkill(createSkillDto);
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
  @ApiOperation({ summary: 'Update skill (Admin)' })
  updateSkill(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.updateSkill(id, updateSkillDto);
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
  @ApiOperation({ summary: 'Create skill category (Admin)' })
  createCategory(@Body() createSkillCategoryDto: CreateSkillCategoryDto) {
    return this.skillsService.createCategory(createSkillCategoryDto);
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
  @ApiOperation({ summary: 'Update skill category (Admin)' })
  updateCategory(
    @Param('id') id: string,
    @Body() updateSkillCategoryDto: UpdateSkillCategoryDto,
  ) {
    return this.skillsService.updateCategory(id, updateSkillCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill category (Admin)' })
  removeCategory(@Param('id') id: string) {
    return this.skillsService.removeCategory(id);
  }
}
