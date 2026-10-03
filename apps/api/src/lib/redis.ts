import { Redis } from 'ioredis';
import { env } from '../config/env';
import { logger } from '../config/logger';

/**
 * Shared Redis connection for caching / health checks.
 * BullMQ workers (Phase 4) create their own connections because they require
 * `maxRetriesPerRequest: null`.
 */
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  connectionName: 'seoflow-api',
});

redis.on('error', (error) => {
  logger.warn({ err: error }, 'Redis connection error');
});
