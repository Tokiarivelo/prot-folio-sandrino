import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Full Stack Developer' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: 'Passionate developer with 5 years of experience' })
  @IsString()
  shortBio: string;

  @ApiPropertyOptional({ example: 'Detailed bio...' })
  @IsString()
  @IsOptional()
  longBio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/resume.pdf' })
  @IsString()
  @IsOptional()
  resumePdfUrl?: string;

  @ApiPropertyOptional({
    example: {
      github: 'https://github.com/username',
      linkedin: 'https://linkedin.com/in/username',
      twitter: 'https://twitter.com/username',
    },
  })
  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, any>;

  @ApiPropertyOptional({
    example: {
      title: 'Portfolio Site',
      description: 'My portfolio website',
      keywords: ['developer', 'portfolio'],
    },
  })
  @IsObject()
  @IsOptional()
  seoMetadata?: Record<string, any>;
}
