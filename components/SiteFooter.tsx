"use client";

import { SocialFooterIcons } from "@/components/SocialFooterIcons";

export function SiteFooter() {
  return (
    <footer className="relative z-[1] border-t border-white/10 py-8 text-center text-xs text-[var(--dp-muted)] sm:py-10 sm:text-sm">
      <SocialFooterIcons />
      <p>© {new Date().getFullYear()} David Perk All Rights Reserved</p>
    </footer>
  );
}
