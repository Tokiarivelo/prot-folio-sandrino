import {
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }: { value: string | boolean | undefined }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isCover?: boolean;

  @ApiPropertyOptional({ example: 'Project screenshot' })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional({ example: 0 })
  @Transform(({ value }: { value: string | number | undefined }) =>
    value !== undefined ? parseInt(String(value), 10) : value,
  )
  @IsInt()
  @IsOptional()
  order?: number;
}
