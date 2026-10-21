/**
 * Runs on Vercel build when a Postgres URL is available.
 * Supports Neon / Vercel Marketplace env names:
 *   DATABASE_URL | POSTGRES_PRISMA_URL | POSTGRES_URL
 * Optional non-pooled URL for migrations:
 *   DIRECT_URL | POSTGRES_URL_NON_POOLING
 */
import { spawnSync } from "node:child_process";

function firstEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

const databaseUrl = firstEnv(
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
  "NEON_DATABASE_URL",
);
const directUrl = firstEnv(
  "DIRECT_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "STORAGE_DATABASE_URL_UNPOOLED",
);

if (!databaseUrl) {
  console.log("db-prepare: no Postgres URL — skipping migrate (catalog fallback stays active).");
  process.exit(0);
}

process.env.DATABASE_URL = databaseUrl;
if (directUrl) {
  process.env.DIRECT_URL = directUrl;
}

console.log("db-prepare: applying Prisma migrations…");
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});
if (migrate.status !== 0) {
  process.exit(migrate.status ?? 1);
}

if (process.env.SEED_ON_DEPLOY === "1") {
  console.log("db-prepare: SEED_ON_DEPLOY=1 — seeding catalog…");
  const seed = spawnSync("npx", ["prisma", "db", "seed"], {
    stdio: "inherit",
    env: process.env,
  });
  if (seed.status !== 0) {
    process.exit(seed.status ?? 1);
  }
}

console.log("db-prepare: database ready.");
