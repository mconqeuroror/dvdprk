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
import { DP_SECTION_HEADING } from "@/lib/dp-design";

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

const cardShell =
  "dp-fx-glass-panel rounded-xl p-5 font-[family-name:var(--font-dm-sans)] md:p-6";

const captionClass =
  "mb-3 text-[11px] font-medium uppercase leading-snug tracking-[0.1em] text-[var(--dp-muted-soft)] md:mb-4 md:text-xs";

const viewMonthlyResultsButtonClass =
  "rounded-full border border-white/[0.08] bg-black/40 px-8 py-2.5 text-sm font-medium text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:border-white/[0.11] hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dp-bg)] motion-reduce:transition-none";

let fxBlueBodyScrollLocks = 0;
function lockFxBlueBodyScroll() {
  fxBlueBodyScrollLocks += 1;
  if (fxBlueBodyScrollLocks === 1) document.body.style.overflow = "hidden";
}
function unlockFxBlueBodyScroll() {
  fxBlueBodyScrollLocks = Math.max(0, fxBlueBodyScrollLocks - 1);
  if (fxBlueBodyScrollLocks === 0) document.body.style.overflow = "";
}

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
  const cellFrame =
    "relative flex min-h-[3rem] w-full min-w-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] px-1 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-md sm:min-h-[3.35rem] sm:px-1.5 sm:py-2.5";
  const pctClass =
    "relative z-[1] block w-full max-w-full whitespace-normal text-center text-[0.62rem] font-semibold tabular-nums leading-tight tracking-[-0.02em] sm:text-[0.68rem] md:text-[0.72rem]";
  const labelClass =
    "mb-1 flex h-3.5 items-center justify-center text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/45 sm:h-4 sm:text-[0.58rem]";

  if (value === null) {
    return (
      <div className="flex min-w-0 flex-col">
        <div className={labelClass}>{label}</div>
        <div
          className={`${cellFrame} border-white/[0.07] bg-black/25 text-white/28`}
        >
          <span className="text-[0.65rem] font-medium tabular-nums">—</span>
        </div>
      </div>
    );
  }
  const t = Math.min(1, Math.abs(value) / scaleMax);
  const tint = 0.08 + t * 0.26;
  if (value >= 0) {
    return (
      <div className="flex min-w-0 flex-col">
        <div className={labelClass}>{label}</div>
        <div
          className={`${cellFrame} border-teal-400/12`}
          style={{
            backgroundImage: `linear-gradient(165deg, rgba(45, 212, 191, ${tint * 0.92}) 0%, rgba(12, 18, 24, 0.88) 55%, rgba(4, 6, 10, 0.92) 100%)`,
          }}
        >
          <span className={`${pctClass} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]`}>
            {formatPct(value)}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-col">
      <div className={labelClass}>{label}</div>
      <div
        className={`${cellFrame} border-rose-400/12`}
        style={{
          backgroundImage: `linear-gradient(165deg, rgba(251, 113, 133, ${tint * 0.9}) 0%, rgba(18, 12, 16, 0.88) 55%, rgba(8, 4, 6, 0.92) 100%)`,
        }}
      >
        <span className={`${pctClass} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]`}>
          {formatPct(value)}
        </span>
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
          className="dp-fx-glass-year rounded-xl p-3.5 sm:p-4"
        >
          <h4 className="mb-3.5 border-b border-white/[0.08] pb-2.5 text-left font-[family-name:var(--font-syne)] text-xs font-bold uppercase tracking-[0.14em] text-white/70 sm:text-sm sm:tracking-[0.12em]">
            {year}
          </h4>
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
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

function FxBlueVerifyRow({
  verifyAccount,
  verifyCumulative,
  verifyMonthly,
}: {
  verifyAccount: string;
  verifyCumulative: string;
  verifyMonthly: string;
}) {
  const a =
    "text-[0.72rem] font-semibold text-white/72 underline-offset-2 transition hover:text-white/95 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm";
  return (
    <div className="flex flex-col items-center gap-2.5 border-t border-white/[0.06] bg-black/55 px-4 py-3.5 backdrop-blur-xl sm:px-5">
      <p className="text-center text-[0.62rem] font-medium uppercase tracking-[0.12em] text-white/38">
        Verify on FX Blue
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
        <a href={verifyAccount} target="_blank" rel="noopener noreferrer" className={a}>
          Account
        </a>
        <a
          href={verifyCumulative}
          target="_blank"
          rel="noopener noreferrer"
          className={a}
        >
          Cumulative
        </a>
        <a href={verifyMonthly} target="_blank" rel="noopener noreferrer" className={a}>
          Monthly
        </a>
      </div>
    </div>
  );
}

function MonthlyAllYearsModal({
  matrix,
  verifyAccount,
  verifyCumulative,
  verifyMonthly,
  onClose,
  titleId,
}: {
  matrix: YearMatrixRow[];
  verifyAccount: string;
  verifyCumulative: string;
  verifyMonthly: string;
  onClose: () => void;
  titleId: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    lockFxBlueBodyScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockFxBlueBodyScroll();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="dp-fx-modal-backdrop absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(85dvh,540px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl dp-fx-glass-modal"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.06] bg-black/45 px-4 py-3.5 backdrop-blur-md sm:px-5">
          <h3
            id={titleId}
            className="pr-2 font-[family-name:var(--font-syne)] text-sm font-bold tracking-tight text-white sm:text-base"
          >
            Monthly returns
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/[0.07] bg-black/40 px-2.5 py-1 text-lg leading-none text-white/60 backdrop-blur-sm transition hover:border-white/[0.1] hover:bg-black/55 hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="max-h-[min(62dvh,400px)] overflow-y-auto overflow-x-hidden overscroll-contain bg-black/30 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4">
            <MonthlyYearBlocks matrix={matrix} />
          </div>
        </div>
        <FxBlueVerifyRow
          verifyAccount={verifyAccount}
          verifyCumulative={verifyCumulative}
          verifyMonthly={verifyMonthly}
        />
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
                  fill="rgba(255,255,255,0.12)"
                  stroke={CHART_ACCENT}
                  strokeWidth={2}
                />
              </g>
            ) : null}
          </svg>

          {hover && tip ? (
            <div
              className="pointer-events-none absolute z-10 max-w-[min(260px,calc(100%-1rem))] rounded-lg border border-white/[0.1] bg-black/55 px-3 py-2 text-left shadow-lg backdrop-blur-xl"
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
  showVerify = true,
}: {
  data: FxBlueAccountData;
  verifyUrl: string;
  showVerify?: boolean;
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
      <dl className="flex-1 space-y-0 divide-y divide-white/[0.1] text-sm">
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
      {showVerify ? <VerifyOnFxBlue href={verifyUrl} /> : null}
    </div>
  );
}

/** Embed fallback: monthly FX Blue widget inside a dialog */
function MonthlyIframeModal({
  src,
  iframeTitle,
  verifyAccount,
  verifyCumulative,
  verifyMonthly,
  onClose,
  titleId,
}: {
  src: string;
  iframeTitle: string;
  verifyAccount: string;
  verifyCumulative: string;
  verifyMonthly: string;
  onClose: () => void;
  titleId: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    lockFxBlueBodyScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockFxBlueBodyScroll();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="dp-fx-modal-backdrop absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[min(82dvh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl dp-fx-glass-modal"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.06] bg-black/45 px-4 py-3.5 backdrop-blur-md sm:px-5">
          <h3
            id={titleId}
            className="pr-2 font-[family-name:var(--font-syne)] text-sm font-bold tracking-tight text-white sm:text-base"
          >
            Monthly returns
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/[0.07] bg-black/40 px-2.5 py-1 text-lg leading-none text-white/60 backdrop-blur-sm transition hover:border-white/[0.1] hover:bg-black/55 hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dp-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-black/25 p-2 sm:p-3">
          <iframe
            src={src}
            title={iframeTitle}
            className="dp-fx-glass-inset h-full min-h-[280px] w-full rounded-xl"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ colorScheme: "dark" }}
          />
        </div>
        <FxBlueVerifyRow
          verifyAccount={verifyAccount}
          verifyCumulative={verifyCumulative}
          verifyMonthly={verifyMonthly}
        />
      </div>
    </div>
  );
}

function ProfitCard({
  series,
  verifyUrl,
  currency,
  showVerify = true,
}: {
  series: FxBlueCumulativePoint[];
  verifyUrl: string;
  currency: string;
  showVerify?: boolean;
}) {
  const last = series[series.length - 1]!;
  return (
    <div className={`${cardShell} flex min-h-0 flex-1 flex-col`}>
      <p className={captionClass}>Cumulative profit</p>
      <div className="dp-fx-glass-chart flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl">
        <div className="relative min-h-[240px] w-full min-w-0 flex-1 basis-0 md:min-h-[400px] lg:min-h-[min(480px,58vh)]">
          <CumulativeChart series={series} currency={currency} />
        </div>
        <p className="shrink-0 border-t border-white/[0.06] bg-black/55 px-3 py-2.5 text-center text-xs leading-snug text-[var(--dp-muted)] backdrop-blur-md">
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
      {showVerify ? <VerifyOnFxBlue href={verifyUrl} /> : null}
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
  noTopMargin,
}: {
  account: React.ReactNode;
  profit: React.ReactNode;
  noTopMargin?: boolean;
}) {
  return (
    <div
      className={`mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[minmax(272px,320px)_1fr] md:items-start md:gap-6 lg:gap-8 ${noTopMargin ? "" : "mt-9 sm:mt-11"}`}
    >
      <div className="order-1 min-w-0">{account}</div>
      <div className="order-2 flex min-h-0 w-full min-w-0 flex-col md:min-h-[min(560px,72vh)]">
        {profit}
      </div>
    </div>
  );
}

function IframeFallback({ verify }: { verify: ApiPayload["verify"] | null }) {
  const id = fxBluePublisherId();
  const accountSrc =
    verify?.account || fxBlueWidgetUrl(FX_WIDGET.account, id);
  const cumulativeSrc =
    verify?.cumulative || fxBlueWidgetUrl(FX_WIDGET.cumulative, id);
  const monthlySrc =
    verify?.monthly || fxBlueWidgetUrl(FX_WIDGET.monthly, id);
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const monthlyModalTitleId = useId().replace(/:/g, "");

  const makeIframe = (
    f: (typeof IFRAMES)[number],
    opts?: { tall?: boolean; hideVerify?: boolean },
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
          {opts?.hideVerify ? null : <VerifyOnFxBlue href={src} />}
          <div
            className={`dp-fx-glass-inset mt-3 overflow-hidden rounded-xl ${boxMin}`}
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
        account={makeIframe(IFRAMES[1], { hideVerify: true })}
        profit={makeIframe(IFRAMES[0], {
          tall: true,
          hideVerify: true,
        })}
      />
      <div className="mx-auto mt-8 flex w-full max-w-6xl justify-center px-2 sm:mt-10">
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
              verifyAccount={accountSrc}
              verifyCumulative={cumulativeSrc}
              verifyMonthly={monthlySrc}
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
        className={DP_SECTION_HEADING}
      >
        Expertise backed by years of data
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-4 sm:text-lg">
        Inspect track record of my forex live account.
      </p>

      {!payload && !loadError ? (
        <div className="mx-auto mt-9 grid max-w-6xl grid-cols-1 gap-6 sm:mt-11 md:grid-cols-[minmax(272px,320px)_1fr] md:items-start md:gap-6 lg:gap-8">
          <div className="h-[min(420px,50vh)] animate-pulse rounded-[10px] bg-white/[0.06]" />
          <div className="h-[min(480px,58vh)] animate-pulse rounded-[10px] bg-white/[0.06] md:min-h-[min(560px,72vh)]" />
        </div>
      ) : showCustom && payload ? (
        <>
          <TwoColTrackGrid
            account={
              <AccountCard
                data={payload.account!}
                verifyUrl={payload.verify.account}
                showVerify={false}
              />
            }
            profit={
              <ProfitCard
                series={payload.cumulative!}
                verifyUrl={payload.verify.cumulative}
                currency={payload.account!.currency}
                showVerify={false}
              />
            }
          />
          {payload.monthly?.length ? (
            <div className="mx-auto mt-8 flex w-full max-w-6xl justify-center px-2 sm:mt-10">
              <button
                type="button"
                onClick={() => setMonthlyModalOpen(true)}
                className={viewMonthlyResultsButtonClass}
              >
                View monthly results
              </button>
            </div>
          ) : null}
          {monthlyModalOpen && payload.monthly?.length
            ? createPortal(
                <MonthlyAllYearsModal
                  matrix={buildMonthMatrix(payload.monthly!)}
                  verifyAccount={payload.verify.account}
                  verifyCumulative={payload.verify.cumulative}
                  verifyMonthly={payload.verify.monthly}
                  onClose={() => setMonthlyModalOpen(false)}
                  titleId={monthlyModalTitleId}
                />,
                document.body,
              )
            : null}
        </>
      ) : (
        <IframeFallback verify={payload?.verify ?? null} />
      )}

      {payload && !showCustom && !loadError ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-[var(--dp-muted)]">
          Showing official FX Blue embeds while live data sync is unavailable.
          Open <strong className="text-white/70">View monthly results</strong> to
          verify Account, Cumulative, and Monthly on FX Blue.
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
          via{" "}
          <strong className="text-white/75">View monthly results</strong> (opens a
          popup).
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
          widgets. Use <strong className="text-white/75">Verify</strong> (Account /
          Cumulative / Monthly) in the monthly returns dialog to open the official
          widgets and compare.
        </p>
      </div>
    </section>
  );
}
