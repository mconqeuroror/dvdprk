"use client";

import { useState } from "react";

/**
 * Uploads to POST /api/admin/upload (Vercel Blob when BLOB_READ_WRITE_TOKEN is set).
 * Copy the returned URL into any video or image field on this page.
 */
export function AdminBlobUpload() {
  const [status, setStatus] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setStatus(null);
    setUrl(null);
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
        setUrl(data.url);
        setStatus("Uploaded — copy URL into a field below.");
      }
    } catch {
      setStatus("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-medium text-white">Media upload (blob)</p>
      <p className="mt-1 text-xs text-[var(--dp-muted)]">
        Images and videos: upload here, then paste the public URL into hero, sliders,
        modules, or success videos. Requires{" "}
        <code className="text-white/70">BLOB_READ_WRITE_TOKEN</code> in env.
      </p>
      <label className="mt-3 inline-block">
        <span className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15">
          {busy ? "Uploading…" : "Choose file"}
        </span>
        <input
          type="file"
          className="sr-only"
          accept="image/*,video/*"
          disabled={busy}
          onChange={onFile}
        />
      </label>
      {status ? (
        <p className="mt-2 text-xs text-[var(--dp-muted)]">{status}</p>
      ) : null}
      {url ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            readOnly
            value={url}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-emerald-200"
          />
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(url)}
            className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10"
          >
            Copy URL
          </button>
        </div>
      ) : null}
    </div>
  );
}
