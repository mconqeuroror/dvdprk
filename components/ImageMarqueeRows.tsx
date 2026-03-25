type ImageMarqueeRowsProps = {
  row1: string[];
  row2: string[];
  /** Spacing below heading (default mt-8) */
  className?: string;
};

function Frame({
  url,
  label,
}: {
  url: string;
  label: string;
}) {
  const u = url.trim();
  if (u) {
    return (
      <figure className="dp-marquee-frame relative h-52 w-40 shrink-0 cursor-default overflow-hidden rounded-xl border border-white/15 bg-[var(--dp-surface)]/40 shadow-lg transition-shadow duration-300 hover:border-white/25 hover:shadow-[0_0_24px_rgba(98,67,255,0.25)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={u}
          alt=""
          className="h-full w-full object-contain object-center"
          loading="lazy"
          decoding="async"
        />
        <figcaption className="sr-only">{label}</figcaption>
      </figure>
    );
  }

  return (
    <div
      className="dp-marquee-frame flex h-52 w-40 shrink-0 cursor-default items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-xs text-[var(--dp-muted)] transition-colors duration-300 hover:border-white/25 hover:text-white/70"
      aria-hidden
    >
      Empty
    </div>
  );
}

function MarqueeTrack({
  images,
  direction,
}: {
  images: string[];
  direction: "to-right" | "to-left";
}) {
  const pair = [...images, ...images];
  const scrollerClass =
    direction === "to-left"
      ? "dp-marquee-scroller--left"
      : "dp-marquee-scroller--right";

  return (
    <div className="dp-marquee-track relative overflow-hidden py-3">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--dp-bg)] via-[var(--dp-bg)]/90 to-transparent sm:w-28"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--dp-bg)] via-[var(--dp-bg)]/90 to-transparent sm:w-28"
        aria-hidden
      />
      <div className={`flex w-max gap-4 ${scrollerClass}`}>
        {pair.map((src, idx) => (
          <Frame
            key={`${direction}-${idx}`}
            url={src}
            label={`Slide ${(idx % 10) + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ImageMarqueeRows({
  row1,
  row2,
  className = "mt-8",
}: ImageMarqueeRowsProps) {
  return (
    <section
      className={`w-full ${className}`}
      aria-label="Image galleries"
    >
      <MarqueeTrack images={row1} direction="to-right" />
      <MarqueeTrack images={row2} direction="to-left" />
    </section>
  );
}
