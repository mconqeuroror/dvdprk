import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyButton } from "@/components/admin/CopyButton";
import { UtmClicksBarChart } from "@/components/admin/UtmClicksBarChart";
import { getPublicSiteOrigin } from "@/lib/public-site-url";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { bucketClicksByDay } from "@/lib/utm-clicks-series";
import { buildDestinationWithUtm, trackingUrlForSlug } from "@/lib/utm-url";
import { logoutAction } from "../../actions";
import { deleteUtmLinkAction } from "../actions";

export default async function AdminUtmLinkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const jar = await cookies();
  if (jar.get("dp_admin")?.value !== "1") {
    redirect("/admin");
  }

  if (!hasDatabaseUrl()) {
    redirect("/admin/utm?error=nodb");
  }

  const { id } = await params;
  const sp = await searchParams;
  const origin = await getPublicSiteOrigin();

  const link = await prisma.utmTrackedLink.findUnique({
    where: { id },
    include: { _count: { select: { clicks: true } } },
  });

  if (!link) notFound();

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 86400000);
  const since7 = new Date(now.getTime() - 7 * 86400000);
  const since24 = new Date(now.getTime() - 86400000);

  const [recentClicks, total7, total24] = await Promise.all([
    prisma.utmLinkClick.findMany({
      where: { linkId: id, createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
    prisma.utmLinkClick.count({
      where: { linkId: id, createdAt: { gte: since7 } },
    }),
    prisma.utmLinkClick.count({
      where: { linkId: id, createdAt: { gte: since24 } },
    }),
  ]);

  const series30 = bucketClicksByDay(
    recentClicks.map((c) => c.createdAt),
    30,
  );
  const series7 = bucketClicksByDay(
    recentClicks.filter((c) => c.createdAt >= since7).map((c) => c.createdAt),
    7,
  );

  const tracking = trackingUrlForSlug(origin, link.slug);
  const finalUrl = buildDestinationWithUtm(link, origin);

  return (
    <main className="mx-auto max-w-4xl px-3 py-12 pb-24 sm:px-4 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/utm"
          className="text-sm text-[var(--dp-muted)] hover:text-white"
        >
          ← All UTM links
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-red-300 hover:text-red-200"
          >
            Log out
          </button>
        </form>
      </div>

      {sp.created ? (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Link created. Copy the tracking URL below and use it in ads or bios.
        </p>
      ) : null}

      <h1 className="mt-6 font-[family-name:var(--font-syne)] text-2xl font-bold text-white">
        {link.name}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-[var(--dp-muted)]">
            All time
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {link._count.clicks}
          </p>
        </div>
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-[var(--dp-muted)]">
            Last 7 days
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{total7}</p>
        </div>
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-[var(--dp-muted)]">
            Last 24 hours
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{total24}</p>
        </div>
      </div>

      <div className="mt-8 space-y-2 rounded-xl border border-white/12 bg-white/[0.03] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--dp-muted)]">
          Tracking URL (short)
        </p>
        <p className="break-all font-mono text-sm text-white">{tracking}</p>
        <CopyButton text={tracking} label="Copy tracking URL" />
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--dp-muted)]">
          Final destination (after redirect + UTMs)
        </p>
        <p className="break-all font-mono text-xs text-[var(--dp-muted)]">
          {finalUrl}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <UtmClicksBarChart
          series={series7}
          title="Clicks per day (last 7 days, UTC)"
        />
        <UtmClicksBarChart
          series={series30}
          title="Clicks per day (last 30 days, UTC)"
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href={`/api/admin/utm/links/${link.id}/export`}
          className="inline-flex items-center rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          Export CSV (all clicks)
        </a>
        <form action={deleteUtmLinkAction}>
          <input type="hidden" name="id" value={link.id} />
          <button
            type="submit"
            className="rounded-full border border-red-500/40 px-6 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10"
          >
            Delete link
          </button>
        </form>
      </div>
    </main>
  );
}
