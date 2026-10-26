export const COORDINATION_TIME_ZONE = "Africa/Nairobi";

function dateKeyInZone(date: Date, timeZone: string): string | null {
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  if (!values.year || !values.month || !values.day) return null;
  return `${values.year}-${values.month}-${values.day}`;
}

export function coordinationToday(now = new Date()): string {
  return dateKeyInZone(now, COORDINATION_TIME_ZONE) ?? now.toISOString().slice(0, 10);
}

export function coordinationDateKey(instant: string): string | null {
  return dateKeyInZone(new Date(instant), COORDINATION_TIME_ZONE);
}

function utcDateForDay(day: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day ? null : date;
}

export function moveCoordinationMonth(day: string, amount: number): string {
  const date = utcDateForDay(day) ?? utcDateForDay(coordinationToday())!;
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 10);
}

/** The 42 date keys for a Monday-first month grid containing `day`. */
export function coordinationMonthGrid(day: string): string[] {
  const date = utcDateForDay(day) ?? utcDateForDay(coordinationToday())!;
  date.setUTCDate(1);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const cell = new Date(date);
    cell.setUTCDate(date.getUTCDate() + index);
    return cell.toISOString().slice(0, 10);
  });
}

export function formatCoordinationMonth(day: string): string {
  const date = utcDateForDay(day);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-KE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCoordinationDay(day: string): string {
  const date = utcDateForDay(day);
  if (!date) return day;
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCoordinationDayShort(day: string): string {
  const date = utcDateForDay(day);
  if (!date) return day;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
