import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';
import { toPublicUser } from '../users/user-presenter';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { validatePasswordPolicy } from './password-policy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordPolicy = validatePasswordPolicy(dto.password);

    if (!passwordPolicy.valid) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'WEAK_PASSWORD',
        message: 'A senha não atende aos requisitos de segurança.',
        details: [
          {
            field: 'password',
            message:
              'Use no mínimo 8 caracteres, incluindo letra, número e caractere especial.',
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
      message: 'Já existe uma conta cadastrada com este e-mail.',
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

  async login(dto: LoginDto) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) {
      throw this.invalidCredentials();
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw this.invalidCredentials();
    }

    if (!user.active) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'ACCOUNT_INACTIVE',
        message: 'Esta conta está desativada.',
      });
    }

    return {
      user: toPublicUser(user),
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        role: user.role,
      }),
      expiresIn: 300,
    };
  }

  async me(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Usuário autenticado não encontrado.',
      });
    }

    return {
      user: toPublicUser(user),
    };
  }

  private invalidCredentials() {
    return new UnauthorizedException({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'E-mail ou senha inválidos.',
    });
  }
}
