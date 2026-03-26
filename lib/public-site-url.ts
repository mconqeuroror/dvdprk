import { headers } from "next/headers";

/**
 * Canonical public origin for absolute tracking links (emails, ads).
 * Prefer NEXT_PUBLIC_SITE_URL; fall back to the current request host in admin/preview.
 */
export async function getPublicSiteOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  return "https://www.davidperk.com";
}

/** Sync variant when headers() is not available (e.g. redirect route with Request). */
export function getPublicSiteOriginFromRequest(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  const u = new URL(request.url);
  return `${u.protocol}//${u.host}`.replace(/\/$/, "");
}
