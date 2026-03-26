/**
 * Site content: Postgres (`site_settings.payload` JSON) when `DATABASE_URL` is set,
 * otherwise `data/site-config.json`. All video/image fields are URLs (blob-friendly).
 */
import type { Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import {
  parseFunnelPages,
  type FunnelPages,
} from "@/lib/funnel-types";
import { WHOP_JOIN_URL } from "@/lib/join-url";
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
  /** Line below “Student results” (optional; empty hides it) */
  homeStudentResultsSubtext: string;
  sliderRow1: string[];
  sliderRow2: string[];
  successVideos: string[];
  freeCourseModules: FreeCourseModule[];
  /**
   * Optional block-based funnel for /, /basic-course, /book.
   * When absent or invalid, layouts fall back to legacy fields via defaults.
   */
  funnelPages?: FunnelPages | null;
};

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");

const DEFAULT_FREE_MODULES: FreeCourseModule[] = [
  { tag: "Module 1", description: "", videoUrl: "" },
  { tag: "Module 2", description: "", videoUrl: "" },
  { tag: "Module 3", description: "", videoUrl: "" },
];

const DEFAULT_HOME_DESC =
  "Clear frameworks, accountability, and a process you can repeat. Start with the basic course, then book a call when you're ready to go deeper.";

const DEFAULT_STUDENT_RESULTS_SUBTEXT =
  "Learn alongside profitable traders";

const DEFAULTS: SiteConfig = {
  heroVideoUrl: "",
  homeHeroTitlePrimary: "Build a funded path",
  homeHeroTitleMuted: " without the noise.",
  homeHeroDescription: DEFAULT_HOME_DESC,
  homeStudentResultsHeading: "Student results",
  homeStudentResultsSubtext: DEFAULT_STUDENT_RESULTS_SUBTEXT,
  sliderRow1: Array(10).fill(""),
  sliderRow2: Array(10).fill(""),
  successVideos: ["", "", ""],
  freeCourseModules: DEFAULT_FREE_MODULES.map((m) => ({ ...m })),
  funnelPages: null,
};

function cloneDefaults(): SiteConfig {
  return {
    ...DEFAULTS,
    homeHeroDescription: DEFAULT_HOME_DESC,
    sliderRow1: [...DEFAULTS.sliderRow1],
    sliderRow2: [...DEFAULTS.sliderRow2],
    successVideos: [...DEFAULTS.successVideos],
    freeCourseModules: DEFAULT_FREE_MODULES.map((m) => ({ ...m })),
    funnelPages: null,
  };
}

export function defaultFunnelPagesFromLegacy(c: SiteConfig): FunnelPages {
  return {
    home: [
      {
        id: "h-hero",
        type: "homeHero",
        titlePrimary: c.homeHeroTitlePrimary,
        titleMuted: c.homeHeroTitleMuted,
        description: c.homeHeroDescription,
      },
      { id: "h-video", type: "heroVideoSlot" },
      {
        id: "h-ctas-top",
        type: "ctaRow",
        items: [
          { label: "Join now!", href: "/basic-course", variant: "primary" },
          { label: "Book a call", href: "/book", variant: "outline" },
        ],
      },
      {
        id: "h-results-intro",
        type: "studentResultsIntro",
        heading: c.homeStudentResultsHeading,
        subtext: c.homeStudentResultsSubtext,
      },
      { id: "h-marquee", type: "imageMarqueeSlot" },
      { id: "h-fxblue", type: "fxBlueTrackRecord" },
      {
        id: "h-whop",
        type: "externalCta",
        label: "Join now!",
        href: WHOP_JOIN_URL,
        variant: "primary",
      },
      {
        id: "h-success-title",
        type: "studentSuccessSection",
        heading: "Student success",
      },
      {
        id: "h-book-close",
        type: "bookPromptClosing",
        heading:
          "Ready to talk? Book a call and we'll map your next step.",
        ctaLabel: "Book a call",
        ctaHref: "/book",
        ctaVariant: "outlineStrong",
      },
    ],
    basicCourse: [
      {
        id: "bc-head",
        type: "basicCourseHeader",
        title: "Basic Forex training",
        intro1:
          "You've just unlocked access to our basic Forex mini course.",
        intro2:
          "Keep it simple & start with Module 1 and work through in order.",
      },
      { id: "bc-modules", type: "freeCourseModulesSlot" },
      {
        id: "bc-foot-ctas",
        type: "ctaRow",
        items: [
          { label: "Home", href: "/", variant: "outline" },
          {
            label: "Join now!",
            href: WHOP_JOIN_URL,
            variant: "primary",
          },
        ],
      },
      {
        id: "bc-cal",
        type: "calendlySection",
        heading: "Want to learn more?",
        description: "Book a live call with David below",
        minHeight: 760,
      },
    ],
    book: [
      {
        id: "bk-back",
        type: "bookBackLink",
        label: "← Back to home",
        href: "/",
      },
      {
        id: "bk-head",
        type: "bookHeader",
        title: "Book a call",
        description:
          "Pick a time that works for you. The widget uses your Calendly colors.",
      },
      { id: "bk-cal", type: "calendlyEmbed", minHeight: 800 },
    ],
  };
}

export function getFunnelPages(config: SiteConfig): FunnelPages {
  const parsed = config.funnelPages
    ? parseFunnelPages(config.funnelPages)
    : null;
  if (parsed) return parsed;
  return defaultFunnelPagesFromLegacy(config);
}

/** Copy hero + student-results text from home blocks into legacy keys (for media panel / fallbacks). */
/** When legacy “home copy” form is saved, push values into stored funnel blocks (if any). */
export function mergeLegacyHomeCopyIntoFunnelPages(
  config: SiteConfig,
): SiteConfig {
  if (config.funnelPages == null) return config;
  const parsed = parseFunnelPages(config.funnelPages);
  if (!parsed) return config;
  const home = parsed.home.map((b) => {
    if (b.type === "homeHero") {
      return {
        ...b,
        titlePrimary: config.homeHeroTitlePrimary,
        titleMuted: config.homeHeroTitleMuted,
        description: config.homeHeroDescription,
      };
    }
    if (b.type === "studentResultsIntro") {
      return {
        ...b,
        heading: config.homeStudentResultsHeading,
        subtext: config.homeStudentResultsSubtext,
      };
    }
    return b;
  });
  return {
    ...config,
    funnelPages: { ...parsed, home },
  };
}

export function syncLegacyCopyFromHomeFunnel(config: SiteConfig): SiteConfig {
  const pages = getFunnelPages(config);
  let next = { ...config };
  for (const b of pages.home) {
    if (b.hidden) continue;
    if (b.type === "homeHero") {
      next = {
        ...next,
        homeHeroTitlePrimary:
          b.titlePrimary.trim() || next.homeHeroTitlePrimary,
        homeHeroTitleMuted: b.titleMuted,
        homeHeroDescription: b.description.trim() || next.homeHeroDescription,
      };
    }
    if (b.type === "studentResultsIntro") {
      next = {
        ...next,
        homeStudentResultsHeading:
          b.heading.trim() || next.homeStudentResultsHeading,
        homeStudentResultsSubtext: b.subtext.trim(),
      };
    }
  }
  return next;
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
  const resultsSub =
    p.homeStudentResultsSubtext === undefined ||
    p.homeStudentResultsSubtext === null
      ? DEFAULT_STUDENT_RESULTS_SUBTEXT
      : String(p.homeStudentResultsSubtext).trim();
  const funnelRaw = p.funnelPages;
  const funnelParsed =
    funnelRaw === null || funnelRaw === undefined
      ? null
      : parseFunnelPages(funnelRaw);

  return {
    heroVideoUrl: String(p.heroVideoUrl ?? ""),
    homeHeroTitlePrimary: primary || DEFAULTS.homeHeroTitlePrimary,
    homeHeroTitleMuted: muted,
    homeHeroDescription: desc || DEFAULT_HOME_DESC,
    homeStudentResultsHeading:
      resultsH || DEFAULTS.homeStudentResultsHeading,
    homeStudentResultsSubtext: resultsSub,
    sliderRow1: pad10(p.sliderRow1),
    sliderRow2: pad10(p.sliderRow2),
    successVideos: pad3(p.successVideos),
    freeCourseModules: normalizeFreeCourseModules(p.freeCourseModules),
    funnelPages: funnelParsed ?? null,
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
    homeStudentResultsSubtext: config.homeStudentResultsSubtext.trim(),
    sliderRow1: pad10(config.sliderRow1),
    sliderRow2: pad10(config.sliderRow2),
    successVideos: pad3(config.successVideos),
    freeCourseModules: normalizeFreeCourseModules(config.freeCourseModules),
    funnelPages:
      config.funnelPages != null && parseFunnelPages(config.funnelPages)
        ? config.funnelPages
        : null,
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
