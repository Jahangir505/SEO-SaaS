import type { DependencyHealth, LivenessStatus, ReadinessStatus } from '@seoflow/types';
import { withTimeout } from '../../utils/with-timeout';

export type DependencyCheck = () => Promise<unknown>;

export interface HealthServiceOptions {
  checks: { database: DependencyCheck; redis: DependencyCheck };
  appName: string;
  version: string;
  environment: string;
  timeoutMs?: number;
}

export class HealthService {
  private readonly timeoutMs: number;

  constructor(private readonly options: HealthServiceOptions) {
    this.timeoutMs = options.timeoutMs ?? 2_000;
  }

  /** Liveness: the process is up and serving requests. Performs no I/O. */
  getLiveness(): LivenessStatus {
    return {
      status: 'ok',
      service: this.options.appName,
      version: this.options.version,
      environment: this.options.environment,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /** Readiness: every dependency the API needs to serve traffic is reachable. */
  async getReadiness(): Promise<ReadinessStatus> {
    const [database, redis] = await Promise.all([
      this.runCheck('database', this.options.checks.database),
      this.runCheck('redis', this.options.checks.redis),
    ]);

    return {
      status: database.status === 'up' && redis.status === 'up' ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: { database, redis },
    };
  }

  private async runCheck(name: string, check: DependencyCheck): Promise<DependencyHealth> {
    const startedAt = performance.now();
    try {
      await withTimeout(check(), this.timeoutMs, `${name} check`);
      return { status: 'up', latencyMs: Math.round(performance.now() - startedAt) };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Math.round(performance.now() - startedAt),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
