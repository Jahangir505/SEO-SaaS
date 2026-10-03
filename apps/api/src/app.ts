import cors, { type CorsOptions } from 'cors';
import express, { type Express, Router } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { httpLogger } from './middlewares/http-logger';
import { notFoundHandler } from './middlewares/not-found';
import { apiRateLimiter } from './middlewares/rate-limit';
import { createHealthRouter } from './modules/health/health.routes';
import type { HealthService } from './modules/health/health.service';

/** Everything the HTTP layer needs is injected, so tests can build the app without real I/O. */
export interface AppDependencies {
  healthService: HealthService;
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (curl, server-to-server, health probes) aren't subject to CORS.
    callback(null, !origin || env.CORS_ORIGINS.includes(origin));
  },
  credentials: true,
  maxAge: 600,
};

export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(httpLogger);
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // Health probes are mounted before the rate limiter so orchestrators are never throttled.
  app.use('/api/health', createHealthRouter(deps.healthService));

  const api = Router();
  api.use(apiRateLimiter);
  // Feature module routers are mounted here from Phase 2 onwards, e.g.:
  // api.use('/auth', createAuthRouter(deps.authService));
  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
