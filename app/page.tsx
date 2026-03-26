import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";
import { ImageMarqueeRows } from "@/components/ImageMarqueeRows";
import { DevScrollGrid } from "@/components/DevScrollGrid";
import { FxBlueTrackRecord } from "@/components/FxBlueTrackRecord";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import { SiteFooter } from "@/components/SiteFooter";
import { WHOP_JOIN_URL } from "@/lib/join-url";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const basicCourseCtaClass =
  "dp-cta-glow-primary mx-auto inline-flex h-11 w-full max-w-sm origin-center items-center justify-center rounded-full bg-[var(--dp-accent)] px-6 text-sm font-bold text-white transition-transform duration-300 ease-out hover:scale-[1.02] hover:sm:scale-110 sm:mx-0 sm:h-12 sm:w-auto sm:max-w-none sm:min-w-[12rem] sm:px-10 active:scale-[0.98]";

const bookCallCtaClass =
  "dp-cta-glow-outline mx-auto inline-flex h-11 w-full max-w-sm origin-center items-center justify-center rounded-full border-2 border-white/90 bg-transparent px-6 text-sm font-bold text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[var(--dp-accent)] hover:bg-white/[0.06] hover:sm:scale-105 sm:mx-0 sm:h-12 sm:w-auto sm:max-w-none sm:min-w-[12rem] sm:px-10 active:scale-[0.98]";

const bookCallCtaStrongGlowClass =
  "dp-cta-glow-outline-strong mx-auto inline-flex h-11 w-full max-w-sm origin-center items-center justify-center rounded-full border-2 border-white/90 bg-transparent px-6 text-sm font-bold text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[var(--dp-accent)] hover:bg-white/[0.06] hover:sm:scale-105 sm:mx-0 sm:h-12 sm:w-auto sm:max-w-none sm:min-w-[12rem] sm:px-10 active:scale-[0.98]";

const sectionHeadingClass =
  "text-center font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl";

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <div className="relative min-h-screen overflow-hidden pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-10 md:pt-12">
      <PageBackgroundGlow variant="home" />
      {process.env.NODE_ENV === "development" ? <DevScrollGrid /> : null}
      {/* Accent radial — strength tuned to read closer to top-left PageBackgroundGlow accent (orb × ~0.4 opacity) */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-[min(88vh,760px)] w-[min(100vw,960px)] bg-[radial-gradient(ellipse_58%_46%_at_78%_78%,rgba(98,67,255,0.38)_0%,rgba(98,67,255,0.18)_26%,rgba(98,67,255,0.08)_46%,rgba(98,67,255,0.03)_62%,transparent_78%)] sm:h-[min(82vh,840px)] sm:w-[min(96vw,1080px)] sm:bg-[radial-gradient(ellipse_56%_44%_at_80%_80%,rgba(98,67,255,0.42)_0%,rgba(98,67,255,0.2)_24%,rgba(98,67,255,0.09)_44%,rgba(98,67,255,0.035)_58%,transparent_76%)]"
        aria-hidden
      />

      <main className="relative z-[1] min-w-0 pb-16 text-center sm:pb-24">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-syne)] text-[1.65rem] font-bold leading-[1.08] tracking-tight text-white min-[400px]:text-[1.85rem] sm:text-4xl sm:leading-[1.05] md:text-6xl lg:text-7xl">
            {config.homeHeroTitlePrimary}
            {config.homeHeroTitleMuted ? (
              <span className="text-[var(--dp-muted)]">
                {config.homeHeroTitleMuted}
              </span>
            ) : null}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-[var(--dp-muted)] sm:mt-6 sm:text-lg md:text-xl">
            {config.homeHeroDescription}
          </p>

          <div className="mx-auto mt-8 flex w-full min-w-0 max-w-4xl justify-center sm:mt-10">
            <HeroVideo url={config.heroVideoUrl} />
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/basic-course" className={basicCourseCtaClass}>
              Join now!
            </Link>
            <Link href="/book" className={bookCallCtaClass}>
              Book a call
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl px-3 sm:mt-16 sm:px-4 md:mt-20 md:px-6">
          <h2 className={sectionHeadingClass}>
            {config.homeStudentResultsHeading}
          </h2>
          {config.homeStudentResultsSubtext ? (
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-4 sm:text-lg">
              {config.homeStudentResultsSubtext}
            </p>
          ) : null}
        </div>

        <div className="relative z-0 mt-6 w-full">
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

        <FxBlueTrackRecord />

        <div className="mx-auto mt-8 flex justify-center px-3 sm:mt-10 sm:px-4">
          <Link
            href={WHOP_JOIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={basicCourseCtaClass}
          >
            Join now!
          </Link>
        </div>

        <div className="mx-auto mt-14 max-w-6xl px-3 sm:mt-20 sm:px-4 md:mt-24 md:px-6">
          <h2 className={sectionHeadingClass}>Student success</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 md:grid-cols-3">
            {config.successVideos.map((videoUrl, i) => (
              <div
                key={`success-${i}`}
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

        <div className="mx-auto mt-14 max-w-6xl px-3 sm:mt-16 sm:px-4 md:mt-20">
          <h2 className="mx-auto max-w-xl text-center font-[family-name:var(--font-syne)] text-lg font-bold leading-snug text-white sm:text-xl md:text-2xl">
            Ready to talk? Book a call and we&apos;ll map your next step.
          </h2>
          <div className="mt-6 flex justify-center sm:mt-8">
            <Link href="/book" className={bookCallCtaStrongGlowClass}>
              Book a call
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
