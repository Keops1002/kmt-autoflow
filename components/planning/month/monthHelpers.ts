import type { PlanningBar } from "@/lib/api/planning";

export function getDaysInMonth(year: number, month: number): Date[] {
  const last = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: last }, (_, i) => new Date(year, month, i + 1));
}

export function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function isoDate(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  return isoDate(new Date());
}

export function getBarsForDay(bars: PlanningBar[], dateId: string): PlanningBar[] {
  return bars.filter((b) => b.start_date <= dateId && b.end_date >= dateId);
}

export function statusDot(status: string): string {
  switch (status) {
    case "done":        return "bg-emerald-500";
    case "in_progress": return "bg-blue-500";
    default:            return "bg-amber-400";
  }
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round(
    (new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86400000
  );
}

export const MONTH_NAMES = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

export const DAY_HEADERS = ["L","M","M","J","V","S","D"];