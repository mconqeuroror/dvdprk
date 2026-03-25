/** Dual-orb backgrounds; smaller on narrow viewports to reduce overflow and paint cost. */
const layouts = {
  home: {
    accent:
      "absolute -left-1/4 top-0 h-[min(72vw,300px)] w-[min(72vw,300px)] rounded-full bg-[var(--dp-accent)] blur-[72px] sm:h-[520px] sm:w-[520px] sm:blur-[140px]",
    violet:
      "absolute -right-1/4 bottom-0 h-[min(62vw,260px)] w-[min(62vw,260px)] rounded-full bg-violet-900/50 blur-[64px] sm:h-[420px] sm:w-[420px] sm:blur-[120px]",
  },
  freeCourse: {
    accent:
      "absolute -right-[10%] top-[5%] h-[min(78vw,320px)] w-[min(78vw,320px)] rounded-full bg-[var(--dp-accent)] blur-[76px] sm:h-[540px] sm:w-[540px] sm:blur-[132px]",
    violet:
      "absolute -left-[5%] bottom-[8%] h-[min(70vw,280px)] w-[min(70vw,280px)] rounded-full bg-violet-900/50 blur-[70px] sm:h-[480px] sm:w-[480px] sm:blur-[125px]",
  },
  book: {
    accent:
      "absolute left-[8%] -bottom-[12%] h-[min(75vw,300px)] w-[min(75vw,300px)] rounded-full bg-[var(--dp-accent)] blur-[74px] sm:h-[500px] sm:w-[500px] sm:blur-[138px]",
    violet:
      "absolute -right-[8%] top-[22%] h-[min(68vw,270px)] w-[min(68vw,270px)] rounded-full bg-violet-900/50 blur-[68px] sm:h-[450px] sm:w-[450px] sm:blur-[122px]",
  },
} as const;

export type PageBackgroundVariant = keyof typeof layouts;

export function PageBackgroundGlow({
  variant,
}: {
  variant: PageBackgroundVariant;
}) {
  const L = layouts[variant];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.32] sm:opacity-40"
      aria-hidden
    >
      <div className={L.accent} />
      <div className={L.violet} />
    </div>
  );
}
