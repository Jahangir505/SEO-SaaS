import { describe, expect, it } from 'vitest';
import { idParamSchema, paginationQuerySchema } from './common';

describe('paginationQuerySchema', () => {
  it('applies defaults', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
  });

  it('coerces query-string numbers', () => {
    expect(paginationQuerySchema.parse({ page: '3', pageSize: '50' })).toEqual({
      page: 3,
      pageSize: 50,
    });
  });

  it('rejects page sizes above the maximum', () => {
    expect(paginationQuerySchema.safeParse({ pageSize: '500' }).success).toBe(false);
  });
});

describe('idParamSchema', () => {
  it('rejects non-uuid ids', () => {
    expect(idParamSchema.safeParse({ id: '1 OR 1=1' }).success).toBe(false);
  });
});
