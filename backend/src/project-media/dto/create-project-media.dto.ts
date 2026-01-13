import {
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class CreateProjectMediaDto {
  @ApiProperty({ example: 'project-id' })
  @IsString()
  projectId: string;

  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  fileType: MediaType;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isCover?: boolean;

  @ApiPropertyOptional({ example: 'Project screenshot' })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  order?: number;
}
