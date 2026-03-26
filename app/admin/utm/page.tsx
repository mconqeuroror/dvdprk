import type { UtmTrackedLink } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/admin/CopyButton";
import { UtmDestinationPresets } from "@/components/admin/UtmDestinationPresets";
import { UtmShareBarChart } from "@/components/admin/UtmShareBarChart";
import { getPublicSiteOrigin } from "@/lib/public-site-url";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { trackingUrlForSlug } from "@/lib/utm-url";
import { logoutAction } from "../actions";
import { createUtmLinkAction } from "./actions";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/35";
const labelClass = "block text-xs text-[var(--dp-muted)]";

export default async function AdminUtmPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    deleted?: string;
  }>;
}) {
  const jar = await cookies();
  if (jar.get("dp_admin")?.value !== "1") {
    redirect("/admin");
  }

  const sp = await searchParams;
  const origin = await getPublicSiteOrigin();
  const db = hasDatabaseUrl();

  type LinkRow = UtmTrackedLink & { _count: { clicks: number } };
  let links: LinkRow[] = [];
  let shareRows: { name: string; count: number; share: number }[] = [];

  if (db) {
    links = await prisma.utmTrackedLink.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { clicks: true } } },
    });
    const total = links.reduce((s, l) => s + l._count.clicks, 0);
    shareRows = links.map((l) => ({
      name: l.name,
      count: l._count.clicks,
      share: total > 0 ? l._count.clicks / total : 0,
    }));
  }

  return (
    <main className="mx-auto max-w-4xl px-3 py-12 pb-24 sm:px-4 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white">
          UTM tracking links
        </h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/panel"
            className="text-sm text-[var(--dp-muted)] hover:text-white"
          >
            Media &amp; copy
          </Link>
          <Link
            href="/admin/funnel"
            className="text-sm text-[var(--dp-muted)] hover:text-white"
          >
            Funnel
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
      </div>

      <p className="mt-4 text-sm text-[var(--dp-muted)]">
        Short URLs like{" "}
        <code className="text-white/80">/r/yourcode</code> record a click, then
        send visitors to your destination with UTM parameters. Use{" "}
        <code className="text-white/80">NEXT_PUBLIC_SITE_URL</code> in production
        so copied links use your real domain.
      </p>

      {sp.deleted ? (
        <p className="mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-[var(--dp-muted)]">
          Link removed.
        </p>
      ) : null}

      {sp.error === "nodb" ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          PostgreSQL is required. Set <code className="text-white/80">DATABASE_URL</code>{" "}
          and run <code className="text-white/80">npx prisma db push</code>.
        </p>
      ) : null}
      {sp.error === "required" ? (
        <p className="mt-4 text-sm text-red-300">
          Fill name, destination, and all three required UTM fields.
        </p>
      ) : null}
      {sp.error === "slug" ? (
        <p className="mt-4 text-sm text-red-300">
          Could not allocate a unique short code — try again.
        </p>
      ) : null}

      {!db ? (
        <p className="mt-8 text-sm text-[var(--dp-muted)]">
          UTM tracking is disabled until the database is connected.
        </p>
      ) : (
        <>
          {shareRows.length >= 2 ? (
            <div className="mt-10">
              <UtmShareBarChart rows={shareRows} />
            </div>
          ) : null}

          <section className="mt-10">
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
              Create link
            </h2>
            <form action={createUtmLinkAction} className="mt-4 space-y-3">
              <div>
                <label className={labelClass} htmlFor="utm-name">
                  Internal name
                </label>
                <input
                  id="utm-name"
                  name="name"
                  required
                  placeholder="e.g. IG Reel — March promo"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="utm-dest">
                  Destination URL
                </label>
                <input
                  id="utm-dest"
                  name="destinationUrl"
                  required
                  placeholder="/  or  /basic-course  or  full https URL"
                  className={inputClass}
                />
                <UtmDestinationPresets inputId="utm-dest" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass} htmlFor="utm-src">
                    utm_source *
                  </label>
                  <input
                    id="utm-src"
                    name="utmSource"
                    required
                    placeholder="instagram"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="utm-med">
                    utm_medium *
                  </label>
                  <input
                    id="utm-med"
                    name="utmMedium"
                    required
                    placeholder="social"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="utm-camp">
                    utm_campaign *
                  </label>
                  <input
                    id="utm-camp"
                    name="utmCampaign"
                    required
                    placeholder="march_2025"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="utm-cont">
                    utm_content (optional)
                  </label>
                  <input
                    id="utm-cont"
                    name="utmContent"
                    placeholder="reel_01"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="utm-term">
                    utm_term (optional)
                  </label>
                  <input
                    id="utm-term"
                    name="utmTerm"
                    placeholder="forex"
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-full bg-[var(--dp-accent)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Create tracking link
              </button>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
              All links
            </h2>
            {links.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--dp-muted)]">
                No links yet. Create one above.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {links.map((l) => {
                  const track = trackingUrlForSlug(origin, l.slug);
                  return (
                    <li
                      key={l.id}
                      className="rounded-xl border border-white/12 bg-white/[0.03] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/utm/${l.id}`}
                            className="font-medium text-white hover:text-[var(--dp-accent)]"
                          >
                            {l.name}
                          </Link>
                          <p className="mt-1 break-all font-mono text-xs text-[var(--dp-muted)]">
                            {track}
                          </p>
                          <p className="mt-1 text-xs text-[var(--dp-muted)]">
                            {l.utmSource} / {l.utmMedium} / {l.utmCampaign}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className="text-sm font-semibold text-white">
                            {l._count.clicks} clicks
                          </span>
                          <CopyButton text={track} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
