import type { DependencyHealth } from '@seoflow/types';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DependencyRowProps {
  label: string;
  health: DependencyHealth;
  /** Hide the latency figure when it wasn't actually measured. */
  hideLatency?: boolean;
}

export function DependencyRow({ label, health, hideLatency = false }: DependencyRowProps) {
  const up = health.status === 'up';

  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {up ? (
          <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
        ) : (
          <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {health.error && (
            <p className="truncate text-xs text-muted-foreground" title={health.error}>
              {health.error}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!hideLatency && (
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {health.latencyMs} ms
          </span>
        )}
        <Badge variant={up ? 'success' : 'destructive'}>{up ? 'Operational' : 'Down'}</Badge>
      </div>
    </li>
  );
}
