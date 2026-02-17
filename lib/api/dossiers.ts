import { supabase } from "@/lib/supabase";

/* =========================================================
   GET DOSSIERS – NORMALISÉ
========================================================= */
export async function getDossiers() {
  const { data, error } = await supabase
    .from("dossiers")
    .select(`
      id,
      problem,
      status,
      estimated_price,
      vehicles (
        brand,
        model,
        clients (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération dossiers :", error);
    throw error;
  }

  // 🔥 NORMALISATION DES TABLEAUX
  return data?.map((d) => ({
    id: d.id,
    problem: d.problem,
    status: d.status,
    estimated_price: d.estimated_price,
    vehicle: d.vehicles?.[0] ?? null,
    client: d.vehicles?.[0]?.clients?.[0] ?? null,
  })) ?? [];
}

/* =========================================================
   DELETE DOSSIER
========================================================= */
export async function deleteDossier(id: string) {
  const { error } = await supabase
    .from("dossiers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erreur suppression dossier :", error);
    throw error;
  }

  return true;
}
