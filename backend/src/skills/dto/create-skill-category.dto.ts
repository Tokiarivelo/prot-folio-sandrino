import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillCategoryDto {
  @ApiProperty({ example: 'Frontend' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  order?: number;
}
