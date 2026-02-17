import { supabase } from "@/lib/supabase";

/* =========================================================
   GENERATE CURRENT WEEK
========================================================= */
function getCurrentWeek() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return weekDays;
}

/* =========================================================
   GET WEEK PLANNING
========================================================= */
export async function getPlanningWeek() {
  const weekDays = getCurrentWeek();
  const start = weekDays[0].toISOString().slice(0, 10);
  const end = weekDays[6].toISOString().slice(0, 10);

  const { data: entries } = await supabase
    .from("planning_entries")
    .select(`
      dossier_id,
      start_date,
      end_date,
      dossiers (
        id,
        problem
      )
    `)
    .gte("start_date", start)
    .lte("start_date", end);

  const bars = (entries || []).map(e => ({
    dossier_id: e.dossier_id,
    start: e.start_date,
    end: e.end_date,
    dossier: e.dossiers
  }));

  const { data: unplanned } = await supabase
    .from("dossiers")
    .select("*")
    .is("planned_date", null);

  return {
    weekDays,
    bars,
    unplanned: unplanned || []
  };
}

/* =========================================================
   MOVE DOSSIER TO DATE
========================================================= */
export async function moveDossierToDate(
  dossierId: string | number,
  date: string
) {
  await supabase.from("planning_entries").delete().eq("dossier_id", dossierId);

  await supabase.from("planning_entries").insert({
    dossier_id: dossierId,
    start_date: date,
    end_date: date,
  });
}

/* =========================================================
   MONTH VIEW
========================================================= */
export async function getPlanningMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  const start = first.toISOString().slice(0, 10);
  const end = last.toISOString().slice(0, 10);

  const { data: entries } = await supabase
    .from("planning_entries")
    .select(`
      dossier_id,
      start_date,
      end_date,
      dossiers ( id, problem )
    `)
    .gte("start_date", start)
    .lte("start_date", end);

  return {
    month: m,
    year: y,
    entries: entries || []
  };
}

/* =========================================================
   EDIT RANGE
========================================================= */
export async function setPlanningRange(
  dossierId: string | number,
  start: string,
  end: string
) {
  await supabase
    .from("planning_entries")
    .update({ start_date: start, end_date: end })
    .eq("dossier_id", dossierId);
}

/* =========================================================
   CLEAR ENTRY
========================================================= */
export async function clearPlanning(dossierId: string | number) {
  await supabase.from("planning_entries").delete().eq("dossier_id", dossierId);
}
