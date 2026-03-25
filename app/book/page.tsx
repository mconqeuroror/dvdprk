import type { Metadata } from "next";
import Link from "next/link";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Schedule a call with David Perk via Calendly.",
};

export default function BookPage() {
  return (
    <div className="relative min-h-screen overflow-hidden pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:pt-28 md:pt-32">
      <PageBackgroundGlow variant="book" />
      <main className="relative z-[1] mx-auto min-w-0 max-w-4xl px-3 pb-16 sm:px-4 sm:pb-20 md:px-6">
        <Link
          href="/"
          className="text-sm text-[var(--dp-muted)] transition-colors hover:text-white"
        >
          ← Back to home
        </Link>
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-2xl font-bold text-white sm:mt-8 sm:text-3xl md:text-4xl">
          Book a call
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--dp-muted)] sm:mt-3 sm:text-base">
          Pick a time that works for you. The widget uses your Calendly colors.
        </p>
        <div className="mt-6 sm:mt-8">
          <CalendlyEmbed minHeight={800} />
        </div>
      </main>
    </div>
  );
}
