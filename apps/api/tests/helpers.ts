import { createApp } from '../src/app';
import { type DependencyCheck, HealthService } from '../src/modules/health/health.service';

export function buildTestApp(
  checks: Partial<{ database: DependencyCheck; redis: DependencyCheck }> = {},
) {
  const healthService = new HealthService({
    appName: 'seoflow-api',
    version: '0.0.0-test',
    environment: 'test',
    timeoutMs: 100,
    checks: {
      database: checks.database ?? (async () => 1),
      redis: checks.redis ?? (async () => 'PONG'),
    },
  });
  return createApp({ healthService });
}
