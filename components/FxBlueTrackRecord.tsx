/**
 * FX Blue charts render inside third-party iframes. Card shell, padding, borders,
 * and captions are ours; gridlines, table colors, row hovers, and in-widget typography
 * are controlled by FX Blue unless they expose theme URL parameters.
 */
const FX_CHARTS = [
  {
    widgetKey: "profit",
    label: "Cumulative profit",
    title: "Cumulative profit — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_cumulativeprofit&id=david_perk",
  },
  {
    widgetKey: "account",
    label: "Live account & equity",
    title: "Live account overview — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_accountinfo&id=david_perk",
  },
  {
    widgetKey: "monthly",
    label: "Monthly returns",
    title: "Monthly return table — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_monthlyreturntable&id=david_perk",
  },
] as const;

const sectionHeadingClass =
  "text-center font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl";

/** Shared shell: deep charcoal, 10px radius, 1px hairline, 20–24px padding, DM Sans. */
function ChartFrame({
  src,
  title,
  label,
  widgetKey,
}: (typeof FX_CHARTS)[number]) {
  const captionId = `fx-widget-caption-${widgetKey}`;

  return (
    <figure className="w-full font-[family-name:var(--font-dm-sans)]">
      <div className="rounded-[10px] border border-solid border-[rgba(255,255,255,0.08)] bg-[#0f1117] p-5 md:p-6">
        <p
          id={captionId}
          className="mb-3 text-[11px] font-medium uppercase leading-snug tracking-[0.1em] text-[rgba(243,240,254,0.5)] md:mb-4 md:text-xs"
        >
          {label}
        </p>
        <div className="overflow-hidden rounded-[10px] bg-[#0f1117] ring-1 ring-inset ring-[rgba(255,255,255,0.06)]">
          <iframe
            src={src}
            title={title}
            aria-labelledby={captionId}
            className="block aspect-[2/1] min-h-[200px] w-full sm:min-h-[218px] md:min-h-[236px] lg:min-h-[256px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </div>
    </figure>
  );
}

/**
 * 2×2 grid: cumulative profit (top-left), account / equity (top-right),
 * monthly returns (bottom-left); bottom-right empty.
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

      <div className="mx-auto mt-9 grid max-w-6xl grid-cols-1 gap-6 sm:mt-11 sm:gap-7 md:grid-cols-2 md:gap-x-8 md:gap-y-7">
        <div className="mx-auto w-full max-w-[520px] md:mx-0 md:max-w-none md:justify-self-end md:pr-2 lg:max-w-[540px]">
          <ChartFrame {...FX_CHARTS[0]} />
        </div>
        <div className="mx-auto w-full max-w-[520px] md:mx-0 md:max-w-none md:justify-self-start md:pl-2 lg:max-w-[540px]">
          <ChartFrame {...FX_CHARTS[1]} />
        </div>
        <div className="mx-auto w-full max-w-[520px] md:mx-0 md:max-w-none md:justify-self-end md:pr-2 lg:max-w-[540px]">
          <ChartFrame {...FX_CHARTS[2]} />
        </div>
        <div
          className="hidden md:block md:min-h-[80px] md:justify-self-start md:pl-2"
          aria-hidden
        />
      </div>
    </section>
  );
}
