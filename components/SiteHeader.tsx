import Link from "next/link";
import { GlassNavShell } from "@/components/GlassNavShell";
import { SiteHeaderNav } from "@/components/SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 md:px-6 md:pt-4">
      <div className="pointer-events-auto mx-auto max-w-6xl">
        <GlassNavShell>
          <div className="glass-nav-inner flex h-[3.5rem] items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 sm:px-5 md:h-[72px] md:px-8">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 font-[family-name:var(--font-syne)] text-base font-semibold tracking-tight text-white sm:gap-3 sm:text-lg md:gap-3.5 md:text-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt=""
                width={889}
                height={433}
                fetchPriority="high"
                decoding="async"
                className="h-7 w-auto shrink-0 opacity-95 sm:h-[1.6rem] md:h-[1.8rem]"
                aria-hidden
              />
              <span className="truncate">David Perk</span>
            </Link>
            <SiteHeaderNav />
          </div>
        </GlassNavShell>
      </div>
    </header>
  );
}
