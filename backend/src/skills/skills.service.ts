import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

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
    userId: string,
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
        userId,
        iconUrl,
      },
      include: {
        category: true,
      },
    });

    this.logger.log(`Skill created with ID: ${skill.id}`);
    return skill;
  }

  async findAllSkills(
    user?: AuthenticatedUser,
    username?: string,
    targetUserId?: string,
  ) {
    if (!user && !username && !targetUserId) {
      return [];
    }

    const where: Prisma.SkillWhereInput = {};

    // Base filter for ownership
    if (targetUserId) {
      where.userId = targetUserId;
    } else if (username) {
      where.owner = { username };
    }

    // Role-based restrictions
    if (user) {
      if (user.role !== 'ADMIN') {
        where.userId = user.userId;
        delete where.owner;
      }
    } else {
      // Public requests
      const ownerFilter = (where.owner as Prisma.AdminUserWhereInput) || {};
      where.owner = {
        ...ownerFilter,
        isPublic: true,
      };
    }

    return this.prisma.skill.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findSkillsByCategory(
    categoryId: string,
    user?: AuthenticatedUser,
    username?: string,
    targetUserId?: string,
  ) {
    if (!user && !username && !targetUserId) {
      return [];
    }

    const where: Prisma.SkillWhereInput = { categoryId };

    // Base filter for ownership
    if (targetUserId) {
      where.userId = targetUserId;
    } else if (username) {
      where.owner = { username };
    }

    // Role-based restrictions
    if (user) {
      if (user.role !== 'ADMIN') {
        where.userId = user.userId;
        delete where.owner;
      }
    } else {
      // Public requests
      const ownerFilter = (where.owner as Prisma.AdminUserWhereInput) || {};
      where.owner = {
        ...ownerFilter,
        isPublic: true,
      };
    }

    return this.prisma.skill.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async findOneSkill(id: string, user?: AuthenticatedUser) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (user && user.role !== 'ADMIN' && skill.userId !== user.userId) {
      throw new ForbiddenException('You do not own this skill');
    }

    return skill;
  }

  async updateSkill(
    id: string,
    updateSkillDto: UpdateSkillDto,
    user: AuthenticatedUser,
    file?: Express.Multer.File,
  ) {
    this.logger.log(`=== UPDATE SKILL ${id} ===`);

    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    if (user.role !== 'ADMIN' && skill.userId !== user.userId) {
      throw new ForbiddenException('You do not own this skill');
    }

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
      throw new NotFoundException('Skill refresh failed');
    }
  }

  async removeSkill(id: string, user: AuthenticatedUser) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    if (user.role !== 'ADMIN' && skill.userId !== user.userId) {
      throw new ForbiddenException('You do not own this skill');
    }

    try {
      return await this.prisma.skill.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Skill deletion failed');
    }
  }

  // Skill Categories
  async createCategory(
    createSkillCategoryDto: CreateSkillCategoryDto,
    userId: string,
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
        userId,
        iconUrl,
      },
    });

    this.logger.log(`Category created with ID: ${category.id}`);
    return category;
  }

  async findAllCategories(
    user?: AuthenticatedUser,
    username?: string,
    targetUserId?: string,
  ) {
    if (!user && !username && !targetUserId) {
      return [];
    }

    const where: Prisma.SkillCategoryWhereInput = {};
    let subWhere: Prisma.SkillWhereInput = {};

    // Base filter for ownership
    if (targetUserId) {
      where.userId = targetUserId;
      subWhere = { userId: targetUserId };
    } else if (username) {
      where.owner = { username };
      subWhere = { owner: { username } };
    }

    // Role-based restrictions
    if (user) {
      if (user.role !== 'ADMIN') {
        where.userId = user.userId;
        subWhere = { userId: user.userId };
        delete where.owner;
        delete subWhere.owner;
      }
    } else {
      // Public requests
      const ownerFilter = (where.owner as Prisma.AdminUserWhereInput) || {};
      where.owner = {
        ...ownerFilter,
        isPublic: true,
      };

      const subOwnerFilter =
        (subWhere.owner as Prisma.AdminUserWhereInput) || {};
      subWhere.owner = {
        ...subOwnerFilter,
        isPublic: true,
      };
    }

    return this.prisma.skillCategory.findMany({
      where,
      include: {
        skills: {
          where: subWhere,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOneCategory(id: string, user?: AuthenticatedUser) {
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

    if (user && user.role !== 'ADMIN' && category.userId !== user.userId) {
      throw new ForbiddenException('You do not own this category');
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateSkillCategoryDto: UpdateSkillCategoryDto,
    user: AuthenticatedUser,
    file?: Express.Multer.File,
  ) {
    this.logger.log(`=== UPDATE SKILL CATEGORY ${id} ===`);

    const category = await this.prisma.skillCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');

    if (user.role !== 'ADMIN' && category.userId !== user.userId) {
      throw new ForbiddenException('You do not own this category');
    }

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
      throw new NotFoundException('Category update failed');
    }
  }

  async removeCategory(id: string, user: AuthenticatedUser) {
    const category = await this.prisma.skillCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');

    if (user.role !== 'ADMIN' && category.userId !== user.userId) {
      throw new ForbiddenException('You do not own this category');
    }

    try {
      return await this.prisma.skillCategory.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Category deletion failed');
    }
  }
}
