"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  mapCourseToShopifyAction,
  saveShopifyConnectionAction,
  syncShopifyPricesAction,
  testShopifyConnectionAction,
  type ShopifyActionState,
} from "@/lib/shopify/actions";
import { formatPrice } from "@/lib/courses/present";
import type { ShopifyPriceEntry } from "@/lib/shopify/types";

const initial: ShopifyActionState = { ok: false, message: "" };

export function ShopifyPanel({
  status,
  products,
  productError,
  courses,
}: {
  status: {
    configured: boolean;
    storeDomain: string | null;
    source: "env" | "database" | "file" | null;
    lastSyncedAt: string | null;
    lastError: string | null;
  };
  products: ShopifyPriceEntry[];
  productError: string | null;
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    shopifyProductId: string | null;
    shopifySyncedAt: Date | string | null;
  }>;
}) {
  const [saveState, saveAction, savePending] = useActionState(saveShopifyConnectionAction, initial);
  const [mapState, mapAction, mapPending] = useActionState(mapCourseToShopifyAction, initial);
  const [syncMessage, setSyncMessage] = useState<ShopifyActionState | null>(null);
  const [testMessage, setTestMessage] = useState<ShopifyActionState | null>(null);
  const [busy, setBusy] = useState(false);

  async function runTest() {
    setBusy(true);
    setTestMessage(await testShopifyConnectionAction());
    setBusy(false);
  }

  async function runSync() {
    setBusy(true);
    setSyncMessage(await syncShopifyPricesAction());
    setBusy(false);
  }

  return (
    <div className="grid gap-8">
      <section className="border-border bg-card rounded-2xl border p-5 shadow-xs">
        <h2 className="font-display text-xl tracking-tight">Shopify connection</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Connect your Shopify Admin API so course amounts update automatically. Products are matched by{" "}
          <strong>handle</strong> or <strong>SKU</strong> equal to the course slug, or by a manual product map below.
        </p>

        <div className="mt-4 grid gap-2 text-sm">
          <p>
            Status:{" "}
            <span className={status.configured ? "text-success font-semibold" : "text-destructive font-semibold"}>
              {status.configured ? "Connected" : "Not connected"}
            </span>
            {status.storeDomain ? ` · ${status.storeDomain}` : null}
            {status.source ? ` · via ${status.source}` : null}
          </p>
          {status.lastSyncedAt ? (
            <p className="text-muted-foreground">Last sync: {new Date(status.lastSyncedAt).toLocaleString("en-IN")}</p>
          ) : null}
          {status.lastError ? <p className="text-destructive">{status.lastError}</p> : null}
        </div>

        <form action={saveAction} className="mt-5 grid gap-3 sm:max-w-xl">
          <label className="grid gap-1.5 text-sm font-semibold">
            Store domain
            <Input
              name="storeDomain"
              required
              placeholder="your-store.myshopify.com"
              defaultValue={status.storeDomain ?? ""}
              autoComplete="off"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Admin API access token
            <Input
              name="accessToken"
              required
              type="password"
              placeholder="shpat_…"
              autoComplete="off"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={savePending || busy}>
              {savePending ? "Saving…" : "Save & connect"}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => void runTest()}>
              Test connection
            </Button>
            <Button type="button" variant="secondary" disabled={busy} onClick={() => void runSync()}>
              Sync prices now
            </Button>
          </div>
          {saveState.message ? (
            <p className={saveState.ok ? "text-success text-sm" : "text-destructive text-sm"}>{saveState.message}</p>
          ) : null}
          {testMessage ? (
            <p className={testMessage.ok ? "text-success text-sm" : "text-destructive text-sm"}>{testMessage.message}</p>
          ) : null}
          {syncMessage ? (
            <p className={syncMessage.ok ? "text-success text-sm" : "text-destructive text-sm"}>{syncMessage.message}</p>
          ) : null}
        </form>

        <div className="text-muted-foreground mt-5 space-y-1 text-xs leading-relaxed">
          <p>Create a custom app in Shopify Admin → Settings → Apps → Develop apps → Admin API access token.</p>
          <p>Scopes needed: <code>read_products</code>.</p>
          <p>
            On Vercel you can also set <code>SHOPIFY_STORE_DOMAIN</code> and <code>SHOPIFY_ADMIN_ACCESS_TOKEN</code>.
          </p>
        </div>
      </section>

      <section className="border-border bg-card rounded-2xl border p-5 shadow-xs">
        <h2 className="font-display text-xl tracking-tight">Shopify products</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {products.length} product{products.length === 1 ? "" : "s"} loaded
          {productError ? ` · ${productError}` : null}
        </p>
        {products.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm">No products yet. Connect Shopify to load the catalog.</p>
        ) : (
          <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-border/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Handle / SKU</th>
                  <th className="px-3 py-2 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId} className="border-border/60 border-t">
                    <td className="px-3 py-2">{product.title}</td>
                    <td className="text-muted-foreground px-3 py-2">
                      {product.handle}
                      {product.sku ? ` · ${product.sku}` : ""}
                    </td>
                    <td className="px-3 py-2 font-medium">{formatPrice(product.price, product.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border-border bg-card rounded-2xl border p-5 shadow-xs">
        <h2 className="font-display text-xl tracking-tight">Course price mapping</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Auto-match uses course slug = Shopify handle/SKU. Use the dropdown for a manual product link (requires database).
        </p>

        {courses.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm">
            No database courses found. Prices still overlay on the public catalog when Shopify handles match course slugs.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {courses.map((course) => (
              <form
                key={course.id}
                action={mapAction}
                className="border-border/70 grid gap-2 rounded-xl border p-3 sm:grid-cols-[1.4fr_1fr_auto] sm:items-end"
              >
                <input type="hidden" name="courseId" value={course.id} />
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-muted-foreground text-xs">
                    slug: {course.slug} · current {formatPrice(course.price, course.currency)}
                    {course.shopifySyncedAt
                      ? ` · synced ${new Date(course.shopifySyncedAt).toLocaleString("en-IN")}`
                      : ""}
                  </p>
                </div>
                <label className="grid gap-1 text-xs font-semibold">
                  Shopify product
                  <select
                    name="productId"
                    defaultValue={course.shopifyProductId ?? ""}
                    className="border-border bg-background h-11 rounded-xl border px-3 text-sm"
                  >
                    <option value="">Auto (handle/SKU)</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.title} — {formatPrice(product.price, product.currency)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" variant="outline" disabled={mapPending}>
                  Save map
                </Button>
              </form>
            ))}
            {mapState.message ? (
              <p className={mapState.ok ? "text-success text-sm" : "text-destructive text-sm"}>{mapState.message}</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
