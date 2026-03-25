import { getYoutubeEmbedUrl } from "@/lib/video-embed";

type HeroVideoProps = {
  url: string;
  /** `hero` = centered max width; `grid` = full width of column */
  layout?: "hero" | "grid";
  /** `9:16` = portrait (e.g. shorts); default `16:9` */
  aspectRatio?: "16:9" | "9:16";
  embedTitle?: string;
  /** Shown in empty placeholder (e.g. “Video 1”) */
  placeholderLabel?: string;
};

export function HeroVideo({
  url,
  layout = "hero",
  aspectRatio = "16:9",
  embedTitle = "Video",
  placeholderLabel,
}: HeroVideoProps) {
  const trimmed = url.trim();
  const yt = trimmed ? getYoutubeEmbedUrl(trimmed) : null;

  const aspect =
    aspectRatio === "9:16"
      ? "aspect-[9/16]"
      : "aspect-video";

  const shellRadius =
    "rounded-xl border border-white/10 md:rounded-2xl";
  const placeholderRadius =
    "rounded-xl border border-dashed border-white/20 md:rounded-2xl";

  const frame =
    layout === "grid"
      ? `${aspect} w-full min-w-0 overflow-hidden ${shellRadius} bg-black shadow-[0_12px_36px_rgba(0,0,0,0.4)] md:shadow-[0_16px_48px_rgba(0,0,0,0.45)]`
      : `${aspect} w-full min-w-0 max-w-4xl overflow-hidden ${shellRadius} bg-black shadow-[0_16px_56px_rgba(0,0,0,0.45)] md:shadow-[0_24px_80px_rgba(0,0,0,0.5)]`;

  const videoCls =
    layout === "grid"
      ? `${aspect} w-full min-w-0 ${shellRadius} bg-black object-cover shadow-[0_12px_36px_rgba(0,0,0,0.4)] md:shadow-[0_16px_48px_rgba(0,0,0,0.45)]`
      : `${aspect} w-full min-w-0 max-w-4xl ${shellRadius} bg-black object-cover shadow-[0_16px_56px_rgba(0,0,0,0.45)] md:shadow-[0_24px_80px_rgba(0,0,0,0.5)]`;

  const placeholderShell =
    layout === "grid"
      ? `flex ${aspect} w-full min-w-0 items-center justify-center ${placeholderRadius} bg-white/[0.03] px-3 text-center text-[0.7rem] leading-snug text-[var(--dp-muted)] sm:px-4 sm:text-xs md:text-sm`
      : `flex ${aspect} w-full min-w-0 max-w-4xl items-center justify-center ${placeholderRadius} bg-white/[0.03] px-4 text-center text-xs text-[var(--dp-muted)] sm:px-6 sm:text-sm`;

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
