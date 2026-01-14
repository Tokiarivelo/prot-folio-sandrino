import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async create(createProfileDto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: createProfileDto,
    });
  }

  async findAll() {
    return this.prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async findFirst() {
    return this.prisma.profile.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    try {
      return await this.prisma.profile.update({
        where: { id },
        data: updateProfileDto,
      });
    } catch {
      throw new NotFoundException('Profile not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.profile.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Profile not found');
    }
  }
}
