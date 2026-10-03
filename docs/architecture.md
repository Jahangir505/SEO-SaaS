# Architecture

## System overview

```
            ┌──────────────────────┐        ┌──────────────────────────┐
 Browser ──►│ web  (Next.js, :3000) │──────► │ api  (Express, :4000)     │
            └──────────────────────┘ fetch  │                          │
                                            │  ├──► PostgreSQL (Prisma) │
                                            │  └──► Redis               │
                                            └──────────────────────────┘
                                   (Phase 4+)  workers ◄── BullMQ queues in Redis
```

- **web** renders UI only. It talks to the API over HTTP using the shared response contract
  from `@seoflow/types`. No business logic or secrets live in the frontend.
- **api** owns all business logic, authorization and data access.
- **PostgreSQL** is the system of record. **Redis** backs rate limiting, caching and (from
  Phase 4) BullMQ job queues for crawls, ranking checks, syncs and report generation, so
  long-running work never blocks an HTTP request.

## API structure (`apps/api/src`)

```
config/        env validation (zod, fail-fast), logger, app info
lib/           infrastructure clients: prisma, redis
middlewares/   http logger/request id, rate limit, 404, centralized error handler
utils/         AppError, response helpers, small helpers
modules/
  health/      health.routes.ts → health.controller.ts → health.service.ts
app.ts         createApp(deps): builds the Express app from injected dependencies
server.ts      composition root: wires real deps, starts HTTP server, graceful shutdown
```

Each feature is a **module** with the same layers:

```
routes      HTTP wiring + validation middleware
controller  translate HTTP ⇄ service calls; no business logic
service     business rules, authorization decisions, orchestration
repository  the only layer that touches Prisma; always scoped by organizationId
```

Folders such as `jobs/`, `queues/` and `integrations/` are introduced in the phase that first
needs them rather than created empty.

**Dependency injection.** `createApp()` receives its services, so tests build the app with
fakes and never touch real I/O. `server.ts` is the only place that wires real clients.

**Errors.** Anything expected is thrown as `AppError` (status + stable `code`). Zod errors
become 400s with field-level `errors`. Everything else is logged with its stack and returned
as a generic 500 (message hidden in production). Express 5 forwards rejected promises from
async handlers to the error handler automatically.

## Security baseline (Phase 1)

- `helmet` security headers; `x-powered-by` disabled (API + web)
- CORS allowlist (`CORS_ORIGINS`) with credentials, ready for HTTP-only refresh cookies
- Per-IP rate limiting on `/api/*` (health probes exempt). Moves to a Redis store in Phase 2
- JSON body size limit (1 MB), malformed JSON → 400
- Env validated at boot; the process refuses to start with bad config
- Secrets/cookies/authorization headers redacted from logs
- Containers run as non-root `node`; ports bound to `127.0.0.1`

## Shared packages

| Package               | Purpose                                                        |
| --------------------- | -------------------------------------------------------------- |
| `@seoflow/types`      | API envelope + DTO types shared by API and web                 |
| `@seoflow/validation` | Zod schemas shared by API (request validation) and web (forms) |
| `@seoflow/config`     | tsconfig bases, ESLint flat config                             |

Internal packages are consumed **as TypeScript source** (no build step): Next.js transpiles
them (`transpilePackages`), tsx runs them in dev, and tsup bundles them into the API build.

## Frontend structure (`apps/web/src`)

```
app/            routes (App Router), layout, error + 404 boundaries
components/ui/  shadcn/ui primitives (owned source, not a dependency)
components/     app-wide components (logo, theme toggle)
features/<x>/   feature slices: api.ts (calls) → hooks.ts (TanStack Query) → components
lib/            api client, public env, utils
providers/      theme + query providers
```

Data fetching goes through `features/*/api.ts` → `apiFetch` and is cached by TanStack Query.
Components stay presentational. Zustand is added only when genuinely global client state appears.

## Docker images

- `docker/api.Dockerfile` — multi-stage: install (filtered to the API) → tsup build →
  `pnpm deploy --prod` → small runtime image. A `migrate` target keeps the Prisma CLI for
  `prisma migrate deploy`.
- `docker/web.Dockerfile` — Next.js `standalone` output. `NEXT_PUBLIC_API_URL` is a build arg.
- `.pnpmfile.cjs` drops `@prisma/client`'s optional `prisma`/`typescript` peers so the CLI isn't
  shipped in the production image.
