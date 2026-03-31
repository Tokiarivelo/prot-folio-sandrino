import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'admin@portfolio.dev',
      username: 'sandrino',
      fullName: 'Sandrino',
    },
  })
  user: { id: string; email: string; username?: string; fullName: string };
}

export class CurrentUserDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'admin@portfolio.dev' })
  email: string;

  @ApiProperty({ example: 'sandrino' })
  username?: string;

  @ApiProperty({ example: 'Sandrino' })
  fullName: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register admin user',
    description:
      '⚠️ **DISABLED IN PRODUCTION.** Creates a new admin account with full access to all protected endpoints. Disable this endpoint (or add an invite-only guard) before going live by setting NODE_ENV=production.',
  })
  @ApiCreatedResponse({
    description: 'Admin user created and JWT returned',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation error or email already in use',
  })
  @ApiForbiddenResponse({
    description: 'Registration is disabled in production',
  })
  async register(@Body() registerDto: RegisterDto) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Registration is disabled in production');
    }
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login as admin',
    description:
      'Authenticates with email and password. Returns a signed JWT that must be included in the `Authorization: Bearer {token}` header for all protected endpoints. Token expires as configured by JWT_EXPIRATION (default: 7d).',
  })
  @ApiOkResponse({
    description: 'Login successful — JWT returned',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiBadRequestResponse({
    description: 'Validation error (missing fields, invalid email format)',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'Returns the currently authenticated admin user profile based on the JWT token. Use this to verify the token is valid and retrieve the user ID for subsequent admin operations.',
  })
  @ApiOkResponse({ description: 'Current user profile', type: CurrentUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.validateUser(user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current user account (Admin)',
    description:
      'Allows the authenticated user to update their email, full name, username, or password.',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: CurrentUserDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.authService.updateUser(user.userId, dto);
  }
}
