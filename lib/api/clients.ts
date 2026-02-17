/* =========================================================
   API CLIENTS – SUPABASE
========================================================= */

import { supabase } from "@/lib/supabase";
import { GARAGE_ID } from "@/lib/constants";
import type { Client, ClientWithStats } from "@/lib/types";

/* =========================================================
   GET CLIENTS (avec stats)
========================================================= */
export async function getClientsWithStats(): Promise<ClientWithStats[]> {
  const { data, error } = await supabase
    .from("clients_with_stats")
    .select("id, garage_id, name, phone, email, dossiers_count, last_dossier_at")
    .eq("garage_id", GARAGE_ID)
    .order("last_dossier_at", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("getClientsWithStats error:", error);
    throw error;
  }

  return (data ?? []) as ClientWithStats[];
}

/* =========================================================
   GET CLIENT BY ID (avec stats)
========================================================= */
export async function getClientWithStatsById(id: string): Promise<ClientWithStats | null> {
  const { data, error } = await supabase
    .from("clients_with_stats")
    .select("id, garage_id, name, phone, email, dossiers_count, last_dossier_at")
    .eq("id", id)
    .eq("garage_id", GARAGE_ID)
    .single();

  if (error) {
    console.error("getClientWithStatsById error:", error);
    return null;
  }

  return data as ClientWithStats;
}

/* =========================================================
   CREATE CLIENT
   - évite les doublons côté UI via unique index (si tu l'as gardé)
========================================================= */
export async function createClient(payload: {
  name: string;
  phone?: string;
  email?: string;
}): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      garage_id: GARAGE_ID,
      name: payload.name.trim(),
      phone: payload.phone?.trim() || null,
      email: payload.email?.trim() || null,
    })
    .select("id, garage_id, name, phone, email")
    .single();

  if (error) {
    console.error("createClient error:", error);
    throw error;
  }

  return data as Client;
}
