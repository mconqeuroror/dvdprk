import type { FunnelBlock, FunnelPageId } from "@/lib/funnel-types";
import { WHOP_JOIN_URL } from "@/lib/join-url";

function uid(prefix: string) {
  return `${prefix}-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())}`;
}

export const HOME_BLOCK_TYPES = [
  "homeHero",
  "heroVideoSlot",
  "ctaRow",
  "studentResultsIntro",
  "imageMarqueeSlot",
  "fxBlueTrackRecord",
  "externalCta",
  "studentSuccessSection",
  "bookPromptClosing",
] as const;

export const BASIC_BLOCK_TYPES = [
  "basicCourseHeader",
  "freeCourseModulesSlot",
  "ctaRow",
  "calendlySection",
] as const;

export const BOOK_BLOCK_TYPES = [
  "bookBackLink",
  "bookHeader",
  "calendlyEmbed",
] as const;

export function createEmptyBlock(
  page: FunnelPageId,
  type: string,
): FunnelBlock | null {
  if (page === "home") {
    switch (type) {
      case "homeHero":
        return {
          id: uid("h"),
          type: "homeHero",
          titlePrimary: "Headline",
          titleMuted: "",
          description: "",
        };
      case "heroVideoSlot":
        return { id: uid("h"), type: "heroVideoSlot" };
      case "ctaRow":
        return {
          id: uid("h"),
          type: "ctaRow",
          items: [
            { label: "Button", href: "/", variant: "primary" },
          ],
        };
      case "studentResultsIntro":
        return {
          id: uid("h"),
          type: "studentResultsIntro",
          heading: "Section title",
          subtext: "",
        };
      case "imageMarqueeSlot":
        return { id: uid("h"), type: "imageMarqueeSlot" };
      case "fxBlueTrackRecord":
        return { id: uid("h"), type: "fxBlueTrackRecord" };
      case "externalCta":
        return {
          id: uid("h"),
          type: "externalCta",
          label: "Join now!",
          href: WHOP_JOIN_URL,
          variant: "primary",
        };
      case "studentSuccessSection":
        return {
          id: uid("h"),
          type: "studentSuccessSection",
          heading: "Student success",
        };
      case "bookPromptClosing":
        return {
          id: uid("h"),
          type: "bookPromptClosing",
          heading: "Ready to take the next step?",
          ctaLabel: "Book a call",
          ctaHref: "/book",
          ctaVariant: "outlineStrong",
        };
      default:
        return null;
    }
  }
  if (page === "basicCourse") {
    switch (type) {
      case "basicCourseHeader":
        return {
          id: uid("bc"),
          type: "basicCourseHeader",
          title: "Basic Forex training",
          intro1: "",
          intro2: "",
        };
      case "freeCourseModulesSlot":
        return { id: uid("bc"), type: "freeCourseModulesSlot" };
      case "ctaRow":
        return {
          id: uid("bc"),
          type: "ctaRow",
          items: [
            { label: "Home", href: "/", variant: "outline" },
            { label: "Join now!", href: WHOP_JOIN_URL, variant: "primary" },
          ],
        };
      case "calendlySection":
        return {
          id: uid("bc"),
          type: "calendlySection",
          heading: "Want to learn more?",
          description: "Book a live call below",
          minHeight: 760,
        };
      default:
        return null;
    }
  }
  switch (type) {
    case "bookBackLink":
      return {
        id: uid("bk"),
        type: "bookBackLink",
        label: "← Back to home",
        href: "/",
      };
    case "bookHeader":
      return {
        id: uid("bk"),
        type: "bookHeader",
        title: "Book a call",
        description: "",
      };
    case "calendlyEmbed":
      return { id: uid("bk"), type: "calendlyEmbed", minHeight: 800 };
    default:
      return null;
  }
}
