import { supabase } from "@/lib/supabase";

/**
 * Génère les jours d'une semaine avec un offset
 * @param weekOffset 0 pour cette semaine, 1 pour la suivante, etc.
 */
export function getWeekDays(weekOffset = 0) {
  const today = new Date();
  const monday = new Date(today);
  // On se cale sur le lundi de la semaine actuelle
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  // On ajoute l'offset de semaines
  monday.setDate(monday.getDate() + (weekOffset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export async function getPlanningData(weekOffset = 0) {
  const weekDays = getWeekDays(weekOffset);
  const start = weekDays[0].toISOString().slice(0, 10);
  const end = weekDays[6].toISOString().slice(0, 10);

  // Récupération des entrées planifiées
  const { data: entries } = await supabase
    .from("planning_entries")
    .select(`
      dossier_id,
      start_date,
      end_date,
      dossiers (
        id,
        problem,
        vehicles ( plate, brand, model )
      )
    `)
    .gte("start_date", start)
    .lte("start_date", end);

  // Récupération des dossiers NON planifiés (ceux qui n'ont pas d'entrée dans planning_entries)
  // Note: On peut aussi filtrer par un flag dans 'dossiers' si tu préfères
  const { data: allDossiers } = await supabase.from("dossiers").select("*, vehicles(*)");
  const plannedIds = entries?.map(e => e.dossier_id) || [];
  const unplanned = allDossiers?.filter(d => !plannedIds.includes(d.id)) || [];

  return {
    weekDays,
    bars: entries || [],
    unplanned
  };
}

export async function moveDossierToDate(dossierId: string | number, date: string) {
  // On supprime l'ancienne planification s'il y en a une
  await supabase.from("planning_entries").delete().eq("dossier_id", dossierId);
  
  // On insère la nouvelle
  return await supabase.from("planning_entries").insert({
    dossier_id: dossierId,
    start_date: date,
    end_date: date,
  });
}
// Ajoute cette fonction à la fin de ton fichier lib/api/planning.ts

export async function getPlanningMonth(monthOffset = 0) {
  const now = new Date();
  // On calcule le mois cible en fonction de l'offset
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();

  const firstDay = new Date(y, m, 1).toISOString().slice(0, 10);
  const lastDay = new Date(y, m + 1, 0).toISOString().slice(0, 10);

  const { data: entries } = await supabase
    .from("planning_entries")
    .select(`
      dossier_id,
      start_date,
      end_date,
      dossiers (
        id,
        problem,
        vehicles ( plate, brand, model )
      )
    `)
    .gte("start_date", firstDay)
    .lte("start_date", lastDay);

  return {
    month: m,
    year: y,
    entries: entries || []
  };
}