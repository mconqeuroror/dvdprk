/**
 * Site content: Postgres (`site_settings.payload` JSON) when `DATABASE_URL` is set,
 * otherwise `data/site-config.json`. All video/image fields are URLs (blob-friendly).
 */
import type { Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

export type FreeCourseModule = {
  /** Short title / heading shown above the description and video */
  tag: string;
  /** Optional body copy below the title (supports line breaks) */
  description: string;
  videoUrl: string;
};

export type SiteConfig = {
  heroVideoUrl: string;
  /** Home hero H1 — first line (white) */
  homeHeroTitlePrimary: string;
  /** Home hero H1 — second part (muted); optional */
  homeHeroTitleMuted: string;
  /** Home hero paragraph under the title */
  homeHeroDescription: string;
  /** Home “Student results” section heading */
  homeStudentResultsHeading: string;
  sliderRow1: string[];
  sliderRow2: string[];
  successVideos: string[];
  freeCourseModules: FreeCourseModule[];
};

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");

const DEFAULT_FREE_MODULES: FreeCourseModule[] = [
  { tag: "Module 1", description: "", videoUrl: "" },
  { tag: "Module 2", description: "", videoUrl: "" },
  { tag: "Module 3", description: "", videoUrl: "" },
];

const DEFAULT_HOME_DESC =
  "Clear frameworks, accountability, and a process you can repeat. Start with the basic course, then book a call when you're ready to go deeper.";

const DEFAULTS: SiteConfig = {
  heroVideoUrl: "",
  homeHeroTitlePrimary: "Build a funded path",
  homeHeroTitleMuted: " without the noise.",
  homeHeroDescription: DEFAULT_HOME_DESC,
  homeStudentResultsHeading: "Student results",
  sliderRow1: Array(10).fill(""),
  sliderRow2: Array(10).fill(""),
  successVideos: ["", "", ""],
  freeCourseModules: DEFAULT_FREE_MODULES.map((m) => ({ ...m })),
};

function cloneDefaults(): SiteConfig {
  return {
    ...DEFAULTS,
    homeHeroDescription: DEFAULT_HOME_DESC,
    sliderRow1: [...DEFAULTS.sliderRow1],
    sliderRow2: [...DEFAULTS.sliderRow2],
    successVideos: [...DEFAULTS.successVideos],
    freeCourseModules: DEFAULT_FREE_MODULES.map((m) => ({ ...m })),
  };
}

function pad10(arr: unknown): string[] {
  const a = Array.isArray(arr) ? arr.map((x) => String(x ?? "")) : [];
  const out = [...a];
  while (out.length < 10) out.push("");
  return out.slice(0, 10);
}

function pad3(arr: unknown): string[] {
  const a = Array.isArray(arr) ? arr.map((x) => String(x ?? "")) : [];
  const out = [...a];
  while (out.length < 3) out.push("");
  return out.slice(0, 3);
}

export function normalizeFreeCourseModules(raw: unknown): FreeCourseModule[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_FREE_MODULES.map((m) => ({ ...m }));
  }
  return raw.map((item, i) => {
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const tag = String(o.tag ?? "").trim();
      const videoUrl = String(o.videoUrl ?? "").trim();
      const description = String(o.description ?? "");
      return {
        tag: tag || `Module ${i + 1}`,
        description,
        videoUrl,
      };
    }
    return { tag: `Module ${i + 1}`, description: "", videoUrl: "" };
  });
}

function normalizeFromUnknown(parsed: unknown): SiteConfig {
  if (!parsed || typeof parsed !== "object") {
    return cloneDefaults();
  }
  const p = parsed as Record<string, unknown>;
  const primary = String(p.homeHeroTitlePrimary ?? "").trim();
  const muted = String(p.homeHeroTitleMuted ?? "");
  const desc = String(p.homeHeroDescription ?? "").trim();
  const resultsH = String(p.homeStudentResultsHeading ?? "").trim();
  return {
    heroVideoUrl: String(p.heroVideoUrl ?? ""),
    homeHeroTitlePrimary: primary || DEFAULTS.homeHeroTitlePrimary,
    homeHeroTitleMuted: muted,
    homeHeroDescription: desc || DEFAULT_HOME_DESC,
    homeStudentResultsHeading:
      resultsH || DEFAULTS.homeStudentResultsHeading,
    sliderRow1: pad10(p.sliderRow1),
    sliderRow2: pad10(p.sliderRow2),
    successVideos: pad3(p.successVideos),
    freeCourseModules: normalizeFreeCourseModules(p.freeCourseModules),
  };
}

async function getSiteConfigFromFile(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return normalizeFromUnknown(parsed);
  } catch {
    return cloneDefaults();
  }
}

async function getSiteConfigFromDatabase(): Promise<SiteConfig | null> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "site" },
  });
  if (!row) return null;
  return normalizeFromUnknown(row.payload);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (hasDatabaseUrl()) {
    try {
      const fromDb = await getSiteConfigFromDatabase();
      if (fromDb) return fromDb;
    } catch (e) {
      console.error("[getSiteConfig] database error, falling back to file:", e);
    }
  }
  return getSiteConfigFromFile();
}

export async function writeSiteConfig(config: SiteConfig): Promise<void> {
  const normalized: SiteConfig = {
    heroVideoUrl: config.heroVideoUrl.trim(),
    homeHeroTitlePrimary:
      config.homeHeroTitlePrimary.trim() || DEFAULTS.homeHeroTitlePrimary,
    homeHeroTitleMuted: config.homeHeroTitleMuted,
    homeHeroDescription:
      config.homeHeroDescription.trim() || DEFAULT_HOME_DESC,
    homeStudentResultsHeading:
      config.homeStudentResultsHeading.trim() ||
      DEFAULTS.homeStudentResultsHeading,
    sliderRow1: pad10(config.sliderRow1),
    sliderRow2: pad10(config.sliderRow2),
    successVideos: pad3(config.successVideos),
    freeCourseModules: normalizeFreeCourseModules(config.freeCourseModules),
  };

  const payload = normalized as unknown as Prisma.InputJsonValue;

  if (hasDatabaseUrl()) {
    await prisma.siteSettings.upsert({
      where: { id: "site" },
      create: { id: "site", payload },
      update: { payload },
    });
    return;
  }

  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(
    CONFIG_PATH,
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf-8",
  );
}
