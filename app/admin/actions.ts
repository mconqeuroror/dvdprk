"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  isAdminSession,
  setAdminSession,
} from "@/lib/admin-session";
import { validateAdminLoginAsync } from "@/lib/validate-admin-login";
import {
  getSiteConfig,
  normalizeFreeCourseModules,
  writeSiteConfig,
  type FreeCourseModule,
  type SiteConfig,
} from "@/lib/site-config";

export type MediaFieldPayload =
  | { field: "hero"; url: string }
  | { field: "slider1"; index: number; url: string }
  | { field: "slider2"; index: number; url: string }
  | { field: "successVideo"; index: number; url: string }
  | { field: "freeCourseModuleVideo"; index: number; url: string };

/**
 * Persists a single media URL (or clears it). Used by direct upload controls on the admin panel.
 */
export async function saveMediaFieldAction(
  payload: MediaFieldPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdminSession())) {
    return { ok: false, error: "Unauthorized" };
  }

  const url = String(payload.url ?? "").trim();

  try {
    const config = await getSiteConfig();

    switch (payload.field) {
      case "hero": {
        config.heroVideoUrl = url;
        break;
      }
      case "slider1": {
        if (payload.index < 0 || payload.index > 9) {
          return { ok: false, error: "Invalid slot" };
        }
        config.sliderRow1[payload.index] = url;
        break;
      }
      case "slider2": {
        if (payload.index < 0 || payload.index > 9) {
          return { ok: false, error: "Invalid slot" };
        }
        config.sliderRow2[payload.index] = url;
        break;
      }
      case "successVideo": {
        if (payload.index < 0 || payload.index > 2) {
          return { ok: false, error: "Invalid slot" };
        }
        config.successVideos[payload.index] = url;
        break;
      }
      case "freeCourseModuleVideo": {
        const i = payload.index;
        if (i < 0) return { ok: false, error: "Invalid module" };
        const modules = [...config.freeCourseModules];
        while (modules.length <= i) {
          modules.push({
            tag: `Module ${modules.length + 1}`,
            videoUrl: "",
          });
        }
        const prev = modules[i] ?? { tag: `Module ${i + 1}`, videoUrl: "" };
        modules[i] = { ...prev, videoUrl: url };
        config.freeCourseModules = normalizeFreeCourseModules(modules);
        break;
      }
    }

    await writeSiteConfig(config);
    revalidatePath("/");
    revalidatePath("/free-course");
    revalidatePath("/admin/panel");
    return { ok: true };
  } catch (e) {
    console.error("[saveMediaFieldAction]", e);
    return { ok: false, error: "Save failed" };
  }
}

export async function loginAction(formData: FormData) {
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  if (await validateAdminLoginAsync(user, password)) {
    await setAdminSession();
    redirect("/admin/panel");
  }
  redirect("/admin?error=1");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveSiteConfigAction(formData: FormData) {
  if (!(await isAdminSession())) {
    redirect("/admin");
  }

  const current = await getSiteConfig();

  let freeCourseModules: FreeCourseModule[] = current.freeCourseModules;
  try {
    const raw = String(formData.get("freeCourseModulesJson") ?? "[]");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length > 0) {
        freeCourseModules = parsed.map((item: unknown, i: number) => {
          if (item && typeof item === "object") {
            const o = item as Record<string, unknown>;
            return {
              tag: String(o.tag ?? "").trim() || `Module ${i + 1}`,
              videoUrl: String(o.videoUrl ?? "").trim(),
            };
          }
          return { tag: `Module ${i + 1}`, videoUrl: "" };
        });
      } else {
        freeCourseModules = normalizeFreeCourseModules([]);
      }
    }
  } catch {
    freeCourseModules = current.freeCourseModules;
  }

  const config: SiteConfig = {
    ...current,
    freeCourseModules: normalizeFreeCourseModules(freeCourseModules),
  };
  await writeSiteConfig(config);
  revalidatePath("/");
  revalidatePath("/free-course");
  redirect("/admin/panel?saved=1");
}
