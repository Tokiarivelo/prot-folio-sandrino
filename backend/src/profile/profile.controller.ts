import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

export class ProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Sandrino' })
  fullName: string;

  @ApiProperty({ example: 'Full Stack Developer' })
  jobTitle: string;

  @ApiPropertyOptional({ example: "Hi, I'm Sandrino" })
  heroText: string | null;

  @ApiProperty({ example: 'I build beautiful, fast web experiences.' })
  shortBio: string;

  @ApiPropertyOptional({ example: "I'm a passionate full-stack developer..." })
  longBio: string | null;

  @ApiPropertyOptional({ example: 'Antananarivo, Madagascar' })
  location: string | null;

  @ApiProperty({ example: true })
  availability: boolean;

  @ApiPropertyOptional({
    example: 'https://storage.supabase.co/portfolio-media/profile/avatar.jpg',
  })
  profileImageUrl: string | null;

  @ApiPropertyOptional({
    example: 'https://storage.supabase.co/portfolio-media/profile/resume.pdf',
  })
  resumePdfUrl: string | null;

  @ApiPropertyOptional({
    example: {
      github: 'https://github.com/sandrino',
      linkedin: 'https://linkedin.com/in/sandrino',
    },
  })
  socialLinks: Record<string, string> | null;

  @ApiPropertyOptional({
    example: {
      title: 'Sandrino — Developer',
      description: '...',
      keywords: ['dev'],
    },
  })
  seoMetadata: Record<string, any> | null;

  @ApiPropertyOptional({
    example: {
      primaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      darkMode: true,
    },
  })
  themeConfig: Record<string, any> | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    example: true,
    description: 'Whether the profile is visible to the public',
  })
  isPublic: boolean;
}

export class ImageUploadResponseDto {
  @ApiProperty({
    example: 'https://storage.supabase.co/portfolio-media/profile/avatar.jpg',
  })
  profileImageUrl: string;
}

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create profile (Admin)',
    description:
      'Creates the portfolio owner profile. Each user has one profile.',
  })
  @ApiCreatedResponse({
    description: 'Profile created',
    type: ProfileResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  create(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.profileService.create(createProfileDto, user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get mine (Admin)',
    description: 'Returns the currently authenticated user profile.',
  })
  findMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.findFirst(user);
  }

  @Get()
  @ApiOperation({
    summary: 'List all profiles (Admin)',
    description:
      'Returns all profiles ordered by creation date descending. Use GET /profile/current for the public portfolio.',
  })
  @ApiOkResponse({
    description: 'Array of profiles',
    type: [ProfileResponseDto],
  })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'targetUserId', required: false })
  findAll(
    @CurrentUser() user?: AuthenticatedUser,
    @Query('username') username?: string,
    @Query('targetUserId') targetUserId?: string,
  ) {
    return this.profileService.findAll(user, username, targetUserId);
  }

  @Get('current')
  @ApiOperation({
    summary: 'Get active profile (Public)',
    description:
      'Returns the most recently created profile. This is the primary endpoint used by the public portfolio frontend to populate Hero, About, and Contact sections. Returns null if no profile has been created yet.',
  })
  @ApiOkResponse({
    description: 'Active profile or null if not set up yet',
    type: ProfileResponseDto,
  })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'targetUserId', required: false })
  findFirst(
    @CurrentUser() user?: AuthenticatedUser,
    @Query('username') username?: string,
    @Query('targetUserId') targetUserId?: string,
  ) {
    return this.profileService.findFirst(user, username, targetUserId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get profile by ID (Public)',
    description: 'Retrieves a specific profile by UUID.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the profile' })
  @ApiOkResponse({ description: 'Profile found', type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.profileService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update profile (Admin)',
    description:
      'Partially updates a profile. All fields are optional. JSON fields (socialLinks, seoMetadata, themeConfig) are replaced in full — merge before sending if you want to preserve existing keys.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the profile' })
  @ApiOkResponse({ description: 'Profile updated', type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.profileService.update(id, updateProfileDto, user);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload profile image (Admin)',
    description:
      'Uploads a profile/avatar image to Supabase Storage and updates the profileImageUrl on the profile. Accepts JPEG, PNG, WebP. Maximum file size: 5MB. The old image is NOT automatically deleted from storage.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the profile' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, WebP — max 5MB)',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Image uploaded and profile updated',
    type: ImageUploadResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiBadRequestResponse({
    description: 'No file provided or invalid file type',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.profileService.uploadImage(id, file, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete profile (Admin)',
    description:
      'Permanently deletes a profile record. Does not delete associated files from Supabase Storage.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the profile' })
  @ApiNoContentResponse({ description: 'Profile deleted' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.profileService.remove(id, user);
  }
}
