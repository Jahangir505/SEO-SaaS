import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiClientError } from './api-client';

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('unwraps data from a success envelope', async () => {
    mockFetch(200, { success: true, data: { status: 'ok' } });
    await expect(apiFetch('/api/health')).resolves.toEqual({ status: 'ok' });
  });

  it('returns data for success envelopes even on non-2xx status (e.g. 503 readiness)', async () => {
    mockFetch(503, { success: true, data: { status: 'not_ready' } });
    await expect(apiFetch('/api/health/ready')).resolves.toEqual({ status: 'not_ready' });
  });

  it('throws ApiClientError with code and status for error envelopes', async () => {
    mockFetch(404, { success: false, message: 'Not here', code: 'NOT_FOUND', errors: [] });
    await expect(apiFetch('/api/nope')).rejects.toMatchObject({
      name: 'ApiClientError',
      status: 404,
      code: 'NOT_FOUND',
      message: 'Not here',
    });
  });

  it('throws a NETWORK_ERROR when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const error = await apiFetch('/api/health').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).code).toBe('NETWORK_ERROR');
  });
});
