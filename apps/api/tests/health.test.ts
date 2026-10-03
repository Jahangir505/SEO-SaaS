import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers';

describe('GET /api/health', () => {
  it('returns liveness information in the standard envelope', async () => {
    const res = await request(buildTestApp()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: { status: 'ok', service: 'seoflow-api', environment: 'test' },
    });
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('applies security headers', async () => {
    const res = await request(buildTestApp()).get('/api/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
  });
});

describe('GET /api/health/ready', () => {
  it('returns 200 when all dependencies are up', async () => {
    const res = await request(buildTestApp()).get('/api/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ready');
    expect(res.body.data.checks.database.status).toBe('up');
    expect(res.body.data.checks.redis.status).toBe('up');
  });

  it('returns 503 when a dependency fails', async () => {
    const app = buildTestApp({
      database: async () => {
        throw new Error('connection refused');
      },
    });
    const res = await request(app).get('/api/health/ready');

    expect(res.status).toBe(503);
    expect(res.body.data.status).toBe('not_ready');
    expect(res.body.data.checks.database).toMatchObject({
      status: 'down',
      error: 'connection refused',
    });
    expect(res.body.data.checks.redis.status).toBe('up');
  });

  it('returns 503 when a dependency hangs past the timeout', async () => {
    const app = buildTestApp({ redis: () => new Promise(() => {}) });
    const res = await request(app).get('/api/health/ready');

    expect(res.status).toBe(503);
    expect(res.body.data.checks.redis.error).toMatch(/timed out/);
  });
});
