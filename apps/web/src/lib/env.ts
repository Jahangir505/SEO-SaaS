/**
 * Public (browser-safe) configuration. Only NEXT_PUBLIC_* variables may be read here —
 * never put secrets in this file.
 */
export const publicEnv = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, ''),
} as const;
