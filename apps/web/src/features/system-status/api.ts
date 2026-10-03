import type { LivenessStatus, ReadinessStatus } from '@seoflow/types';
import { apiFetch } from '@/lib/api-client';

export const systemStatusApi = {
  liveness: () => apiFetch<LivenessStatus>('/api/health'),
  readiness: () => apiFetch<ReadinessStatus>('/api/health/ready'),
};
