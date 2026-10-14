import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";

import type { ShopifyCredentials } from "./types";

const SETTINGS_FILE = path.join(process.cwd(), "data", "shopify-settings.json");

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/\.myshopify\.com$/i, "")
    .concat(".myshopify.com");
}

export function hasShopifyEnvCredentials(): boolean {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN?.trim() && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim());
}

async function readFileSettings(): Promise<ShopifyCredentials | null> {
  try {
    const raw = await readFile(SETTINGS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<ShopifyCredentials>;
    if (!parsed.storeDomain || !parsed.accessToken) return null;
    return {
      storeDomain: normalizeDomain(parsed.storeDomain),
      accessToken: parsed.accessToken.trim(),
    };
  } catch {
    return null;
  }
}

async function readDbSettings(): Promise<ShopifyCredentials | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const row = await db.shopifySettings.findUnique({ where: { id: "default" } });
    if (!row) return null;
    return {
      storeDomain: normalizeDomain(row.storeDomain),
      accessToken: row.accessToken,
    };
  } catch {
    return null;
  }
}

/** Resolve Shopify credentials: env wins, then DB, then local file. */
export async function getShopifyCredentials(): Promise<ShopifyCredentials | null> {
  const envDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const envToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  if (envDomain && envToken) {
    return { storeDomain: normalizeDomain(envDomain), accessToken: envToken };
  }

  const fromDb = await readDbSettings();
  if (fromDb) return fromDb;

  return readFileSettings();
}

export async function saveShopifyCredentials(input: {
  storeDomain: string;
  accessToken: string;
}): Promise<{ source: "database" | "file" }> {
  const credentials: ShopifyCredentials = {
    storeDomain: normalizeDomain(input.storeDomain),
    accessToken: input.accessToken.trim(),
  };

  if (process.env.DATABASE_URL) {
    try {
      await db.shopifySettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          storeDomain: credentials.storeDomain,
          accessToken: credentials.accessToken,
        },
        update: {
          storeDomain: credentials.storeDomain,
          accessToken: credentials.accessToken,
          lastError: null,
        },
      });
      return { source: "database" };
    } catch (error) {
      console.error("Shopify settings DB save failed; writing local file.", error);
    }
  }

  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(credentials, null, 2), "utf8");
  return { source: "file" };
}

export async function markShopifySync(result: {
  ok: boolean;
  error?: string;
}): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await db.shopifySettings.update({
      where: { id: "default" },
      data: {
        lastSyncedAt: result.ok ? new Date() : undefined,
        lastError: result.ok ? null : (result.error ?? "Sync failed"),
      },
    });
  } catch {
    // Settings row may not exist yet.
  }
}

export async function getShopifyConnectionStatus(): Promise<{
  configured: boolean;
  storeDomain: string | null;
  source: "env" | "database" | "file" | null;
  lastSyncedAt: string | null;
  lastError: string | null;
}> {
  if (hasShopifyEnvCredentials()) {
    return {
      configured: true,
      storeDomain: normalizeDomain(process.env.SHOPIFY_STORE_DOMAIN!),
      source: "env",
      lastSyncedAt: null,
      lastError: null,
    };
  }

  if (process.env.DATABASE_URL) {
    try {
      const row = await db.shopifySettings.findUnique({ where: { id: "default" } });
      if (row) {
        return {
          configured: true,
          storeDomain: row.storeDomain,
          source: "database",
          lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
          lastError: row.lastError,
        };
      }
    } catch {
      // fall through
    }
  }

  const file = await readFileSettings();
  if (file) {
    return {
      configured: true,
      storeDomain: file.storeDomain,
      source: "file",
      lastSyncedAt: null,
      lastError: null,
    };
  }

  return {
    configured: false,
    storeDomain: null,
    source: null,
    lastSyncedAt: null,
    lastError: null,
  };
}
