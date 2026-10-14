import { unstable_cache } from "next/cache";

import { listCourses } from "@/data/catalog";
import { db } from "@/lib/db";

import { listShopifyProducts } from "./client";
import { getShopifyCredentials, markShopifySync } from "./config";
import type { ShopifyPriceEntry, ShopifyPriceMap, ShopifyProduct } from "./types";

function parseMoney(value: string): number {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount);
}

function primaryVariant(product: ShopifyProduct) {
  return product.variants[0] ?? null;
}

export function buildPriceEntries(products: ShopifyProduct[]): ShopifyPriceEntry[] {
  return products
    .map((product) => {
      const variant = primaryVariant(product);
      if (!variant) return null;
      return {
        productId: String(product.id),
        variantId: String(variant.id),
        handle: product.handle,
        title: product.title,
        price: parseMoney(variant.price),
        currency: "INR",
        sku: variant.sku?.trim() || "",
      } satisfies ShopifyPriceEntry;
    })
    .filter((entry): entry is ShopifyPriceEntry => entry !== null);
}

/** Match Shopify products onto academy course slugs. */
export function mapPricesToCourses(
  entries: ShopifyPriceEntry[],
  courses: Array<{ slug: string; shopifyProductId?: string | null }>,
): ShopifyPriceMap {
  const byHandle = new Map(entries.map((entry) => [entry.handle.toLowerCase(), entry]));
  const bySku = new Map(
    entries.filter((entry) => entry.sku).map((entry) => [entry.sku.toLowerCase(), entry]),
  );
  const byProductId = new Map(entries.map((entry) => [entry.productId, entry]));

  const map: ShopifyPriceMap = {};
  for (const course of courses) {
    const manual = course.shopifyProductId
      ? byProductId.get(course.shopifyProductId)
      : undefined;
    const bySlug = byHandle.get(course.slug.toLowerCase()) ?? bySku.get(course.slug.toLowerCase());
    const matched = manual ?? bySlug;
    if (matched) {
      map[course.slug] = matched;
    }
  }
  return map;
}

async function fetchLivePriceMap(): Promise<ShopifyPriceMap> {
  const credentials = await getShopifyCredentials();
  if (!credentials) return {};

  const products = await listShopifyProducts(credentials);
  const entries = buildPriceEntries(products);

  let courseKeys: Array<{ slug: string; shopifyProductId?: string | null }> = listCourses().map(
    (course) => ({ slug: course.slug }),
  );

  if (process.env.DATABASE_URL) {
    try {
      const dbCourses = await db.course.findMany({
        select: { slug: true, shopifyProductId: true },
      });
      if (dbCourses.length > 0) {
        courseKeys = dbCourses;
      }
    } catch {
      // keep catalog slugs
    }
  }

  return mapPricesToCourses(entries, courseKeys);
}

/** Cached Shopify price map (5 minutes). */
export const getShopifyPriceMap = unstable_cache(
  async () => {
    try {
      return await fetchLivePriceMap();
    } catch (error) {
      console.error("Shopify price fetch failed.", error);
      return {} as ShopifyPriceMap;
    }
  },
  ["shopify-price-map-v1"],
  { revalidate: 300, tags: ["shopify-price-map-v1"] },
);

export async function syncShopifyPricesToDatabase(): Promise<{
  updated: number;
  matched: number;
  products: number;
}> {
  const credentials = await getShopifyCredentials();
  if (!credentials) {
    throw new Error("Shopify is not connected. Save your store domain and Admin API token first.");
  }

  const products = await listShopifyProducts(credentials);
  const entries = buildPriceEntries(products);

  if (!process.env.DATABASE_URL) {
    await markShopifySync({ ok: true });
    return { updated: 0, matched: 0, products: products.length };
  }

  const courses = await db.course.findMany({
    select: { id: true, slug: true, shopifyProductId: true, price: true, currency: true },
  });
  const priceMap = mapPricesToCourses(entries, courses);

  let updated = 0;
  for (const course of courses) {
    const match = priceMap[course.slug];
    if (!match) continue;
    await db.course.update({
      where: { id: course.id },
      data: {
        price: match.price,
        currency: match.currency,
        shopifyProductId: match.productId,
        shopifyVariantId: match.variantId,
        shopifySyncedAt: new Date(),
      },
    });
    updated += 1;
  }

  await markShopifySync({ ok: true });
  return { updated, matched: Object.keys(priceMap).length, products: products.length };
}

export function applyShopifyPrices<T extends { slug: string; price: number; currency?: string }>(
  courses: T[],
  priceMap: ShopifyPriceMap,
): T[] {
  return courses.map((course) => {
    const live = priceMap[course.slug];
    if (!live) return course;
    return {
      ...course,
      price: live.price,
      currency: live.currency,
    };
  });
}
