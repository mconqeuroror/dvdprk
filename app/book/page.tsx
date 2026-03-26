import type { Metadata } from "next";
import { DevScrollGrid } from "@/components/DevScrollGrid";
import { FunnelBlocksRenderer } from "@/components/funnel/FunnelBlocksRenderer";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import { SiteFooter } from "@/components/SiteFooter";
import { visibleBlocks } from "@/lib/funnel-types";
import { getFunnelPages, getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Schedule a call with David Perk via Calendly.",
};

export default async function BookPage() {
  const config = await getSiteConfig();
  const blocks = visibleBlocks(getFunnelPages(config).book);

  return (
    <div className="relative min-h-screen overflow-hidden pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-10 md:pt-12">
      <PageBackgroundGlow variant="book" />
      {process.env.NODE_ENV === "development" ? <DevScrollGrid /> : null}
      <FunnelBlocksRenderer page="book" blocks={blocks} config={config} />
      <SiteFooter />
    </div>
  );
}
