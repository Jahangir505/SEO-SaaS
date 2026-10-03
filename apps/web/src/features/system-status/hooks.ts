'use client';

import { useQuery } from '@tanstack/react-query';
import { systemStatusApi } from './api';

const REFRESH_INTERVAL_MS = 15_000;

export const systemStatusKeys = {
  all: ['system-status'] as const,
  liveness: () => [...systemStatusKeys.all, 'liveness'] as const,
  readiness: () => [...systemStatusKeys.all, 'readiness'] as const,
};

export function useLiveness() {
  return useQuery({
    queryKey: systemStatusKeys.liveness(),
    queryFn: systemStatusApi.liveness,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

export function useReadiness() {
  return useQuery({
    queryKey: systemStatusKeys.readiness(),
    queryFn: systemStatusApi.readiness,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}
