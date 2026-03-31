import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, MediaType } from '@prisma/client';

export class ProjectLinkDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'GitHub' })
  label: string;

  @ApiProperty({ example: 'https://github.com/sandrino/project' })
  url: string;

  @ApiProperty({
    example: 'github',
    enum: ['github', 'demo', 'live', 'docs', 'npm', 'other'],
  })
  type: string;
}

export class ProjectMediaDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({
    example: 'https://storage.supabase.co/portfolio-media/projects/cover.jpg',
  })
  fileUrl: string;

  @ApiProperty({ enum: MediaType, example: 'IMAGE' })
  fileType: MediaType;

  @ApiProperty({
    example: true,
    description: 'Whether this is the cover/thumbnail image',
  })
  isCover: boolean;

  @ApiPropertyOptional({ example: 'Homepage screenshot' })
  caption: string | null;

  @ApiProperty({ example: 0 })
  order: number;
}

export class ProjectTagDto {
  @ApiProperty({ example: { id: 'uuid', name: 'React', slug: 'react' } })
  tag: { id: string; name: string; slug: string };
}

export class ProjectResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'E-commerce Platform' })
  title: string;

  @ApiProperty({ example: 'e-commerce-platform' })
  slug: string;

  @ApiProperty({
    example: 'A full-featured e-commerce platform with real-time inventory.',
  })
  shortDescription: string;

  @ApiPropertyOptional({ example: 'Built a scalable e-commerce solution...' })
  fullDescription: string | null;

  @ApiProperty({ enum: ProjectStatus, example: 'PUBLISHED' })
  status: ProjectStatus;

  @ApiProperty({ example: 1 })
  displayOrder: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [ProjectMediaDto] })
  media: ProjectMediaDto[];

  @ApiProperty({ type: [ProjectLinkDto] })
  links: ProjectLinkDto[];

  @ApiProperty({ type: [ProjectTagDto] })
  projectTags: ProjectTagDto[];
}

export class PaginatedProjectsDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  data: ProjectResponseDto[];

  @ApiProperty({
    example: { total: 10, page: 1, limit: 10, totalPages: 1 },
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
