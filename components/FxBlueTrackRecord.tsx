const FX_CHARTS = [
  {
    key: "account",
    title: "Live account overview — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_accountinfo&id=david_perk",
  },
  {
    key: "profit",
    title: "Cumulative profit — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_cumulativeprofit&id=david_perk",
  },
  {
    key: "monthly",
    title: "Monthly return table — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_monthlyreturntable&id=david_perk",
  },
] as const;

const sectionHeadingClass =
  "text-center font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl";

function ChartFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/12 bg-[var(--dp-surface)]/25 shadow-lg shadow-black/30">
      <iframe
        src={src}
        title={title}
        className="block aspect-[2/1] min-h-[180px] w-full sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

/**
 * 2×2 grid: account (top-left), cumulative profit (top-right),
 * monthly table (bottom-left); bottom-right empty for balance.
 */
export function FxBlueTrackRecord() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl px-3 sm:mt-14 sm:px-4 md:mt-16 md:px-6"
      aria-labelledby="fx-track-record-heading"
    >
      <h2
        id="fx-track-record-heading"
        className={sectionHeadingClass}
      >
        Expertise backed by years of data
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-4 sm:text-lg">
        Inspect track record of my forex live account.
      </p>

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-6 lg:max-w-6xl">
        <div className="mx-auto w-full max-w-[440px] md:mx-0 md:justify-self-end md:pr-1 lg:max-w-[460px] lg:pr-2">
          <ChartFrame {...FX_CHARTS[0]} />
        </div>
        <div className="mx-auto w-full max-w-[440px] md:mx-0 md:justify-self-start md:pl-1 lg:max-w-[460px] lg:pl-2">
          <ChartFrame {...FX_CHARTS[1]} />
        </div>
        <div className="mx-auto w-full max-w-[440px] md:mx-0 md:justify-self-end md:pr-1 lg:max-w-[460px] lg:pr-2">
          <ChartFrame {...FX_CHARTS[2]} />
        </div>
        <div
          className="hidden md:block md:min-h-[100px] md:justify-self-start md:pl-1 lg:pl-2"
          aria-hidden
        />
      </div>
    </section>
  );
}
