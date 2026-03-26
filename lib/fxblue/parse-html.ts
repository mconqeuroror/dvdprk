/**
 * FX Blue widget pages embed JSON in <script> (not a supported public API).
 * We extract it server-side for custom UI; users verify via official widget URLs.
 */

export type FxBlueAccountData = {
  userId: string;
  balance: number;
  equity: number;
  floatingPL: number;
  closedPL: number;
  marginFree: number;
  marginUsed: number;
  marginLevel: number;
  currency: string;
  accountType: string;
};

export type FxBlueMonthPoint = {
  key: string;
  month: number;
  year: number;
  return: number;
  profit: number;
  pips: number;
};

export type FxBlueCumulativePoint = { date: string; profit: number };

function skipString(html: string, i: number): number {
  const q = html[i];
  if (q !== '"' && q !== "'") return i;
  let k = i + 1;
  while (k < html.length) {
    const c = html[k]!;
    if (c === "\\") {
      k += 2;
      continue;
    }
    if (c === q) return k + 1;
    k++;
  }
  return html.length;
}

/** Extract one top-level `{...}` or `[...]` from html[startIdx], respecting strings. */
export function extractBalancedJsonFragment(
  html: string,
  startIdx: number,
): string | null {
  const c0 = html[startIdx];
  if (c0 !== "{" && c0 !== "[") return null;
  let depth = 0;
  let i = startIdx;
  while (i < html.length) {
    const c = html[i]!;
    if (c === '"' || c === "'") {
      i = skipString(html, i);
      continue;
    }
    if (c === "{" || c === "[") {
      depth++;
      i++;
      continue;
    }
    if (c === "}" || c === "]") {
      depth--;
      i++;
      if (depth === 0) return html.slice(startIdx, i);
      continue;
    }
    i++;
  }
  return null;
}

function afterAssignment(html: string, needle: string): number | null {
  const idx = html.indexOf(needle);
  if (idx === -1) return null;
  let j = idx + needle.length;
  while (j < html.length && /\s/.test(html[j]!)) j++;
  return j;
}

export function parseAccountChartData(html: string): FxBlueAccountData | null {
  const j = afterAssignment(html, "document.ChartData =");
  if (j === null) return null;
  const frag = extractBalancedJsonFragment(html, j);
  if (!frag) return null;
  try {
    const o = JSON.parse(frag) as Record<string, unknown>;
    return {
      userId: String(o.userId ?? ""),
      balance: Number(o.balance),
      equity: Number(o.equity),
      floatingPL: Number(o.floatingPL),
      closedPL: Number(o.closedPL),
      marginFree: Number(o.marginFree),
      marginUsed: Number(o.marginUsed),
      marginLevel: Number(o.marginLevel),
      currency: String(o.currency ?? ""),
      accountType: String(o.accountType ?? ""),
    };
  } catch {
    return null;
  }
}

export function parseMonthlyChartData(html: string): FxBlueMonthPoint[] | null {
  const j = afterAssignment(html, "document.ChartData =");
  if (j === null) return null;
  const frag = extractBalancedJsonFragment(html, j);
  if (!frag || frag[0] !== "[") return null;
  try {
    const arr = JSON.parse(frag) as FxBlueMonthPoint[];
    if (!Array.isArray(arr)) return null;
    return arr;
  } catch {
    return null;
  }
}

export function parseCumulativeAddRows(html: string): FxBlueCumulativePoint[] | null {
  const key = "data.addRows(";
  const idx = html.indexOf(key);
  if (idx === -1) return null;
  let j = idx + key.length;
  while (j < html.length && /\s/.test(html[j]!)) j++;
  const frag = extractBalancedJsonFragment(html, j);
  if (!frag || frag[0] !== "[") return null;
  let normalized = frag;
  if (frag.includes("'")) {
    normalized = frag.replace(/'/g, '"');
  }
  let rows: unknown[];
  try {
    rows = JSON.parse(normalized) as unknown[];
  } catch {
    return null;
  }
  if (!Array.isArray(rows)) return null;
  const out: FxBlueCumulativePoint[] = [];
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const d = row[0];
    const p = row[1];
    if (typeof d !== "string") continue;
    if (d === "Start") continue;
    if (typeof p !== "number") continue;
    out.push({ date: d, profit: p });
  }
  return out.length > 0 ? out : null;
}

export async function fetchFxBlueHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "davidperk-web/1.0 (FX Blue public widget; custom UI + verify links)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
