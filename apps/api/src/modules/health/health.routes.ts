import { Router } from 'express';
import { HealthController } from './health.controller';
import type { HealthService } from './health.service';

export function createHealthRouter(healthService: HealthService): Router {
  const controller = new HealthController(healthService);
  const router = Router();

  router.get('/', controller.liveness);
  router.get('/ready', controller.readiness);

  return router;
}
