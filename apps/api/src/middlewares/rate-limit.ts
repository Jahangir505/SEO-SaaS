import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';

/**
 * Global per-IP limiter for the API. Uses the in-memory store for now; it moves to a
 * Redis-backed store (shared across instances) together with the auth endpoints in Phase 2.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(AppError.tooManyRequests()),
});
