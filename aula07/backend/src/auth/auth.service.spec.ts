import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  function createService({
    existingUser = null,
    loginUser = null,
  }: {
    existingUser?: Partial<User> | null;
    loginUser?: Partial<User> | null;
  } = {}) {
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(loginUser),
    };
    const repository = {
      findOne: jest.fn().mockResolvedValue(existingUser),
      create: jest.fn((data) => ({ id: 'user-id', ...data })),
      save: jest.fn(async (user) => user),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<User>;
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-token'),
    } as unknown as JwtService;

    return {
      service: new AuthService(repository, jwtService),
      repository,
      jwtService,
    };
  }

  it('creates an active user with role user and does not expose passwordHash', async () => {
    const { service, repository } = createService();

    const result = await service.register({
      name: 'Ana Souza',
      email: 'ana@email.com',
      password: 'Ditado@2026',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ana Souza',
        email: 'ana@email.com',
        role: UserRole.User,
        active: true,
      }),
    );
    expect(result.user).toEqual({
      id: 'user-id',
      name: 'Ana Souza',
      email: 'ana@email.com',
      role: UserRole.User,
      active: true,
    });
    expect('passwordHash' in result.user).toBe(false);
  });

  it('rejects weak passwords with WEAK_PASSWORD', async () => {
    const { service } = createService();

    await expect(
      service.register({
        name: 'Ana Souza',
        email: 'ana@email.com',
        password: 'Senha123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicated email with EMAIL_ALREADY_EXISTS', async () => {
    const { service } = createService({
      existingUser: { id: 'existing-user' },
    });

    await expect(
      service.register({
        name: 'Ana Souza',
        email: 'ana@email.com',
        password: 'Ditado@2026',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns user and JWT when login is valid', async () => {
    const { service, jwtService } = createService({
      loginUser: {
        id: 'user-id',
        name: 'Ana Souza',
        email: 'ana@email.com',
        passwordHash: await hash('Ditado@2026', 4),
        role: UserRole.User,
        active: true,
      },
    });

    const result = await service.login({
      email: 'ana@email.com',
      password: 'Ditado@2026',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      role: UserRole.User,
    });
    expect(result).toEqual({
      user: {
        id: 'user-id',
        name: 'Ana Souza',
        email: 'ana@email.com',
        role: UserRole.User,
        active: true,
      },
      accessToken: 'jwt-token',
      expiresIn: 300,
    });
  });

  it('rejects invalid credentials without revealing whether email exists', async () => {
    const { service } = createService();

    await expect(
      service.login({
        email: 'ana@email.com',
        password: 'Ditado@2026',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects inactive accounts', async () => {
    const { service } = createService({
      loginUser: {
        id: 'user-id',
        name: 'Ana Souza',
        email: 'ana@email.com',
        passwordHash: await hash('Ditado@2026', 4),
        role: UserRole.User,
        active: false,
      },
    });

    await expect(
      service.login({
        email: 'ana@email.com',
        password: 'Ditado@2026',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
