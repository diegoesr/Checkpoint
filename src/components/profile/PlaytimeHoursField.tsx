"use client";

import { useCallback, useMemo } from "react";
import {
  formatHoursStep,
  playtimeKeyDownHandler,
  sanitizePlaytimeKeyboardInput,
} from "@/lib/playtime-input";

export function PlaytimeHoursField({
  value,
  onChange,
  label,
  helperText,
  groupAriaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  helperText?: string;
  groupAriaLabel?: string;
}) {
  const adjust = useCallback(
    (delta: number) => {
      const raw = value.trim().replace(",", ".");
      const base = raw === "" ? 0 : Number(raw);
      const n = Number.isFinite(base) ? base : 0;
      if (delta > 0) {
        const next = Math.round((n + delta) * 100) / 100;
        onChange(formatHoursStep(next));
        return;
      }
      if (!Number.isFinite(n) || n <= 0) {
        onChange("");
        return;
      }
      const next = Math.round((n + delta) * 100) / 100;
      onChange(next <= 0 ? "" : formatHoursStep(next));
    },
    [value, onChange],
  );

  const canDecrement = useMemo(() => {
    const raw = value.trim().replace(",", ".");
    if (raw === "") return false;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0;
  }, [value]);

  return (
    <div className="max-w-full">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6">
        <span className="shrink-0 text-sm font-semibold uppercase tracking-[0.14em] text-[#9ab]">
          {label}
        </span>
        <div
          className="inline-flex h-6 min-h-6 items-stretch overflow-hidden rounded-lg border border-[#3d4654] bg-[#1a1f26] text-sm leading-none shadow-inner shadow-black/15"
          role="group"
          aria-label={groupAriaLabel ?? label}
        >
          <button
            type="button"
            className="flex w-5 shrink-0 items-center justify-center border-r border-[#3d4654] bg-[#252b33] text-sm font-semibold leading-none text-white/90 transition hover:bg-[#2f3642] hover:text-white focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Restar una hora"
            disabled={!canDecrement}
            onClick={() => adjust(-1)}
          >
            −
          </button>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) =>
              onChange(sanitizePlaytimeKeyboardInput(e.target.value))
            }
            onKeyDown={(e) => playtimeKeyDownHandler(e, value, adjust)}
            placeholder="—"
            title="Solo números; coma o punto para decimales."
            aria-label={label}
            className="min-w-[2.25rem] max-w-[4rem] shrink-0 cursor-text border-0 bg-[#252b33] px-1.5 text-center text-sm font-bold tabular-nums text-white placeholder:text-[#567] focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40"
          />
          <button
            type="button"
            className="flex w-5 shrink-0 items-center justify-center border-l border-[#3d4654] bg-[#252b33] text-sm font-semibold leading-none text-white/90 transition hover:bg-[#2f3642] hover:text-white focus:z-10 focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            aria-label="Sumar una hora"
            onClick={() => adjust(1)}
          >
            +
          </button>
        </div>
      </div>
      {helperText ? (
        <span className="mt-2 block text-[11px] leading-snug text-[#678]">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
