import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ToolOrderDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderToolsDto {
  @ApiProperty({ type: [ToolOrderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToolOrderDto)
  reorderings: ToolOrderDto[];
}
