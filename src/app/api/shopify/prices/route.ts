import { NextResponse } from "next/server";

import { getShopifyPriceMap } from "@/lib/shopify/prices";

/** Public price map used by the catalog to show live Shopify amounts. */
export async function GET() {
  try {
    const prices = await getShopifyPriceMap();
    return NextResponse.json(
      { ok: true, prices },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=240",
        },
      },
    );
  } catch (error) {
    console.error("Shopify prices API failed.", error);
    return NextResponse.json({ ok: false, prices: {}, error: "Unavailable" }, { status: 200 });
  }
}
