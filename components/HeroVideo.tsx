import { getYoutubeEmbedUrl } from "@/lib/video-embed";

type HeroVideoProps = {
  url: string;
  /** `hero` = centered max width; `grid` = full width of column */
  layout?: "hero" | "grid";
  embedTitle?: string;
  /** Shown in empty placeholder (e.g. “Video 1”) */
  placeholderLabel?: string;
};

export function HeroVideo({
  url,
  layout = "hero",
  embedTitle = "Video",
  placeholderLabel,
}: HeroVideoProps) {
  const trimmed = url.trim();
  const yt = trimmed ? getYoutubeEmbedUrl(trimmed) : null;

  const frame =
    layout === "grid"
      ? "aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
      : "aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.5)]";

  const videoCls =
    layout === "grid"
      ? "aspect-video w-full rounded-2xl border border-white/10 bg-black object-cover shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
      : "aspect-video w-full max-w-4xl rounded-2xl border border-white/10 bg-black object-cover shadow-[0_24px_80px_rgba(0,0,0,0.5)]";

  const placeholderShell =
    layout === "grid"
      ? "flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 text-center text-xs text-[var(--dp-muted)] sm:text-sm"
      : "flex aspect-video w-full max-w-4xl items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 text-center text-sm text-[var(--dp-muted)]";

  if (yt) {
    return (
      <div className={frame}>
        <iframe
          title={embedTitle}
          src={`${yt}?rel=0`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (trimmed) {
    return (
      <video
        className={videoCls}
        controls
        playsInline
        preload="metadata"
        src={trimmed}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  const hint = placeholderLabel
    ? `${placeholderLabel}: add an MP4 or YouTube link in /admin.`
    : "No video set yet. Add an MP4 or YouTube link in /admin.";

  return (
    <div
      className={placeholderShell}
      role="region"
      aria-label={placeholderLabel ?? "Video placeholder"}
    >
      {hint}
    </div>
  );
}
