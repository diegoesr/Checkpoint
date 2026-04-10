"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  deleteGameActivityAction,
  updateGameActivityAction,
} from "@/app/profile/actions";
import { PlaytimeHoursField } from "@/components/profile/PlaytimeHoursField";
import { GAME_PLATFORMS, gamePlatformLabel } from "@/lib/game-platforms";
import { formatHoursStep } from "@/lib/playtime-input";
import {
  RAWG_COVER_QUALITY,
  RAWG_COVER_SIZES_POSTER_COMPACT,
} from "@/lib/rawg-image";
import {
  formatPlaytimeHours,
  formatShortDate,
} from "@/lib/profile-display";
import type { GameActivityRecord } from "@/lib/supabase/profile-dashboard";

type Props = {
  initial: GameActivityRecord[];
  readOnly?: boolean;
  /** Si es false, no se muestra el título (p. ej. debajo del feed de actividad). */
  showHeading?: boolean;
};

export function ProfileActivitySection({
  initial,
  readOnly = false,
  showHeading = true,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<GameActivityRecord | null>(null);
  /** «Modificar» en la portada abre cambiar detalles / quitar (móvil y desktop). */
  const [actionsFor, setActionsFor] = useState<GameActivityRecord | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editStartedOn, setEditStartedOn] = useState("");
  const [editPlaytimeStr, setEditPlaytimeStr] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = useCallback((a: GameActivityRecord) => {
    setEditing(a);
    setEditStartedOn(a.started_on ?? "");
    const h = a.playtime_hours;
    setEditPlaytimeStr(
      h != null && Number.isFinite(Number(h))
        ? formatHoursStep(Number(h))
        : "",
    );
    setEditPlatform(a.platform ?? "");
    setEditNote(a.note ?? "");
  }, []);

  const closeEdit = useCallback(() => {
    setEditing(null);
    setEditSaving(false);
  }, []);

  async function saveEdit() {
    if (!editing) return;
    const ptRaw = editPlaytimeStr.trim().replace(",", ".");
    let playtimeHours: number | null = null;
    if (ptRaw !== "") {
      const n = Number(ptRaw);
      if (!Number.isFinite(n) || n < 0) {
        alert("Las horas deben ser un número positivo o déjalo vacío.");
        return;
      }
      if (n > 999_999.99) {
        alert("El valor de horas es demasiado grande.");
        return;
      }
      playtimeHours = Math.round(n * 100) / 100;
    }
    setEditSaving(true);
    const res = await updateGameActivityAction({
      id: editing.id,
      startedOn: editStartedOn || null,
      playtimeHours,
      platform: editPlatform.trim() === "" ? null : editPlatform.trim(),
      note: editNote.trim() === "" ? null : editNote.trim(),
    });
    setEditSaving(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    closeEdit();
    router.refresh();
  }

  async function performRemoveActivity(id: string) {
    setBusyId(id);
    const res = await deleteGameActivityAction(id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    if (editing?.id === id) closeEdit();
    router.refresh();
  }

  return (
    <section>
      {showHeading ? (
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
            Partidas registradas
          </h2>
        </div>
      ) : (
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#678] md:text-left md:font-medium md:tracking-[0.12em] md:text-[#567]">
          Jugando
        </p>
      )}
      {initial.length === 0 ? (
        <p className="text-sm text-[#678]">
          {readOnly
            ? "Sin partidas registradas."
            : "Registra qué estás jugando."}
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden">
          {initial.map((a) => (
            <div
              key={a.id}
              className="group relative w-[96px] shrink-0 sm:w-[120px]"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-[#1f252d] ring-1 ring-[#2f3642] sm:rounded-md">
                {a.background_image ? (
                  <Image
                    src={a.background_image}
                    alt=""
                    fill
                    quality={RAWG_COVER_QUALITY}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes={RAWG_COVER_SIZES_POSTER_COMPACT}
                  />
                ) : null}
                {!readOnly ? (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:h-28" />
                    <div className="absolute right-1 top-1 z-20 flex translate-y-0 flex-col gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100 sm:right-2 sm:top-2 md:translate-y-1 md:group-hover:translate-y-0">
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => setActionsFor(a)}
                        className="touch-manipulation rounded-md border border-emerald-500/35 bg-black/65 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.06em] text-emerald-100 shadow-md backdrop-blur-sm transition hover:border-emerald-400/70 hover:bg-emerald-600/85 hover:text-white disabled:opacity-40 md:px-2.5 md:py-1.5 md:text-[9px] md:tracking-[0.08em]"
                      >
                        Modificar
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
              <p className="mt-1.5 line-clamp-2 text-center text-[11px] font-medium text-[#bcd]">
                {a.game_name}
              </p>
              <p className="mt-0.5 text-center text-[10px] leading-tight text-[#9ab]">
                {formatPlaytimeHours(a.playtime_hours) ?? "—"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-center text-[10px] leading-tight text-[#9ab]">
                {gamePlatformLabel(a.platform) ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {!readOnly && actionsFor ? (
        <div
          className="fixed inset-0 z-[210] flex items-end justify-center bg-black/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center md:pb-3 md:p-6"
          role="presentation"
          onClick={() => setActionsFor(null)}
        >
          <div
            role="dialog"
            aria-labelledby="activity-actions-title"
            aria-modal="true"
            className="w-full max-w-sm rounded-xl border border-[#3d4654] bg-[#252b33] p-2 shadow-2xl md:max-w-md"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setActionsFor(null);
            }}
          >
            <p
              id="activity-actions-title"
              className="border-b border-[#2f3642] px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              {actionsFor.game_name}
            </p>
            <div className="flex flex-col gap-1 p-2">
              <button
                type="button"
                disabled={busyId === actionsFor.id}
                className="touch-manipulation rounded-lg border border-emerald-500/35 bg-emerald-600/20 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-600/30 disabled:opacity-40"
                onClick={() => {
                  const row = actionsFor;
                  setActionsFor(null);
                  openEdit(row);
                }}
              >
                Editar detalles
              </button>
              <button
                type="button"
                disabled={busyId === actionsFor.id}
                className="touch-manipulation rounded-lg border border-red-400/35 bg-red-950/40 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-950/60 disabled:opacity-40"
                onClick={() => {
                  if (!confirm("¿Quitar esta entrada de actividad?")) return;
                  const id = actionsFor.id;
                  setActionsFor(null);
                  void performRemoveActivity(id);
                }}
              >
                Quitar partida
              </button>
              <button
                type="button"
                className="touch-manipulation rounded-lg py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9ab] transition hover:bg-white/5"
                onClick={() => setActionsFor(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!readOnly && editing ? (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="presentation"
          onClick={closeEdit}
        >
          <div
            role="dialog"
            aria-labelledby="activity-edit-title"
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-[#3d4654] bg-[#2c3440] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-black/25 bg-[#252b33] px-3 py-2.5">
              <h2
                id="activity-edit-title"
                className="flex-1 text-center text-sm font-medium text-white"
              >
                Editar actividad
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                className="flex size-9 shrink-0 items-center justify-center rounded text-lg text-[#9ab] transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <p className="text-center text-sm font-semibold text-white">
                {editing.game_name}
              </p>
              <p className="mt-1 text-center text-[11px] text-[#678]">
                Registrado {formatShortDate(editing.played_at)}
              </p>

              <label className="mt-4 block">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                  Lo inicié el
                </span>
                <input
                  type="date"
                  value={editStartedOn}
                  onChange={(e) => setEditStartedOn(e.target.value)}
                  className="mt-1 w-full rounded border border-[#1f252d] bg-[#1a1f26] px-2 py-2 text-sm text-white"
                />
              </label>

              <div className="mt-4">
                <PlaytimeHoursField
                  value={editPlaytimeStr}
                  onChange={setEditPlaytimeStr}
                  label="Horas hasta ahora"
                  helperText="Opcional. Solo números; botones o flechas ↑↓."
                  groupAriaLabel="Horas jugadas hasta ahora"
                />
              </div>

              <label className="mt-4 inline-block w-[9.5rem] max-w-full sm:w-[10.5rem]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                  Plataforma
                </span>
                <select
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value)}
                  className="mt-1 w-full min-w-0 cursor-pointer rounded border border-[#1f252d] bg-[#1a1f26] px-1.5 py-1.5 text-sm text-white focus:border-emerald-600/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">— Opcional —</option>
                  {GAME_PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                  Nota
                </span>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={2}
                  placeholder="Opcional…"
                  className="mt-1 w-full resize-none rounded border border-[#1f252d] bg-[#1a1f26] px-2 py-2 text-sm text-white placeholder:text-[#567]"
                />
              </label>
            </div>
            <footer className="flex shrink-0 justify-end gap-2 border-t border-black/25 bg-[#252b33] px-4 py-3">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded border border-[#3d4654] bg-[#384250] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#c8d0d9] transition hover:bg-[#455160]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={editSaving}
                onClick={saveEdit}
                className="rounded border border-emerald-500/40 bg-emerald-600 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {editSaving ? "Guardando…" : "Guardar"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
