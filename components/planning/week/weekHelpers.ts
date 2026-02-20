import type { PlanningBar, UnplannedDossier } from "@/lib/api/planning";

export function isoDate(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  return isoDate(new Date());
}

export function statusStyle(status: string) {
  switch (status) {
    case "done":
      return { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", label: "Terminé" };
    case "in_progress":
      return { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700", label: "En cours" };
    default:
      return { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700", label: "En attente" };
  }
}

export function getInitialDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export const DAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];
export const DAY_NAMES   = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];