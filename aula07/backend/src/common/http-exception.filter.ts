import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

type ErrorResponse = {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  details?: unknown[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<{
      status: (statusCode: number) => { json: (body: unknown) => void };
    }>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body =
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as ErrorResponse)
          : { message: String(exceptionResponse) };

      response.status(statusCode).json({
        statusCode,
        code: body.code ?? this.defaultCode(statusCode),
        message: this.normalizeMessage(body.message, statusCode),
        details: body.details ?? [],
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
      details: [],
    });
  }

  private normalizeMessage(message: string | string[] | undefined, statusCode: number) {
    if (Array.isArray(message)) {
      return 'Confira os dados informados.';
    }

    return message ?? this.defaultMessage(statusCode);
  }

  private defaultCode(statusCode: number) {
    if (statusCode === HttpStatus.BAD_REQUEST) {
      return 'VALIDATION_ERROR';
    }

    if (statusCode === HttpStatus.FORBIDDEN) {
      return 'FORBIDDEN';
    }

    if (statusCode === HttpStatus.NOT_FOUND) {
      return 'NOT_FOUND';
    }

    return 'HTTP_ERROR';
  }

  private defaultMessage(statusCode: number) {
    if (statusCode === HttpStatus.BAD_REQUEST) {
      return 'Confira os dados informados.';
    }

    if (statusCode === HttpStatus.FORBIDDEN) {
      return 'Você não possui permissão para acessar esta área.';
    }

    if (statusCode === HttpStatus.NOT_FOUND) {
      return 'Recurso não encontrado.';
    }

    return 'Não foi possível concluir a operação.';
  }
}
