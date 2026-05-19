import { SetMetadata } from '@nestjs/common';

import { Roles } from '../enum/roles.enum';

export const RolesDecorator = (...roles: Roles[]) =>
  SetMetadata('roles', roles);