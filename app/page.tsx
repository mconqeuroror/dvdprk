import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";
import { ImageMarqueeRows } from "@/components/ImageMarqueeRows";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const freeCourseCtaClass =
  "dp-cta-glow-primary inline-flex h-12 origin-center items-center justify-center rounded-full bg-[var(--dp-accent)] px-10 text-sm font-bold text-white transition-transform duration-300 ease-out hover:scale-110";

const sectionHeadingClass =
  "font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-white md:text-3xl";

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 md:pt-32">
      <PageBackgroundGlow variant="home" />

      <main className="relative z-[1] pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="mb-4 font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--dp-accent)]">
            Patience · skill · discipline
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            Build a funded path
            <span className="text-[var(--dp-muted)]"> without the noise.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--dp-muted)] md:text-xl">
            Clear frameworks, accountability, and a process you can repeat.
            Start with the free course, then book a call when you&apos;re ready
            to go deeper.
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-4xl justify-center">
            <HeroVideo url={config.heroVideoUrl} />
          </div>

          <div className="mx-auto mt-10 flex w-full max-w-4xl justify-center">
            <Link href="/free-course" className={freeCourseCtaClass}>
              Get the free course
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-6xl px-4 md:mt-20 md:px-6">
          <h2 className={sectionHeadingClass}>Student results</h2>
        </div>

        <ImageMarqueeRows
          row1={config.sliderRow1}
          row2={config.sliderRow2}
          className="mt-6"
        />

        <div className="mx-auto mt-10 flex justify-center px-4">
          <Link href="/free-course" className={freeCourseCtaClass}>
            Get the free course
          </Link>
        </div>

        <div className="mx-auto mt-20 max-w-6xl px-4 md:mt-24 md:px-6">
          <h2 className={sectionHeadingClass}>Student success</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {config.successVideos.map((videoUrl, i) => (
              <HeroVideo
                key={`success-${i}`}
                url={videoUrl}
                layout="grid"
                embedTitle={`Student success video ${i + 1}`}
                placeholderLabel={`Success video ${i + 1}`}
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center md:mt-12">
            <Link href="/free-course" className={freeCourseCtaClass}>
              Start free course
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-[1] border-t border-white/10 py-10 text-center text-sm text-[var(--dp-muted)]">
        © {new Date().getFullYear()} David Perk
      </footer>
    </div>
  );
}
