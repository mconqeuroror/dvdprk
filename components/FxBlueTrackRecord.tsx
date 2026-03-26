"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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

function VerifyOnFxBlue({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--dp-accent)] underline-offset-2 hover:underline"
    >
      Verify on FX Blue (official widget)
      <span aria-hidden className="text-[0.65rem] opacity-80">
        ↗
      </span>
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

function CumulativeChart({ series }: { series: FxBlueCumulativePoint[] }) {
  const w = 560;
  const h = 200;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const cw = w - padL - padR;
  const ch = h - padT - padB;
  const profits = series.map((s) => s.profit);
  const minP = Math.min(...profits);
  const maxP = Math.max(...profits);
  const range = maxP - minP || 1;
  const n = series.length;
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
      className="w-full max-w-full text-[var(--dp-muted)]"
      role="img"
      aria-label="Cumulative profit over time"
    >
      <defs>
        <linearGradient id="fxblue-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(98, 67, 255)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(98, 67, 255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#fxblue-area)" />
      <polyline
        fill="none"
        stroke="rgb(129, 140, 248)"
        strokeWidth="2"
        points={lineD}
      />
      <text x={padL} y={h - 6} className="fill-[var(--dp-muted)]" style={{ fontSize: 9 }}>
        {series[0]?.date} → {series[series.length - 1]?.date}
      </text>
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
    <div className={cardShell}>
      <p className={captionClass}>Live account &amp; equity</p>
      <dl className="space-y-0 divide-y divide-white/[0.08] text-sm">
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

function MonthlyTable({
  months,
  verifyUrl,
}: {
  months: FxBlueMonthPoint[];
  verifyUrl: string;
}) {
  const matrix = buildMonthMatrix(months);
  const mon = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className={cardShell}>
      <p className={captionClass}>Monthly returns</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-center text-[0.65rem] sm:text-xs">
          <thead>
            <tr className="text-[var(--dp-muted)]">
              <th className="sticky left-0 bg-[#0f1117] px-1 py-2 text-left font-medium">
                Year
              </th>
              {mon.map((m) => (
                <th key={m} className="px-0.5 py-2 font-medium">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(([year, cells]) => (
              <tr key={year} className="border-t border-white/[0.06]">
                <th className="sticky left-0 bg-[#141822] px-1 py-1.5 text-left text-white">
                  {year}
                </th>
                {cells.map((v, i) => (
                  <td key={i} className="px-0.5 py-1">
                    {v === null ? (
                      <span className="text-white/20">—</span>
                    ) : (
                      <span
                        className={
                          v >= 0
                            ? "inline-block min-w-[2.75rem] rounded bg-emerald-500/25 px-1 py-0.5 text-emerald-200"
                            : "inline-block min-w-[2.75rem] rounded bg-red-500/25 px-1 py-0.5 text-red-200"
                        }
                      >
                        {formatPct(v)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <VerifyOnFxBlue href={verifyUrl} />
    </div>
  );
}

function ProfitCard({
  series,
  verifyUrl,
}: {
  series: FxBlueCumulativePoint[];
  verifyUrl: string;
}) {
  return (
    <div className={cardShell}>
      <p className={captionClass}>Cumulative profit</p>
      <div className="rounded-[10px] bg-black/40 ring-1 ring-inset ring-white/[0.06]">
        <CumulativeChart series={series} />
      </div>
      <VerifyOnFxBlue href={verifyUrl} />
    </div>
  );
}

const FX_GRID_WRAP = [
  "mx-auto w-full max-w-[520px] md:mx-0 md:max-w-none md:justify-self-end md:pr-2 lg:max-w-[540px]",
  "mx-auto w-full max-w-[520px] md:mx-0 md:max-w-none md:justify-self-start md:pl-2 lg:max-w-[540px]",
  "mx-auto w-full max-w-[520px] md:mx-0 md:max-w-none md:justify-self-end md:pr-2 lg:max-w-[540px]",
] as const;

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

function IframeFallback({ verify }: { verify: ApiPayload["verify"] | null }) {
  const id = fxBluePublisherId();
  return (
    <>
      {IFRAMES.map((f, idx) => {
        const verifyKey =
          f.chart === FX_WIDGET.cumulative
            ? "cumulative"
            : f.chart === FX_WIDGET.account
              ? "account"
              : "monthly";
        const src = verify?.[verifyKey] || fxBlueWidgetUrl(f.chart, id);
        return (
          <div key={f.widgetKey} className={FX_GRID_WRAP[idx] ?? FX_GRID_WRAP[0]}>
            <figure className="w-full font-[family-name:var(--font-dm-sans)]">
              <div className={cardShell}>
                <p className={captionClass}>{f.label}</p>
                <VerifyOnFxBlue href={src} />
                <div className="mt-3 overflow-hidden rounded-[10px] bg-[#0f1117] ring-1 ring-inset ring-[rgba(255,255,255,0.06)]">
                  <iframe
                    src={src}
                    title={f.title}
                    className="block aspect-[2/1] min-h-[200px] w-full sm:min-h-[218px] md:min-h-[236px] lg:min-h-[256px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            </figure>
          </div>
        );
      })}
    </>
  );
}

/**
 * Live FX Blue stats: custom dark UI when parsing succeeds; official iframes + verify links as fallback.
 * Every block links to the same widget URL on fxblue.com so visitors can confirm authenticity.
 */
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
          widgets we embed. Use{" "}
          <strong className="text-white/85">“Verify on FX Blue”</strong> on any
          card to open the <strong className="text-white/85">official</strong>{" "}
          widget in a new tab and confirm it matches.
        </p>
      </div>

      {!payload && !loadError ? (
        <div className="mx-auto mt-10 grid max-w-6xl animate-pulse grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="h-64 rounded-[10px] bg-white/[0.06] md:odd:justify-self-end md:even:justify-self-start"
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-9 grid max-w-6xl grid-cols-1 gap-6 sm:mt-11 sm:gap-7 md:grid-cols-2 md:gap-x-8 md:gap-y-7">
          {showCustom && payload ? (
            <>
              <div className={FX_GRID_WRAP[0]}>
                <ProfitCard
                  series={payload.cumulative!}
                  verifyUrl={payload.verify.cumulative}
                />
              </div>
              <div className={FX_GRID_WRAP[1]}>
                <AccountCard
                  data={payload.account!}
                  verifyUrl={payload.verify.account}
                />
              </div>
              <div className={FX_GRID_WRAP[2]}>
                <MonthlyTable
                  months={payload.monthly!}
                  verifyUrl={payload.verify.monthly}
                />
              </div>
            </>
          ) : (
            <IframeFallback verify={payload?.verify ?? null} />
          )}
          <div
            className="hidden md:block md:min-h-[80px] md:justify-self-start md:pl-2"
            aria-hidden
          />
        </div>
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
