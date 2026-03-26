import type { UtmTrackedLink } from "@prisma/client";

/**
 * Absolute URL users land on after /r/{slug} (includes UTM query params).
 */
export function buildDestinationWithUtm(
  link: Pick<
    UtmTrackedLink,
    | "destinationUrl"
    | "utmSource"
    | "utmMedium"
    | "utmCampaign"
    | "utmContent"
    | "utmTerm"
  >,
  siteOrigin: string,
): string {
  const base = siteOrigin.replace(/\/$/, "");
  const dest = link.destinationUrl.trim();
  let u: URL;
  try {
    u = new URL(dest);
  } catch {
    u = new URL(dest.startsWith("/") ? dest : `/${dest}`, `${base}/`);
  }

  const p = u.searchParams;
  p.set("utm_source", link.utmSource.trim());
  p.set("utm_medium", link.utmMedium.trim());
  p.set("utm_campaign", link.utmCampaign.trim());
  if (link.utmContent?.trim()) p.set("utm_content", link.utmContent.trim());
  else p.delete("utm_content");
  if (link.utmTerm?.trim()) p.set("utm_term", link.utmTerm.trim());
  else p.delete("utm_term");

  return u.toString();
}

export function trackingUrlForSlug(siteOrigin: string, slug: string): string {
  const base = siteOrigin.replace(/\/$/, "");
  return `${base}/r/${slug}`;
}
