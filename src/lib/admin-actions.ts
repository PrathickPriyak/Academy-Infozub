"use server";

import { redirect } from "next/navigation";

import { signInAdmin, signOutAdmin } from "@/lib/admin-session";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    const ok = await signInAdmin(email, password);
    if (!ok) {
      redirect("/admin/login?error=1");
    }
  } catch (error) {
    console.error("Admin sign-in failed.", error);
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await signOutAdmin();
  redirect("/admin/login");
}
