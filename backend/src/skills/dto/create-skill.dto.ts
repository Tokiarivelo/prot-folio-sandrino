import { IsString, IsEnum, IsInt, IsOptional } from 'class-validator';
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
  @IsInt()
  @IsOptional()
  yearsExperience?: number;

  @ApiPropertyOptional({ example: 'https://example.com/react-icon.png' })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  order?: number;
}
