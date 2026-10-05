import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';
import { toPublicUser } from '../users/user-presenter';
import { RegisterDto } from './dto/register.dto';
import { validatePasswordPolicy } from './password-policy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const passwordPolicy = validatePasswordPolicy(dto.password);

    if (!passwordPolicy.valid) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'WEAK_PASSWORD',
        message: 'A senha nao atende aos requisitos de seguranca.',
        details: [
          {
            field: 'password',
            message:
              'Use no minimo 8 caracteres, incluindo letra, numero e caractere especial.',
          },
        ],
      });
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        statusCode: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Ja existe uma conta cadastrada com este e-mail.',
      });
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hash(dto.password, 12),
      role: UserRole.User,
      active: true,
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      user: toPublicUser(savedUser),
    };
  }
}
