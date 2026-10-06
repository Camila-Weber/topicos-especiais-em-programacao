import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../users/user-role.enum';
import { AuthenticatedUser } from './authenticated-user';

type RequestWithUser = {
  user?: AuthenticatedUser;
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (request.user?.role === UserRole.Admin) {
      return true;
    }

    throw new ForbiddenException({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Você não possui permissão para acessar esta área.',
    });
  }
}
