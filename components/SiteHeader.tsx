import Link from "next/link";

const navLink =
  "text-sm text-[var(--dp-muted)] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dp-accent)]";

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-6">
      <div className="pointer-events-auto mx-auto max-w-6xl">
        <div className="glass-nav-shell">
          <div className="glass-nav-inner flex h-16 items-center justify-between gap-6 px-5 md:h-[72px] md:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white md:gap-3.5 md:text-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt=""
                width={1021}
                height={565}
                className="h-[1.6rem] w-auto shrink-0 opacity-95 md:h-[1.8rem]"
                aria-hidden
              />
              <span>David Perk</span>
            </Link>
            <nav
              className="flex items-center gap-5 md:gap-8"
              aria-label="Primary"
            >
              <Link href="/" className={navLink}>
                Home
              </Link>
              <Link href="/free-course" className={navLink}>
                Free course
              </Link>
              <Link
                href="/book"
                className="rounded-full bg-[var(--dp-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Book a call
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
