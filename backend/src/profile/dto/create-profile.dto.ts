import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLinksDto {
  @ApiPropertyOptional({ example: 'https://github.com/sandrino' })
  github?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/sandrino' })
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/sandrino' })
  twitter?: string;

  @ApiPropertyOptional({ example: 'sandrino@portfolio.dev' })
  email?: string;

  @ApiPropertyOptional({ example: 'https://dribbble.com/sandrino' })
  dribbble?: string;
}

export class SeoMetadataDto {
  @ApiPropertyOptional({ example: 'Sandrino — Full Stack Developer' })
  title?: string;

  @ApiPropertyOptional({
    example:
      'Full Stack Developer specializing in React, Node.js, and modern web technologies.',
  })
  description?: string;

  @ApiPropertyOptional({ example: ['developer', 'full-stack', 'react'] })
  keywords?: string[];

  @ApiPropertyOptional({
    example: 'https://storage.supabase.co/portfolio-media/og.jpg',
  })
  ogImage?: string;
}

export class ThemeConfigDto {
  @ApiPropertyOptional({ example: '#6366f1' })
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#8b5cf6' })
  accentColor?: string;

  @ApiPropertyOptional({ example: true })
  darkMode?: boolean;
}

export class CreateProfileDto {
  @ApiProperty({ example: 'Sandrino' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Full Stack Developer' })
  @IsString()
  jobTitle: string;

  @ApiPropertyOptional({
    example: "Hi, I'm Sandrino",
    description:
      'Large hero headline displayed prominently in the hero section',
  })
  @IsString()
  @IsOptional()
  heroText?: string;

  @ApiProperty({
    example:
      'I build beautiful, fast web experiences. Open to new opportunities.',
    description: 'Short bio displayed below job title in the hero section',
  })
  @IsString()
  shortBio: string;

  @ApiPropertyOptional({
    example:
      "I'm a passionate full-stack developer with a love for clean code and great user experiences.",
    description:
      'Extended bio displayed in the About section (supports plain text or HTML)',
  })
  @IsString()
  @IsOptional()
  longBio?: string;

  @ApiPropertyOptional({
    example: 'Antananarivo, Madagascar',
    description: 'Physical location shown in About section',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    example: true,
    description:
      'Whether the owner is currently available for new projects/roles',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  availability?: boolean;

  @ApiPropertyOptional({
    example: 'https://storage.supabase.co/portfolio-media/profile/avatar.jpg',
    description:
      'Public URL of the profile/avatar image stored in Supabase Storage',
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://storage.supabase.co/portfolio-media/profile/resume.pdf',
    description: 'Public URL of the resume PDF stored in Supabase Storage',
  })
  @IsString()
  @IsOptional()
  resumePdfUrl?: string;

  @ApiPropertyOptional({
    type: SocialLinksDto,
    example: {
      github: 'https://github.com/sandrino',
      linkedin: 'https://linkedin.com/in/sandrino',
      twitter: 'https://twitter.com/sandrino',
      email: 'sandrino@portfolio.dev',
    },
    description:
      'JSON object containing social network URLs keyed by platform name',
  })
  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({
    type: SeoMetadataDto,
    example: {
      title: 'Sandrino — Full Stack Developer',
      description: 'Full Stack Developer specializing in React and Node.js.',
      keywords: ['developer', 'full-stack', 'react', 'nodejs'],
      ogImage: 'https://storage.supabase.co/portfolio-media/og.jpg',
    },
    description:
      'JSON object with SEO meta tags (title, description, keywords, ogImage)',
  })
  @IsObject()
  @IsOptional()
  seoMetadata?: Record<string, any>;

  @ApiPropertyOptional({
    type: ThemeConfigDto,
    example: {
      primaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      darkMode: true,
    },
    description:
      'JSON object with color theme configuration for the public portfolio',
  })
  @IsObject()
  @IsOptional()
  themeConfig?: Record<string, any>;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the profile is visible to the public',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
