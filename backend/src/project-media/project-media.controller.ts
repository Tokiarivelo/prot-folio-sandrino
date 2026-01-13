import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectMediaService } from './project-media.service';
import { CreateProjectMediaDto } from './dto/create-project-media.dto';
import { UpdateProjectMediaDto } from './dto/update-project-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Project Media')
@Controller('project-media')
export class ProjectMediaController {
  constructor(private readonly projectMediaService: ProjectMediaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload project media (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        projectId: { type: 'string' },
        fileType: { type: 'string', enum: ['IMAGE', 'VIDEO', 'DOCUMENT'] },
        isCover: { type: 'boolean' },
        caption: { type: 'string' },
        order: { type: 'number' },
      },
    },
  })
  create(
    @Body() createProjectMediaDto: CreateProjectMediaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.projectMediaService.create(createProjectMediaDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project media (Public)' })
  findAll(@Query('projectId') projectId?: string) {
    return this.projectMediaService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project media by ID (Public)' })
  findOne(@Param('id') id: string) {
    return this.projectMediaService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project media metadata (Admin)' })
  update(
    @Param('id') id: string,
    @Body() updateProjectMediaDto: UpdateProjectMediaDto,
  ) {
    return this.projectMediaService.update(id, updateProjectMediaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete project media (Admin)' })
  remove(@Param('id') id: string) {
    return this.projectMediaService.remove(id);
  }
}
