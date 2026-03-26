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
      <figure className="dp-marquee-frame relative h-44 w-[7.25rem] shrink-0 cursor-default overflow-hidden rounded-lg bg-[var(--dp-surface)]/40 shadow-md sm:h-52 sm:w-40 sm:rounded-xl sm:shadow-lg">
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
      className="dp-marquee-frame flex h-44 w-[7.25rem] shrink-0 cursor-default items-center justify-center rounded-lg bg-white/[0.02] text-[0.65rem] text-[var(--dp-muted)] sm:h-52 sm:w-40 sm:rounded-xl sm:text-xs"
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
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--dp-bg)] via-[var(--dp-bg)]/88 to-transparent sm:w-16 md:w-28"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[11] w-2 bg-gradient-to-r from-white/35 to-transparent shadow-[8px_0_28px_rgba(255,255,255,0.2)] sm:w-2.5 sm:shadow-[12px_0_36px_rgba(255,255,255,0.22)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--dp-bg)] via-[var(--dp-bg)]/88 to-transparent sm:w-16 md:w-28"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[11] w-2 bg-gradient-to-l from-white/35 to-transparent shadow-[-8px_0_28px_rgba(255,255,255,0.2)] sm:w-2.5 sm:shadow-[-12px_0_36px_rgba(255,255,255,0.22)]"
        aria-hidden
      />
      <div className={`flex w-max gap-3 sm:gap-4 ${scrollerClass}`}>
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
