import { z } from 'zod';

/** Route param schema for resources identified by a UUID. */
export const idParamSchema = z.object({
  id: z.uuid(),
});

/** Query-string pagination shared by every list endpoint. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
