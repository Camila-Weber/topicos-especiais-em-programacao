import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateUserStatusDto } from './update-user-status.dto';

describe('UpdateUserStatusDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  async function transform(payload: Record<string, unknown>) {
    return pipe.transform(payload, {
      type: 'body',
      metatype: UpdateUserStatusDto,
    });
  }

  it('accepts active boolean', async () => {
    await expect(transform({ active: false })).resolves.toEqual({ active: false });
  });

  it('rejects extra fields like role', async () => {
    await expect(transform({ active: true, role: 'admin' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
