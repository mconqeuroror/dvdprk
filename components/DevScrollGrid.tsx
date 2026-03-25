"use client";

import { useEffect, useState } from "react";

/**
 * Development only: sits above PageBackgroundGlow, below main (z-0).
 * Client-only after mount so SSR + first paint match (no hydration mismatch).
 */
export function DevScrollGrid() {
  const [mounted, setMounted] = useState(false);
  const [opacity, setOpacity] = useState(0.18);
  const [radialYPercent, setRadialYPercent] = useState(32);
  const [radialXPercent, setRadialXPercent] = useState(50);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    setMounted(true);

    let raf = 0;
    const tick = () => {
      const root = document.documentElement;
      const sh = Math.max(1, root.scrollHeight);
      const max = Math.max(1, sh - window.innerHeight);
      const p = Math.min(1, Math.max(0, root.scrollTop / max));

      setOpacity(0.09 + p * 0.34);

      const centerY = root.scrollTop + window.innerHeight * 0.4;
      const yPct = (centerY / sh) * 100;
      setRadialYPercent(Math.min(96, Math.max(4, yPct)));

      const xPct = 50 + Math.sin(p * Math.PI) * 12;
      setRadialXPercent(Math.min(88, Math.max(12, xPct)));
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  if (!mounted || process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        opacity,
        backgroundImage: `
          radial-gradient(
            ellipse 90% 50% at ${radialXPercent}% ${radialYPercent}%,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.08) 32%,
            transparent 58%
          ),
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "auto, 48px 48px, 48px 48px",
      }}
      aria-hidden
    />
  );
}
