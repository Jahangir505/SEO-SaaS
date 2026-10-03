import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env automatically. Use Node's built-in loader (no dotenv dependency);
// in Docker/CI the variables come from the real environment and no file exists.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on process.env
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // `prisma generate` doesn't need a connection, so a missing URL must not break installs.
    url: process.env.DATABASE_URL ?? '',
  },
});
