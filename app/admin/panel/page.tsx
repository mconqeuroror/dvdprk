import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DirectMediaField } from "@/components/admin/DirectMediaField";
import { FreeCourseModulesEditor } from "@/components/admin/FreeCourseModulesEditor";
import { getSiteConfig } from "@/lib/site-config";
import { hasDatabaseUrl } from "@/lib/prisma";
import { logoutAction, saveSiteConfigAction } from "../actions";

export default async function AdminPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const jar = await cookies();
  if (jar.get("dp_admin")?.value !== "1") {
    redirect("/admin");
  }
  const config = await getSiteConfig();
  const sp = await searchParams;
  const storageHint = hasDatabaseUrl()
    ? "the database"
    : "data/site-config.json";

  return (
    <main className="mx-auto max-w-3xl px-3 py-12 pb-20 sm:px-4 sm:py-16 sm:pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white">
          Admin panel
        </h1>
        <div className="flex gap-3">
          <Link
            href="/"
            className="text-sm text-[var(--dp-muted)] hover:text-white"
          >
            View site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-red-300 hover:text-red-200"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Basic course module text and order saved to {storageHint}. Media above
          is saved as you upload or click Save link / Remove.
        </p>
      ) : null}

      <p className="mt-6 text-sm text-[var(--dp-muted)]">
        Upload or paste a link at each slot — changes apply immediately. For
        YouTube or external MP4, paste the URL and press{" "}
        <span className="text-white/80">Save link</span>. Sliders use images
        only. Requires <code className="text-white/70">BLOB_READ_WRITE_TOKEN</code>{" "}
        for file uploads.
      </p>

      <div className="mt-8 space-y-10">
        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Hero video
          </h2>
          <p className="mt-1 text-xs text-[var(--dp-muted)]">
            Background / hero: MP4 (upload) or YouTube URL.
          </p>
          <div className="mt-3">
            <DirectMediaField
              target={{ kind: "hero" }}
              initialUrl={config.heroVideoUrl}
              accept="video/*"
            />
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Slider row 1 (scrolls → right)
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {config.sliderRow1.map((url, i) => (
              <DirectMediaField
                key={`r1-${i}`}
                target={{ kind: "slider1", index: i }}
                initialUrl={url}
                accept="image/*"
                imagePreview
                slotLabel={`Image ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Slider row 2 (scrolls → left)
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {config.sliderRow2.map((url, i) => (
              <DirectMediaField
                key={`r2-${i}`}
                target={{ kind: "slider2", index: i }}
                initialUrl={url}
                accept="image/*"
                imagePreview
                slotLabel={`Image ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Student success videos (3)
          </h2>
          <p className="mt-1 text-xs text-[var(--dp-muted)]">
            Home page “Student success” row.
          </p>
          <div className="mt-3 grid gap-3">
            {config.successVideos.map((url, i) => (
              <DirectMediaField
                key={`sv-${i}`}
                target={{ kind: "successVideo", index: i }}
                initialUrl={url}
                accept="video/*"
                slotLabel={`Video ${i + 1}`}
              />
            ))}
          </div>
        </section>
      </div>

      <form action={saveSiteConfigAction} className="mt-10 space-y-6">
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Home page copy
          </h2>
          <p className="text-xs text-[var(--dp-muted)]">
            Shown on <code className="text-white/70">/</code>. Muted line is the
            gray part after the main headline (leave empty to hide it).
          </p>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--dp-muted)]" htmlFor="homeHeroTitlePrimary">
              Hero headline (white)
            </label>
            <input
              id="homeHeroTitlePrimary"
              name="homeHeroTitlePrimary"
              defaultValue={config.homeHeroTitlePrimary}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--dp-muted)]" htmlFor="homeHeroTitleMuted">
              Hero headline (muted suffix)
            </label>
            <input
              id="homeHeroTitleMuted"
              name="homeHeroTitleMuted"
              defaultValue={config.homeHeroTitleMuted}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[var(--dp-muted)]" htmlFor="homeHeroDescription">
              Hero paragraph
            </label>
            <textarea
              id="homeHeroDescription"
              name="homeHeroDescription"
              rows={4}
              defaultValue={config.homeHeroDescription}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label
              className="block text-xs text-[var(--dp-muted)]"
              htmlFor="homeStudentResultsHeading"
            >
              “Student results” section title
            </label>
            <input
              id="homeStudentResultsHeading"
              name="homeStudentResultsHeading"
              defaultValue={config.homeStudentResultsHeading}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
        </section>

        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
          Basic course modules
        </h2>
        <p className="text-xs text-[var(--dp-muted)]">
          Shown on <code className="text-white/70">/basic-course</code>. Each
          module: title, optional description (body under the title), then
          video. Video uploads save immediately per slot (by position). After
          you add or remove modules, click Save below first so uploads match
          the right module. Save stores title, description, order, and list.
        </p>
        <div className="mt-4">
          <FreeCourseModulesEditor initial={config.freeCourseModules} />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[var(--dp-accent)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Save home copy, module titles, descriptions &amp; list
        </button>
      </form>
    </main>
  );
}
