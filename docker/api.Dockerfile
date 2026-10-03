# syntax=docker/dockerfile:1.7
# SEOFlow API image. Targets:
#   migrate — has the Prisma CLI; runs `prisma migrate deploy` and exits
#   runtime — minimal production image (default)

ARG NODE_IMAGE=node:22-alpine

# ─── base ───────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true
RUN corepack enable
WORKDIR /repo

# ─── deps: install only what the API needs (cached on manifest changes) ─────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc .pnpmfile.cjs ./
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY apps/api/package.json apps/api/
# The API postinstall runs `prisma generate`, which needs the schema + config.
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@seoflow/api..."

# ─── build ──────────────────────────────────────────────────────────────────
FROM deps AS build
COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter @seoflow/api build
# Self-contained production install of the API (no dev deps, no workspace links).
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @seoflow/api deploy --prod --legacy --ignore-scripts /prod/api

# ─── migrate ────────────────────────────────────────────────────────────────
FROM build AS migrate
WORKDIR /repo/apps/api
USER node
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

# ─── runtime ────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    PORT=4000
WORKDIR /app
COPY --from=build --chown=node:node /prod/api ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1
CMD ["node", "--enable-source-maps", "dist/server.js"]
