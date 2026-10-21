import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/admin-actions";
import { demoAdmin, usingDemoAdminCredentials } from "@/lib/admin-session";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const showDemoHint = usingDemoAdminCredentials();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>Preview access for course management.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="grid gap-3">
            <Input
              name="email"
              type="email"
              required
              placeholder="Email"
              aria-label="Email"
              defaultValue={showDemoHint ? demoAdmin.email : undefined}
            />
            <Input
              name="password"
              type="password"
              required
              placeholder="Password"
              aria-label="Password"
            />
            {params.error ? (
              <p className="text-destructive text-sm">
                Those credentials were not accepted.
                {showDemoHint
                  ? null
                  : " Use the ADMIN_EMAIL and ADMIN_PASSWORD values set in Vercel, then redeploy."}
              </p>
            ) : null}
            <Button type="submit">Sign in</Button>
          </form>
          {showDemoHint ? (
            <p className="text-muted-foreground mt-4 text-xs">
              Sign in with {demoAdmin.email} / {demoAdmin.password}
              {process.env.NODE_ENV === "production"
                ? " (set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in Vercel to replace these)."
                : null}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
