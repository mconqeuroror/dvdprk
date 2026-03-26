/**
 * Simple SVG bar chart (no extra deps). `series` should be chronological.
 */
export function UtmClicksBarChart({
  series,
  title,
}: {
  series: { date: string; count: number }[];
  title: string;
}) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const w = Math.max(360, series.length * 28);
  const h = 140;
  const pad = 28;
  const barW = 18;
  const chartH = h - pad;

  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
      <p className="mb-3 text-sm font-medium text-white">{title}</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-full text-[var(--dp-muted)]"
        role="img"
        aria-label={title}
      >
        {series.map((s, i) => {
          const barH = (s.count / max) * (chartH - 8);
          const x = i * 28 + 6;
          const y = chartH - barH;
          return (
            <g key={s.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, s.count > 0 ? 2 : 0)}
                rx={3}
                className="fill-[var(--dp-accent)]/85"
              />
              {i % Math.ceil(series.length / 8) === 0 || series.length <= 14 ? (
                <text
                  x={x + barW / 2}
                  y={h - 4}
                  textAnchor="middle"
                  className="fill-[var(--dp-muted)] text-[7px]"
                  style={{ fontSize: "7px" }}
                >
                  {s.date.slice(5)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-[var(--dp-muted)]">
        Max bar height = highest day in range. UTC dates (YYYY-MM-DD).
      </p>
    </div>
  );
}
