import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers';

describe('error handling', () => {
  it('returns a 404 in the standard error envelope for unknown routes', async () => {
    const res = await request(buildTestApp()).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, code: 'NOT_FOUND', errors: [] });
    expect(res.body.requestId).toBe(res.headers['x-request-id']);
  });

  it('rejects malformed JSON with a 400', async () => {
    const res = await request(buildTestApp())
      .post('/api/anything')
      .set('Content-Type', 'application/json')
      .send('{"broken":');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Malformed JSON body' });
  });

  it('reuses a well-formed incoming request id and ignores unsafe ones', async () => {
    const app = buildTestApp();
    const good = await request(app).get('/api/health').set('X-Request-Id', 'lb-req-12345678');
    const bad = await request(app)
      .get('/api/health')
      .set('X-Request-Id', '<script>alert(1)</script>');

    expect(good.headers['x-request-id']).toBe('lb-req-12345678');
    expect(bad.headers['x-request-id']).not.toContain('<script>');
  });
});

describe('CORS', () => {
  it('allows configured origins', async () => {
    const res = await request(buildTestApp())
      .get('/api/health')
      .set('Origin', 'http://localhost:3000');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('does not allow unknown origins', async () => {
    const res = await request(buildTestApp())
      .get('/api/health')
      .set('Origin', 'https://evil.example');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
