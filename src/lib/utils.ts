import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKes(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const body = Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1);
    return `KES ${body}M`;
  }
  return `KES ${new Intl.NumberFormat("en-KE").format(Math.round(n))}`;
}

export function formatKesRange(min: number, max: number): string {
  return `${formatKes(min)} – ${formatKes(max)}`;
}
