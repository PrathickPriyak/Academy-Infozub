/**
 * prisma generate with a placeholder URL when no Postgres env is set yet.
 */
import { spawnSync } from "node:child_process";

const keys = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
  "STORAGE_POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
];

let url;
for (const key of keys) {
  const value = process.env[key]?.trim();
  if (value) {
    url = value;
    break;
  }
}

if (!url) {
  url = "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder";
}

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(result.status ?? 1);
