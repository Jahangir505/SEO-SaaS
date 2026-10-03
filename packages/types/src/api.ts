/**
 * Standard API response envelope shared by the API and web apps.
 * Every endpoint returns either ApiSuccessResponse<T> or ApiErrorResponse.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiFieldError {
  /** Dot-separated path to the offending field, e.g. "body.email". */
  path: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  /** Stable, machine-readable error code, e.g. "VALIDATION_ERROR". */
  code: string;
  errors: ApiFieldError[];
  requestId?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
}
