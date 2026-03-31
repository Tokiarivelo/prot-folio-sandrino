import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  username?: string;
  role: Role;
}
