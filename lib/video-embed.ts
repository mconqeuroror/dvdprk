/** Returns YouTube embed URL or null if not a recognized YouTube link. */
export function getYoutubeEmbedUrl(input: string): string | null {
  const u = input.trim();
  if (!u) return null;
  try {
    const url = u.startsWith("http") ? new URL(u) : new URL(`https://${u}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = url.pathname.match(/\/embed\/([^/?]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
      const s = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (s) return `https://www.youtube.com/embed/${s[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}
