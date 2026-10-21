/**
 * Runs on Vercel build when a Postgres URL is available.
 * Never fails the Next.js build — migrate/seed errors are logged so deploys still ship.
 */
import { spawnSync } from "node:child_process";

function firstEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return { key, value };
  }
  return undefined;
}

const pooled = firstEnv(
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
  "STORAGE_POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
);

const unpooled = firstEnv(
  "DIRECT_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "STORAGE_DATABASE_URL_UNPOOLED",
  "STORAGE_POSTGRES_URL_NON_POOLING",
);

if (!pooled && !unpooled) {
  console.log("db-prepare: no Postgres URL — skipping migrate (catalog fallback stays active).");
  process.exit(0);
}

const migrateUrl = unpooled?.value ?? pooled?.value;
const appUrl = pooled?.value ?? unpooled?.value;

console.log(
  `db-prepare: using ${unpooled ? unpooled.key : pooled.key} for migrate` +
    (pooled && unpooled ? ` (app URL from ${pooled.key})` : ""),
);

process.env.DATABASE_URL = migrateUrl;
if (unpooled) {
  process.env.DIRECT_URL = unpooled.value;
}

console.log("db-prepare: applying Prisma migrations…");
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});

if (migrate.status !== 0) {
  console.error(
    "db-prepare: migrate deploy failed — continuing build. Fix the DB URL / run migrate later.",
  );
} else if (process.env.SEED_ON_DEPLOY === "1") {
  console.log("db-prepare: SEED_ON_DEPLOY=1 — seeding catalog…");
  // Prefer pooled/app URL for seed runtime after migrate
  process.env.DATABASE_URL = appUrl;
  const seed = spawnSync("npx", ["prisma", "db", "seed"], {
    stdio: "inherit",
    env: process.env,
  });
  if (seed.status !== 0) {
    console.error("db-prepare: seed failed — continuing build. Run npm run db:seed later.");
  }
}

process.env.DATABASE_URL = appUrl;
console.log("db-prepare: done.");
process.exit(0);
