import { PartialType } from '@nestjs/swagger';
import { CreateProjectMediaDto } from './create-project-media.dto';

export class UpdateProjectMediaDto extends PartialType(CreateProjectMediaDto) {}
