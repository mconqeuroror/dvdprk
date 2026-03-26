const DEFAULT_ID = "david_perk";

export function fxBluePublisherId(): string {
  return process.env.FX_BLUE_PUBLISHER_ID?.trim() || DEFAULT_ID;
}

export function fxBlueWidgetUrl(chart: string, id = fxBluePublisherId()): string {
  const params = new URLSearchParams({ c: chart, id });
  return `https://www.fxblue.com/fxbluechart.aspx?${params.toString()}`;
}

export function fxBlueProfileUrl(id = fxBluePublisherId()): string {
  return `https://www.fxblue.com/users/${encodeURIComponent(id)}`;
}

export const FX_WIDGET = {
  cumulative: "ch_cumulativeprofit",
  account: "ch_accountinfo",
  monthly: "ch_monthlyreturntable",
} as const;
