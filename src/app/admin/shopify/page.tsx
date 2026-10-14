import Link from "next/link";
import { redirect } from "next/navigation";

import { ShopifyPanel } from "@/components/admin/shopify-panel";
import { Button } from "@/components/ui/button";
import { isAdminSignedIn } from "@/lib/admin-session";
import { loadShopifyAdminData } from "@/lib/shopify/actions";

export const dynamic = "force-dynamic";

export default async function AdminShopifyPage() {
  if (!(await isAdminSignedIn())) {
    redirect("/admin/login");
  }

  const data = await loadShopifyAdminData();

  return (
    <main className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div>
            <p className="font-display text-lg tracking-tight">Shopify prices</p>
            <p className="text-muted-foreground text-xs">Admin · dynamic course amounts</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/courses">View courses</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <ShopifyPanel
          status={data.status}
          products={data.products}
          productError={data.productError}
          courses={data.courses}
        />
      </div>
    </main>
  );
}
