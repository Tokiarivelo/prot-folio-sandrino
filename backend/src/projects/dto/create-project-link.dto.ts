import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectLinkDto {
  @ApiProperty({
    example: 'GitHub',
    description: 'Human-readable label shown as the link button text',
  })
  @IsString()
  label: string;

  @ApiProperty({
    example: 'https://github.com/sandrino/project',
    description: 'Full URL of the link',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: 'github',
    description:
      'Link type used to render the correct icon. Values: github, demo, live, docs, npm, other',
    enum: ['github', 'demo', 'live', 'docs', 'npm', 'other'],
  })
  @IsString()
  type: string;
}
