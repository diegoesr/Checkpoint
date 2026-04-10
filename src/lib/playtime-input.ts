import type { KeyboardEvent } from "react";

export function formatHoursStep(n: number): string {
  const r = Math.round(n * 100) / 100;
  return String(r);
}

/** Solo dígitos y un separador decimal (coma o punto), máx. 2 decimales. */
export function sanitizePlaytimeKeyboardInput(s: string): string {
  let intPart = "";
  let sep: "," | "." | null = null;
  let decPart = "";
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") {
      if (sep === null) intPart += ch;
      else if (decPart.length < 2) decPart += ch;
      continue;
    }
    if ((ch === "," || ch === ".") && sep === null) sep = ch;
  }
  if (sep === null) return intPart;
  return intPart + sep + decPart;
}

export function playtimeKeyDownHandler(
  e: KeyboardEvent<HTMLInputElement>,
  currentValue: string,
  adjust: (delta: number) => void,
): void {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    adjust(1);
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    adjust(-1);
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "Escape" ||
    e.key === "Home" ||
    e.key === "End"
  ) {
    return;
  }
  if (e.key.length === 1 && /[0-9]/.test(e.key)) return;
  if (e.key.length === 1 && (e.key === "," || e.key === ".")) {
    if (currentValue.includes(",") || currentValue.includes(".")) {
      e.preventDefault();
    }
    return;
  }
  if (e.key.length === 1) e.preventDefault();
}
