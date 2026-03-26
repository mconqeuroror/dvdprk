"use client";

import { useEffect, useState } from "react";
import { FunnelBlocksRenderer } from "@/components/funnel/FunnelBlocksRenderer";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import type { FunnelBlock, FunnelPageId } from "@/lib/funnel-types";
import type { SiteConfig } from "@/lib/site-config";

type PreviewMsg = {
  type: "dp-funnel-preview";
  page: FunnelPageId;
  blocks: FunnelBlock[];
  config: SiteConfig;
};

export function FunnelPreviewFrame() {
  const [payload, setPayload] = useState<PreviewMsg | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const d = e.data as PreviewMsg | undefined;
      if (d?.type === "dp-funnel-preview") setPayload(d);
    }
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "dp-funnel-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!payload) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[var(--dp-muted)]">
        Waiting for editor…
      </div>
    );
  }

  const { page, blocks, config } = payload;
  const glowVariant =
    page === "home" ? "home" : page === "basicCourse" ? "basicCourse" : "book";

  const previewConfig: SiteConfig = {
    ...config,
    funnelPages: null,
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--dp-bg)] pt-6 text-[var(--dp-text)]">
      <PageBackgroundGlow variant={glowVariant} />
      <FunnelBlocksRenderer
        page={page}
        blocks={blocks}
        config={previewConfig}
      />
    </div>
  );
}
