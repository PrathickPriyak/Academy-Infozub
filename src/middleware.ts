import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { adminCookieName, verifyAdminToken } from "@/lib/admin-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy /admin → /infozub-admin
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/admin/, "/infozub-admin");
    return NextResponse.redirect(url);
  }

  if (pathname === "/infozub-admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(adminCookieName)?.value;
  const signedIn = token ? await verifyAdminToken(token) : false;
  if (signedIn) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/infozub-admin")) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const login = request.nextUrl.clone();
  login.pathname = "/infozub-admin/login";
  login.search = "";
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/infozub-admin",
    "/infozub-admin/:path*",
    "/api/infozub-admin/:path*",
  ],
};
