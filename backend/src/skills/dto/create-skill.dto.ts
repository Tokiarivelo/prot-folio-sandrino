import { IsString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SkillLevel } from '@prisma/client';

export class CreateSkillDto {
  @ApiProperty({ example: 'category-id' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'React' })
  @IsString()
  name: string;

  @ApiProperty({ enum: SkillLevel, example: 'ADVANCED' })
  @IsEnum(SkillLevel)
  level: SkillLevel;

  @ApiPropertyOptional({ example: 5 })
  @Transform(({ value }: { value: string | number | undefined }) =>
    value !== undefined ? parseInt(String(value), 10) : value,
  )
  @IsInt()
  @IsOptional()
  yearsExperience?: number;

  @ApiPropertyOptional({ example: 'https://example.com/react-icon.png' })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 0 })
  @Transform(({ value }: { value: string | number | undefined }) =>
    value !== undefined ? parseInt(String(value), 10) : value,
  )
  @IsInt()
  @IsOptional()
  order?: number;
}
