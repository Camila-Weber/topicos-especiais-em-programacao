import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  function createHost() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    };

    return {
      host,
      status,
      json,
    };
  }

  it('normalizes validation errors without stack', () => {
    const { host, status, json } = createHost();

    new HttpExceptionFilter().catch(
      new BadRequestException(['name should not be empty']),
      host as never,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Confira os dados informados.',
      details: [],
    });
    expect(JSON.stringify(json.mock.calls[0][0])).not.toContain('stack');
  });

  it('preserves controlled error codes', () => {
    const { json } = createHost();
    const host = createHost();

    new HttpExceptionFilter().catch(
      new NotFoundException({
        statusCode: 404,
        code: 'TRANSCRIPTION_NOT_FOUND',
        message: 'Transcricao nao encontrada.',
      }),
      host.host as never,
    );

    expect(host.json).toHaveBeenCalledWith({
      statusCode: 404,
      code: 'TRANSCRIPTION_NOT_FOUND',
      message: 'Transcricao nao encontrada.',
      details: [],
    });
    expect(json).not.toHaveBeenCalled();
  });

  it('hides unexpected error details', () => {
    const { host, json } = createHost();

    new HttpExceptionFilter().catch(new Error('database stack detail'), host as never);

    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
      details: [],
    });
  });
});
