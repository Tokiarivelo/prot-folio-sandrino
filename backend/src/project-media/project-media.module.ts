import { Module } from '@nestjs/common';
import { ProjectMediaService } from './project-media.service';
import { ProjectMediaController } from './project-media.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ProjectMediaController],
  providers: [ProjectMediaService],
})
export class ProjectMediaModule {}
