"use client";

import { useState } from "react";
import { DirectMediaField } from "@/components/admin/DirectMediaField";
import type { FreeCourseModule } from "@/lib/site-config";

export function FreeCourseModulesEditor({
  initial,
}: {
  initial: FreeCourseModule[];
}) {
  const [modules, setModules] = useState<FreeCourseModule[]>(() =>
    initial.length > 0
      ? initial.map((m) => ({ ...m }))
      : [
          { tag: "Module 1", videoUrl: "" },
          { tag: "Module 2", videoUrl: "" },
          { tag: "Module 3", videoUrl: "" },
        ],
  );

  const update = (i: number, patch: Partial<FreeCourseModule>) => {
    setModules((prev) =>
      prev.map((m, j) => (j === i ? { ...m, ...patch } : m)),
    );
  };

  const remove = (i: number) => {
    setModules((prev) => prev.filter((_, j) => j !== i));
  };

  const add = () => {
    setModules((prev) => [
      ...prev,
      { tag: `Module ${prev.length + 1}`, videoUrl: "" },
    ]);
  };

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="freeCourseModulesJson"
        value={JSON.stringify(modules)}
        aria-hidden
      />
      {modules.map((mod, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--dp-muted)]">
              Module {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs text-red-300 hover:text-red-200"
            >
              Remove
            </button>
          </div>
          <label className="mb-1 block text-xs text-[var(--dp-muted)]">
            Tag / paragraph (shown above video)
          </label>
          <textarea
            value={mod.tag}
            onChange={(e) => update(i, { tag: e.target.value })}
            rows={2}
            className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
            placeholder="e.g. Module 1 — Welcome"
          />
          <label className="mb-1 block text-xs text-[var(--dp-muted)]">
            Video — upload, remove, or paste a link (Save link after paste)
          </label>
          <DirectMediaField
            target={{ kind: "freeCourseModule", index: i }}
            initialUrl={mod.videoUrl}
            accept="video/*"
            refreshOnSave={false}
            onSaved={(url) => update(i, { videoUrl: url })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border border-dashed border-white/20 py-2 text-sm text-[var(--dp-muted)] transition-colors hover:border-white/30 hover:text-white"
      >
        + Add module
      </button>
    </div>
  );
}
