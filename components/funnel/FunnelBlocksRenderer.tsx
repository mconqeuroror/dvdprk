"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { FxBlueTrackRecord } from "@/components/FxBlueTrackRecord";
import { HeroVideo } from "@/components/HeroVideo";
import { ImageMarqueeRows } from "@/components/ImageMarqueeRows";
import { DP_SECTION_HEADING } from "@/lib/dp-design";
import type { CtaItem, FunnelBlock, FunnelPageId } from "@/lib/funnel-types";
import type { SiteConfig } from "@/lib/site-config";
import { funnelCtaClass, FUNNEL_CTA_OUTLINE_STRONG } from "./funnelCtaClasses";

function CtaLink({ item }: { item: CtaItem }) {
  const cls = funnelCtaClass(item.variant);
  const external =
    /^https?:\/\//i.test(item.href) || item.href.startsWith("//");
  if (external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={cls}>
      {item.label}
    </Link>
  );
}

function renderBlock(
  block: FunnelBlock,
  config: SiteConfig,
  page: FunnelPageId,
): ReactNode {
  switch (block.type) {
    case "homeHero":
      return (
        <div
          key={block.id}
          className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6"
        >
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-syne)] text-[1.65rem] font-bold leading-[1.08] tracking-tight text-white min-[400px]:text-[1.85rem] sm:text-4xl sm:leading-[1.05] md:text-6xl lg:text-7xl">
            {block.titlePrimary}
            {block.titleMuted ? (
              <span className="text-[var(--dp-muted)]">{block.titleMuted}</span>
            ) : null}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-[var(--dp-muted)] sm:mt-6 sm:text-lg md:text-xl">
            {block.description}
          </p>
        </div>
      );
    case "heroVideoSlot":
      return (
        <div
          key={block.id}
          className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6"
        >
          <div className="mx-auto mt-8 flex w-full min-w-0 max-w-4xl justify-center sm:mt-10">
            <HeroVideo url={config.heroVideoUrl} />
          </div>
        </div>
      );
    case "ctaRow":
      if (page === "basicCourse") {
        return (
          <div
            key={block.id}
            className="mx-auto mt-12 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-16 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            {block.items.map((item, i) => (
              <CtaLink key={`${block.id}-cta-${i}`} item={item} />
            ))}
          </div>
        );
      }
      return (
        <div
          key={block.id}
          className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6"
        >
          <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            {block.items.map((item, i) => (
              <CtaLink key={`${block.id}-cta-${i}`} item={item} />
            ))}
          </div>
        </div>
      );
    case "studentResultsIntro":
      return (
        <div
          key={block.id}
          className="mx-auto mt-12 max-w-6xl px-3 sm:mt-16 sm:px-4 md:mt-20 md:px-6"
        >
          <h2 className={DP_SECTION_HEADING}>{block.heading}</h2>
          {block.subtext.trim() ? (
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-4 sm:text-lg">
              {block.subtext}
            </p>
          ) : null}
        </div>
      );
    case "imageMarqueeSlot":
      return (
        <div key={block.id} className="relative z-0 mt-6 w-full">
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[min(72vw,480px)] w-[min(96vw,920px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_68%_52%_at_50%_50%,rgba(98,67,255,0.13)_0%,rgba(98,67,255,0.04)_38%,transparent_72%)] sm:top-1/2 sm:h-[min(62vw,520px)]"
            aria-hidden
          />
          <ImageMarqueeRows
            row1={config.sliderRow1}
            row2={config.sliderRow2}
            className="relative z-[1] mt-0"
          />
        </div>
      );
    case "fxBlueTrackRecord":
      return <FxBlueTrackRecord key={block.id} />;
    case "externalCta": {
      const cls =
        block.variant === "primary"
          ? funnelCtaClass("primary")
          : funnelCtaClass("outline");
      return (
        <div
          key={block.id}
          className="mx-auto mt-8 flex justify-center px-3 sm:mt-10 sm:px-4"
        >
          <a
            href={block.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
          >
            {block.label}
          </a>
        </div>
      );
    }
    case "studentSuccessSection":
      return (
        <div
          key={block.id}
          className="mx-auto mt-14 max-w-6xl px-3 sm:mt-20 sm:px-4 md:mt-24 md:px-6"
        >
          <h2 className={DP_SECTION_HEADING}>{block.heading}</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 md:grid-cols-3">
            {config.successVideos.map((videoUrl, i) => (
              <div
                key={`success-${block.id}-${i}`}
                className="mx-auto w-full max-w-[min(100%,260px)] min-[400px]:max-w-[min(100%,280px)] md:max-w-none"
              >
                <HeroVideo
                  url={videoUrl}
                  layout="grid"
                  aspectRatio="9:16"
                  embedTitle={`Student success video ${i + 1}`}
                  placeholderLabel={`Success video ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      );
    case "bookPromptClosing": {
      const v = block.ctaVariant === "outline" ? "outline" : "outlineStrong";
      const cls =
        v === "outlineStrong" ? FUNNEL_CTA_OUTLINE_STRONG : funnelCtaClass("outline");
      return (
        <div
          key={block.id}
          className="mx-auto mt-14 max-w-6xl px-3 sm:mt-16 sm:px-4 md:mt-20"
        >
          <h2 className="mx-auto max-w-xl text-center font-[family-name:var(--font-syne)] text-lg font-bold leading-snug text-white sm:text-xl md:text-2xl">
            {block.heading}
          </h2>
          <div className="mt-6 flex justify-center sm:mt-8">
            <Link href={block.ctaHref} className={cls}>
              {block.ctaLabel}
            </Link>
          </div>
        </div>
      );
    }
    case "basicCourseHeader":
      return (
        <div key={block.id}>
          <h1 className="transform-gpu pb-4 font-[family-name:var(--font-syne)] text-[1.65rem] font-bold leading-normal tracking-tight text-white min-[400px]:text-[1.85rem] sm:pb-5 sm:text-4xl md:pb-8 md:text-6xl md:leading-[1.35] lg:text-7xl lg:leading-[1.32] after:block after:h-2 after:content-[''] sm:after:h-2.5 md:after:h-3">
            {block.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-6 sm:text-lg md:text-xl">
            {block.intro1}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-4 sm:text-lg md:text-xl">
            {block.intro2}
          </p>
        </div>
      );
    case "freeCourseModulesSlot":
      return (
        <div
          key={block.id}
          className="mt-10 space-y-10 text-left sm:mt-14 sm:space-y-14 md:mt-16 md:space-y-16"
        >
          {config.freeCourseModules.map((mod, i) => (
            <section key={`${block.id}-m-${i}`}>
              <p className="mx-auto max-w-3xl whitespace-pre-line text-center font-[family-name:var(--font-syne)] text-[1.35rem] font-bold leading-relaxed text-white md:text-[1.52rem]">
                {mod.tag}
              </p>
              {mod.description.trim() ? (
                <p className="mx-auto mt-4 max-w-3xl whitespace-pre-line text-center text-base leading-relaxed text-[var(--dp-muted)] sm:text-lg">
                  {mod.description}
                </p>
              ) : null}
              <div className="mx-auto mt-6 flex w-full min-w-0 max-w-4xl justify-center">
                <HeroVideo
                  url={mod.videoUrl}
                  embedTitle={`Basic course: ${mod.tag}`}
                  placeholderLabel={`${mod.tag} (video)`}
                />
              </div>
            </section>
          ))}
        </div>
      );
    case "calendlySection":
      return (
        <section
          key={block.id}
          className="mx-auto mt-14 max-w-4xl sm:mt-20 md:mt-28"
        >
          <h2 className="text-center font-[family-name:var(--font-syne)] text-lg font-bold uppercase tracking-[0.1em] text-white sm:text-xl sm:tracking-[0.12em] md:text-2xl">
            {block.heading}
          </h2>
          <p className="mt-3 text-center text-base text-[var(--dp-muted)] sm:mt-4 sm:text-lg md:text-xl">
            {block.description}
          </p>
          <div className="mt-6 sm:mt-8">
            <CalendlyEmbed minHeight={block.minHeight} />
          </div>
        </section>
      );
    case "bookBackLink":
      return (
        <Link
          key={block.id}
          href={block.href}
          className="inline-block text-sm text-[var(--dp-muted)] transition-colors hover:text-white"
        >
          {block.label}
        </Link>
      );
    case "bookHeader":
      return (
        <div key={block.id}>
          <h1 className="mt-6 font-[family-name:var(--font-syne)] text-2xl font-bold text-white sm:mt-8 sm:text-3xl md:text-4xl">
            {block.title}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[var(--dp-muted)] sm:mt-3 sm:text-base">
            {block.description}
          </p>
        </div>
      );
    case "calendlyEmbed":
      return (
        <div key={block.id} className="mt-6 text-left sm:mt-8">
          <CalendlyEmbed minHeight={block.minHeight} />
        </div>
      );
    default:
      return null;
  }
}

const mainClass: Record<FunnelPageId, string> = {
  home: "relative z-[1] min-w-0 pb-16 text-center sm:pb-24",
  basicCourse:
    "relative z-[1] mx-auto min-w-0 max-w-6xl px-3 pb-16 text-center sm:px-4 sm:pb-24 md:px-6",
  book: "relative z-[1] mx-auto min-w-0 max-w-4xl px-3 pb-16 text-center sm:px-4 sm:pb-20 md:px-6",
};

export function FunnelBlocksRenderer({
  page,
  blocks,
  config,
}: {
  page: FunnelPageId;
  blocks: FunnelBlock[];
  config: SiteConfig;
}) {
  return (
    <main className={mainClass[page]}>
      {blocks.map((b) => renderBlock(b, config, page))}
    </main>
  );
}
