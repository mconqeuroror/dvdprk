import {
  fxBlueProfileUrl,
  fxBluePublisherId,
  fxBlueWidgetUrl,
  FX_WIDGET,
} from "@/lib/fxblue/constants";
import {
  fetchFxBlueHtml,
  parseAccountChartData,
  parseCumulativeAddRows,
  parseMonthlyChartData,
  type FxBlueAccountData,
  type FxBlueCumulativePoint,
  type FxBlueMonthPoint,
} from "@/lib/fxblue/parse-html";

export type FxBlueWidgetsPayload = {
  publisherId: string;
  profileUrl: string;
  updatedAt: string;
  verify: {
    account: string;
    monthly: string;
    cumulative: string;
  };
  account: FxBlueAccountData | null;
  monthly: FxBlueMonthPoint[] | null;
  cumulative: FxBlueCumulativePoint[] | null;
  /** All three parsed — safe to show custom UI only. */
  customUi: boolean;
  errors: string[];
};

export async function loadFxBlueWidgets(): Promise<FxBlueWidgetsPayload> {
  const publisherId = fxBluePublisherId();
  const profileUrl = fxBlueProfileUrl(publisherId);
  const verify = {
    account: fxBlueWidgetUrl(FX_WIDGET.account, publisherId),
    monthly: fxBlueWidgetUrl(FX_WIDGET.monthly, publisherId),
    cumulative: fxBlueWidgetUrl(FX_WIDGET.cumulative, publisherId),
  };

  const errors: string[] = [];

  const [htmlAccount, htmlMonthly, htmlCum] = await Promise.all([
    fetchFxBlueHtml(verify.account),
    fetchFxBlueHtml(verify.monthly),
    fetchFxBlueHtml(verify.cumulative),
  ]);

  const account = htmlAccount ? parseAccountChartData(htmlAccount) : null;
  if (htmlAccount && !account) errors.push("account_parse");

  const monthly = htmlMonthly ? parseMonthlyChartData(htmlMonthly) : null;
  if (htmlMonthly && (!monthly || monthly.length === 0)) errors.push("monthly_parse");

  const cumulative = htmlCum ? parseCumulativeAddRows(htmlCum) : null;
  if (htmlCum && (!cumulative || cumulative.length === 0)) errors.push("cumulative_parse");

  if (!htmlAccount) errors.push("account_fetch");
  if (!htmlMonthly) errors.push("monthly_fetch");
  if (!htmlCum) errors.push("cumulative_fetch");

  const customUi = Boolean(
    account && monthly && monthly.length > 0 && cumulative && cumulative.length > 0,
  );

  return {
    publisherId,
    profileUrl,
    updatedAt: new Date().toISOString(),
    verify,
    account,
    monthly,
    cumulative,
    customUi,
    errors,
  };
}
