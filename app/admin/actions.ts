"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  isAdminSession,
  setAdminSession,
} from "@/lib/admin-session";
import { validateAdminLoginAsync } from "@/lib/validate-admin-login";
import {
  normalizeFreeCourseModules,
  writeSiteConfig,
  type FreeCourseModule,
  type SiteConfig,
} from "@/lib/site-config";

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

  const heroVideoUrl = String(formData.get("heroVideoUrl") ?? "");
  const sliderRow1: string[] = [];
  const sliderRow2: string[] = [];
  for (let i = 0; i < 10; i++) {
    sliderRow1.push(String(formData.get(`slider1_${i}`) ?? "").trim());
    sliderRow2.push(String(formData.get(`slider2_${i}`) ?? "").trim());
  }
  const successVideos = [0, 1, 2].map((i) =>
    String(formData.get(`successVideo_${i}`) ?? "").trim(),
  );

  let freeCourseModules: FreeCourseModule[] = normalizeFreeCourseModules([]);
  try {
    const raw = String(formData.get("freeCourseModulesJson") ?? "[]");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
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
    }
  } catch {
    freeCourseModules = normalizeFreeCourseModules([]);
  }

  const config: SiteConfig = {
    heroVideoUrl: heroVideoUrl.trim(),
    sliderRow1,
    sliderRow2,
    successVideos,
    freeCourseModules,
  };
  await writeSiteConfig(config);
  redirect("/admin/panel?saved=1");
}
