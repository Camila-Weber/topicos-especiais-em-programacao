import { ConflictException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  function createService(overrides: Partial<Repository<User>> = {}) {
    const repository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => ({ id: 'user-id', ...data })),
      save: jest.fn(async (user) => user),
      ...overrides,
    } as unknown as Repository<User>;

    return {
      service: new AuthService(repository),
      repository,
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
      findOne: jest.fn().mockResolvedValue({ id: 'existing-user' }),
    });

    await expect(
      service.register({
        name: 'Ana Souza',
        email: 'ana@email.com',
        password: 'Ditado@2026',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
