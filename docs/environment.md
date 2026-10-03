# Environment variables

There are three env files. Only the `.example` versions are committed.

| File                  | Used by                      |
| --------------------- | ---------------------------- |
| `.env`                | `docker compose` (root)      |
| `apps/api/.env`       | API in local dev, Prisma CLI |
| `apps/web/.env.local` | Next.js in local dev         |

## API (`apps/api/.env`)

Validated with Zod at startup (`src/config/env.ts`). Invalid config stops the process.

| Variable               | Default                 | Description                                         |
| ---------------------- | ----------------------- | --------------------------------------------------- |
| `NODE_ENV`             | `development`           | `development` \| `test` \| `production`             |
| `PORT`                 | `4000`                  | HTTP port                                           |
| `LOG_LEVEL`            | `info`                  | pino level (`fatal`…`trace`, `silent`)              |
| `TRUST_PROXY`          | `0`                     | Number of reverse proxies in front (for client IPs) |
| `CORS_ORIGINS`         | `http://localhost:3000` | Comma-separated allowed browser origins             |
| `RATE_LIMIT_WINDOW_MS` | `60000`                 | Rate-limit window                                   |
| `RATE_LIMIT_MAX`       | `300`                   | Requests per IP per window                          |
| `DATABASE_URL`         | — (required)            | `postgresql://user:pass@host:port/db?schema=public` |
| `REDIS_URL`            | — (required)            | `redis://` or `rediss://` URL                       |

## Web (`apps/web/.env.local`)

| Variable              | Default                 | Description                                                                                           |
| --------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API base URL as seen by the **browser**. Inlined at build time — rebuild the image after changing it. |

Only `NEXT_PUBLIC_*` values reach the browser. Never put secrets in them.

## Docker Compose (`.env`)

| Variable              | Default                 | Description                                  |
| --------------------- | ----------------------- | -------------------------------------------- |
| `POSTGRES_USER`       | `seoflow`               | Database user                                |
| `POSTGRES_PASSWORD`   | `seoflow`               | Database password (change outside local dev) |
| `POSTGRES_DB`         | `seoflow`               | Database name                                |
| `POSTGRES_HOST_PORT`  | `5433`                  | Host port for Postgres                       |
| `REDIS_HOST_PORT`     | `6381`                  | Host port for Redis                          |
| `API_HOST_PORT`       | `4000`                  | Host port for the API                        |
| `WEB_HOST_PORT`       | `3000`                  | Host port for the web app                    |
| `API_LOG_LEVEL`       | `info`                  | API log level in Docker                      |
| `CORS_ORIGINS`        | `http://localhost:3000` | Passed to the API                            |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Build arg for the web image                  |

Variables for JWT secrets, Google OAuth, Stripe, AI providers, etc. are added in the phases
that introduce those features.
