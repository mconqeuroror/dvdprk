"use client";

import { useEffect, useState } from "react";

const BASE =
  "https://calendly.com/davidperk?embed_type=Inline&background_color=010409&primary_color=6243ff&text_color=ffffff";

type CalendlyEmbedProps = {
  className?: string;
  minHeight?: number;
};

function clampHeight(requested: number, vw: number): number {
  if (vw < 380) return Math.min(requested, 520);
  if (vw < 480) return Math.min(requested, 580);
  if (vw < 640) return Math.min(requested, 660);
  return requested;
}

export function CalendlyEmbed({
  className = "",
  minHeight = 720,
}: CalendlyEmbedProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [frameH, setFrameH] = useState(minHeight);

  useEffect(() => {
    const host = window.location.host || "localhost";
    const embedDomain = encodeURIComponent(host);
    setSrc(`${BASE}&embed_domain=${embedDomain}`);
  }, []);

  useEffect(() => {
    const sync = () => setFrameH(clampHeight(minHeight, window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [minHeight]);

  return (
    <div
      className={`calendly-inline-widget w-full min-w-0 overflow-hidden rounded-xl sm:rounded-[14px] ${className}`}
      style={{ minHeight: frameH }}
    >
      {!src ? (
        <div
          className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm text-[var(--dp-muted)] sm:rounded-[14px]"
          style={{ minHeight: frameH }}
          aria-hidden
        >
          Loading scheduler…
        </div>
      ) : (
        <iframe
          title="Schedule a call with David Perk"
          src={src}
          width="100%"
          height={frameH}
          className="w-full border-0"
          style={{ minHeight: frameH }}
        />
      )}
    </div>
  );
}
