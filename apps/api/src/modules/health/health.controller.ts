import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/api-response';
import type { HealthService } from './health.service';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  liveness = (_req: Request, res: Response): void => {
    sendSuccess(res, this.healthService.getLiveness());
  };

  readiness = async (_req: Request, res: Response): Promise<void> => {
    const readiness = await this.healthService.getReadiness();
    const ready = readiness.status === 'ready';
    res.setHeader('Cache-Control', 'no-store');
    sendSuccess(res, readiness, {
      status: ready ? 200 : 503,
      message: ready
        ? 'All dependencies are reachable'
        : 'One or more dependencies are unavailable',
    });
  };
}
