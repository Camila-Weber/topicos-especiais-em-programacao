import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  async function transform(payload: Record<string, unknown>) {
    return pipe.transform(payload, {
      type: 'body',
      metatype: RegisterDto,
    });
  }

  it('normalizes name and email', async () => {
    await expect(
      transform({
        name: ' Ana Souza ',
        email: ' ANA@EMAIL.COM ',
        password: 'Ditado@2026',
      }),
    ).resolves.toEqual({
      name: 'Ana Souza',
      email: 'ana@email.com',
      password: 'Ditado@2026',
    });
  });

  it('rejects missing name', async () => {
    await expect(
      transform({
        email: 'ana@email.com',
        password: 'Ditado@2026',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid email', async () => {
    await expect(
      transform({
        name: 'Ana Souza',
        email: 'email-invalido',
        password: 'Ditado@2026',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects role and active sent by the client', async () => {
    await expect(
      transform({
        name: 'Ana Souza',
        email: 'ana@email.com',
        password: 'Ditado@2026',
        role: 'admin',
        active: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
