import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/panel")) {
    const ok = request.cookies.get("dp_admin")?.value === "1";
    if (!ok) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/panel", "/admin/panel/"],
};
