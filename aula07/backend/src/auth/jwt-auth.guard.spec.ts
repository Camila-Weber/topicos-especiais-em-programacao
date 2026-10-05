import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../users/user-role.enum';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  function createContext(authorization?: string) {
    const request = {
      headers: {
        authorization,
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    return {
      context,
      request,
    };
  }

  function createGuard(jwtService: Partial<JwtService>) {
    return new JwtAuthGuard(
      jwtService as JwtService,
      {
        get: jest.fn().mockReturnValue('test-secret'),
      } as unknown as ConfigService,
    );
  }

  it('rejects requests without token', async () => {
    const { context } = createContext();
    const guard = createGuard({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects expired token with TOKEN_EXPIRED', async () => {
    const { context } = createContext('Bearer expired-token');
    const guard = createGuard({
      verifyAsync: jest.fn().mockRejectedValue(Object.assign(new Error('expired'), {
        name: 'TokenExpiredError',
      })),
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'TOKEN_EXPIRED',
      }),
    });
  });

  it('attaches authenticated user when token is valid', async () => {
    const { context, request } = createContext('Bearer valid-token');
    const guard = createGuard({
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-id',
        role: UserRole.User,
      }),
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toMatchObject({
      user: {
        sub: 'user-id',
        role: UserRole.User,
      },
    });
  });
});
