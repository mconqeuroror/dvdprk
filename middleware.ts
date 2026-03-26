import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/admin/panel") ||
    pathname.startsWith("/admin/funnel") ||
    pathname.startsWith("/admin/utm")
  ) {
    const ok = request.cookies.get("dp_admin")?.value === "1";
    if (!ok) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/panel",
    "/admin/panel/:path*",
    "/admin/funnel",
    "/admin/funnel/:path*",
    "/admin/utm",
    "/admin/utm/:path*",
  ],
};
