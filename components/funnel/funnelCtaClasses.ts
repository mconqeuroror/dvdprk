import type { CtaVariant } from "@/lib/funnel-types";

export const FUNNEL_CTA_PRIMARY =
  "dp-cta-glow-primary mx-auto inline-flex h-11 w-full max-w-sm origin-center items-center justify-center rounded-full bg-[var(--dp-accent)] px-6 text-sm font-bold text-white transition-transform duration-300 ease-out hover:scale-[1.02] hover:sm:scale-110 sm:mx-0 sm:h-12 sm:w-auto sm:max-w-none sm:min-w-[12rem] sm:px-10 active:scale-[0.98]";

export const FUNNEL_CTA_OUTLINE =
  "dp-cta-glow-outline mx-auto inline-flex h-11 w-full max-w-sm origin-center items-center justify-center rounded-full border-2 border-white/90 bg-transparent px-6 text-sm font-bold text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[var(--dp-accent)] hover:bg-white/[0.06] hover:sm:scale-105 sm:mx-0 sm:h-12 sm:w-auto sm:max-w-none sm:min-w-[12rem] sm:px-10 active:scale-[0.98]";

export const FUNNEL_CTA_OUTLINE_STRONG =
  "dp-cta-glow-outline-strong mx-auto inline-flex h-11 w-full max-w-sm origin-center items-center justify-center rounded-full border-2 border-white/90 bg-transparent px-6 text-sm font-bold text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[var(--dp-accent)] hover:bg-white/[0.06] hover:sm:scale-105 sm:mx-0 sm:h-12 sm:w-auto sm:max-w-none sm:min-w-[12rem] sm:px-10 active:scale-[0.98]";

export function funnelCtaClass(variant: CtaVariant): string {
  if (variant === "primary") return FUNNEL_CTA_PRIMARY;
  if (variant === "outlineStrong") return FUNNEL_CTA_OUTLINE_STRONG;
  return FUNNEL_CTA_OUTLINE;
}
