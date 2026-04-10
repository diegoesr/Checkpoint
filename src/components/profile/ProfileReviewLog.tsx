"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { addGameActivityAction, addGameReviewAction } from "@/app/profile/actions";
import { PlaytimeHoursField } from "@/components/profile/PlaytimeHoursField";
import { RawgSearchModal, type RawgGamePick } from "@/components/profile/RawgSearchModal";
import { GAME_PLATFORMS } from "@/lib/game-platforms";
import {
  RAWG_COVER_QUALITY,
  RAWG_COVER_SIZES_POSTER_COMPACT,
} from "@/lib/rawg-image";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function releaseYear(released: string | null | undefined): string {
  if (!released || released.length < 4) return "";
  return released.slice(0, 4);
}

function formatRatingText(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/**
 * Cinco estrellas con medias. Arrastrar horizontalmente (o pulsar): izquierda baja,
 * derecha sube, en pasos de 0,5 sobre todo el ancho de la fila.
 */
function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const applyClientX = useCallback(
    (clientX: number) => {
      const el = barRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      let ratio = (clientX - rect.left) / rect.width;
      ratio = Math.min(1, Math.max(0, ratio));
      const segment = Math.min(9, Math.max(0, Math.floor(ratio * 10)));
      const next = 0.5 * (segment + 1);
      if (next !== value) onChange(next);
    },
    [onChange, value],
  );

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ya liberado */
    }
  };

  return (
    <div
      ref={barRef}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-label="Valoración de 0,5 a 5 estrellas. Arrastra horizontalmente para subir o bajar."
      tabIndex={0}
      title="Arrastra a la izquierda o derecha para cambiar la valoración"
      className="flex cursor-ew-resize touch-none select-none items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      onPointerDown={(e) => {
        e.preventDefault();
        draggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        applyClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!draggingRef.current) return;
        applyClientX(e.clientX);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => {
        draggingRef.current = false;
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          const n = Math.max(0.5, Math.round((value - 0.5) * 2) / 2);
          if (n !== value) onChange(n);
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          const n = Math.min(5, Math.round((value + 0.5) * 2) / 2);
          if (n !== value) onChange(n);
        }
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="pointer-events-none relative inline-flex h-9 w-8 shrink-0 items-center justify-center"
        >
          <span
            className="relative text-[26px] leading-none text-[#3d4a58]"
            aria-hidden
          >
            ★
            <span
              className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-emerald-400"
              style={{
                width:
                  value >= star
                    ? "100%"
                    : value >= star - 0.5
                      ? "50%"
                      : "0%",
              }}
            >
              ★
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

type ProfileReviewLogProps = {
  /** Tras navegar desde el menú móvil «Agregar»: abre el buscador de reseña o de actividad. */
  autoOpen?: "review" | "activity";
  /** Tras guardar con éxito (flujo desde /profile/registrar): volver al perfil. */
  redirectToProfileAfterSave?: boolean;
};

export function ProfileReviewLog({
  autoOpen,
  redirectToProfileAfterSave = false,
}: ProfileReviewLogProps = {}) {
  const router = useRouter();
  const autoOpenedRef = useRef(false);
  const [phase, setPhase] = useState<"closed" | "pick" | "form">("closed");
  const [game, setGame] = useState<RawgGamePick | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(4);
  const [startedOn, setStartedOn] = useState("");
  const [finishedOn, setFinishedOn] = useState(todayIsoDate);
  const [isReplay, setIsReplay] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activityGame, setActivityGame] = useState<RawgGamePick | null>(null);
  const [activityStartedOn, setActivityStartedOn] = useState("");
  const [activityPlaytimeStr, setActivityPlaytimeStr] = useState("");
  const [activityPlatform, setActivityPlatform] = useState("");
  const [activitySaving, setActivitySaving] = useState(false);
  const [playtimeHoursStr, setPlaytimeHoursStr] = useState("");
  const [platform, setPlatform] = useState("");

  const year = useMemo(() => releaseYear(game?.released), [game?.released]);

  const activityYear = useMemo(
    () => releaseYear(activityGame?.released),
    [activityGame?.released],
  );

  const closeActivityForm = useCallback(() => {
    setActivityGame(null);
    setActivityStartedOn("");
    setActivityPlaytimeStr("");
    setActivityPlatform("");
  }, []);

  const activityBackToSearch = useCallback(() => {
    setActivityStartedOn("");
    setActivityPlaytimeStr("");
    setActivityPlatform("");
    setActivityGame(null);
    setActivityOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setPhase("closed");
    setGame(null);
    setReviewText("");
    setRating(4);
    setStartedOn("");
    setFinishedOn(todayIsoDate());
    setIsReplay(false);
    setLiked(false);
    setPlaytimeHoursStr("");
    setPlatform("");
  }, []);

  const openPicker = () => setPhase("pick");

  useEffect(() => {
    if (!autoOpen || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    if (autoOpen === "review") {
      setPhase("pick");
    } else {
      setActivityOpen(true);
    }
  }, [autoOpen]);

  const onGameChosen = (g: RawgGamePick) => {
    setGame(g);
    setPhase("form");
    setFinishedOn(todayIsoDate());
  };

  const backToPick = () => {
    setGame(null);
    setPhase("pick");
  };

  async function save() {
    if (!game) return;
    const ptRaw = playtimeHoursStr.trim().replace(",", ".");
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
    setSaving(true);
    const res = await addGameReviewAction({
      rawgId: game.id,
      body: reviewText,
      rating,
      startedOn: startedOn || null,
      finishedOn: finishedOn || null,
      isReplay: isReplay,
      liked,
      playtimeHours,
      platform: platform.trim() === "" ? null : platform.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    closeAll();
    if (redirectToProfileAfterSave) {
      router.replace("/profile");
      router.refresh();
      return;
    }
    router.refresh();
  }

  async function saveActivity() {
    if (!activityGame) return;
    const ptRaw = activityPlaytimeStr.trim().replace(",", ".");
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
    setActivitySaving(true);
    const res = await addGameActivityAction({
      rawgId: activityGame.id,
      startedOn: activityStartedOn || null,
      playtimeHours,
      platform:
        activityPlatform.trim() === "" ? null : activityPlatform.trim(),
    });
    setActivitySaving(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    closeActivityForm();
    setActivityOpen(false);
    if (redirectToProfileAfterSave) {
      router.replace("/profile");
      router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="max-w-md text-xs leading-snug text-[#678] sm:max-w-md lg:max-w-lg sm:text-left">
          Registra qué estás jugando o publica una reseña con fechas y
          valoración.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
          <button
            type="button"
            onClick={() => setActivityOpen(true)}
            className="shrink-0 rounded-md border border-emerald-500/45 bg-emerald-500/15 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-200 shadow-sm transition duration-200 hover:bg-emerald-500/25 active:scale-[0.98] sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-[11px] sm:tracking-[0.14em] sm:hover:scale-[1.02] sm:hover:shadow-md"
          >
            + Actividad (jugando)
          </button>
          <button
            type="button"
            onClick={openPicker}
            className="shrink-0 rounded-md border border-emerald-600/60 bg-emerald-600 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm transition duration-200 hover:bg-emerald-500 active:scale-[0.98] sm:rounded sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.16em] sm:shadow-md sm:hover:scale-[1.02] sm:hover:shadow-lg sm:hover:shadow-emerald-900/25"
          >
            + Nueva reseña
          </button>
        </div>
      </div>

      <RawgSearchModal
        open={activityOpen}
        title="Registrar actividad — elige juego"
        onClose={() => setActivityOpen(false)}
        onSelect={(g) => {
          setActivityOpen(false);
          setActivityGame(g);
        }}
      />

      <RawgSearchModal
        open={phase === "pick"}
        title="Elegir juego — reseña"
        onClose={closeAll}
        onSelect={onGameChosen}
      />

      {activityGame ? (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="presentation"
          onClick={closeActivityForm}
        >
          <div
            role="dialog"
            aria-labelledby="activity-log-title"
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[#3d4654] bg-[#2c3440] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-black/25 bg-[#252b33] px-2 py-2.5 sm:px-3">
              <button
                type="button"
                onClick={activityBackToSearch}
                className="rounded-sm bg-[#384250] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#c8d0d9] transition hover:bg-[#455160] hover:text-white"
              >
                ← Volver
              </button>
              <h2
                id="activity-log-title"
                className="flex-1 text-center text-sm font-medium text-white"
              >
                Jugando…
              </h2>
              <button
                type="button"
                onClick={closeActivityForm}
                className="flex size-9 shrink-0 items-center justify-center rounded text-lg text-[#9ab] transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
                <div className="mx-auto shrink-0 sm:mx-0">
                  <div className="relative aspect-[2/3] w-[100px] overflow-hidden rounded-sm border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:w-[120px]">
                    {activityGame.background_image ? (
                      <Image
                        src={activityGame.background_image}
                        alt=""
                        fill
                        quality={RAWG_COVER_QUALITY}
                        className="object-cover"
                        sizes={RAWG_COVER_SIZES_POSTER_COMPACT}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-[#1a1f26] text-xs text-[#567]">
                        Sin carátula
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold leading-snug text-white sm:text-xl">
                      {activityGame.name}
                      {activityYear ? (
                        <span className="ml-2 font-normal text-[#9ab]">
                          {activityYear}
                        </span>
                      ) : null}
                    </h3>
                  </div>

                  <label className="block max-w-[220px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                      Lo inicié el
                    </span>
                    <input
                      type="date"
                      value={activityStartedOn}
                      onChange={(e) => setActivityStartedOn(e.target.value)}
                      className="mt-1 w-full rounded border border-[#1f252d] bg-[#1a1f26] px-2 py-2 text-sm text-white"
                    />
                  </label>

                  <PlaytimeHoursField
                    value={activityPlaytimeStr}
                    onChange={setActivityPlaytimeStr}
                    label="Horas hasta ahora"
                    helperText="Opcional. Solo números; botones o flechas ↑↓."
                    groupAriaLabel="Horas jugadas hasta ahora"
                  />

                  <label className="inline-block w-[9.5rem] max-w-full sm:w-[10.5rem]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                      Plataforma
                    </span>
                    <select
                      value={activityPlatform}
                      onChange={(e) => setActivityPlatform(e.target.value)}
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

                  <p className="text-[11px] leading-snug text-[#678]">
                    Fecha de inicio, horas y plataforma son opcionales; se
                    muestran en actividad reciente.
                  </p>
                </div>
              </div>
            </div>

            <footer className="flex shrink-0 justify-end border-t border-black/25 bg-[#252b33] px-4 py-3">
              <button
                type="button"
                disabled={activitySaving}
                onClick={saveActivity}
                className="rounded border border-emerald-500/40 bg-emerald-600 px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {activitySaving ? "Guardando…" : "Registrar actividad"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {phase === "form" && game ? (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="presentation"
          onClick={closeAll}
        >
          <div
            role="dialog"
            aria-labelledby="review-log-title"
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[#3d4654] bg-[#2c3440] shadow-2xl transition-all duration-300 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] hover:ring-1 hover:ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-black/25 bg-[#252b33] px-2 py-2.5 sm:px-3">
              <button
                type="button"
                onClick={backToPick}
                className="rounded-sm bg-[#384250] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#c8d0d9] transition hover:bg-[#455160] hover:text-white"
              >
                ← Volver
              </button>
              <h2
                id="review-log-title"
                className="flex-1 text-center text-sm font-medium text-white"
              >
                Jugué…
              </h2>
              <button
                type="button"
                onClick={closeAll}
                className="flex size-9 shrink-0 items-center justify-center rounded text-lg text-[#9ab] transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                <div className="mx-auto shrink-0 lg:mx-0">
                  <div className="relative aspect-[2/3] w-[120px] overflow-hidden rounded-sm border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:w-[140px]">
                    {game.background_image ? (
                      <Image
                        src={game.background_image}
                        alt=""
                        fill
                        quality={RAWG_COVER_QUALITY}
                        className="object-cover"
                        sizes={RAWG_COVER_SIZES_POSTER_COMPACT}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-[#1a1f26] text-xs text-[#567]">
                        Sin carátula
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold leading-snug text-white sm:text-xl">
                      {game.name}
                      {year ? (
                        <span className="ml-2 font-normal text-[#9ab]">
                          {year}
                        </span>
                      ) : null}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                    <label className="block min-w-[140px] flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                        Empecé el
                      </span>
                      <input
                        type="date"
                        value={startedOn}
                        onChange={(e) => setStartedOn(e.target.value)}
                        className="mt-1 w-full rounded border border-[#1f252d] bg-[#1a1f26] px-2 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="block min-w-[140px] flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                        Terminé el
                      </span>
                      <input
                        type="date"
                        value={finishedOn}
                        onChange={(e) => setFinishedOn(e.target.value)}
                        className="mt-1 w-full rounded border border-[#1f252d] bg-[#1a1f26] px-2 py-2 text-sm text-white"
                      />
                    </label>
                  </div>

                  <label className="inline-block w-[9.5rem] max-w-full sm:w-[10.5rem]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                      Plataforma
                    </span>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
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

                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#bcd]">
                    <input
                      type="checkbox"
                      checked={isReplay}
                      onChange={(e) => setIsReplay(e.target.checked)}
                      className="size-4 rounded border-[#456] bg-[#1a1f26] text-emerald-600 focus:ring-emerald-500/40"
                    />
                    Lo estoy rejugando (no es la primera vez)
                  </label>

                  <PlaytimeHoursField
                    value={playtimeHoursStr}
                    onChange={setPlaytimeHoursStr}
                    label="Horas invertidas"
                    helperText="Opcional. Solo números al escribir; botones o flechas ↑↓."
                    groupAriaLabel="Horas de juego"
                  />

                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                      Reseña
                    </span>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={5}
                      placeholder="Añade una reseña…"
                      className="mt-1 w-full resize-none rounded-lg border border-[#1f252d] bg-[#e8eaed] px-3 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#6b7280] focus:border-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </label>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                      Valoración
                    </p>
                    <p className="mt-1 text-xs text-[#9ab]">
                      {formatRatingText(rating)} de 5
                    </p>
                    <div className="mt-2 flex flex-nowrap items-center gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <StarRatingInput value={rating} onChange={setRating} />
                      <div
                        className="h-8 w-px shrink-0 bg-[#3d4654]"
                        aria-hidden
                      />
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#789]">
                          Me gusta
                        </span>
                        <button
                          type="button"
                          onClick={() => setLiked((v) => !v)}
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3d4654] bg-[#252b33] text-xl leading-none transition hover:border-orange-500/40 hover:bg-[#2f3642]"
                          aria-pressed={liked}
                          aria-label={liked ? "Quitar me gusta" : "Me gusta"}
                        >
                          <span
                            className={
                              liked ? "text-orange-400" : "text-[#567]"
                            }
                          >
                            {liked ? "♥" : "♡"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="flex shrink-0 justify-end border-t border-black/25 bg-[#252b33] px-4 py-3">
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="rounded border border-emerald-500/40 bg-emerald-600 px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
