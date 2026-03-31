import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectMediaModule } from './project-media/project-media.module';
import { SkillsModule } from './skills/skills.module';
import { ContactModule } from './contact/contact.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { TagsModule } from './tags/tags.module';
import { ToolsModule } from './tools/tools.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting: 60 requests per minute per IP globally
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    ProfileModule,
    ProjectsModule,
    ProjectMediaModule,
    SkillsModule,
    ContactModule,
    StorageModule,
    EmailModule,
    TagsModule,
    ToolsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally — use @SkipThrottle() on endpoints that need exemption
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
