const FX_CHARTS = [
  {
    key: "profit",
    label: "Cumulative profit",
    title: "Cumulative profit — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_cumulativeprofit&id=david_perk",
  },
  {
    key: "account",
    label: "Live account & equity",
    title: "Live account overview — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_accountinfo&id=david_perk",
  },
  {
    key: "monthly",
    label: "Monthly returns",
    title: "Monthly return table — FX Blue",
    src: "https://www.fxblue.com/fxbluechart.aspx?c=ch_monthlyreturntable&id=david_perk",
  },
] as const;

const sectionHeadingClass =
  "text-center font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl";

function ChartFrame({
  src,
  title,
  label,
}: {
  src: string;
  title: string;
  label: string;
}) {
  return (
    <figure className="w-full">
      <div
        className="overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-b from-white/[0.07] to-black/35 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/[0.05] transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_16px_48px_-10px_rgba(0,0,0,0.65)]"
      >
        <div className="bg-black/25">
          <iframe
            src={src}
            title={title}
            className="block aspect-[2/1] min-h-[192px] w-full sm:min-h-[210px] md:min-h-[228px] lg:min-h-[248px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[var(--dp-muted)] sm:text-xs">
        {label}
      </figcaption>
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

      <div className="mx-auto mt-9 grid max-w-6xl grid-cols-1 gap-7 sm:mt-11 sm:gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-8">
        <div className="mx-auto w-full max-w-[480px] md:mx-0 md:max-w-none md:justify-self-end md:pr-2 lg:max-w-[500px]">
          <ChartFrame {...FX_CHARTS[0]} />
        </div>
        <div className="mx-auto w-full max-w-[480px] md:mx-0 md:max-w-none md:justify-self-start md:pl-2 lg:max-w-[500px]">
          <ChartFrame {...FX_CHARTS[1]} />
        </div>
        <div className="mx-auto w-full max-w-[480px] md:mx-0 md:max-w-none md:justify-self-end md:pr-2 lg:max-w-[500px]">
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
