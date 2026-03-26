import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-dp-bg pt-[max(5rem,env(safe-area-inset-top))] sm:pt-24 md:pt-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(50vh,420px)] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(98,67,255,0.12)_0%,transparent_65%)]"
        aria-hidden
      />
      <main className="relative z-[1] mx-auto max-w-lg px-4 pb-16 text-center">
        <p className="font-[family-name:var(--font-syne)] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--dp-muted)]">
          404
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[var(--dp-muted)] sm:text-base">
          The link may be broken or the page was removed. Head back to the site
          to continue.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--dp-accent)] px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dp-bg)]"
        >
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
