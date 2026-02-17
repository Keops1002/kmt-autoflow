/* =========================================================
   TYPES GLOBAUX – PRÊT SUPABASE (MULTI-GARAGE)
   Modèle relationnel : Client -> Vehicle -> Dossier
========================================================= */

export type DossierStatus = "in_progress" | "pending" | "done";

export interface Garage {
  id: string;
  name: string;
  created_at?: string;
}

/* =========================================================
   TYPES – SUPABASE
========================================================= */

export interface Client {
  id: string;
  garage_id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface ClientWithStats extends Client {
  dossiers_count: number;
  last_dossier_at: string | null;
}


export interface Vehicle {
  id: string;
  client_id: string;
  brand: string;
  model: string;
  plate?: string;
  created_at?: string;
}

export interface Dossier {
  id: string;
  vehicle_id: string;
  problem: string;
  status: string;
  created_at: string;

  estimated_price?: number;
  final_price?: number;
  payment_status?: "unpaid" | "partial" | "paid";
}


/* =========================================================
   VIEW MODEL (front) – pour afficher des cards facilement
   (join Supabase plus tard)
========================================================= */
export interface DossierCardModel {
  id: string;
  garage_id: string;

  client_name: string;

  vehicle_label: string; // ex: "BMW Série 3"
  problem: string;

  progress?: string;
  status: DossierStatus;
}
