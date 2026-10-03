import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DependencyRow } from './dependency-row';

afterEach(cleanup);

describe('DependencyRow', () => {
  it('shows an operational dependency with its latency', () => {
    render(<DependencyRow label="PostgreSQL" health={{ status: 'up', latencyMs: 4 }} />);

    expect(screen.getByText('PostgreSQL')).toBeTruthy();
    expect(screen.getByText('Operational')).toBeTruthy();
    expect(screen.getByText('4 ms')).toBeTruthy();
  });

  it('shows a failing dependency with its error message', () => {
    render(
      <DependencyRow
        label="Redis"
        health={{ status: 'down', latencyMs: 2000, error: 'redis check timed out after 2000ms' }}
      />,
    );

    expect(screen.getByText('Down')).toBeTruthy();
    expect(screen.getByText('redis check timed out after 2000ms')).toBeTruthy();
  });
});
