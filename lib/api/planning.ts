import { supabase } from "@/lib/supabase";

/* ── Helper timezone-safe ── */
export function isoDate(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return isoDate(date);
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const dateA = new Date(ay, am - 1, ad);
  const dateB = new Date(by, bm - 1, bd);
  return Math.round((dateB.getTime() - dateA.getTime()) / 86400000);
}

export function getWeekDays(weekOffset = 0): Date[] {
  const today  = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export async function getPlanningData(weekOffset = 0) {
  const weekDays = getWeekDays(weekOffset);
  const start    = isoDate(weekDays[0]);
  const end      = isoDate(weekDays[6]);

  const { data: entries, error: entriesError } = await supabase
    .from("planning_entries")
    .select(`
      dossier_id, start_date, end_date,
      dossiers (
        id, problem, status, estimated_price,
        vehicles ( plate, brand, model, clients ( name ) )
      )
    `)
    .lte("start_date", end)
    .gte("end_date", start);

  if (entriesError) console.error("getPlanningData entries error:", entriesError.message);

  const { data: allDossiers, error: dossiersError } = await supabase
    .from("dossiers")
    .select("id, problem, status, estimated_price, vehicles(plate, brand, model, clients(name))")
    .in("status", ["pending", "in_progress"]);

  if (dossiersError) console.error("getPlanningData dossiers error:", dossiersError.message);

  const plannedIds = entries?.map((e) => e.dossier_id) || [];
  const unplanned  = (allDossiers || []).filter((d) => !plannedIds.includes(d.id));

  return {
    weekDays,
    bars:      (entries   || []) as unknown as PlanningBar[],
    unplanned: (unplanned || []) as unknown as UnplannedDossier[],
  };
}

export async function scheduleDossier(
  dossierId: string,
  startDate: string,
  endDate: string
) {
  const { error: upsertError } = await supabase
    .from("planning_entries")
    .upsert(
      { dossier_id: dossierId, start_date: startDate, end_date: endDate },
      { onConflict: "dossier_id" }
    );

  if (upsertError) {
    console.warn("upsert failed, fallback delete+insert:", upsertError.message);
    await supabase.from("planning_entries").delete().eq("dossier_id", dossierId);
    const { error: insertError } = await supabase
      .from("planning_entries")
      .insert({ dossier_id: dossierId, start_date: startDate, end_date: endDate });
    if (insertError) throw new Error(`scheduleDossier failed: ${insertError.message}`);
  }
}

export async function moveDossierToDate(dossierId: string, newStartDate: string) {
  const { data: existing } = await supabase
    .from("planning_entries")
    .select("start_date, end_date")
    .eq("dossier_id", dossierId)
    .single();

  let newEndDate = newStartDate;
  if (existing) {
    const duration = daysBetween(existing.start_date, existing.end_date);
    newEndDate = addDays(newStartDate, duration);
  }

  await supabase.from("planning_entries").delete().eq("dossier_id", dossierId);
  const { error } = await supabase.from("planning_entries").insert({
    dossier_id: dossierId,
    start_date: newStartDate,
    end_date:   newEndDate,
  });
  if (error) throw new Error(`moveDossierToDate failed: ${error.message}`);
}

export async function clearPlanning(dossierId: string) {
  const { error } = await supabase
    .from("planning_entries")
    .delete()
    .eq("dossier_id", dossierId);
  if (error) throw new Error(`clearPlanning failed: ${error.message}`);
}

export async function getPlanningMonth(monthOffset = 0) {
  const now    = new Date();
  const y      = now.getFullYear();
  const m      = now.getMonth() + monthOffset;
  const target = new Date(y, m, 1);
  const ty     = target.getFullYear();
  const tm     = target.getMonth();

  const firstDay = isoDate(new Date(ty, tm, 1));
  const lastDay  = isoDate(new Date(ty, tm + 1, 0));

  const { data: entries, error } = await supabase
    .from("planning_entries")
    .select(`
      dossier_id, start_date, end_date,
      dossiers (
        id, problem, status, estimated_price,
        vehicles ( plate, brand, model, clients ( name ) )
      )
    `)
    .lte("start_date", lastDay)
    .gte("end_date", firstDay);

  if (error) console.error("getPlanningMonth error:", error.message);

  return {
    month:   tm,
    year:    ty,
    entries: (entries || []) as unknown as PlanningBar[],
  };
}

export interface PlanningBar {
  dossier_id: string;
  start_date: string;
  end_date: string;
  dossiers: {
    id: string;
    problem: string;
    status: string;
    estimated_price?: number;
    vehicles: {
      plate?: string;
      brand: string;
      model: string;
      clients?: { name: string } | null;
    } | null;
  };
}

export interface UnplannedDossier {
  id: string;
  problem: string;
  status: string;
  estimated_price?: number;
  vehicles?: {
    plate?: string;
    brand: string;
    model: string;
    clients?: { name: string } | null;
  } | null;
}