import type { Metadata } from "next";
import { DevScrollGrid } from "@/components/DevScrollGrid";
import { FunnelBlocksRenderer } from "@/components/funnel/FunnelBlocksRenderer";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import { SiteFooter } from "@/components/SiteFooter";
import { visibleBlocks } from "@/lib/funnel-types";
import { getFunnelPages, getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Basic course",
  description:
    "Basic Forex mini course from David Perk — modules and book a live call.",
  openGraph: {
    title: "Basic course",
    description:
      "Basic Forex mini course from David Perk — modules and book a live call.",
  },
  twitter: {
    title: "Basic course",
    description:
      "Basic Forex mini course from David Perk — modules and book a live call.",
  },
};

export default async function BasicCoursePage() {
  const config = await getSiteConfig();
  const blocks = visibleBlocks(getFunnelPages(config).basicCourse);

  return (
    <div className="relative min-h-screen pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-10 md:pt-12">
      <PageBackgroundGlow variant="basicCourse" />
      {process.env.NODE_ENV === "development" ? <DevScrollGrid /> : null}
      <FunnelBlocksRenderer
        page="basicCourse"
        blocks={blocks}
        config={config}
      />
      <SiteFooter />
    </div>
  );
}
