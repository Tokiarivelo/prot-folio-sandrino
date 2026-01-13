import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  // Skills
  async createSkill(createSkillDto: CreateSkillDto) {
    return this.prisma.skill.create({
      data: createSkillDto,
      include: {
        category: true,
      },
    });
  }

  async findAllSkills() {
    return this.prisma.skill.findMany({
      include: {
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findSkillsByCategory(categoryId: string) {
    return this.prisma.skill.findMany({
      where: { categoryId },
      orderBy: { order: 'asc' },
    });
  }

  async findOneSkill(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async updateSkill(id: string, updateSkillDto: UpdateSkillDto) {
    try {
      return await this.prisma.skill.update({
        where: { id },
        data: updateSkillDto,
        include: {
          category: true,
        },
      });
    } catch {
      throw new NotFoundException('Skill not found');
    }
  }

  async removeSkill(id: string) {
    try {
      return await this.prisma.skill.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Skill not found');
    }
  }

  // Skill Categories
  async createCategory(createSkillCategoryDto: CreateSkillCategoryDto) {
    return this.prisma.skillCategory.create({
      data: createSkillCategoryDto,
    });
  }

  async findAllCategories() {
    return this.prisma.skillCategory.findMany({
      include: {
        skills: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOneCategory(id: string) {
    const category = await this.prisma.skillCategory.findUnique({
      where: { id },
      include: {
        skills: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateSkillCategoryDto: UpdateSkillCategoryDto,
  ) {
    try {
      return await this.prisma.skillCategory.update({
        where: { id },
        data: updateSkillCategoryDto,
      });
    } catch {
      throw new NotFoundException('Category not found');
    }
  }

  async removeCategory(id: string) {
    try {
      return await this.prisma.skillCategory.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Category not found');
    }
  }
}
