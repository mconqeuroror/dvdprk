/** Same dual-orb treatment as home; positions differ per route so pages feel distinct. */
const layouts = {
  home: {
    accent:
      "absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-[var(--dp-accent)] blur-[140px]",
    violet:
      "absolute -right-1/4 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-900/50 blur-[120px]",
  },
  freeCourse: {
    accent:
      "absolute -right-[10%] top-[5%] h-[540px] w-[540px] rounded-full bg-[var(--dp-accent)] blur-[132px]",
    violet:
      "absolute -left-[5%] bottom-[8%] h-[480px] w-[480px] rounded-full bg-violet-900/50 blur-[125px]",
  },
  book: {
    accent:
      "absolute left-[8%] -bottom-[12%] h-[500px] w-[500px] rounded-full bg-[var(--dp-accent)] blur-[138px]",
    violet:
      "absolute -right-[8%] top-[22%] h-[450px] w-[450px] rounded-full bg-violet-900/50 blur-[122px]",
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
      className="pointer-events-none absolute inset-0 opacity-40"
      aria-hidden
    >
      <div className={L.accent} />
      <div className={L.violet} />
    </div>
  );
}
