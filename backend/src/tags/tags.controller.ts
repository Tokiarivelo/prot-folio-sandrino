import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';

export class TagResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 'react' })
  slug: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    example: { projectTags: 5 },
    description: 'Count of projects using this tag',
  })
  _count: { projectTags: number };
}

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all tags (Public)',
    description:
      'Returns all tags ordered alphabetically. Each tag includes a project count. Use the slug to filter projects via GET /projects?tag={slug}.',
  })
  @ApiOkResponse({
    description: 'Array of all tags with project usage counts',
    type: [TagResponseDto],
  })
  findAll() {
    return this.tagsService.findAll();
  }
}
