import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";
import { ImageMarqueeRows } from "@/components/ImageMarqueeRows";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const freeCourseCtaClass =
  "dp-cta-glow-primary inline-flex h-11 w-full max-w-sm origin-center items-center justify-center rounded-full bg-[var(--dp-accent)] px-6 text-sm font-bold text-white transition-transform duration-300 ease-out hover:scale-[1.02] hover:sm:scale-110 sm:h-12 sm:w-auto sm:max-w-none sm:px-10 active:scale-[0.98]";

const sectionHeadingClass =
  "font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl";

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <div className="relative min-h-screen overflow-hidden pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:pt-28 md:pt-32">
      <PageBackgroundGlow variant="home" />

      <main className="relative z-[1] min-w-0 pb-16 sm:pb-24">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
          <p className="mb-3 font-[family-name:var(--font-syne)] text-[0.65rem] font-semibold uppercase leading-snug tracking-[0.18em] text-[var(--dp-accent)] sm:mb-4 sm:text-xs sm:tracking-[0.2em]">
            Patience · skill · discipline
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-[1.65rem] font-bold leading-[1.08] tracking-tight text-white min-[400px]:text-[1.85rem] sm:text-4xl sm:leading-[1.05] md:text-6xl lg:text-7xl">
            Build a funded path
            <span className="text-[var(--dp-muted)]"> without the noise.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-6 sm:text-lg md:text-xl">
            Clear frameworks, accountability, and a process you can repeat.
            Start with the free course, then book a call when you&apos;re ready
            to go deeper.
          </p>

          <div className="mx-auto mt-8 flex w-full min-w-0 max-w-4xl justify-center sm:mt-10">
            <HeroVideo url={config.heroVideoUrl} />
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-4xl justify-center sm:mt-10">
            <Link href="/free-course" className={freeCourseCtaClass}>
              Get the free course
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl px-3 sm:mt-16 sm:px-4 md:mt-20 md:px-6">
          <h2 className={sectionHeadingClass}>Student results</h2>
        </div>

        <ImageMarqueeRows
          row1={config.sliderRow1}
          row2={config.sliderRow2}
          className="mt-6"
        />

        <div className="mx-auto mt-8 flex justify-center px-3 sm:mt-10 sm:px-4">
          <Link href="/free-course" className={freeCourseCtaClass}>
            Get the free course
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
          <div className="mt-8 flex justify-center px-3 sm:mt-10 md:mt-12 sm:px-0">
            <Link href="/free-course" className={freeCourseCtaClass}>
              Start free course
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-[1] border-t border-white/10 py-8 text-center text-xs text-[var(--dp-muted)] sm:py-10 sm:text-sm">
        © {new Date().getFullYear()} David Perk
      </footer>
    </div>
  );
}
