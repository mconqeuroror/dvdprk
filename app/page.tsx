import { DevScrollGrid } from "@/components/DevScrollGrid";
import { FunnelBlocksRenderer } from "@/components/funnel/FunnelBlocksRenderer";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import { SiteFooter } from "@/components/SiteFooter";
import { visibleBlocks } from "@/lib/funnel-types";
import { getFunnelPages, getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getSiteConfig();
  const blocks = visibleBlocks(getFunnelPages(config).home);

  return (
    <div className="relative min-h-screen overflow-hidden pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-10 md:pt-12">
      <PageBackgroundGlow variant="home" />
      {process.env.NODE_ENV === "development" ? <DevScrollGrid /> : null}
      <div
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-[min(88vh,760px)] w-[min(100vw,960px)] bg-[radial-gradient(ellipse_58%_46%_at_78%_78%,rgba(98,67,255,0.38)_0%,rgba(98,67,255,0.18)_26%,rgba(98,67,255,0.08)_46%,rgba(98,67,255,0.03)_62%,transparent_78%)] sm:h-[min(82vh,840px)] sm:w-[min(96vw,1080px)] sm:bg-[radial-gradient(ellipse_56%_44%_at_80%_80%,rgba(98,67,255,0.42)_0%,rgba(98,67,255,0.2)_24%,rgba(98,67,255,0.09)_44%,rgba(98,67,255,0.035)_58%,transparent_76%)]"
        aria-hidden
      />

      <FunnelBlocksRenderer page="home" blocks={blocks} config={config} />

      <SiteFooter />
    </div>
  );
}
