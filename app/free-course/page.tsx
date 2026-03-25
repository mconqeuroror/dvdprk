import type { Metadata } from "next";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { HeroVideo } from "@/components/HeroVideo";
import { PageBackgroundGlow } from "@/components/PageBackgroundGlow";
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
    <div className="relative min-h-screen overflow-hidden pt-28 md:pt-32">
      <PageBackgroundGlow variant="freeCourse" />
      <main className="relative z-[1] mx-auto max-w-6xl px-4 pb-24 md:px-6">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
          Free Forex Training
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--dp-muted)] md:text-xl">
          You&apos;ve just unlocked access to our free Forex mini course.
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--dp-muted)] md:text-xl">
          Keep it simple &amp; start with Module 1 and work through in order.
        </p>

        <div className="mt-14 space-y-14 md:mt-16 md:space-y-16">
          {modules.map((mod, i) => (
            <section key={`${i}-${mod.tag.slice(0, 20)}`}>
              <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-white md:text-lg">
                {mod.tag}
              </p>
              <div className="mx-auto mt-6 flex w-full max-w-4xl justify-center">
                <HeroVideo
                  url={mod.videoUrl}
                  embedTitle={`Free course: ${mod.tag}`}
                  placeholderLabel={`${mod.tag} (video)`}
                />
              </div>
            </section>
          ))}
        </div>

        <section className="mx-auto mt-20 max-w-4xl md:mt-28">
          <h2 className="text-center font-[family-name:var(--font-syne)] text-xl font-bold uppercase tracking-[0.12em] text-white md:text-2xl">
            Want to learn more?
          </h2>
          <p className="mt-4 text-center text-lg text-[var(--dp-muted)] md:text-xl">
            Book a live call with David below
          </p>
          <div className="mt-8">
            <CalendlyEmbed minHeight={760} />
          </div>
        </section>
      </main>
    </div>
  );
}
