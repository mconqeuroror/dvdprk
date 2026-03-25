import type { Metadata } from "next";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { HeroVideo } from "@/components/HeroVideo";
import { DevScrollGrid } from "@/components/DevScrollGrid";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Forex Training",
  description:
    "Free Forex mini course from David Perk — modules and book a live call.",
};

export default async function FreeCoursePage() {
  const config = await getSiteConfig();
  const modules = config.freeCourseModules;

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:pt-28 md:pt-32">
      <PageBackgroundGlow variant="freeCourse" />
      {process.env.NODE_ENV === "development" ? <DevScrollGrid /> : null}
      <main className="relative z-[1] mx-auto min-w-0 max-w-6xl px-3 pb-16 sm:px-4 sm:pb-24 md:px-6">
        <h1 className="font-[family-name:var(--font-syne)] pb-[0.2em] text-[1.65rem] font-bold leading-[1.14] tracking-tight text-white min-[400px]:text-[1.85rem] sm:text-4xl sm:leading-[1.12] md:text-6xl md:leading-[1.1] lg:text-7xl lg:leading-[1.1]">
          Free Forex Training
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-6 sm:text-lg md:text-xl">
          You&apos;ve just unlocked access to our free Forex mini course.
        </p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--dp-muted)] sm:mt-4 sm:text-lg md:text-xl">
          Keep it simple &amp; start with Module 1 and work through in order.
        </p>

        <div className="mt-10 space-y-10 sm:mt-14 sm:space-y-14 md:mt-16 md:space-y-16">
          {modules.map((mod, i) => (
            <section key={`module-${i}`}>
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
                  embedTitle={`Free course: ${mod.tag}`}
                  placeholderLabel={`${mod.tag} (video)`}
                />
              </div>
            </section>
          ))}
        </div>

        <section className="mx-auto mt-14 max-w-4xl sm:mt-20 md:mt-28">
          <h2 className="text-center font-[family-name:var(--font-syne)] text-lg font-bold uppercase tracking-[0.1em] text-white sm:text-xl sm:tracking-[0.12em] md:text-2xl">
            Want to learn more?
          </h2>
          <p className="mt-3 text-center text-base text-[var(--dp-muted)] sm:mt-4 sm:text-lg md:text-xl">
            Book a live call with David below
          </p>
          <div className="mt-6 sm:mt-8">
            <CalendlyEmbed minHeight={760} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
