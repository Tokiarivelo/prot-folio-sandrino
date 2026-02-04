import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateProjectMediaDto } from './dto/create-project-media.dto';
import { UpdateProjectMediaDto } from './dto/update-project-media.dto';

@Injectable()
export class ProjectMediaService {
  private readonly logger = new Logger(ProjectMediaService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(
    createProjectMediaDto: CreateProjectMediaDto,
    file: Express.Multer.File,
  ) {
    this.logger.log('=== CREATE PROJECT MEDIA ===');
    this.logger.log(`DTO: ${JSON.stringify(createProjectMediaDto)}`);
    this.logger.log(
      `File: ${file ? `${file.originalname} (${file.size} bytes)` : 'No file'}`,
    );

    // Upload file to Supabase
    const fileUrl = await this.storage.uploadFile(file, 'projects');
    this.logger.log(`File uploaded, URL: ${fileUrl}`);

    // Save metadata to database
    const media = await this.prisma.projectMedia.create({
      data: {
        ...createProjectMediaDto,
        fileUrl,
      },
    });

    this.logger.log(`Media record created with ID: ${media.id}`);
    this.logger.log('=== CREATE PROJECT MEDIA COMPLETE ===');

    return media;
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};

    return this.prisma.projectMedia.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const media = await this.prisma.projectMedia.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async update(id: string, updateProjectMediaDto: UpdateProjectMediaDto) {
    try {
      return await this.prisma.projectMedia.update({
        where: { id },
        data: updateProjectMediaDto,
      });
    } catch {
      throw new NotFoundException('Media not found');
    }
  }

  async remove(id: string) {
    const media = await this.findOne(id);

    // Delete file from Supabase
    try {
      await this.storage.deleteFile(media.fileUrl);
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
    }

    // Delete from database
    return this.prisma.projectMedia.delete({
      where: { id },
    });
  }
}
