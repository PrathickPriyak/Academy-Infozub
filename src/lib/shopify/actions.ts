"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-session";
import { db } from "@/lib/db";

import { testShopifyConnection, listShopifyProducts } from "./client";
import {
  getShopifyConnectionStatus,
  getShopifyCredentials,
  saveShopifyCredentials,
} from "./config";
import { buildPriceEntries, syncShopifyPricesToDatabase } from "./prices";

export type ShopifyActionState = {
  ok: boolean;
  message: string;
};

function refreshShopifyPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/shopify");
  revalidatePath("/courses");
  revalidatePath("/");
  // Bust cached price map
  try {
    revalidateTag("shopify-price-map-v1");
  } catch {
    // older next may ignore
  }
}

export async function saveShopifyConnectionAction(
  _prev: ShopifyActionState,
  formData: FormData,
): Promise<ShopifyActionState> {
  await requireAdmin();
  const storeDomain = String(formData.get("storeDomain") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  if (!storeDomain || !accessToken) {
    return { ok: false, message: "Store domain and Admin API access token are required." };
  }

  const probe = await testShopifyConnection({
    storeDomain,
    accessToken,
  });
  if (!probe.ok) {
    return { ok: false, message: `Connection failed: ${probe.error}` };
  }

  const saved = await saveShopifyCredentials({ storeDomain, accessToken });
  refreshShopifyPaths();
  return {
    ok: true,
    message: `Connected to ${probe.shopName}. Saved via ${saved.source}.`,
  };
}

export async function testShopifyConnectionAction(): Promise<ShopifyActionState> {
  await requireAdmin();
  const credentials = await getShopifyCredentials();
  if (!credentials) {
    return { ok: false, message: "No Shopify credentials configured yet." };
  }
  const probe = await testShopifyConnection(credentials);
  if (!probe.ok) return { ok: false, message: probe.error };
  return { ok: true, message: `Shopify reachable — shop: ${probe.shopName}` };
}

export async function syncShopifyPricesAction(): Promise<ShopifyActionState> {
  await requireAdmin();
  try {
    const result = await syncShopifyPricesToDatabase();
    refreshShopifyPaths();
    return {
      ok: true,
      message: `Synced ${result.updated} course price(s) from ${result.products} Shopify product(s) (${result.matched} matched).`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Price sync failed.",
    };
  }
}

export async function mapCourseToShopifyAction(
  _prev: ShopifyActionState,
  formData: FormData,
): Promise<ShopifyActionState> {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  if (!courseId) return { ok: false, message: "Course is required." };

  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "Database is required to save product mappings. Set DATABASE_URL or match products by handle/SKU.",
    };
  }

  try {
    if (!productId) {
      await db.course.update({
        where: { id: courseId },
        data: { shopifyProductId: null, shopifyVariantId: null, shopifySyncedAt: null },
      });
      refreshShopifyPaths();
      return { ok: true, message: "Shopify mapping cleared." };
    }

    const credentials = await getShopifyCredentials();
    if (!credentials) return { ok: false, message: "Connect Shopify first." };

    const products = await listShopifyProducts(credentials);
    const entry = buildPriceEntries(products).find((item) => item.productId === productId);
    if (!entry) return { ok: false, message: "Shopify product not found." };

    await db.course.update({
      where: { id: courseId },
      data: {
        shopifyProductId: entry.productId,
        shopifyVariantId: entry.variantId,
        price: entry.price,
        currency: entry.currency,
        shopifySyncedAt: new Date(),
      },
    });
    refreshShopifyPaths();
    return {
      ok: true,
      message: `Mapped and set price to ${entry.price} ${entry.currency}.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to save mapping.",
    };
  }
}

export async function loadShopifyAdminData() {
  await requireAdmin();
  const status = await getShopifyConnectionStatus();
  const credentials = await getShopifyCredentials();

  let products: ReturnType<typeof buildPriceEntries> = [];
  let productError: string | null = null;
  if (credentials) {
    try {
      const raw = await listShopifyProducts(credentials);
      products = buildPriceEntries(raw);
    } catch (error) {
      productError = error instanceof Error ? error.message : "Failed to load products.";
    }
  }

  let courses: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    shopifyProductId: string | null;
    shopifySyncedAt: Date | null;
  }> = [];

  if (process.env.DATABASE_URL) {
    try {
      courses = await db.course.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          currency: true,
          shopifyProductId: true,
          shopifySyncedAt: true,
        },
        orderBy: { title: "asc" },
      });
    } catch {
      courses = [];
    }
  }

  return { status, products, productError, courses };
}
