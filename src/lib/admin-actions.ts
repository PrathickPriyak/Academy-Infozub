"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import { signInAdmin, signOutAdmin } from "@/lib/admin-session";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let ok = false;
  try {
    ok = await signInAdmin(email, password);
  } catch (error) {
    // Never swallow Next.js redirect() throws from deeper helpers.
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Admin sign-in failed.", error);
    redirect("/infozub-admin/login?error=1");
  }

  if (!ok) {
    redirect("/infozub-admin/login?error=1");
  }

  redirect("/infozub-admin");
}

export async function logoutAction(): Promise<void> {
  await signOutAdmin();
  redirect("/infozub-admin/login");
}
