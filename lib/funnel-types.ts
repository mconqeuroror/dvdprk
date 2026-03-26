export type FunnelPageId = "home" | "basicCourse" | "book";

export type CtaVariant = "primary" | "outline" | "outlineStrong";

export type CtaItem = {
  label: string;
  href: string;
  variant: CtaVariant;
};

export type FunnelBlock =
  | {
      id: string;
      type: "homeHero";
      hidden?: boolean;
      titlePrimary: string;
      titleMuted: string;
      description: string;
    }
  | { id: string; type: "heroVideoSlot"; hidden?: boolean }
  | {
      id: string;
      type: "ctaRow";
      hidden?: boolean;
      items: CtaItem[];
    }
  | {
      id: string;
      type: "studentResultsIntro";
      hidden?: boolean;
      heading: string;
      subtext: string;
    }
  | { id: string; type: "imageMarqueeSlot"; hidden?: boolean }
  | { id: string; type: "fxBlueTrackRecord"; hidden?: boolean }
  | {
      id: string;
      type: "externalCta";
      hidden?: boolean;
      label: string;
      href: string;
      variant: "primary" | "outline";
    }
  | {
      id: string;
      type: "studentSuccessSection";
      hidden?: boolean;
      heading: string;
    }
  | {
      id: string;
      type: "bookPromptClosing";
      hidden?: boolean;
      heading: string;
      ctaLabel: string;
      ctaHref: string;
      /** Default strong outline glow (matches legacy home closing CTA). */
      ctaVariant?: "outline" | "outlineStrong";
    }
  | {
      id: string;
      type: "basicCourseHeader";
      hidden?: boolean;
      title: string;
      intro1: string;
      intro2: string;
    }
  | { id: string; type: "freeCourseModulesSlot"; hidden?: boolean }
  | {
      id: string;
      type: "calendlySection";
      hidden?: boolean;
      heading: string;
      description: string;
      minHeight: number;
    }
  | {
      id: string;
      type: "bookBackLink";
      hidden?: boolean;
      label: string;
      href: string;
    }
  | {
      id: string;
      type: "bookHeader";
      hidden?: boolean;
      title: string;
      description: string;
    }
  | {
      id: string;
      type: "calendlyEmbed";
      hidden?: boolean;
      minHeight: number;
    };

export type FunnelPages = Record<FunnelPageId, FunnelBlock[]>;

const BLOCK_TYPES_HOME = new Set([
  "homeHero",
  "heroVideoSlot",
  "ctaRow",
  "studentResultsIntro",
  "imageMarqueeSlot",
  "fxBlueTrackRecord",
  "externalCta",
  "studentSuccessSection",
  "bookPromptClosing",
]);

const BLOCK_TYPES_BASIC = new Set([
  "basicCourseHeader",
  "freeCourseModulesSlot",
  "ctaRow",
  "calendlySection",
]);

const BLOCK_TYPES_BOOK = new Set([
  "bookBackLink",
  "bookHeader",
  "calendlyEmbed",
]);

function parseCtaItem(raw: unknown): CtaItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const label = String(o.label ?? "").trim();
  const href = String(o.href ?? "").trim();
  const v = String(o.variant ?? "outline");
  const variant =
    v === "primary" || v === "outline" || v === "outlineStrong"
      ? v
      : "outline";
  if (!label || !href) return null;
  return { label, href, variant };
}

function parseBlock(page: FunnelPageId, raw: unknown): FunnelBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = String(o.id ?? "").trim();
  const type = String(o.type ?? "").trim();
  const hidden = Boolean(o.hidden);
  if (!id || !type) return null;

  const allowed =
    page === "home"
      ? BLOCK_TYPES_HOME
      : page === "basicCourse"
        ? BLOCK_TYPES_BASIC
        : BLOCK_TYPES_BOOK;
  if (!allowed.has(type)) return null;

  switch (type) {
    case "homeHero":
      return {
        id,
        type,
        hidden,
        titlePrimary: String(o.titlePrimary ?? ""),
        titleMuted: String(o.titleMuted ?? ""),
        description: String(o.description ?? ""),
      };
    case "heroVideoSlot":
      return { id, type, hidden };
    case "ctaRow": {
      const itemsRaw = Array.isArray(o.items) ? o.items : [];
      const items = itemsRaw
        .map(parseCtaItem)
        .filter((x): x is CtaItem => x !== null)
        .slice(0, 6);
      if (items.length === 0) {
        return {
          id,
          type,
          hidden,
          items: [
            {
              label: "Button",
              href: "/",
              variant: "primary",
            },
          ],
        };
      }
      return { id, type, hidden, items };
    }
    case "studentResultsIntro":
      return {
        id,
        type,
        hidden,
        heading: String(o.heading ?? ""),
        subtext: String(o.subtext ?? ""),
      };
    case "imageMarqueeSlot":
      return { id, type, hidden };
    case "fxBlueTrackRecord":
      return { id, type, hidden };
    case "externalCta": {
      const variant =
        o.variant === "outline" ? "outline" : "primary";
      return {
        id,
        type,
        hidden,
        label: String(o.label ?? "Join now!"),
        href: String(o.href ?? ""),
        variant,
      };
    }
    case "studentSuccessSection":
      return {
        id,
        type,
        hidden,
        heading: String(o.heading ?? "Student success"),
      };
    case "bookPromptClosing": {
      const cv = o.ctaVariant === "outline" ? "outline" : "outlineStrong";
      return {
        id,
        type,
        hidden,
        heading: String(o.heading ?? ""),
        ctaLabel: String(o.ctaLabel ?? "Book a call"),
        ctaHref: String(o.ctaHref ?? "/book"),
        ctaVariant: cv,
      };
    }
    case "basicCourseHeader":
      return {
        id,
        type,
        hidden,
        title: String(o.title ?? ""),
        intro1: String(o.intro1 ?? ""),
        intro2: String(o.intro2 ?? ""),
      };
    case "freeCourseModulesSlot":
      return { id, type, hidden };
    case "calendlySection":
      return {
        id,
        type,
        hidden,
        heading: String(o.heading ?? ""),
        description: String(o.description ?? ""),
        minHeight:
          typeof o.minHeight === "number" && o.minHeight >= 400
            ? Math.min(o.minHeight, 1200)
            : 760,
      };
    case "bookBackLink":
      return {
        id,
        type,
        hidden,
        label: String(o.label ?? "← Back to home"),
        href: String(o.href ?? "/"),
      };
    case "bookHeader":
      return {
        id,
        type,
        hidden,
        title: String(o.title ?? ""),
        description: String(o.description ?? ""),
      };
    case "calendlyEmbed":
      return {
        id,
        type,
        hidden,
        minHeight:
          typeof o.minHeight === "number" && o.minHeight >= 400
            ? Math.min(o.minHeight, 1200)
            : 800,
      };
    default:
      return null;
  }
}

export function parseFunnelPageBlocks(
  page: FunnelPageId,
  raw: unknown,
): FunnelBlock[] | null {
  if (!Array.isArray(raw)) return null;
  const out: FunnelBlock[] = [];
  for (const item of raw) {
    const b = parseBlock(page, item);
    if (b) out.push(b);
  }
  return out.length > 0 ? out : null;
}

export function parseFunnelPages(raw: unknown): FunnelPages | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const home = parseFunnelPageBlocks("home", p.home);
  const basicCourse = parseFunnelPageBlocks("basicCourse", p.basicCourse);
  const book = parseFunnelPageBlocks("book", p.book);
  if (!home || !basicCourse || !book) return null;
  return { home, basicCourse, book };
}

/** Strip hidden blocks for public render (or pass all and skip in renderer). */
export function visibleBlocks(blocks: FunnelBlock[]): FunnelBlock[] {
  return blocks.filter((b) => !b.hidden);
}
