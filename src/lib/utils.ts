import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Years available in the platform */
export const AVAILABLE_YEARS = Array.from({ length: 12 }, (_, i) => String(2015 + i)); // 2015-2026

/** Default year (prioritize most recent: 2026) */
export const DEFAULT_YEAR = "2026";

/** Month options for select dropdowns */
export const MONTH_OPTIONS = [
  { value: "", label: "Anual (todos meses)" },
  ...Array.from({ length: 12 }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return { value: num, label: `${num} — ${names[i]}` };
  }),
];

/** All months for filtering */
export const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
