import type { ApiFieldError, ApiResponse } from '@seoflow/types';
import { publicEnv } from './env';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly errors: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Thin fetch wrapper around the SEOFlow API envelope.
 * Resolves with `data` for `{ success: true }` responses (even non-2xx ones such as a 503
 * readiness report) and throws ApiClientError otherwise.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${publicEnv.apiUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers: { Accept: 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiClientError('Unable to reach the SEOFlow API', 0, 'NETWORK_ERROR');
  }

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Unexpected response from API (HTTP ${response.status})`,
      response.status,
      'INVALID_RESPONSE',
    );
  }

  if (body.success) return body.data;
  throw new ApiClientError(body.message, response.status, body.code, body.errors);
}
