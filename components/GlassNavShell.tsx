"use client";

import { useEffect, useState } from "react";

const MD_QUERY = "(min-width: 768px)";
const MAX_TINT = 0.6;

/**
 * Desktop only: darkens the glass bar as the user scrolls down the page
 * (scroll progress × max 60% opacity overlay).
 */
export function GlassNavShell({ children }: { children: React.ReactNode }) {
  const [tint, setTint] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(MD_QUERY);

    const update = () => {
      if (!mq.matches) {
        setTint(0);
        return;
      }
      const root = document.documentElement;
      const scrollable = Math.max(1, root.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / scrollable));
      setTint(p * MAX_TINT);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <div
      className="glass-nav-shell"
      style={{ ["--nav-scroll-tint" as string]: String(tint) }}
    >
      {children}
    </div>
  );
}
