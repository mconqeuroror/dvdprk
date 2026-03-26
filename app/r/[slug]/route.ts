import { NextResponse } from "next/server";
import { buildDestinationWithUtm } from "@/lib/utm-url";
import { getPublicSiteOriginFromRequest } from "@/lib/public-site-url";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const clean = slug.trim().toLowerCase();
  if (!clean || clean.length > 64) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  try {
    const link = await prisma.utmTrackedLink.findUnique({
      where: { slug: clean },
    });
    if (!link) {
      return NextResponse.redirect(new URL("/", request.url), 302);
    }

    await prisma.utmLinkClick.create({
      data: { linkId: link.id },
    });

    const origin = getPublicSiteOriginFromRequest(request);
    const target = buildDestinationWithUtm(link, origin);
    return NextResponse.redirect(target, 302);
  } catch (e) {
    console.error("[r/slug]", e);
    return NextResponse.redirect(new URL("/", request.url), 302);
  }
}
