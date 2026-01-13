import { IsString, IsOptional, IsEnum, IsInt, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'E-commerce Platform' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'e-commerce-platform' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'A modern e-commerce solution' })
  @IsString()
  shortDescription: string;

  @ApiPropertyOptional({ example: 'Full description with details...' })
  @IsString()
  @IsOptional()
  fullDescription?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: 'DRAFT' })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: ['react', 'nodejs'] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
