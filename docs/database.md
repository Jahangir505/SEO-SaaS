# Database

## Strategy

- **PostgreSQL 17**, single database, accessed only through **Prisma 7** from the API's
  repository layer.
- Prisma 7 setup: `apps/api/prisma.config.ts` (datasource URL + paths),
  `apps/api/prisma/schema.prisma`, client generated to `apps/api/src/generated/prisma`
  (git-ignored, regenerated on `pnpm install`). Queries go through the
  `@prisma/adapter-pg` driver adapter (`src/lib/prisma.ts`).
- **Multi-tenancy:** shared schema, row-level tenancy. Every tenant-owned table has a
  required, indexed `organizationId`. Repositories always filter by the caller's organization,
  and services check membership/role before any access. Cross-tenant access is covered by tests
  from Phase 2 onwards.
- Conventions (from Phase 2): UUID primary keys, `createdAt`/`updatedAt` on every table,
  snake_case table names via `@@map`, explicit `onDelete` behavior on every relation, and
  composite indexes that lead with `organizationId`.

Phase 1 intentionally contains **no models**. The first schema (User, Organization,
OrganizationMember, sessions/refresh tokens) arrives with authentication in Phase 2.

## Migrations

| Where     | Command                                     | Notes                                  |
| --------- | ------------------------------------------- | -------------------------------------- |
| Local dev | `pnpm db:migrate` (`prisma migrate dev`)    | Creates + applies a migration          |
| Docker/CI | `migrate` service (`prisma migrate deploy`) | Applies pending migrations, then exits |

Migration files in `apps/api/prisma/migrations` are committed and never edited after merge.

## Connecting

```bash
psql postgresql://seoflow:seoflow@localhost:5433/seoflow
pnpm db:studio
```
