"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BASIC_BLOCK_TYPES,
  BOOK_BLOCK_TYPES,
  createEmptyBlock,
  HOME_BLOCK_TYPES,
} from "@/lib/funnel-block-factory";
import type {
  CtaItem,
  FunnelBlock,
  FunnelPageId,
  FunnelPages,
} from "@/lib/funnel-types";
import { visibleBlocks } from "@/lib/funnel-types";
import type { SiteConfig } from "@/lib/site-config";
import { saveFunnelPagesAction } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/35";
const labelClass = "block text-xs text-[var(--dp-muted)]";

function patchBlock(
  pages: FunnelPages,
  page: FunnelPageId,
  id: string,
  next: FunnelBlock,
): FunnelPages {
  return {
    ...pages,
    [page]: pages[page].map((b) => (b.id === id ? next : b)),
  };
}

function BlockFields({
  block,
  onChange,
}: {
  block: FunnelBlock;
  onChange: (b: FunnelBlock) => void;
}) {
  switch (block.type) {
    case "homeHero":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Title (white)</label>
            <input
              className={inputClass}
              value={block.titlePrimary}
              onChange={(e) =>
                onChange({ ...block, titlePrimary: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Title (muted suffix)</label>
            <input
              className={inputClass}
              value={block.titleMuted}
              onChange={(e) =>
                onChange({ ...block, titleMuted: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Paragraph</label>
            <textarea
              rows={3}
              className={inputClass}
              value={block.description}
              onChange={(e) =>
                onChange({ ...block, description: e.target.value })
              }
            />
          </div>
        </div>
      );
    case "heroVideoSlot":
      return (
        <p className="mt-2 text-xs text-[var(--dp-muted)]">
          Video URL is set in the main admin panel (Hero video).
        </p>
      );
    case "ctaRow":
      return (
        <div className="mt-2 space-y-3">
          {block.items.map((item, i) => (
            <div
              key={`${block.id}-i-${i}`}
              className="rounded-lg border border-white/10 p-2"
            >
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Label</label>
                  <input
                    className={inputClass}
                    value={item.label}
                    onChange={(e) => {
                      const items = [...block.items];
                      items[i] = { ...item, label: e.target.value };
                      onChange({ ...block, items });
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Href</label>
                  <input
                    className={inputClass}
                    value={item.href}
                    onChange={(e) => {
                      const items = [...block.items];
                      items[i] = { ...item, href: e.target.value };
                      onChange({ ...block, items });
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Variant</label>
                  <select
                    className={inputClass}
                    value={item.variant}
                    onChange={(e) => {
                      const items = [...block.items];
                      const variant = e.target.value as CtaItem["variant"];
                      items[i] = { ...item, variant };
                      onChange({ ...block, items });
                    }}
                  >
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                    <option value="outlineStrong">Outline strong</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-red-300 hover:text-red-200"
                onClick={() => {
                  const items = block.items.filter((_, j) => j !== i);
                  onChange({
                    ...block,
                    items:
                      items.length > 0
                        ? items
                        : [
                            {
                              label: "Button",
                              href: "/",
                              variant: "primary" as const,
                            },
                          ],
                  });
                }}
              >
                Remove button
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-xs text-[var(--dp-accent)] hover:underline"
            onClick={() =>
              onChange({
                ...block,
                items: [
                  ...block.items,
                  { label: "New", href: "/", variant: "outline" },
                ],
              })
            }
          >
            + Add button
          </button>
        </div>
      );
    case "studentResultsIntro":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Heading</label>
            <input
              className={inputClass}
              value={block.heading}
              onChange={(e) =>
                onChange({ ...block, heading: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Subtext (empty hides)</label>
            <input
              className={inputClass}
              value={block.subtext}
              onChange={(e) =>
                onChange({ ...block, subtext: e.target.value })
              }
            />
          </div>
        </div>
      );
    case "imageMarqueeSlot":
      return (
        <p className="mt-2 text-xs text-[var(--dp-muted)]">
          Images come from slider rows in the main admin panel.
        </p>
      );
    case "fxBlueTrackRecord":
      return (
        <p className="mt-2 text-xs text-[var(--dp-muted)]">
          Embedded FX Blue charts (fixed layout in code).
        </p>
      );
    case "externalCta":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Label</label>
            <input
              className={inputClass}
              value={block.label}
              onChange={(e) =>
                onChange({ ...block, label: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <input
              className={inputClass}
              value={block.href}
              onChange={(e) =>
                onChange({ ...block, href: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Variant</label>
            <select
              className={inputClass}
              value={block.variant}
              onChange={(e) =>
                onChange({
                  ...block,
                  variant: e.target.value === "outline" ? "outline" : "primary",
                })
              }
            >
              <option value="primary">Primary</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </div>
      );
    case "studentSuccessSection":
      return (
        <div className="mt-2">
          <label className={labelClass}>Section heading</label>
          <input
            className={inputClass}
            value={block.heading}
            onChange={(e) =>
              onChange({ ...block, heading: e.target.value })
            }
          />
          <p className="mt-1 text-[0.65rem] text-[var(--dp-muted)]">
            Videos: Student success slots on the main admin panel.
          </p>
        </div>
      );
    case "bookPromptClosing":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Heading</label>
            <textarea
              rows={2}
              className={inputClass}
              value={block.heading}
              onChange={(e) =>
                onChange({ ...block, heading: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>CTA label</label>
            <input
              className={inputClass}
              value={block.ctaLabel}
              onChange={(e) =>
                onChange({ ...block, ctaLabel: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>CTA href</label>
            <input
              className={inputClass}
              value={block.ctaHref}
              onChange={(e) =>
                onChange({ ...block, ctaHref: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>CTA style</label>
            <select
              className={inputClass}
              value={block.ctaVariant === "outline" ? "outline" : "outlineStrong"}
              onChange={(e) =>
                onChange({
                  ...block,
                  ctaVariant:
                    e.target.value === "outline" ? "outline" : "outlineStrong",
                })
              }
            >
              <option value="outlineStrong">Strong outline glow</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </div>
      );
    case "basicCourseHeader":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Page title (H1)</label>
            <input
              className={inputClass}
              value={block.title}
              onChange={(e) =>
                onChange({ ...block, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Intro paragraph 1</label>
            <textarea
              rows={2}
              className={inputClass}
              value={block.intro1}
              onChange={(e) =>
                onChange({ ...block, intro1: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Intro paragraph 2</label>
            <textarea
              rows={2}
              className={inputClass}
              value={block.intro2}
              onChange={(e) =>
                onChange({ ...block, intro2: e.target.value })
              }
            />
          </div>
        </div>
      );
    case "freeCourseModulesSlot":
      return (
        <p className="mt-2 text-xs text-[var(--dp-muted)]">
          Modules are edited in the main admin panel (Basic course modules).
        </p>
      );
    case "calendlySection":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Heading</label>
            <input
              className={inputClass}
              value={block.heading}
              onChange={(e) =>
                onChange({ ...block, heading: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input
              className={inputClass}
              value={block.description}
              onChange={(e) =>
                onChange({ ...block, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Min height (px)</label>
            <input
              type="number"
              min={400}
              max={1200}
              className={inputClass}
              value={block.minHeight}
              onChange={(e) =>
                onChange({
                  ...block,
                  minHeight: Number(e.target.value) || 720,
                })
              }
            />
          </div>
        </div>
      );
    case "calendlyEmbed":
      return (
        <div className="mt-2">
          <label className={labelClass}>Min height (px)</label>
          <input
            type="number"
            min={400}
            max={1200}
            className={inputClass}
            value={block.minHeight}
            onChange={(e) =>
              onChange({
                ...block,
                minHeight: Number(e.target.value) || 720,
              })
            }
          />
        </div>
      );
    case "bookBackLink":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Label</label>
            <input
              className={inputClass}
              value={block.label}
              onChange={(e) =>
                onChange({ ...block, label: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Href</label>
            <input
              className={inputClass}
              value={block.href}
              onChange={(e) =>
                onChange({ ...block, href: e.target.value })
              }
            />
          </div>
        </div>
      );
    case "bookHeader":
      return (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={block.title}
              onChange={(e) =>
                onChange({ ...block, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={2}
              className={inputClass}
              value={block.description}
              onChange={(e) =>
                onChange({ ...block, description: e.target.value })
              }
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function FunnelPagesEditor({
  initialPages,
  config,
}: {
  initialPages: FunnelPages;
  config: SiteConfig;
}) {
  const [tab, setTab] = useState<FunnelPageId>("home");
  const [pages, setPages] = useState<FunnelPages>(initialPages);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const pushPreview = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const msg = {
      type: "dp-funnel-preview" as const,
      page: tab,
      blocks: visibleBlocks(pages[tab]),
      config,
    };
    win.postMessage(msg, window.location.origin);
  }, [tab, pages, config]);

  useEffect(() => {
    const t = window.setTimeout(pushPreview, 350);
    return () => window.clearTimeout(t);
  }, [pushPreview]);

  function move(page: FunnelPageId, index: number, dir: -1 | 1) {
    setPages((prev) => {
      const arr = [...prev[page]];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return prev;
      const tmp = arr[index];
      arr[index] = arr[j]!;
      arr[j] = tmp!;
      return { ...prev, [page]: arr };
    });
  }

  function removeBlock(page: FunnelPageId, id: string) {
    setPages((prev) => ({
      ...prev,
      [page]: prev[page].filter((b) => b.id !== id),
    }));
  }

  function addBlock(page: FunnelPageId, type: string) {
    const b = createEmptyBlock(page, type);
    if (!b) return;
    setPages((prev) => ({
      ...prev,
      [page]: [...prev[page], b],
    }));
  }

  const addable =
    tab === "home"
      ? HOME_BLOCK_TYPES
      : tab === "basicCourse"
        ? BASIC_BLOCK_TYPES
        : BOOK_BLOCK_TYPES;

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-6">
      <div>
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {(
            [
              ["home", "Home /"],
              ["basicCourse", "Basic course"],
              ["book", "Book"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-[var(--dp-accent)] text-white"
                  : "bg-white/5 text-[var(--dp-muted)] hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form action={saveFunnelPagesAction} className="mt-6 space-y-4">
          <input
            type="hidden"
            name="funnelPagesJson"
            value={JSON.stringify(pages)}
          />
          {pages[tab].map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(index));
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData("text/plain"));
                if (Number.isNaN(from)) return;
                setPages((prev) => {
                  const arr = [...prev[tab]];
                  const [item] = arr.splice(from, 1);
                  if (!item) return prev;
                  arr.splice(index, 0, item);
                  return { ...prev, [tab]: arr };
                });
              }}
              className="rounded-xl border border-white/12 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="cursor-grab text-xs font-mono text-[var(--dp-muted)] active:cursor-grabbing">
                  ⋮⋮ {block.type}
                </span>
                <label className="flex items-center gap-2 text-xs text-[var(--dp-muted)]">
                  <input
                    type="checkbox"
                    checked={Boolean(block.hidden)}
                    onChange={(e) =>
                      setPages((p) =>
                        patchBlock(p, tab, block.id, {
                          ...block,
                          hidden: e.target.checked,
                        }),
                      )
                    }
                  />
                  Hidden
                </label>
              </div>
              <BlockFields
                block={block}
                onChange={(next) =>
                  setPages((p) => patchBlock(p, tab, block.id, next))
                }
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/5"
                  onClick={() => move(tab, index, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rounded border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/5"
                  onClick={() => move(tab, index, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                  onClick={() => removeBlock(tab, block.id)}
                >
                  Remove block
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className={labelClass}>Add block</label>
              <select
                id="add-block-type"
                className={`${inputClass} min-w-[200px]`}
                defaultValue=""
              >
                <option value="" disabled>
                  Choose type…
                </option>
                {addable.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
              onClick={() => {
                const sel = document.getElementById(
                  "add-block-type",
                ) as HTMLSelectElement | null;
                const v = sel?.value;
                if (v) addBlock(tab, v);
                if (sel) sel.value = "";
              }}
            >
              Add
            </button>
          </div>

          <button
            type="submit"
            className="rounded-full bg-[var(--dp-accent)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Save funnel (all 3 pages)
          </button>
        </form>
      </div>

      <div className="mt-10 lg:mt-0">
        <p className="mb-2 text-sm font-medium text-white">Live preview</p>
        <p className="mb-2 text-xs text-[var(--dp-muted)]">
          Updates as you edit (same components as the public site). Drag blocks
          to reorder. This is not a Figma canvas — sections are structured
          blocks.
        </p>
        <iframe
          ref={iframeRef}
          title="Funnel preview"
          className="h-[min(78vh,920px)] w-full rounded-xl border border-white/15 bg-black/40"
          src="/admin/funnel/preview-frame"
          onLoad={pushPreview}
        />
      </div>
    </div>
  );
}
