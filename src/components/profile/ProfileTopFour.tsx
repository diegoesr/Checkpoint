"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  clearFavoriteSlotAction,
  setFavoriteSlotAction,
} from "@/app/profile/actions";
import { HalfStarRatingDisplay } from "@/components/profile/HalfStarRatingDisplay";
import type { FavoriteGameRecord } from "@/lib/supabase/profile-dashboard";
import { GameSearchModal } from "@/components/profile/GameSearchModal";
import { GAME_COVER_QUALITY } from "@/lib/game-image";

type Props = { initial: FavoriteGameRecord[]; readOnly?: boolean };

export function ProfileTopFour({ initial, readOnly = false }: Props) {
  const router = useRouter();
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  /** «Modificar» abre acciones (cambiar juego / quitar) en móvil y desktop. */
  const [actionsSlot, setActionsSlot] = useState<number | null>(null);

  const bySlot = new Map(initial.map((f) => [f.slot, f]));

  async function onPick(game: { id: number }) {
    if (pickerSlot == null) return;
    setBusy(pickerSlot);
    const res = await setFavoriteSlotAction(pickerSlot, game.id);
    setBusy(null);
    setPickerSlot(null);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  async function onClear(slot: number) {
    setBusy(slot);
    const res = await clearFavoriteSlotAction(slot);
    setBusy(null);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="border-b border-[#2f3642] pb-10">
      <div className="mb-4 flex items-end justify-between gap-4 max-md:mb-3 max-md:justify-center">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#678] md:text-[11px] md:tracking-[0.2em]">
          Favoritos
        </h2>
        {readOnly ? null : (
          <p className="text-xs text-[#567]">
          </p>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1 max-md:gap-1 sm:gap-3 md:gap-4">
        {[1, 2, 3, 4].map((slot) => {
          const g = bySlot.get(slot);
          const rating =
            g?.review_rating != null && Number(g.review_rating) > 0
              ? Number(g.review_rating)
              : null;
          return (
            <div
              key={slot}
              className="flex flex-col items-stretch gap-1.5"
            >
              <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[#1f252d] shadow-md ring-1 ring-[#2f3642] transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:z-10 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50 hover:ring-emerald-500/40 max-md:rounded-sm max-md:hover:translate-y-0 max-md:hover:scale-100 sm:rounded-xl">
                {g?.background_image ? (
                  <Image
                    src={g.background_image}
                    alt=""
                    fill
                    quality={GAME_COVER_QUALITY}
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] md:duration-500 md:group-hover:scale-105"
                    sizes="(max-width:640px) 55vw, 30vw"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-[#456] transition-colors duration-300 group-hover:text-[#678]">
                    {readOnly ? "—" : "Vacío"}
                  </div>
                )}
                {!readOnly ? (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-16 bg-linear-to-b from-black/55 to-transparent opacity-0 transition-opacity duration-300 max-lg:opacity-40 lg:h-28 lg:group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-linear-to-t from-black/90 to-transparent p-2 pt-8">
                      <p className="line-clamp-2 text-center text-[11px] font-medium text-white drop-shadow-sm">
                        {g?.game_name ?? `Espacio ${slot}`}
                      </p>
                    </div>
                    <div className="absolute right-1 top-1 z-20 flex translate-y-0 flex-col gap-1 opacity-100 transition-all duration-300 sm:right-2 sm:top-2 lg:translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                      {g ? (
                        <button
                          type="button"
                          disabled={busy === slot}
                          onClick={() => setActionsSlot(slot)}
                          className="touch-manipulation rounded-md border border-emerald-500/35 bg-black/65 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.06em] text-emerald-100 shadow-md backdrop-blur-sm transition hover:border-emerald-400/70 hover:bg-emerald-600/85 hover:text-white disabled:opacity-40 md:px-2.5 md:py-1.5 md:text-[9px] md:tracking-[0.08em]"
                        >
                          Modificar
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy === slot}
                          onClick={() => setPickerSlot(slot)}
                          className="touch-manipulation rounded-md border border-emerald-500/35 bg-black/65 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.06em] text-emerald-100 shadow-md backdrop-blur-sm transition hover:border-emerald-400/70 hover:bg-emerald-600/85 hover:text-white disabled:opacity-40 md:px-2.5 md:py-1.5 md:text-[9px] md:tracking-[0.08em]"
                        >
                          Añadir
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {g?.background_image ? (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/50 to-transparent opacity-80" />
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-2 pt-8">
                      <p className="line-clamp-2 text-center text-[11px] font-medium text-white drop-shadow-sm">
                        {g?.game_name ?? "—"}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex min-h-[1.125rem] flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
                {g ? (
                  <>
                    {rating != null ? (
                      <HalfStarRatingDisplay value={rating} size="sm" />
                    ) : (
                      <span className="text-[9px] text-[#567]">Sin reseña</span>
                    )}
                    {g.review_liked ? (
                      <span
                        className="text-sm leading-none text-orange-400/90"
                        aria-label="Marcado con me gusta en la reseña"
                        title="Me gusta en la reseña"
                      >
                        ♥
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {!readOnly && actionsSlot !== null ? (
        <div
          className="fixed inset-0 z-[210] flex items-end justify-center bg-black/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center md:pb-3 md:p-6"
          role="presentation"
          onClick={() => {
            setActionsSlot(null);
          }}
        >
          <div
            role="dialog"
            aria-labelledby="fav-actions-title"
            aria-modal="true"
            className="w-full max-w-sm rounded-xl border border-[#3d4654] bg-[#252b33] p-2 shadow-2xl md:max-w-md"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setActionsSlot(null);
              }
            }}
          >
            <p
              id="fav-actions-title"
              className="border-b border-[#2f3642] px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              {bySlot.get(actionsSlot)?.game_name ?? `Espacio ${actionsSlot}`}
            </p>
            <div className="flex flex-col gap-1 p-2">
              <button
                type="button"
                disabled={busy === actionsSlot}
                className="touch-manipulation rounded-lg border border-emerald-500/35 bg-emerald-600/20 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-600/30 disabled:opacity-40"
                onClick={() => {
                  const s = actionsSlot;
                  setActionsSlot(null);
                  if (s != null) setPickerSlot(s);
                }}
              >
                Cambiar juego
              </button>
              {bySlot.get(actionsSlot) ? (
                <button
                  type="button"
                  disabled={busy === actionsSlot}
                  className="touch-manipulation rounded-lg border border-red-400/35 bg-red-950/40 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-950/60 disabled:opacity-40"
                  onClick={() => {
                    if (
                      !window.confirm(
                        "¿Quitar este juego de tus favoritos?",
                      )
                    ) {
                      return;
                    }
                    const s = actionsSlot;
                    setActionsSlot(null);
                    if (s != null) void onClear(s);
                  }}
                >
                  Quitar de favoritos
                </button>
              ) : null}
              <button
                type="button"
                className="touch-manipulation rounded-lg py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9ab] transition hover:bg-white/5"
                onClick={() => {
                  setActionsSlot(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {!readOnly ? (
        <GameSearchModal
          open={pickerSlot !== null}
          title={`Elegir juego — espacio ${pickerSlot ?? ""}`}
          onClose={() => {
            setPickerSlot(null);
          }}
          onSelect={onPick}
        />
      ) : null}
    </section>
  );
}
