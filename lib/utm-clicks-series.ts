/**
 * Bucket click timestamps into contiguous UTC calendar days for charts / export helpers.
 */
export function bucketClicksByDay(
  timestamps: Date[],
  daysBack: number,
): { date: string; count: number }[] {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (daysBack - 1));
  start.setUTCHours(0, 0, 0, 0);

  const counts = new Map<string, number>();
  for (const t of timestamps) {
    if (t < start || t > end) continue;
    const key = t.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: { date: string; count: number }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    series.push({ date: key, count: counts.get(key) ?? 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return series;
}
