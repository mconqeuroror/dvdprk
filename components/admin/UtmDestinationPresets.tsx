"use client";

const presetClass =
  "rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/90 transition-colors hover:border-[var(--dp-accent)]/50 hover:bg-white/[0.08]";

export function UtmDestinationPresets({ inputId }: { inputId: string }) {
  function setValue(path: string) {
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) el.value = path;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="w-full text-[0.65rem] uppercase tracking-wide text-[var(--dp-muted)]">
        Quick targets
      </span>
      <button
        type="button"
        className={presetClass}
        onClick={() => setValue("/")}
      >
        Main site (home)
      </button>
      <button
        type="button"
        className={presetClass}
        onClick={() => setValue("/basic-course")}
      >
        Free course (/basic-course)
      </button>
    </div>
  );
}
