import type { ApiMeta, ApiSuccessResponse } from '@seoflow/types';
import type { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { message?: string; status?: number; meta?: ApiMeta } = {},
): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options.message && { message: options.message }),
    ...(options.meta && { meta: options.meta }),
  };
  res.status(options.status ?? 200).json(body);
}
