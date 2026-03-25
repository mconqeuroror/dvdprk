import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBlobUpload } from "@/components/admin/AdminBlobUpload";
import { FreeCourseModulesEditor } from "@/components/admin/FreeCourseModulesEditor";
import { getSiteConfig } from "@/lib/site-config";
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 pb-24">
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
          Saved. Content is stored in{" "}
          <code className="rounded bg-black/30 px-1">data/site-config.json</code>{" "}
          (replace with Postgres later).
        </p>
      ) : null}

      <p className="mt-6 text-sm text-[var(--dp-muted)]">
        Hero video: paste a direct{" "}
        <code className="text-white/80">.mp4</code> URL or a YouTube link.
        Sliders: image URLs (https), one per frame — 10 per row. Student
        success: three video URLs (same rules as hero). Free course: edit
        module labels and videos; add or remove modules.
      </p>

      <div className="mt-8">
        <AdminBlobUpload />
      </div>

      <form action={saveSiteConfigAction} className="mt-8 space-y-10">
        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Hero video
          </h2>
          <p className="mt-1 text-xs text-[var(--dp-muted)]">
            YouTube / MP4 URL, or a public URL from blob upload above.
          </p>
          <input
            name="heroVideoUrl"
            defaultValue={config.heroVideoUrl}
            placeholder="https://…mp4 or https://youtube.com/watch?v=…"
            className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
          />
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Slider row 1 (scrolls → right)
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {config.sliderRow1.map((url, i) => (
              <input
                key={`r1-${i}`}
                name={`slider1_${i}`}
                defaultValue={url}
                placeholder={`Image ${i + 1} URL`}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Slider row 2 (scrolls → left)
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {config.sliderRow2.map((url, i) => (
              <input
                key={`r2-${i}`}
                name={`slider2_${i}`}
                defaultValue={url}
                placeholder={`Image ${i + 1} URL`}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Free course modules
          </h2>
          <p className="mt-1 text-xs text-[var(--dp-muted)]">
            Shown on <code className="text-white/70">/free-course</code> in
            order. Each block: label + video.
          </p>
          <div className="mt-4">
            <FreeCourseModulesEditor initial={config.freeCourseModules} />
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Student success videos (3)
          </h2>
          <p className="mt-1 text-xs text-[var(--dp-muted)]">
            Shown on the home page under “Student success”.
          </p>
          <div className="mt-3 grid gap-3">
            {config.successVideos.map((url, i) => (
              <input
                key={`sv-${i}`}
                name={`successVideo_${i}`}
                defaultValue={url}
                placeholder={`Video ${i + 1} — MP4 or YouTube URL`}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
              />
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-[var(--dp-accent)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}
