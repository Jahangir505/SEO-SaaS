'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DependencyRow } from './dependency-row';
import { useLiveness, useReadiness } from './hooks';

export function SystemStatusCard() {
  const liveness = useLiveness();
  const readiness = useReadiness();

  const isLoading = liveness.isPending || readiness.isPending;
  const error = liveness.error ?? readiness.error;
  const ready = readiness.data?.status === 'ready';

  const refetch = () => {
    void liveness.refetch();
    void readiness.refetch();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System status</CardTitle>
        <CardDescription>Live health of the SEOFlow API and its dependencies.</CardDescription>
        <CardAction>
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : error ? (
            <Badge variant="destructive">Unreachable</Badge>
          ) : (
            <Badge variant={ready ? 'success' : 'warning'}>
              {ready ? 'All systems go' : 'Degraded'}
            </Badge>
          )}
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading system status">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div>
              <p className="font-medium">{error.message}</p>
              <p className="text-muted-foreground">
                Make sure the API is running and NEXT_PUBLIC_API_URL points to it.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {liveness.data && (
              <DependencyRow
                label={`API · v${liveness.data.version} (${liveness.data.environment})`}
                health={{ status: 'up', latencyMs: 0 }}
                hideLatency
              />
            )}
            {readiness.data && (
              <>
                <DependencyRow label="PostgreSQL" health={readiness.data.checks.database} />
                <DependencyRow label="Redis" health={readiness.data.checks.redis} />
              </>
            )}
          </ul>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-4 text-xs text-muted-foreground">
        <span>
          {readiness.dataUpdatedAt
            ? `Checked ${new Date(readiness.dataUpdatedAt).toLocaleTimeString()}`
            : 'Refreshes every 15 seconds'}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={liveness.isFetching || readiness.isFetching}
        >
          <RefreshCw
            className={liveness.isFetching || readiness.isFetching ? 'animate-spin' : undefined}
          />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}
