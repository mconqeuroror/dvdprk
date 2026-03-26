import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  if (jar.get("dp_admin")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await context.params;
  const link = await prisma.utmTrackedLink.findUnique({
    where: { id },
    include: {
      clicks: { orderBy: { createdAt: "asc" }, select: { createdAt: true } },
    },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const header = ["clicked_at_utc", "link_name", "slug", "utm_campaign"].map(csvEscape).join(",");
  const lines = link.clicks.map((c) =>
    [
      c.createdAt.toISOString(),
      link.name,
      link.slug,
      link.utmCampaign,
    ]
      .map(csvEscape)
      .join(","),
  );
  const body = `\uFEFF${[header, ...lines].join("\r\n")}`;

  const filename = `utm-clicks-${link.slug}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
