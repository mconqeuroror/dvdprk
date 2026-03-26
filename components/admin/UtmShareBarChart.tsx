/**
 * Horizontal bars: each link’s share of total tracked clicks (all links).
 */
export function UtmShareBarChart({
  rows,
}: {
  rows: { name: string; count: number; share: number }[];
}) {
  if (rows.length === 0) return null;
  const maxShare = Math.max(...rows.map((r) => r.share), 0.01);

  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
      <p className="mb-3 text-sm font-medium text-white">
        Click share by link (all time)
      </p>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="flex justify-between gap-2 text-xs text-[var(--dp-muted)]">
              <span className="truncate text-white/90">{r.name}</span>
              <span>
                {r.count} ({(r.share * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--dp-accent)]/80 transition-[width] duration-300"
                style={{ width: `${(r.share / maxShare) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
