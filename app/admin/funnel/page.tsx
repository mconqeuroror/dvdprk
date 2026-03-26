import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FunnelPagesEditor } from "@/components/admin/FunnelPagesEditor";
import { hasDatabaseUrl } from "@/lib/prisma";
import { getFunnelPages, getSiteConfig } from "@/lib/site-config";
import { logoutAction } from "../actions";

export default async function AdminFunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const jar = await cookies();
  if (jar.get("dp_admin")?.value !== "1") {
    redirect("/admin");
  }
  const config = await getSiteConfig();
  const initialPages = getFunnelPages(config);
  const sp = await searchParams;
  const storageHint = hasDatabaseUrl()
    ? "the database"
    : "data/site-config.json";

  return (
    <main className="mx-auto max-w-7xl px-3 py-12 pb-24 sm:px-4 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white">
          Funnel pages (3 routes)
        </h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/panel"
            className="text-sm text-[var(--dp-muted)] hover:text-white"
          >
            Media &amp; copy
          </Link>
          <Link href="/" className="text-sm text-[var(--dp-muted)] hover:text-white">
            View site
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

      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Funnel layout saved to {storageHint}. Public pages updated.
        </p>
      ) : null}
      {sp.error === "parse" ? (
        <p className="mt-4 text-sm text-red-300">Invalid JSON — nothing was saved.</p>
      ) : null}
      {sp.error === "invalid" ? (
        <p className="mt-4 text-sm text-red-300">
          Funnel data failed validation — restore from backup or reset blocks.
        </p>
      ) : null}

      <p className="mt-6 max-w-2xl text-sm text-[var(--dp-muted)]">
        Edit <strong className="text-white/90">Home</strong> (
        <code className="text-white/70">/</code>),{" "}
        <strong className="text-white/90">Basic course</strong>, and{" "}
        <strong className="text-white/90">Book</strong> as ordered blocks.
        Hero video, sliders, success videos, and course modules still use the{" "}
        <Link href="/admin/panel" className="text-[var(--dp-accent)] hover:underline">
          main admin panel
        </Link>
        . This is a structured builder (not a free-form Figma canvas).
      </p>

      <div className="mt-10">
        <FunnelPagesEditor initialPages={initialPages} config={config} />
      </div>
    </main>
  );
}
