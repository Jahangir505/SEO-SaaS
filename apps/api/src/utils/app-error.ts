import type { ApiFieldError } from '@seoflow/types';

/**
 * Expected (operational) error. Anything thrown that is NOT an AppError is treated
 * as a bug: logged with its stack and returned to the client as a generic 500.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly errors: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message = 'Bad request', errors: ApiFieldError[] = []) {
    return new AppError(400, message, 'BAD_REQUEST', errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, message, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new AppError(409, message, 'CONFLICT');
  }

  static tooManyRequests(message = 'Too many requests, please try again later') {
    return new AppError(429, message, 'RATE_LIMITED');
  }
}
