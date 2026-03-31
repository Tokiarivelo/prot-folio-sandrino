import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectLinkDto } from './dto/create-project-link.dto';
import { ProjectStatus, Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const { tags, ...projectData } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        ...projectData,
        userId,
      },
      include: {
        projectTags: { include: { tag: true } },
        media: true,
        links: true,
      },
    });

    if (tags && tags.length > 0) {
      await this.addTagsToProject(project.id, tags);
    }

    return this.findOne(project.id);
  }

  async findAll(
    status?: ProjectStatus,
    page = 1,
    limit = 10,
    tag?: string,
    user?: AuthenticatedUser,
    username?: string,
    targetUserId?: string,
  ) {
    if (!user && !username && !targetUserId) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = status ? { status } : {};

    if (tag) {
      where.projectTags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    // Use nested owner filter if username is provided
    if (targetUserId) {
      where.userId = targetUserId;
    } else if (username) {
      where.owner = { username };
    }

    // Role-based restrictions
    if (user) {
      if (user.role !== 'ADMIN') {
        // Regular authenticated users can only ever see their own projects
        where.userId = user.userId;
        // Remove owner filter if it was set to something else by targetUserId/username
        delete where.owner;
      }
      // Admins see everything filtered by targetUserId/username if provided
    } else {
      // Public requests: projects must be PUBLISHED and owner's profile must be PUBLIC
      where.status = ProjectStatus.PUBLISHED;
      const ownerFilter = (where.owner as Prisma.AdminUserWhereInput) || {};
      where.owner = {
        ...ownerFilter,
        isPublic: true,
      };
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          projectTags: { include: { tag: true } },
          media: { orderBy: { order: 'asc' } },
          links: true,
          owner: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        projectTags: { include: { tag: true } },
        media: { orderBy: { order: 'asc' } },
        links: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Ownership check for sensitive actions/private views
    if (user && user.role !== 'ADMIN' && project.userId !== user.userId) {
      throw new ForbiddenException('You do not own this project');
    }

    return project;
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        projectTags: { include: { tag: true } },
        media: { orderBy: { order: 'asc' } },
        links: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    user: AuthenticatedUser,
  ) {
    const { tags, ...projectData } = updateProjectDto;

    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    if (user.role !== 'ADMIN' && project.userId !== user.userId) {
      throw new ForbiddenException('You do not own this project');
    }

    await this.prisma.project.update({ where: { id }, data: projectData });

    if (tags !== undefined) {
      await this.prisma.projectTag.deleteMany({ where: { projectId: id } });
      if (tags.length > 0) {
        await this.addTagsToProject(id, tags);
      }
    }

    return this.findOne(id, user);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    if (user.role !== 'ADMIN' && project.userId !== user.userId) {
      throw new ForbiddenException('You do not own this project');
    }

    return this.prisma.project.delete({ where: { id } });
  }

  // Project Links
  async addLink(
    projectId: string,
    dto: CreateProjectLinkDto,
    user: AuthenticatedUser,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (user.role !== 'ADMIN' && project.userId !== user.userId) {
      throw new ForbiddenException('You do not own this project');
    }

    return this.prisma.projectLink.create({
      data: { projectId, ...dto },
    });
  }

  async removeLink(projectId: string, linkId: string, user: AuthenticatedUser) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (user.role !== 'ADMIN' && project.userId !== user.userId) {
      throw new ForbiddenException('You do not own this project');
    }

    const link = await this.prisma.projectLink.findFirst({
      where: { id: linkId, projectId },
    });
    if (!link) throw new NotFoundException('Project link not found');

    return this.prisma.projectLink.delete({ where: { id: linkId } });
  }

  private async addTagsToProject(projectId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');

      let tag = await this.prisma.tag.findUnique({ where: { slug } });

      if (!tag) {
        tag = await this.prisma.tag.create({ data: { name: tagName, slug } });
      }

      await this.prisma.projectTag
        .create({ data: { projectId, tagId: tag.id } })
        .catch(() => {
          // Skip if already exists
        });
    }
  }
}
