import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Injectable()
export class ToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  findAll(
    activeOnly = false,
    user?: AuthenticatedUser,
    username?: string,
    targetUserId?: string,
  ) {
    if (!user && !username && !targetUserId) {
      return [];
    }

    const where: Prisma.ToolWhereInput = activeOnly ? { isActive: true } : {};

    if (user && user.role !== 'ADMIN') {
      where.userId = user.userId;
    } else {
      if (targetUserId) {
        where.userId = targetUserId;
      } else if (username) {
        where.owner = { username };
      }

      if (!user) {
        where.owner = {
          ...((where.owner as Prisma.AdminUserWhereInput) || {}),
          isPublic: true,
        };
      }
    }

    return this.prisma.tool.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const tool = await this.prisma.tool.findUnique({ where: { id } });
    if (!tool) throw new NotFoundException(`Tool ${id} not found`);

    if (user && user.role !== 'ADMIN' && tool.userId !== user.userId) {
      throw new ForbiddenException('You do not own this tool');
    }

    return tool;
  }

  async create(dto: CreateToolDto, userId: string, file: Express.Multer.File) {
    const iconUrl = await this.storage.uploadFile(file, 'tools');
    return this.prisma.tool.create({
      data: {
        name: dto.name,
        userId,
        iconUrl,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateToolDto,
    user: AuthenticatedUser,
    file?: Express.Multer.File,
  ) {
    await this.findOne(id, user);

    const data: Prisma.ToolUpdateInput = { ...dto };

    if (file) {
      data.iconUrl = await this.storage.uploadFile(file, 'tools');
    }

    return this.prisma.tool.update({ where: { id }, data });
  }

  async remove(id: string, user: AuthenticatedUser) {
    await this.findOne(id, user);
    return this.prisma.tool.delete({ where: { id } });
  }

  async reorder(reorderings: { id: string; order: number }[], userId: string) {
    return this.prisma.$transaction(
      reorderings.map((r) =>
        this.prisma.tool.update({
          where: { id: r.id, userId },
          data: { order: r.order },
        }),
      ),
    );
  }
}
