export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Tiempo relativo compacto (p. ej. «8d», «3h») para líneas de actividad. */
export function formatRelativeTimeShort(iso: string): string {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - t) / 1000));
  if (diffSec < 45) return "ahora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 36) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 14) return `${diffDay}d`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 8) return `${diffWk}sem`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mes`;
  const diffYr = Math.floor(diffDay / 365);
  return `${diffYr}a`;
}

/** Encabezado de día para el diario (p. ej. "lunes, 7 de abril de 2026"). */
export function formatDiaryDayHeading(dayYmd: string) {
  const d = new Date(`${dayYmd}T12:00:00`);
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatPlaytimeHours(
  v: number | string | null | undefined,
): string | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return (
    new Intl.NumberFormat("es", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(n) + " h"
  );
}
