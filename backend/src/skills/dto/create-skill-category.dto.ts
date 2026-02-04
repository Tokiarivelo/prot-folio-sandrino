import { IsString, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillCategoryDto {
  @ApiProperty({ example: 'Frontend' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/frontend-icon.png' })
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
