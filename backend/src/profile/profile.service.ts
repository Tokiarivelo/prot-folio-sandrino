import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

type ProfileWithOwner = Prisma.ProfileGetPayload<{
  include: { owner: { select: { isPublic: true } } };
}>;

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(createProfileDto: CreateProfileDto, userId: string) {
    const { isPublic, ...profileData } = createProfileDto;

    const profile = await this.prisma.profile.create({
      data: {
        ...profileData,
        userId,
      },
      include: {
        owner: {
          select: { isPublic: true },
        },
      },
    });

    if (isPublic !== undefined) {
      await this.prisma.adminUser.update({
        where: { id: userId },
        data: { isPublic },
      });
      profile.owner.isPublic = isPublic;
    }

    return this.mapProfile(profile);
  }

  async findAll(
    user?: AuthenticatedUser,
    username?: string,
    targetUserId?: string,
  ) {
    if (!user && !username && !targetUserId) {
      return [];
    }

    const where: Prisma.ProfileWhereInput = {};
    if (user && user.role !== 'ADMIN') {
      where.userId = user.userId;
    } else {
      if (targetUserId) {
        where.userId = targetUserId;
      }

      const ownerFilter: Prisma.AdminUserWhereInput = {};
      if (username) ownerFilter.username = username;
      if (!user) ownerFilter.isPublic = true;

      if (Object.keys(ownerFilter).length > 0) {
        where.owner = ownerFilter;
      }
    }

    const profiles = await this.prisma.profile.findMany({
      where,
      include: {
        owner: {
          select: { isPublic: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return profiles.map((p) => this.mapProfile(p));
  }

  async findFirst(
    user?: AuthenticatedUser,
    username?: string,
    targetUserId?: string,
  ) {
    if (!user && !username && !targetUserId) {
      return null;
    }

    const where: Prisma.ProfileWhereInput = {};
    if (user && user.role !== 'ADMIN') {
      where.userId = user.userId;
    } else {
      if (targetUserId) {
        where.userId = targetUserId;
      }

      const ownerFilter: Prisma.AdminUserWhereInput = {};
      if (username) ownerFilter.username = username;
      if (!user) ownerFilter.isPublic = true;

      if (Object.keys(ownerFilter).length > 0) {
        where.owner = ownerFilter;
      }
    }

    const profile = await this.prisma.profile.findFirst({
      where,
      include: {
        owner: {
          select: { isPublic: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.mapProfile(profile);
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        owner: {
          select: { isPublic: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (user && user.role !== 'ADMIN' && profile.userId !== user.userId) {
      throw new ForbiddenException('You do not own this profile');
    }

    return this.mapProfile(profile);
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
    user: AuthenticatedUser,
  ) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');

    if (user.role !== 'ADMIN' && profile.userId !== user.userId) {
      throw new ForbiddenException('You do not own this profile');
    }

    const { isPublic, ...profileData } = updateProfileDto;

    const updated = await this.prisma.profile.update({
      where: { id },
      data: {
        ...profileData,
        owner:
          isPublic !== undefined
            ? {
                update: { isPublic },
              }
            : undefined,
      },
      include: {
        owner: {
          select: { isPublic: true },
        },
      },
    });

    return this.mapProfile(updated);
  }

  private mapProfile(profile: ProfileWithOwner | null) {
    if (!profile) return null;
    const { owner, ...rest } = profile;
    return {
      ...rest,
      isPublic: owner?.isPublic ?? false,
    };
  }

  async uploadImage(
    id: string,
    file: Express.Multer.File,
    user: AuthenticatedUser,
  ) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');

    if (user.role !== 'ADMIN' && profile.userId !== user.userId) {
      throw new ForbiddenException('You do not own this profile');
    }

    const imageUrl = await this.storage.uploadFile(file, 'profile');

    await this.prisma.profile.update({
      where: { id },
      data: { profileImageUrl: imageUrl },
    });

    return { profileImageUrl: imageUrl };
  }

  async remove(id: string, user: AuthenticatedUser) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');

    if (user.role !== 'ADMIN' && profile.userId !== user.userId) {
      throw new ForbiddenException('You do not own this profile');
    }

    return this.prisma.profile.delete({
      where: { id },
    });
  }
}
