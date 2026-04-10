"use client";

import { useEffect } from "react";

type Props = {
  onClose: () => void;
  onPickReview: () => void;
  onPickActivity: () => void;
};

export function MobileAddChoiceSheet({
  onClose,
  onPickReview,
  onPickActivity,
}: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/65 backdrop-blur-sm md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-add-title"
    >
      <button
        type="button"
        className="min-h-0 flex-1 cursor-default"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="mx-auto w-full max-w-lg rounded-t-2xl border border-white/10 border-b-0 bg-[#14181c] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-12px_40px_rgba(0,0,0,0.5)]">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <h2
          id="mobile-add-title"
          className="text-center text-sm font-semibold text-white"
        >
          ¿Qué quieres agregar?
        </h2>
        <p className="mt-1 text-center text-xs text-[#9ab]">
          Elige una opción para continuar
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            className="w-full rounded-xl border border-emerald-500/50 bg-emerald-500/15 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100 transition active:scale-[0.99] hover:bg-emerald-500/25"
            onClick={onPickReview}
          >
            Nueva reseña
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-[#40bcf4]/40 bg-[#1a2a35] py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#bcd] transition active:scale-[0.99] hover:bg-[#1f3544]"
            onClick={onPickActivity}
          >
            Nueva actividad (jugando)
          </button>
          <button
            type="button"
            className="mt-1 py-2.5 text-center text-xs font-medium text-[#678] transition hover:text-[#9ab]"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
