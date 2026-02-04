import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // Skills
  async createSkill(
    createSkillDto: CreateSkillDto,
    file?: Express.Multer.File,
  ) {
    this.logger.log('=== CREATE SKILL ===');
    this.logger.log(`DTO: ${JSON.stringify(createSkillDto)}`);

    let iconUrl = createSkillDto.iconUrl;

    // If a file is uploaded, use it for iconUrl
    if (file) {
      this.logger.log(`Uploading icon file: ${file.originalname}`);
      iconUrl = await this.storage.uploadFile(file, 'skills');
      this.logger.log(`Icon uploaded: ${iconUrl}`);
    }

    const skill = await this.prisma.skill.create({
      data: {
        ...createSkillDto,
        iconUrl,
      },
      include: {
        category: true,
      },
    });

    this.logger.log(`Skill created with ID: ${skill.id}`);
    return skill;
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

  async updateSkill(
    id: string,
    updateSkillDto: UpdateSkillDto,
    file?: Express.Multer.File,
  ) {
    this.logger.log(`=== UPDATE SKILL ${id} ===`);

    let iconUrl = updateSkillDto.iconUrl;

    // If a file is uploaded, use it for iconUrl
    if (file) {
      this.logger.log(`Uploading new icon file: ${file.originalname}`);
      iconUrl = await this.storage.uploadFile(file, 'skills');
      this.logger.log(`Icon uploaded: ${iconUrl}`);
    }

    try {
      return await this.prisma.skill.update({
        where: { id },
        data: {
          ...updateSkillDto,
          iconUrl,
        },
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
  async createCategory(
    createSkillCategoryDto: CreateSkillCategoryDto,
    file?: Express.Multer.File,
  ) {
    this.logger.log('=== CREATE SKILL CATEGORY ===');
    this.logger.log(`DTO: ${JSON.stringify(createSkillCategoryDto)}`);

    let iconUrl = createSkillCategoryDto.iconUrl;

    // If a file is uploaded, use it for iconUrl
    if (file) {
      this.logger.log(`Uploading category icon file: ${file.originalname}`);
      iconUrl = await this.storage.uploadFile(file, 'skill-categories');
      this.logger.log(`Category icon uploaded: ${iconUrl}`);
    }

    const category = await this.prisma.skillCategory.create({
      data: {
        ...createSkillCategoryDto,
        iconUrl,
      },
    });

    this.logger.log(`Category created with ID: ${category.id}`);
    return category;
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
    file?: Express.Multer.File,
  ) {
    this.logger.log(`=== UPDATE SKILL CATEGORY ${id} ===`);

    let iconUrl = updateSkillCategoryDto.iconUrl;

    // If a file is uploaded, use it for iconUrl
    if (file) {
      this.logger.log(`Uploading new category icon file: ${file.originalname}`);
      iconUrl = await this.storage.uploadFile(file, 'skill-categories');
      this.logger.log(`Category icon uploaded: ${iconUrl}`);
    }

    try {
      return await this.prisma.skillCategory.update({
        where: { id },
        data: {
          ...updateSkillCategoryDto,
          iconUrl,
        },
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
