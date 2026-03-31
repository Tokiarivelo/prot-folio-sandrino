import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Project Inquiry' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'I would like to discuss a project...' })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'UUID of the user being contacted',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsOptional()
  recipientId?: string;
}
