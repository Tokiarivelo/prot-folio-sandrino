import { ApiProperty } from '@nestjs/swagger';

export class ToolResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({
    example:
      'https://cdn.supabase.co/storage/v1/object/public/portfolio-media/tools/react.png',
  })
  iconUrl: string;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
