import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Change from UserRole[] to string[] - UserRole is just a type, not a runtime value
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);