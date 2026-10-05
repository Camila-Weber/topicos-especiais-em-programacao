import { UserRole } from '../users/user-role.enum';

export type AuthenticatedUser = {
  sub: string;
  role: UserRole;
};
