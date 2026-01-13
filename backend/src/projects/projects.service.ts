import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const { tags, ...projectData } = createProjectDto;

    const project = await this.prisma.project.create({
      data: projectData,
      include: {
        projectTags: {
          include: {
            tag: true,
          },
        },
        media: true,
        links: true,
      },
    });

    // Add tags if provided
    if (tags && tags.length > 0) {
      await this.addTagsToProject(project.id, tags);
    }

    return this.findOne(project.id);
  }

  async findAll(status?: ProjectStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          projectTags: {
            include: {
              tag: true,
            },
          },
          media: {
            orderBy: { order: 'asc' },
          },
          links: true,
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

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        projectTags: {
          include: {
            tag: true,
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
        links: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        projectTags: {
          include: {
            tag: true,
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
        links: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { tags, ...projectData } = updateProjectDto;

    try {
      await this.prisma.project.update({
        where: { id },
        data: projectData,
      });

      // Update tags if provided
      if (tags !== undefined) {
        // Remove existing tags
        await this.prisma.projectTag.deleteMany({
          where: { projectId: id },
        });

        // Add new tags
        if (tags.length > 0) {
          await this.addTagsToProject(id, tags);
        }
      }

      return this.findOne(id);
    } catch {
      throw new NotFoundException('Project not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.project.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Project not found');
    }
  }

  private async addTagsToProject(projectId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');

      // Find or create tag
      let tag = await this.prisma.tag.findUnique({
        where: { slug },
      });

      if (!tag) {
        tag = await this.prisma.tag.create({
          data: {
            name: tagName,
            slug,
          },
        });
      }

      // Create project-tag relation
      await this.prisma.projectTag.create({
        data: {
          projectId,
          tagId: tag.id,
        },
      });
    }
  }
}
