import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('returns the health payload inside data', () => {
    const service: Pick<HealthService, 'check'> = {
      check: () => ({
        status: 'ok',
        service: 'ditado-api',
        timestamp: '2026-10-04T00:00:00.000Z',
      }),
    };

    const controller = new HealthController(service as HealthService);

    expect(controller.check()).toEqual({
      data: {
        status: 'ok',
        service: 'ditado-api',
        timestamp: '2026-10-04T00:00:00.000Z',
      },
    });
  });
});
