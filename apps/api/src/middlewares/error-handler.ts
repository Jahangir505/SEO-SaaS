import type { ApiErrorResponse } from '@seoflow/types';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { isProduction } from '../config/env';
import { AppError } from '../utils/app-error';

/** Errors raised by express.json() / body-parser carry `type` and `status`. */
interface BodyParserError extends Error {
  type: string;
  status: number;
}

function isBodyParserError(err: unknown): err is BodyParserError {
  return err instanceof Error && 'type' in err && 'status' in err;
}

function toAppError(err: unknown): AppError | null {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    return AppError.badRequest(
      'Validation failed',
      err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    );
  }

  if (isBodyParserError(err)) {
    if (err.type === 'entity.parse.failed') return AppError.badRequest('Malformed JSON body');
    if (err.type === 'entity.too.large') {
      return new AppError(413, 'Request body too large', 'PAYLOAD_TOO_LARGE');
    }
  }

  return null;
}

/** Centralized error handler — the only place that turns errors into HTTP responses. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = toAppError(err);

  if (appError) {
    req.log?.warn({ err, code: appError.code }, appError.message);
  } else {
    req.log?.error({ err }, 'Unhandled error');
  }

  const status = appError?.statusCode ?? 500;
  const body: ApiErrorResponse = {
    success: false,
    message:
      appError?.message ??
      (isProduction || !(err instanceof Error) ? 'Internal server error' : err.message),
    code: appError?.code ?? 'INTERNAL_ERROR',
    errors: appError?.errors ?? [],
    requestId: typeof req.id === 'string' ? req.id : undefined,
  };

  if (res.headersSent) {
    res.end();
    return;
  }
  res.status(status).json(body);
};
