"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

const desktopLinkBase =
  "text-sm text-[var(--dp-muted)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dp-bg)] rounded-sm";

const desktopLinkActive =
  "text-white underline decoration-2 decoration-[var(--dp-accent)] underline-offset-[7px]";

const mobileLinkBase =
  "block rounded-xl px-4 py-3.5 text-base font-medium text-white/95 transition-colors hover:bg-white/[0.08] active:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dp-bg)]";

const mobileLinkActive =
  "text-white underline decoration-2 decoration-[var(--dp-accent)] underline-offset-[7px]";

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ctaClass =
  "rounded-full bg-[var(--dp-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dp-bg)]";

function MobileMenuPortal({
  open,
  panelId,
  pathname,
  onClose,
}: {
  open: boolean;
  panelId: string;
  pathname: string | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[90] bg-black/50 md:hidden"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        id={panelId}
        className="fixed left-3 right-3 z-[100] max-h-[min(72vh,calc(100dvh-5rem))] overflow-y-auto rounded-2xl border border-white/12 bg-[#0a0d14]/96 p-2 shadow-2xl backdrop-blur-xl md:hidden"
        style={{
          top: "max(5.25rem, calc(env(safe-area-inset-top, 0px) + 4.25rem))",
        }}
      >
        <div className="flex flex-col py-1">
          <Link
            href="/"
            className={`${mobileLinkBase} ${isNavActive(pathname, "/") ? mobileLinkActive : ""}`}
            aria-current={isNavActive(pathname, "/") ? "page" : undefined}
            onClick={onClose}
          >
            Home
          </Link>
          <Link
            href="/basic-course"
            className={`${mobileLinkBase} ${isNavActive(pathname, "/basic-course") ? mobileLinkActive : ""}`}
            aria-current={
              isNavActive(pathname, "/basic-course") ? "page" : undefined
            }
            onClick={onClose}
          >
            Basic course
          </Link>
          <Link
            href="/book"
            className="mx-2 mt-1 flex h-12 items-center justify-center rounded-full bg-[var(--dp-accent)] px-4 text-sm font-semibold text-white hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dp-bg)]"
            onClick={onClose}
          >
            Book a call
          </Link>
        </div>
      </div>
    </>,
    document.body,
  );
}

export function SiteHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2 md:gap-0">
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dp-strong bg-white/[0.06] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dp-bg)] md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <span className="text-2xl leading-none" aria-hidden>
            ×
          </span>
        ) : (
          <span className="flex flex-col gap-1.5" aria-hidden>
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
          </span>
        )}
      </button>

      <nav
        className="hidden items-center gap-5 md:flex md:gap-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          className={`${desktopLinkBase} ${isNavActive(pathname, "/") ? desktopLinkActive : ""}`}
          aria-current={isNavActive(pathname, "/") ? "page" : undefined}
        >
          Home
        </Link>
        <Link
          href="/basic-course"
          className={`${desktopLinkBase} ${isNavActive(pathname, "/basic-course") ? desktopLinkActive : ""}`}
          aria-current={
            isNavActive(pathname, "/basic-course") ? "page" : undefined
          }
        >
          Basic course
        </Link>
        <Link href="/book" className={ctaClass}>
          Book a call
        </Link>
      </nav>

      <MobileMenuPortal
        open={open}
        panelId={panelId}
        pathname={pathname}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
