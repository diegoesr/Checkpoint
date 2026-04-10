"use client";

type Size = "sm" | "md";

/**
 * Solo lectura: 5 estrellas con medias (misma lógica que la valoración al reseñar).
 */
export function HalfStarRatingDisplay({
  value,
  size = "md",
}: {
  value: number | null;
  size?: Size;
}) {
  const v = value != null ? Number(value) : 0;
  const text = size === "sm" ? "text-xs" : "text-base";
  const wStar = size === "sm" ? "w-[0.75em]" : "w-[0.82em]";

  if (!Number.isFinite(v) || v <= 0) {
    return (
      <span
        className={`inline-flex gap-px leading-none text-white/25 ${text}`}
        aria-hidden
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>★</span>
        ))}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-px leading-none ${text}`}
      aria-hidden
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`relative inline-block h-[1em] ${wStar}`}
        >
          <span className="text-white/25">★</span>
          <span
            className="absolute left-0 top-0 overflow-hidden text-emerald-400"
            style={{
              width: v >= i ? "100%" : v >= i - 0.5 ? "50%" : "0%",
            }}
          >
            ★
          </span>
        </span>
      ))}
    </span>
  );
}
