# SEOFlow

> **Audit. Optimize. Track. Grow.**
> AI-powered SEO management and website auditing for small businesses, freelancers and agencies.

**Status: Phase 1 — foundation.** Monorepo, API + web skeletons, PostgreSQL, Redis, Docker, tooling.
No product features (auth, crawler, …) yet — see [Roadmap](#roadmap).

## Stack

| Layer   | Tech                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| Web     | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query |
| API     | Node.js 22, Express 5, TypeScript, Zod, Pino                                   |
| Data    | PostgreSQL 17 via Prisma 7 (driver adapter `@prisma/adapter-pg`), Redis 7      |
| Tooling | pnpm workspaces, ESLint 9 (flat config), Prettier, Vitest, Supertest, Docker   |

## Repository layout

```
.
├── apps/
│   ├── api/                 Express API          → docs/architecture.md
│   └── web/                 Next.js frontend
├── packages/
│   ├── types/               Shared API contract types (@seoflow/types)
│   ├── validation/          Shared Zod schemas (@seoflow/validation)
│   └── config/              Shared tsconfig bases + ESLint config (@seoflow/config)
├── docker/                  api.Dockerfile, web.Dockerfile
├── docs/                    Architecture, environment, database docs
├── docker-compose.yml
└── .env.example             Docker Compose variables
```

## Prerequisites

- Node.js **≥ 20.19** (22 LTS recommended — `nvm use`)
- pnpm **10** (`corepack enable`)
- Docker with Compose v2

## Quick start — full stack in Docker

```bash
cp .env.example .env
docker compose up -d --build --wait
```

| Service  | URL                                    |
| -------- | -------------------------------------- |
| Web      | http://localhost:3000                  |
| API      | http://localhost:4000/api/health       |
| Postgres | `localhost:5433` (user/pass `seoflow`) |
| Redis    | `localhost:6381`                       |

Postgres and Redis use non-default host ports so they don't clash with other local stacks;
change them in `.env`. All ports bind to `127.0.0.1` only.

The `migrate` service runs `prisma migrate deploy` once and exits; `api` only starts after it succeeds.

## Local development (hot reload)

Run Postgres + Redis in Docker and the apps on your machine:

```bash
pnpm install                      # also runs `prisma generate`
cp .env.example .env              # compose variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

pnpm docker:infra                 # postgres + redis only
pnpm dev                          # api on :4000, web on :3000
```

> If the full Docker stack is running, stop `api`/`web` first (`docker compose stop api web`) —
> they use the same ports.

## Scripts (run from the repo root)

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | API (tsx watch) + web (next dev) in parallel |
| `pnpm build`        | Production build of every package            |
| `pnpm test`         | All unit/integration tests (Vitest)          |
| `pnpm lint`         | ESLint everywhere                            |
| `pnpm typecheck`    | `tsc --noEmit` everywhere                    |
| `pnpm format`       | Prettier write (`format:check` for CI)       |
| `pnpm db:migrate`   | Create/apply a migration in development      |
| `pnpm db:generate`  | Regenerate the Prisma client                 |
| `pnpm db:studio`    | Open Prisma Studio                           |
| `pnpm docker:infra` | Start postgres + redis containers            |
| `pnpm docker:up`    | Build and start the whole stack              |
| `pnpm docker:down`  | Stop the stack (data volumes are kept)       |

## Verifying Phase 1

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build

docker compose up -d --build --wait
curl -s localhost:4000/api/health          # liveness  → 200
curl -s localhost:4000/api/health/ready    # readiness → 200, database + redis "up"
docker compose stop redis
curl -s localhost:4000/api/health/ready    # → 503, redis "down"
docker compose start redis
```

Then open http://localhost:3000 — the **System status** card shows the live API, PostgreSQL
and Redis status and refreshes every 15 seconds. Toggle dark mode in the header.

## API conventions

```jsonc
// success
{ "success": true, "data": { /* ... */ }, "message": "optional" }
// error
{ "success": false, "message": "Human readable", "code": "NOT_FOUND", "errors": [], "requestId": "..." }
```

Every response carries an `X-Request-Id` header (reused from the caller if well-formed) that
also appears in the logs. Endpoints so far:

| Method | Path                | Description                                           |
| ------ | ------------------- | ----------------------------------------------------- |
| GET    | `/api/health`       | Liveness — process is up (no I/O)                     |
| GET    | `/api/health/ready` | Readiness — PostgreSQL + Redis reachable (503 if not) |

An OpenAPI/Swagger spec is added with the first real resource endpoints (Phase 2).

## Documentation

- [Architecture](docs/architecture.md)
- [Environment variables](docs/environment.md)
- [Database](docs/database.md)

## Roadmap

1. ✅ Architecture, monorepo, Docker, PostgreSQL, Redis
2. Authentication, organizations, roles & permissions
3. Projects & websites
4. SEO crawler + basic audit engine
5. Issue engine + scoring
6. SEO dashboard + page analyzer
7. Keyword tracking
8. Google Search Console
9. Google Analytics
10. AI SEO assistant
11. Competitor analysis
12. Reports, PDF, white-labeling
13. Stripe subscriptions + usage limits
14. Admin dashboard
15. Testing, security & performance hardening
16. Production deployment
