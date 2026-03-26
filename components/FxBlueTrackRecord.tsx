"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
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

/** Same min height for cumulative + monthly columns on desktop */
const DATA_PANEL_MIN_H =
  "flex min-h-0 flex-col md:min-h-[400px] lg:min-h-[420px]";

function VerifyOnFxBlue({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-block text-[0.7rem] leading-none text-[var(--dp-accent)] hover:underline"
    >
      Verify <span aria-hidden>↗</span>
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

function formatPct(x: number) {
  const s = x >= 0 ? "+" : "";
  return `${s}${x.toFixed(2)}%`;
}

function formatAxisProfit(n: number) {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (v >= 1_000_000) return `${sign}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${sign}${Math.round(v / 1000)}k`;
  if (v >= 1000) return `${sign}${(v / 1000).toFixed(1)}k`;
  return `${sign}${Math.round(v)}`;
}

function buildMonthMatrix(months: FxBlueMonthPoint[]) {
  const byYear = new Map<number, (number | null)[]>();
  for (const m of months) {
    if (!byYear.has(m.year)) byYear.set(m.year, Array(12).fill(null));
    const row = byYear.get(m.year)!;
    if (m.month >= 1 && m.month <= 12) row[m.month - 1] = m.return;
  }
  return Array.from(byYear.entries())
    .sort((a, b) => b[0] - a[0])
    .slice(0, 8);
}

const MON = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function CumulativeChart({ series }: { series: FxBlueCumulativePoint[] }) {
  const areaGradId = `${useId().replace(/:/g, "")}-area`;
  const w = 640;
  const h = 260;
  const padL = 52;
  const padR = 14;
  const padT = 14;
  const padB = 36;
  const cw = w - padL - padR;
  const ch = h - padT - padB;

  const profits = series.map((s) => s.profit);
  const minP = Math.min(...profits);
  const maxP = Math.max(...profits);
  const range = maxP - minP || 1;
  const n = series.length;

  const yTicks = 4;
  const yVals: number[] = [];
  for (let i = 0; i <= yTicks; i++) {
    yVals.push(minP + (range * i) / yTicks);
  }

  const xTickIdx: number[] = [];
  const want = 5;
  for (let i = 0; i < want; i++) {
    xTickIdx.push(Math.round((i / Math.max(want - 1, 1)) * Math.max(n - 1, 0)));
  }
  const xUnique = [...new Set(xTickIdx)].sort((a, b) => a - b);

  const pts = series.map((s, i) => {
    const x = padL + (i / Math.max(n - 1, 1)) * cw;
    const y = padT + (1 - (s.profit - minP) / range) * ch;
    return { x, y, date: s.date, profit: s.profit };
  });

  const lineD = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaD = `M ${pts[0]!.x},${h - padB} L ${pts.map((p) => `${p.x},${p.y}`).join(" L ")} L ${pts[pts.length - 1]!.x},${h - padB} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full max-w-full text-[var(--dp-muted)]"
      role="img"
      aria-label="Cumulative profit over time"
    >
      <defs>
        <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(98, 67, 255)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="rgb(98, 67, 255)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yVals.map((yv, i) => {
        const y = padT + (1 - (yv - minP) / range) * ch;
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={w - padR}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={padL - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-[var(--dp-muted)]"
              style={{ fontSize: 9 }}
            >
              {formatAxisProfit(yv)}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill={`url(#${areaGradId})`} />
      <polyline
        fill="none"
        stroke="rgb(129, 140, 248)"
        strokeWidth="2"
        points={lineD}
      />

      {xUnique.map((idx) => {
        const p = pts[idx];
        if (!p) return null;
        const short = p.date.length > 9 ? p.date.slice(0, 8) + "…" : p.date;
        return (
          <g key={idx}>
            <line
              x1={p.x}
              y1={padT}
              x2={p.x}
              y2={h - padB}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
            <text
              x={p.x}
              y={h - 10}
              textAnchor="middle"
              className="fill-[var(--dp-muted)]"
              style={{ fontSize: 8 }}
            >
              {short}
            </text>
          </g>
        );
      })}
    </svg>
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

/** No horizontal scroll: year blocks + 6×2 month grid per year */
function MonthlyTable({
  months,
  verifyUrl,
}: {
  months: FxBlueMonthPoint[];
  verifyUrl: string;
}) {
  const matrix = buildMonthMatrix(months);

  return (
    <div className={`${cardShell} ${DATA_PANEL_MIN_H}`}>
      <p className={captionClass}>Monthly returns</p>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden">
        {matrix.map(([year, cells]) => (
          <div key={year}>
            <p className="mb-2 text-xs font-semibold text-white">{year}</p>
            <div className="grid grid-cols-6 gap-x-1 gap-y-2">
              {cells.map((v, i) => (
                <div key={i} className="min-w-0 text-center">
                  <div className="text-[0.55rem] uppercase text-[var(--dp-muted)]">
                    {MON[i]}
                  </div>
                  <div
                    className={
                      v === null
                        ? "mt-0.5 text-[0.65rem] text-white/25"
                        : v >= 0
                          ? "mt-0.5 rounded bg-emerald-500/20 px-0.5 py-0.5 text-[0.65rem] font-medium leading-tight text-emerald-200"
                          : "mt-0.5 rounded bg-red-500/20 px-0.5 py-0.5 text-[0.65rem] font-medium leading-tight text-red-200"
                    }
                  >
                    {v === null ? "—" : formatPct(v)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <VerifyOnFxBlue href={verifyUrl} />
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
    <div className={`${cardShell} ${DATA_PANEL_MIN_H}`}>
      <p className={captionClass}>Cumulative profit</p>
      <div className="flex min-h-0 flex-1 flex-col rounded-[10px] bg-black/40 ring-1 ring-inset ring-white/[0.06]">
        <div className="min-h-[220px] flex-1 md:min-h-[280px]">
          <CumulativeChart series={series} />
        </div>
        <p className="border-t border-white/[0.06] px-2 py-1.5 text-center text-[0.65rem] leading-snug text-[var(--dp-muted)]">
          <span className="text-white/70">{series[0]?.date}</span>
          {" → "}
          <span className="text-white/70">{last.date}</span>
          <span className="mx-1 text-white/30">·</span>
          Latest cumulative{" "}
          <span className="font-medium text-white/90">
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

/** Mobile: account → profit → monthly. Desktop: profit | account | monthly */
function WidgetGrid({
  profit,
  account,
  monthly,
}: {
  profit: React.ReactNode;
  account: React.ReactNode;
  monthly: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-9 grid w-full max-w-6xl grid-cols-1 gap-6 sm:mt-11 md:grid-cols-3 md:items-start md:gap-5 lg:gap-6">
      <div className="order-2 min-w-0 md:order-1">{profit}</div>
      <div className="order-1 min-w-0 md:order-2">{account}</div>
      <div className="order-3 min-w-0 md:order-3">{monthly}</div>
    </div>
  );
}

function IframeFallback({ verify }: { verify: ApiPayload["verify"] | null }) {
  const id = fxBluePublisherId();

  const makeIframe = (f: (typeof IFRAMES)[number]) => {
    const verifyKey =
      f.chart === FX_WIDGET.cumulative
        ? "cumulative"
        : f.chart === FX_WIDGET.account
          ? "account"
          : "monthly";
    const src = verify?.[verifyKey] || fxBlueWidgetUrl(f.chart, id);
    return (
      <figure
        key={f.widgetKey}
        className={`w-full font-[family-name:var(--font-dm-sans)] ${DATA_PANEL_MIN_H}`}
      >
        <div className={`${cardShell} flex h-full flex-col`}>
          <p className={captionClass}>{f.label}</p>
          <VerifyOnFxBlue href={src} />
          <div className="mt-3 min-h-[200px] flex-1 overflow-hidden rounded-[10px] bg-[#0f1117] ring-1 ring-inset ring-[rgba(255,255,255,0.06)] md:min-h-[280px]">
            <iframe
              src={src}
              title={f.title}
              className="block h-full min-h-[200px] w-full"
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
    <WidgetGrid
      profit={makeIframe(IFRAMES[0])}
      account={makeIframe(IFRAMES[1])}
      monthly={makeIframe(IFRAMES[2])}
    />
  );
}

export function FxBlueTrackRecord() {
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [loadError, setLoadError] = useState(false);

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

      <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm leading-relaxed text-[var(--dp-muted)]">
        <p>
          <strong className="text-white/90">Why these numbers?</strong> Balance
          and equity move with{" "}
          <strong className="text-white/85">deposits and withdrawals</strong>,
          not just trading — a lower balance can mean cash was taken out, not
          that the strategy “lost” that amount. For performance, focus on{" "}
          <strong className="text-white/85">closed profit</strong>, the{" "}
          <strong className="text-white/85">cumulative profit</strong> curve, and{" "}
          <strong className="text-white/85">monthly return %</strong>.
        </p>
        <p className="mt-2">
          <strong className="text-white/90">Trust &amp; verification:</strong>{" "}
          Data is read from the same public{" "}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--dp-accent)] underline-offset-2 hover:underline"
          >
            FX Blue
          </a>{" "}
          widgets. Tap <strong className="text-white/85">Verify ↗</strong> on any
          card to open the official widget and compare.
        </p>
      </div>

      {!payload && !loadError ? (
        <div className="mx-auto mt-9 grid w-full max-w-6xl animate-pulse grid-cols-1 gap-6 md:grid-cols-3">
          <div className="order-2 h-64 rounded-[10px] bg-white/[0.06] md:order-1 md:h-[320px]" />
          <div className="order-1 h-48 rounded-[10px] bg-white/[0.06] md:order-2 md:h-[320px]" />
          <div className="order-3 h-64 rounded-[10px] bg-white/[0.06] md:h-[320px]" />
        </div>
      ) : showCustom && payload ? (
        <WidgetGrid
          profit={
            <ProfitCard
              series={payload.cumulative!}
              verifyUrl={payload.verify.cumulative}
              currency={payload.account!.currency}
            />
          }
          account={
            <AccountCard
              data={payload.account!}
              verifyUrl={payload.verify.account}
            />
          }
          monthly={
            <MonthlyTable
              months={payload.monthly!}
              verifyUrl={payload.verify.monthly}
            />
          }
        />
      ) : (
        <IframeFallback verify={payload?.verify ?? null} />
      )}

      {payload && !showCustom && !loadError ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-[var(--dp-muted)]">
          Showing official FX Blue embeds while live data sync is unavailable.
          You can still verify each metric with the links above.
        </p>
      ) : null}
    </section>
  );
}
