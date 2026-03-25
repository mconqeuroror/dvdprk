"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  saveMediaFieldAction,
  type MediaFieldPayload,
} from "@/app/admin/actions";

export type DirectMediaTarget =
  | { kind: "hero" }
  | { kind: "slider1"; index: number }
  | { kind: "slider2"; index: number }
  | { kind: "successVideo"; index: number }
  | { kind: "freeCourseModule"; index: number };

function toPayload(target: DirectMediaTarget, url: string): MediaFieldPayload {
  switch (target.kind) {
    case "hero":
      return { field: "hero", url };
    case "slider1":
      return { field: "slider1", index: target.index, url };
    case "slider2":
      return { field: "slider2", index: target.index, url };
    case "successVideo":
      return { field: "successVideo", index: target.index, url };
    case "freeCourseModule":
      return { field: "freeCourseModuleVideo", index: target.index, url };
  }
}

function looksLikeRasterImageUrl(url: string): boolean {
  return /\.(webp|png|jpe?g|gif)(\?|#|$)/i.test(url.trim());
}

type Props = {
  target: DirectMediaTarget;
  initialUrl: string;
  accept: string;
  /** Show a small preview for image URLs (sliders). */
  imagePreview?: boolean;
  /** When false, only `onSaved` runs (e.g. free-course modules — keeps unsaved tags in client state). */
  refreshOnSave?: boolean;
  onSaved?: (url: string) => void;
  slotLabel?: string;
};

export function DirectMediaField({
  target,
  initialUrl,
  accept,
  imagePreview = false,
  refreshOnSave = true,
  onSaved,
  slotLabel,
}: Props) {
  const router = useRouter();
  const [urlDraft, setUrlDraft] = useState(initialUrl);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrlDraft(initialUrl);
  }, [initialUrl]);

  const persist = useCallback(
    async (url: string) => {
      setStatus(null);
      setSaving(true);
      try {
        const res = await saveMediaFieldAction(toPayload(target, url));
        if (!res.ok) {
          setStatus(res.error);
          return;
        }
        setUrlDraft(url);
        onSaved?.(url);
        if (refreshOnSave) {
          router.refresh();
        }
        setStatus(url ? "Saved." : "Cleared.");
      } finally {
        setSaving(false);
      }
    },
    [target, onSaved, refreshOnSave, router],
  );

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setStatus(data.error ?? `Upload failed (${res.status})`);
        return;
      }
      if (data.url) {
        await persist(data.url);
      }
    } catch {
      setStatus("Network error");
    } finally {
      setBusy(false);
    }
  }

  const inFlight = saving || busy;
  const showPreview =
    imagePreview && urlDraft.trim() && looksLikeRasterImageUrl(urlDraft);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      {slotLabel ? (
        <p className="mb-2 text-xs font-medium text-[var(--dp-muted)]">
          {slotLabel}
        </p>
      ) : null}
      {showPreview ? (
        // Admin previews arbitrary CDN URLs; next/image would require host allowlisting.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlDraft}
          alt=""
          className="mb-2 max-h-28 w-full rounded-md object-cover object-center"
        />
      ) : null}
      <input
        type="url"
        value={urlDraft}
        onChange={(e) => setUrlDraft(e.target.value)}
        placeholder="https://… (YouTube / MP4, or upload a file)"
        className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={inFlight}
          onClick={() => void persist(urlDraft.trim())}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save link"}
        </button>
        <label className="inline-block">
          <span className="cursor-pointer rounded-lg border border-[var(--dp-accent)]/50 bg-[var(--dp-accent)]/20 px-3 py-1.5 text-xs text-white hover:bg-[var(--dp-accent)]/30">
            {busy ? "Uploading…" : "Upload file"}
          </span>
          <input
            type="file"
            className="sr-only"
            accept={accept}
            disabled={inFlight}
            onChange={(e) => void onPickFile(e)}
          />
        </label>
        <button
          type="button"
          disabled={inFlight}
          onClick={() => void persist("")}
          className="rounded-lg border border-red-400/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-40"
        >
          Remove
        </button>
      </div>
      {status ? (
        <p className="mt-2 text-xs text-[var(--dp-muted)]">{status}</p>
      ) : null}
    </div>
  );
}
