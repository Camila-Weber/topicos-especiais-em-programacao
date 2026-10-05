import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.enum';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  function createService(user: Partial<User> | null = null) {
    const repository = {
      find: jest.fn().mockResolvedValue(
        user
          ? [
              {
                id: 'user-id',
                name: 'Ana Souza',
                email: 'ana@email.com',
                role: UserRole.User,
                active: true,
                passwordHash: 'secret',
                ...user,
              },
            ]
          : [],
      ),
      findOne: jest.fn().mockResolvedValue(
        user
          ? {
              id: 'user-id',
              name: 'Ana Souza',
              email: 'ana@email.com',
              role: UserRole.User,
              active: true,
              passwordHash: 'secret',
              ...user,
            }
          : null,
      ),
      save: jest.fn(async (entity) => entity),
    } as unknown as Repository<User>;

    return {
      service: new UsersService(repository),
      repository,
    };
  }

  it('lists public users without passwordHash', async () => {
    const { service, repository } = createService({
      passwordHash: 'secret',
    });

    const result = await service.listUsers();

    expect(repository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([
      {
        id: 'user-id',
        name: 'Ana Souza',
        email: 'ana@email.com',
        role: UserRole.User,
        active: true,
      },
    ]);
    expect('passwordHash' in result[0]).toBe(false);
  });

  it('updates active status without changing role', async () => {
    const { service, repository } = createService({
      role: UserRole.User,
    });

    const result = await service.updateStatus('user-id', false);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        active: false,
        role: UserRole.User,
      }),
    );
    expect(result).toMatchObject({
      id: 'user-id',
      active: false,
      role: UserRole.User,
    });
    expect('passwordHash' in result).toBe(false);
  });

  it('returns 404 when user does not exist', async () => {
    const { service } = createService();

    await expect(service.updateStatus('missing-id', false)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
