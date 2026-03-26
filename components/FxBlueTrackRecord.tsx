"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FX_WIDGET,
  fxBlueProfileUrl,
  fxBluePublisherId,
  fxBlueWidgetUrl,
} from "@/lib/fxblue/constants";
import type {
  FxBlueAccountData,
  FxBlueCumulativePoint,
  FxBlueMonthPoint,
} from "@/lib/fxblue/parse-html";

type ApiPayload = {
  publisherId: string;
  profileUrl: string;
  updatedAt: string;
  verify: { account: string; monthly: string; cumulative: string };
  account: FxBlueAccountData | null;
  monthly: FxBlueMonthPoint[] | null;
  cumulative: FxBlueCumulativePoint[] | null;
  customUi: boolean;
  errors: string[];
};

const sectionHeadingClass =
  "text-center font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl";

const cardShell =
  "rounded-[10px] border border-solid border-[rgba(255,255,255,0.08)] bg-[#0f1117] p-5 font-[family-name:var(--font-dm-sans)] md:p-6";

const captionClass =
  "mb-3 text-[11px] font-medium uppercase leading-snug tracking-[0.1em] text-[rgba(243,240,254,0.5)] md:mb-4 md:text-xs";

const viewMonthlyResultsButtonClass =
  "rounded-full border border-white/[0.14] bg-white/[0.06] px-8 py-2.5 text-sm font-medium text-white/95 shadow-sm transition hover:bg-white/[0.1] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[var(--dp-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]";

function VerifyOnFxBlue({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-block text-[0.7rem] leading-none text-[var(--dp-accent)] hover:underline"
    >
      Verify
    </a>
  );
}

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

/** Tooltip / headline style: $1,168,765 */
function formatTooltipProfit(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return formatMoney(n, currency);
  }
}

function formatPct(x: number) {
  const s = x >= 0 ? "+" : "";
  return `${s}${x.toFixed(2)}%`;
}

/** Y-axis labels like $0, $200K, $1.2M */
function formatAxisDollar(n: number): string {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    const t = m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, "");
    return `${sign}$${t}M`;
  }
  if (v >= 1000) return `${sign}$${Math.round(v / 1000)}K`;
  return `${sign}$${Math.round(v)}`;
}

function parseChartDate(s: string): Date | null {
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t);
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (m) return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return null;
}

function yearFromPoint(dateStr: string): string {
  const d = parseChartDate(dateStr);
  return d ? String(d.getFullYear()) : dateStr.slice(-4);
}

/** Tick values spanning min–max with round steps */
function niceProfitTicks(minP: number, maxP: number, maxTicks: number): number[] {
  const span = maxP - minP || 1;
  const rough = span / Math.max(maxTicks - 1, 1);
  const pow = 10 ** Math.floor(Math.log10(rough));
  const err = rough / pow;
  let nice = pow;
  if (err >= 7.5) nice = 10 * pow;
  else if (err >= 3.5) nice = 5 * pow;
  else if (err >= 1.5) nice = 2 * pow;
  const lo = Math.floor(minP / nice) * nice;
  const hi = Math.ceil(maxP / nice) * nice;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + nice * 0.01; v += nice) ticks.push(v);
  if (ticks.length < 2) return [minP, maxP];
  return ticks;
}

/** Monotone cubic Hermite (Fritsch–Carlson style), x strictly non-decreasing */
function monotoneCurvePath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M ${pts[0].x} ${pts[0].y}`;
  const x = pts.map((p) => p.x);
  const y = pts.map((p) => p.y);
  const m = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const h = x[i + 1]! - x[i]!;
    m[i] = h > 0 ? (y[i + 1]! - y[i]!) / h : 0;
  }
  const d = new Array(n).fill(0);
  d[0] = m[0] ?? 0;
  d[n - 1] = m[n - 2] ?? 0;
  for (let i = 1; i < n - 1; i++) {
    if ((m[i - 1] ?? 0) * (m[i] ?? 0) <= 0) d[i] = 0;
    else {
      const h0 = x[i]! - x[i - 1]!;
      const h1 = x[i + 1]! - x[i]!;
      const w0 = 2 * h1 + h0;
      const w1 = h1 + 2 * h0;
      d[i] = (w0 + w1) / (w0 / (m[i - 1] ?? 0) + w1 / (m[i] ?? 0));
    }
  }
  let path = `M ${x[0]} ${y[0]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = x[i + 1]! - x[i]!;
    path += ` C ${x[i]! + h / 3} ${y[i]! + ((d[i] ?? 0) * h) / 3} ${x[i + 1]! - h / 3} ${y[i + 1]! - ((d[i + 1] ?? 0) * h) / 3} ${x[i + 1]!} ${y[i + 1]!}`;
  }
  return path;
}

function capTickCount(ticks: number[], max: number): number[] {
  if (ticks.length <= max) return ticks;
  const step = Math.ceil(ticks.length / max);
  const out: number[] = [];
  for (let i = 0; i < ticks.length; i += step) out.push(ticks[i]!);
  if (out[out.length - 1] !== ticks[ticks.length - 1])
    out.push(ticks[ticks.length - 1]!);
  return out;
}

function pickXYearIndices(
  series: FxBlueCumulativePoint[],
  n: number,
  plotWidth: number,
): number[] {
  if (n <= 1) return [0];
  const minGapPx = 40;
  const maxByWidth = Math.max(2, Math.floor(plotWidth / minGapPx));
  const want = Math.min(8, maxByWidth);
  const raw: number[] = [];
  for (let k = 0; k < want; k++) {
    raw.push(Math.round((k / Math.max(want - 1, 1)) * (n - 1)));
  }
  const sorted = [...new Set(raw)].sort((a, b) => a - b);
  const withYears: number[] = [];
  let prevYear = "";
  for (const idx of sorted) {
    const yr = yearFromPoint(series[idx]!.date);
    if (yr !== prevYear) {
      withYears.push(idx);
      prevYear = yr;
    }
  }
  if (withYears.length >= 2) return withYears;
  return sorted;
}

function buildMonthMatrix(months: FxBlueMonthPoint[]) {
  const byYear = new Map<number, (number | null)[]>();
  for (const m of months) {
    if (!byYear.has(m.year)) byYear.set(m.year, Array(12).fill(null));
    const row = byYear.get(m.year)!;
    if (m.month >= 1 && m.month <= 12) row[m.month - 1] = m.return;
  }
  return Array.from(byYear.entries()).sort((a, b) => b[0] - a[0]);
}

const MON = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

type YearMatrixRow = [number, (number | null)[]];

function maxAbsMonthlyInMatrix(matrix: YearMatrixRow[]): number {
  let m = 0;
  for (const [, cells] of matrix) {
    for (const v of cells) {
      if (v !== null) m = Math.max(m, Math.abs(v));
    }
  }
  return m > 0 ? m : 100;
}

function MonthReturnCell({
  value,
  label,
  scaleMax,
}: {
  value: number | null;
  label: string;
  scaleMax: number;
}) {
  const cellClass =
    "flex min-h-[2.75rem] w-full min-w-0 items-center justify-center rounded-md border px-1 py-1.5 text-center text-[0.6rem] font-semibold tabular-nums leading-snug text-white sm:min-h-[3rem] sm:px-1.5 sm:text-[0.68rem] md:text-[0.72rem]";
  const pctClass =
    "block w-full max-w-full whitespace-normal text-center leading-tight tracking-tight break-words";
  if (value === null) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex h-3.5 items-center justify-center text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/65 sm:h-4 sm:text-[0.65rem]">
          {label}
        </div>
        <div
          className={`${cellClass} border-white/[0.1] bg-white/[0.05] text-white/35`}
        >
          —
        </div>
      </div>
    );
  }
  const t = Math.min(1, Math.abs(value) / scaleMax);
  const alpha = 0.28 + t * 0.62;
  if (value >= 0) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex h-3.5 items-center justify-center text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/65 sm:h-4 sm:text-[0.65rem]">
          {label}
        </div>
        <div
          className={`${cellClass} border-emerald-400/25`}
          style={{ backgroundColor: `rgba(5, 150, 105, ${alpha})` }}
        >
          <span className={pctClass}>{formatPct(value)}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex h-3.5 items-center justify-center text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/65 sm:h-4 sm:text-[0.65rem]">
        {label}
      </div>
      <div
        className={`${cellClass} border-red-400/25`}
        style={{ backgroundColor: `rgba(220, 38, 38, ${alpha})` }}
      >
        <span className={pctClass}>{formatPct(value)}</span>
      </div>
    </div>
  );
}

function MonthlyYearBlocks({ matrix }: { matrix: YearMatrixRow[] }) {
  const scaleMax = maxAbsMonthlyInMatrix(matrix);
  return (
    <>
      {matrix.map(([year, cells]) => (
        <section
          key={year}
          className="rounded-lg border border-white/[0.08] bg-black/25 p-3 sm:p-3.5"
        >
          <h4 className="mb-3 border-b border-white/[0.1] pb-2 text-left text-sm font-semibold tracking-tight text-white">
            {year}
          </h4>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {cells.map((v, i) => (
              <MonthReturnCell
                key={i}
                label={MON[i]!}
                value={v}
                scaleMax={scaleMax}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function MonthlyAllYearsModal({
  matrix,
  verifyUrl,
  onClose,
  titleId,
}: {
  matrix: YearMatrixRow[];
  verifyUrl: string;
  onClose: () => void;
  titleId: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-[12px] border border-white/[0.1] bg-[#0f1117] shadow-2xl max-h-[min(85dvh,520px)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
          <h3
            id={titleId}
            className="pr-2 font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-white sm:text-base"
          >
            All monthly returns
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-lg leading-none text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="max-h-[min(62dvh,380px)] overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4">
            <MonthlyYearBlocks matrix={matrix} />
          </div>
        </div>
        <div className="shrink-0 border-t border-white/[0.08] px-4 py-3 sm:px-5">
          <VerifyOnFxBlue href={verifyUrl} />
        </div>
      </div>
    </div>
  );
}

const CHART_ACCENT = "rgb(98, 67, 255)";

function CumulativeChart({
  series,
  currency,
}: {
  series: FxBlueCumulativePoint[];
  currency: string;
}) {
  const areaGradId = `${useId().replace(/:/g, "")}-area`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<{
    idx: number;
    cx: number;
    cy: number;
  } | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setDims({
        w: Math.max(0, Math.floor(r.width)),
        h: Math.max(0, Math.floor(r.height)),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = dims.w >= 32 && dims.h >= 32;
  const w = ready ? dims.w : 400;
  const h = ready ? dims.h : 280;
  const axisFont = h > 300 ? 12 : 11;

  const padL = 52;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const inset = 3;
  const cw = Math.max(8, w - padL - padR);
  const plotTop = padT + inset;
  const plotBottom = h - padB - inset;
  const baseY = plotBottom;

  const profits = series.map((s) => s.profit);
  const rawMin = Math.min(...profits);
  const rawMax = Math.max(...profits);
  const span = rawMax - rawMin || 1;
  const minP = rawMin - span * 0.04;
  const maxP = rawMax + span * 0.04;
  const n = series.length;

  const yVals = capTickCount(niceProfitTicks(minP, maxP, 6), 6);
  const scaleMin = Math.min(minP, ...yVals);
  const scaleMax = Math.max(maxP, ...yVals);
  const yDomain = scaleMax - scaleMin || 1;

  const xIndices = pickXYearIndices(series, n, cw);

  const pts = series.map((s, i) => {
    const x = padL + (i / Math.max(n - 1, 1)) * cw;
    const y =
      plotTop +
      (1 - (s.profit - scaleMin) / yDomain) * (plotBottom - plotTop);
    return { x, y, date: s.date, profit: s.profit };
  });

  const smoothLine = monotoneCurvePath(pts);
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  const areaD = `${smoothLine} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;

  const nearestIndex = (svgX: number) => {
    const t = (svgX - padL) / cw;
    const idx = Math.round(t * Math.max(n - 1, 0));
    return Math.max(0, Math.min(n - 1, idx));
  };

  const onSvgPointer = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const idx = nearestIndex(x);
    const p = pts[idx];
    if (!p) return;
    setHover({ idx, cx: p.x, cy: p.y });
  };

  const tip = hover ? series[hover.idx] : null;

  return (
    <div ref={wrapRef} className="relative h-full min-h-0 w-full min-w-0">
      {ready ? (
        <>
          <svg
            width={w}
            height={h}
            className="block max-w-full text-[var(--dp-muted)]"
            role="img"
            aria-label="Cumulative profit over time"
            onMouseMove={onSvgPointer}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_ACCENT} stopOpacity="0.25" />
                <stop offset="100%" stopColor={CHART_ACCENT} stopOpacity="0" />
              </linearGradient>
            </defs>

            {yVals.map((yv, i) => {
              const y =
                plotTop +
                (1 - (yv - scaleMin) / yDomain) * (plotBottom - plotTop);
              return (
                <g key={`y-${i}-${yv}`}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={w - padR}
                    y2={y}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="rgba(243,240,254,0.55)"
                    style={{
                      fontSize: axisFont,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {formatAxisDollar(yv)}
                  </text>
                </g>
              );
            })}

            <path d={areaD} fill={`url(#${areaGradId})`} />
            <path
              d={smoothLine}
              fill="none"
              stroke={CHART_ACCENT}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {xIndices.map((idx) => {
              const p = pts[idx];
              if (!p) return null;
              const yr = yearFromPoint(p.date);
              return (
                <text
                  key={`x-${idx}`}
                  x={p.x}
                  y={h - 10}
                  textAnchor="middle"
                  fill="rgba(243,240,254,0.5)"
                  style={{
                    fontSize: axisFont,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {yr}
                </text>
              );
            })}

            {hover && tip ? (
              <g pointerEvents="none">
                <line
                  x1={hover.cx}
                  y1={plotTop}
                  x2={hover.cx}
                  y2={plotBottom}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={1}
                />
                <circle
                  cx={hover.cx}
                  cy={hover.cy}
                  r={5}
                  fill="#0f1117"
                  stroke={CHART_ACCENT}
                  strokeWidth={2}
                />
              </g>
            ) : null}
          </svg>

          {hover && tip ? (
            <div
              className="pointer-events-none absolute z-10 max-w-[min(260px,calc(100%-1rem))] rounded-md border border-white/[0.12] bg-[#1a1d26] px-2.5 py-2 text-left shadow-lg"
              style={{
                left: `${(hover.cx / w) * 100}%`,
                top: "8px",
                transform: "translateX(-50%)",
              }}
            >
              <p className="text-[0.7rem] font-medium text-white/90">
                {tip.date}
              </p>
              <p className="mt-0.5 text-xs font-semibold tabular-nums text-[var(--dp-accent)]">
                {formatTooltipProfit(tip.profit, currency)}
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function AccountCard({
  data,
  verifyUrl,
}: {
  data: FxBlueAccountData;
  verifyUrl: string;
}) {
  const rows: { label: string; value: ReactNode; emphasize?: "profit" | "loss" }[] =
    [
      { label: "Balance", value: formatMoney(data.balance, data.currency) },
      { label: "Equity", value: formatMoney(data.equity, data.currency) },
      {
        label: "Floating P/L",
        value: formatMoney(data.floatingPL, data.currency),
        emphasize: data.floatingPL < 0 ? "loss" : undefined,
      },
      {
        label: "Closed profit",
        value: formatMoney(data.closedPL, data.currency),
        emphasize: "profit",
      },
      { label: "Free margin", value: formatMoney(data.marginFree, data.currency) },
      { label: "Margin in use", value: formatMoney(data.marginUsed, data.currency) },
      {
        label: "Margin level",
        value: `${data.marginLevel.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`,
      },
      { label: "Currency", value: data.currency },
      { label: "Account type", value: data.accountType },
    ];

  return (
    <div className={`${cardShell} flex flex-col`}>
      <p className={captionClass}>Live account &amp; equity</p>
      <dl className="flex-1 space-y-0 divide-y divide-white/[0.08] text-sm">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0"
          >
            <dt className="text-[var(--dp-muted)]">{r.label}</dt>
            <dd
              className={
                r.emphasize === "profit"
                  ? "font-semibold text-emerald-400 tabular-nums"
                  : r.emphasize === "loss"
                    ? "font-semibold text-red-400 tabular-nums"
                    : "text-white tabular-nums"
              }
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      <VerifyOnFxBlue href={verifyUrl} />
    </div>
  );
}

/** Embed fallback: monthly FX Blue widget inside a dialog */
function MonthlyIframeModal({
  src,
  iframeTitle,
  onClose,
  titleId,
}: {
  src: string;
  iframeTitle: string;
  onClose: () => void;
  titleId: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[min(82dvh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-[12px] border border-white/[0.1] bg-[#0f1117] shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
          <h3
            id={titleId}
            className="pr-2 font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-white sm:text-base"
          >
            Monthly returns
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-lg leading-none text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 p-2 sm:p-3">
          <iframe
            src={src}
            title={iframeTitle}
            className="h-full min-h-[280px] w-full rounded-lg bg-black/40"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ colorScheme: "dark" }}
          />
        </div>
        <div className="shrink-0 border-t border-white/[0.08] px-4 py-3 sm:px-5">
          <VerifyOnFxBlue href={src} />
        </div>
      </div>
    </div>
  );
}

function ProfitCard({
  series,
  verifyUrl,
  currency,
}: {
  series: FxBlueCumulativePoint[];
  verifyUrl: string;
  currency: string;
}) {
  const last = series[series.length - 1]!;
  return (
    <div className={`${cardShell} flex min-h-0 flex-1 flex-col`}>
      <p className={captionClass}>Cumulative profit</p>
      <div className="flex min-h-0 w-full flex-1 flex-col rounded-[10px] bg-black/40 ring-1 ring-inset ring-white/[0.06]">
        <div className="relative min-h-[240px] w-full min-w-0 flex-1 basis-0 md:min-h-[400px] lg:min-h-[min(480px,58vh)]">
          <CumulativeChart series={series} currency={currency} />
        </div>
        <p className="shrink-0 border-t border-white/[0.06] px-3 py-2 text-center text-xs leading-snug text-[var(--dp-muted)]">
          <span className="text-white/75">{series[0]?.date}</span>
          <span className="text-white/35"> → </span>
          <span className="text-white/75">{last.date}</span>
          <span className="mx-1.5 text-white/25">·</span>
          <span className="text-white/55">Latest cumulative </span>
          <span className="font-semibold tabular-nums text-white/90">
            {formatMoney(last.profit, currency)}
          </span>
        </p>
      </div>
      <VerifyOnFxBlue href={verifyUrl} />
    </div>
  );
}

const IFRAMES = [
  {
    widgetKey: "profit",
    label: "Cumulative profit",
    title: "Cumulative profit — FX Blue",
    chart: FX_WIDGET.cumulative,
  },
  {
    widgetKey: "account",
    label: "Live account & equity",
    title: "Live account overview — FX Blue",
    chart: FX_WIDGET.account,
  },
  {
    widgetKey: "monthly",
    label: "Monthly returns",
    title: "Monthly return table — FX Blue",
    chart: FX_WIDGET.monthly,
  },
] as const;

/** Account data left, large cumulative chart right (mobile: account then chart) */
function TwoColTrackGrid({
  account,
  profit,
}: {
  account: React.ReactNode;
  profit: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-9 grid w-full max-w-6xl grid-cols-1 gap-6 sm:mt-11 md:grid-cols-[minmax(272px,320px)_1fr] md:items-start md:gap-6 lg:gap-8">
      <div className="order-1 min-w-0">{account}</div>
      <div className="order-2 flex min-h-0 w-full min-w-0 flex-col md:min-h-[min(560px,72vh)]">
        {profit}
      </div>
    </div>
  );
}

function IframeFallback({ verify }: { verify: ApiPayload["verify"] | null }) {
  const id = fxBluePublisherId();
  const monthlySrc =
    verify?.monthly || fxBlueWidgetUrl(FX_WIDGET.monthly, id);
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const monthlyModalTitleId = useId().replace(/:/g, "");

  const makeIframe = (
    f: (typeof IFRAMES)[number],
    opts?: { tall?: boolean },
  ) => {
    const verifyKey =
      f.chart === FX_WIDGET.cumulative
        ? "cumulative"
        : f.chart === FX_WIDGET.account
          ? "account"
          : "monthly";
    const src = verify?.[verifyKey] || fxBlueWidgetUrl(f.chart, id);
    const boxMin =
      opts?.tall === true
        ? "min-h-[260px] md:min-h-[min(520px,62vh)]"
        : "min-h-[200px] md:min-h-[280px]";
    return (
      <figure
        key={f.widgetKey}
        className="w-full font-[family-name:var(--font-dm-sans)]"
      >
        <div className={`${cardShell} flex flex-col`}>
          <p className={captionClass}>{f.label}</p>
          <VerifyOnFxBlue href={src} />
          <div
            className={`mt-3 overflow-hidden rounded-[10px] bg-[#0f1117] ring-1 ring-inset ring-[rgba(255,255,255,0.06)] ${boxMin}`}
          >
            <iframe
              src={src}
              title={f.title}
              className="block h-full min-h-[200px] w-full md:min-h-[280px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>
      </figure>
    );
  };

  return (
    <>
      <TwoColTrackGrid
        account={makeIframe(IFRAMES[1])}
        profit={makeIframe(IFRAMES[0], { tall: true })}
      />
      <div className="mx-auto mt-6 flex w-full max-w-6xl justify-center px-3 sm:mt-8 sm:px-4 md:px-6">
        <button
          type="button"
          onClick={() => setMonthlyModalOpen(true)}
          className={viewMonthlyResultsButtonClass}
        >
          View monthly results
        </button>
      </div>
      {monthlyModalOpen
        ? createPortal(
            <MonthlyIframeModal
              src={monthlySrc}
              iframeTitle="Monthly returns — FX Blue"
              onClose={() => setMonthlyModalOpen(false)}
              titleId={monthlyModalTitleId}
            />,
            document.body,
          )
        : null}
    </>
  );
}

export function FxBlueTrackRecord() {
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const monthlyModalTitleId = useId().replace(/:/g, "");

  useEffect(() => {
    let cancel = false;
    fetch("/api/fxblue/data")
      .then((r) => {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .then((d: ApiPayload) => {
        if (!cancel) setPayload(d);
      })
      .catch(() => {
        if (!cancel) setLoadError(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  const id = fxBluePublisherId();
  const profileUrl = fxBlueProfileUrl(id);
  const showCustom =
    payload?.customUi &&
    payload.account &&
    payload.monthly?.length &&
    payload.cumulative?.length;

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

      {!payload && !loadError ? (
        <div className="mx-auto mt-9 grid w-full max-w-6xl animate-pulse grid-cols-1 gap-6 md:grid-cols-[minmax(272px,320px)_1fr] md:items-start md:gap-6 lg:gap-8">
          <div className={`${cardShell} flex flex-col`}>
            <div className="mb-3 h-3 w-40 rounded bg-white/[0.08]" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-full rounded bg-white/[0.06]"
                />
              ))}
            </div>
            <div className="mt-3 h-3 w-12 rounded bg-white/[0.08]" />
          </div>
          <div className={`${cardShell} flex flex-col`}>
            <div className="mb-3 h-3 w-28 rounded bg-white/[0.08]" />
            <div className="mb-3 min-h-[240px] w-full rounded-lg bg-white/[0.06] md:min-h-[400px] lg:min-h-[480px]" />
            <div className="h-8 w-full rounded bg-white/[0.05]" />
            <div className="mt-2 h-3 w-12 rounded bg-white/[0.08]" />
          </div>
        </div>
      ) : showCustom && payload ? (
        <>
          <TwoColTrackGrid
            account={
              <AccountCard
                data={payload.account!}
                verifyUrl={payload.verify.account}
              />
            }
            profit={
              <ProfitCard
                series={payload.cumulative!}
                verifyUrl={payload.verify.cumulative}
                currency={payload.account!.currency}
              />
            }
          />
          {payload.monthly?.length ? (
            <>
              <div className="mx-auto mt-6 flex w-full max-w-6xl justify-center px-3 sm:mt-8 sm:px-4 md:px-6">
                <button
                  type="button"
                  onClick={() => setMonthlyModalOpen(true)}
                  className={viewMonthlyResultsButtonClass}
                >
                  View monthly results
                </button>
              </div>
              {monthlyModalOpen
                ? createPortal(
                    <MonthlyAllYearsModal
                      matrix={buildMonthMatrix(payload.monthly!)}
                      verifyUrl={payload.verify.monthly}
                      onClose={() => setMonthlyModalOpen(false)}
                      titleId={monthlyModalTitleId}
                    />,
                    document.body,
                  )
                : null}
            </>
          ) : null}
        </>
      ) : (
        <IframeFallback verify={payload?.verify ?? null} />
      )}

      {payload && !showCustom && !loadError ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-[var(--dp-muted)]">
          Showing official FX Blue embeds while live data sync is unavailable.
          You can still verify each metric with the links above.
        </p>
      ) : null}

      <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[0.7rem] leading-snug text-[var(--dp-muted)] sm:mt-10 sm:px-4 sm:text-[0.75rem] sm:leading-relaxed">
        <p>
          <strong className="text-white/80">Why these numbers?</strong> Balance
          and equity move with{" "}
          <strong className="text-white/75">deposits and withdrawals</strong>,
          not just trading — a lower balance can mean cash was taken out, not
          that the strategy “lost” that amount. For performance, focus on{" "}
          <strong className="text-white/75">closed profit</strong>, the{" "}
          <strong className="text-white/75">cumulative profit</strong> curve;{" "}
          <strong className="text-white/75">monthly return %</strong> is available
          via <strong className="text-white/75">View monthly results</strong> below
          the track record.
        </p>
        <p className="mt-1.5 sm:mt-2">
          <strong className="text-white/80">Trust and verification:</strong> Data
          is read from the same public{" "}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--dp-accent)] underline-offset-2 hover:underline"
          >
            FX Blue
          </a>{" "}
          widgets. Use <strong className="text-white/75">Verify</strong> links to
          open the official widgets and compare.
        </p>
      </div>
    </section>
  );
}
