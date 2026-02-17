"use client";

/* =========================================================
   DOSSIERS PAGE – CONNECTÉ SUPABASE
   Version corrigée : Accès par objets & Double Casting TS
========================================================= */

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES – STRUCTURE CORRESPONDANT AUX ALIAS SUPABASE
========================================================= */

interface Dossier {
  id: string;
  problem: string;
  status: string;
  estimated_price: number | null;
  vehicles: {
    brand: string;
    model: string;
    clients: {
      name: string;
    } | null;
  } | null;
}

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH DOSSIERS
  ========================================================= */

  const fetchDossiers = async () => {
    const { data, error } = await supabase
      .from("dossiers")
      .select(`
        id,
        problem,
        status,
        estimated_price,
        vehicles:vehicle_id (
          brand,
          model,
          clients:client_id (
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur fetch dossiers:", error);
      setLoading(false);
      return;
    }

    // Le "as unknown as Dossier[]" règle l'erreur TS 2352
    setDossiers(data as unknown as Dossier[]);
    setLoading(false);
  };

  /* =========================================================
     DELETE DOSSIER
  ========================================================= */

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Supprimer ce dossier ?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("dossiers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
      return;
    }

    // Mise à jour de l'état local pour éviter un rechargement complet
    setDossiers((prev) => prev.filter((d) => d.id !== id));
  };

  /* =========================================================
     INIT
  ========================================================= */

  useEffect(() => {
    fetchDossiers();
  }, []);

  return (
    <AppContainer>
      <div className="px-8 pt-12 pb-40 space-y-6">

        {/* TITLE */}
        <h1 className="text-3xl font-extrabold text-slate-800">
          Dossiers
        </h1>

        {/* LOADING STATE */}
        {loading && (
          <p className="text-slate-500 italic text-center">Chargement des dossiers...</p>
        )}

        {/* EMPTY STATE */}
        {!loading && dossiers.length === 0 && (
          <p className="text-slate-500 text-center">
            Aucun dossier pour le moment.
          </p>
        )}

        {/* DOSSIERS LIST */}
        <div className="grid gap-6">
          {dossiers.map((dossier) => {
            // Accès direct car Supabase renvoie des objets via les alias :vehicle_id
            const vehicle = dossier.vehicles;
            const client = vehicle?.clients;

            return (
              <div
                key={dossier.id}
                className="relative p-6 rounded-[2rem]
                           bg-white/40 backdrop-blur-md
                           border border-white/60
                           shadow-[15px_15px_30px_#bebfc3,-15px_-15px_30px_#ffffff]
                           transition-all hover:scale-[1.01]"
              >

                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDelete(dossier.id)}
                  className="absolute top-6 right-6 text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-600 transition-colors"
                >
                  Supprimer
                </button>

                {/* CLIENT NAME */}
                <h2 className="text-xl font-bold text-slate-800 pr-16">
                  {client?.name ?? "Client inconnu"}
                </h2>

                {/* VEHICLE INFO */}
                <p className="text-sm text-slate-600 font-medium">
                  {vehicle?.brand} {vehicle?.model}
                </p>

                {/* PROBLEM DESCRIPTION */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {dossier.problem || "Aucune description du problème"}
                  </p>
                </div>

                {/* FOOTER: PRICE & STATUS */}
                <div className="flex justify-between items-center mt-6">
                  <div>
                    {dossier.estimated_price ? (
                      <span className="text-lg font-black text-blue-600">
                        {dossier.estimated_price} €
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Prix non défini</span>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                    dossier.status === "done" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {dossier.status}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </AppContainer>
  );
}