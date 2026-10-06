import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from './authenticated-user';

type RequestWithUser = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Autenticação obrigatória.',
      });
    }

    try {
      request.user = await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
        secret: this.config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          statusCode: 401,
          code: 'TOKEN_EXPIRED',
          message: 'Sua sessão expirou.',
        });
      }

      throw new UnauthorizedException({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Token inválido.',
      });
    }
  }

  private extractToken(request: RequestWithUser): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
