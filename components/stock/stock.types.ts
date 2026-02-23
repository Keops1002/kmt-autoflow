export interface StockVehicule {
  id: string;
  marque: string;
  modele: string;
  version: string | null;
  annee: number | null;
  mise_en_circulation: string | null;
  couleur: string | null;
  type_vehicule: string | null;
  carburant: string | null;
  boite: string | null;
  kilometrage: number | null;
  puissance_din: number | null;
  puissance_fiscale: number | null;
  nb_portes: number | null;
  nb_places: number | null;
  crit_air: string | null;
  prix: number | null;
  tva_recuperable: boolean;
  points_forts: string[] | null;
  equipements: any;
  description: string | null;
  statut: string;
  created_at: string;
}

export const STATUT_STYLE: Record<string, { badge: string; label: string }> = {
  disponible: { badge: "bg-emerald-100 text-emerald-700", label: "Disponible" },
  vendu:      { badge: "bg-slate-100 text-slate-500",     label: "Vendu"      },
  reserve:    { badge: "bg-amber-100 text-amber-700",     label: "Réservé"    },
};