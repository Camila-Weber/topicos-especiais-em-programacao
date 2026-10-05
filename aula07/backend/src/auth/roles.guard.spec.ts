import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../users/user-role.enum';
import { AdminGuard } from './roles.guard';

describe('AdminGuard', () => {
  function createContext(role: UserRole) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            sub: 'user-id',
            role,
          },
        }),
      }),
    } as ExecutionContext;
  }

  it('allows admin users', () => {
    expect(new AdminGuard().canActivate(createContext(UserRole.Admin))).toBe(true);
  });

  it('rejects regular users', () => {
    expect(() => new AdminGuard().canActivate(createContext(UserRole.User))).toThrow(
      ForbiddenException,
    );
  });
});
