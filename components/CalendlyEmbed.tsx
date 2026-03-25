"use client";

import { useEffect, useState } from "react";

const BASE =
  "https://calendly.com/davidperk?embed_type=Inline&background_color=010409&primary_color=6243ff&text_color=ffffff";

type CalendlyEmbedProps = {
  className?: string;
  minHeight?: number;
};

export function CalendlyEmbed({
  className = "",
  minHeight = 720,
}: CalendlyEmbedProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const host = window.location.host || "localhost";
    const embedDomain = encodeURIComponent(host);
    setSrc(`${BASE}&embed_domain=${embedDomain}`);
  }, []);

  return (
    <div
      className={`calendly-inline-widget w-full overflow-hidden rounded-[14px] ${className}`}
      style={{ minHeight }}
    >
      {!src ? (
        <div
          className="flex w-full items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-sm text-[var(--dp-muted)]"
          style={{ minHeight }}
          aria-hidden
        >
          Loading scheduler…
        </div>
      ) : (
        <iframe
          title="Schedule a call with David Perk"
          src={src}
          width="100%"
          height={minHeight}
          className="min-h-[min(760px,100%)] w-full border-0"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
