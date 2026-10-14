import type { ShopifyCredentials, ShopifyProduct } from "./types";

const API_VERSION = "2024-10";

function shopUrl(domain: string, pathname: string): string {
  return `https://${domain}/admin/api/${API_VERSION}${pathname}`;
}

async function shopifyFetch<T>(
  credentials: ShopifyCredentials,
  pathname: string,
): Promise<T> {
  const response = await fetch(shopUrl(credentials.storeDomain, pathname), {
    headers: {
      "X-Shopify-Access-Token": credentials.accessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail
        ? `Shopify API ${response.status}: ${detail.slice(0, 240)}`
        : `Shopify API request failed (${response.status}).`,
    );
  }

  return (await response.json()) as T;
}

export async function testShopifyConnection(
  credentials: ShopifyCredentials,
): Promise<{ ok: true; shopName: string } | { ok: false; error: string }> {
  try {
    const payload = await shopifyFetch<{ shop: { name: string } }>(credentials, "/shop.json");
    return { ok: true, shopName: payload.shop.name };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to reach Shopify.",
    };
  }
}

/** Fetch all products (paginated) from Shopify Admin REST API. */
export async function listShopifyProducts(
  credentials: ShopifyCredentials,
): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let pageInfo: string | null = null;

  for (let page = 0; page < 20; page += 1) {
    const requestPath: string = pageInfo
      ? `/products.json?limit=250&page_info=${encodeURIComponent(pageInfo)}`
      : "/products.json?limit=250";

    const response: Response = await fetch(shopUrl(credentials.storeDomain, requestPath), {
      headers: {
        "X-Shopify-Access-Token": credentials.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Shopify products request failed (${response.status}).`);
    }

    const payload = (await response.json()) as { products: ShopifyProduct[] };
    products.push(...(payload.products ?? []));

    const linkHeader: string = response.headers.get("link") ?? "";
    const nextMatch: RegExpMatchArray | null = linkHeader.match(
      /<[^>]*[?&]page_info=([^&>]+)[^>]*>; rel="next"/i,
    );
    pageInfo = nextMatch?.[1] ? decodeURIComponent(nextMatch[1]) : null;
    if (!pageInfo) break;
  }

  return products;
}
