"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { ListFilter } from "lucide-react";

import DossierCard from "@/components/dossiers/DossierCard";
import type { Dossier } from "@/components/dossiers/dossier.types";

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading]   = useState(true);

  // Filtre et tri
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, pending, in_progress, done
  const [sortOrder, setSortOrder]       = useState<string>("newest"); // newest, oldest, az, za

  useEffect(() => {
    const cached = sessionStorage.getItem("dossiers_cache");
    if (cached) {
      setDossiers(JSON.parse(cached));
      setLoading(false);
    }
    fetchDossiers();
  }, []);

  async function fetchDossiers() {
    const { data, error } = await supabase
      .from("dossiers")
      .select(`
        id, created_at, problem, status, payment_status,
        estimated_price, paid_amount, paid_at,
        tasks ( id, title, priority, is_done ),
        devis ( id, numero, status, tva_enabled, signature_data, signed_at, total_ht, total_tva, total_ttc, created_at, facture_id ),
        vehicles:vehicle_id (
          brand, model, plate,
          clients:client_id ( name, phone, email )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) { console.error(error); return; }
    
    const result = (data as unknown as Dossier[]) || [];
    const newJSON = JSON.stringify(result);
    const cached  = sessionStorage.getItem("dossiers_cache");
    if (newJSON !== cached) {
      setDossiers(result);
      sessionStorage.setItem("dossiers_cache", newJSON);
    }
    setLoading(false);
  }

  // Filtrage et Tri
  const displayedDossiers = dossiers
    .filter((d) => statusFilter === "all" || d.status === statusFilter)
    .sort((a, b) => {
      // Tri par date
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      
      // Tri de A à Z (par nom de client)
      const nameA = a.vehicles?.clients?.name || "Z"; 
      const nameB = b.vehicles?.clients?.name || "Z";
      if (sortOrder === "az") return nameA.localeCompare(nameB);
      if (sortOrder === "za") return nameB.localeCompare(nameA);
      
      return 0;
    });

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-40 space-y-4">
        {/* En-tête */}
        <div className="flex items-center justify-between px-2">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>Dossiers</h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{ color: "var(--text-muted)", background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            {displayedDossiers.length} dossier{displayedDossiers.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* 🎛️ BARRE DE FILTRES ET TRI */}
        <div className="flex flex-col gap-3 px-2 mb-4">
          
          {/* Pilules de statut */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <button 
              onClick={() => setStatusFilter("all")} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border text-slate-500'}`}
            >
              Tous
            </button>
            <button 
              onClick={() => setStatusFilter("pending")} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${statusFilter === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'bg-white border text-slate-500'}`}
            >
              En attente
            </button>
            <button 
              onClick={() => setStatusFilter("in_progress")} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${statusFilter === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'bg-white border text-slate-500'}`}
            >
              En cours
            </button>
            <button 
              onClick={() => setStatusFilter("done")} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${statusFilter === 'done' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-white border text-slate-500'}`}
            >
              Terminés
            </button>
          </div>

          {/* Sélecteur de tri */}
          <div className="flex items-center gap-2 px-1">
            <ListFilter size={14} className="text-slate-400" />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs font-bold bg-transparent border-none text-slate-600 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="newest">Les plus récents</option>
              <option value="oldest">Les plus anciens</option>
              <option value="az">Client (A à Z)</option>
              <option value="za">Client (Z à A)</option>
            </select>
          </div>
        </div>

        {/* Skeleton de chargement */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border overflow-hidden p-4 space-y-2" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <div className="h-4 w-32 rounded-full animate-pulse" style={{ background: "var(--card-border)" }} />
                <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: "var(--card-border)" }} />
              </div>
            ))}
          </div>
        )}

        {/* État vide */}
        {!loading && displayedDossiers.length === 0 && (
          <div className="flex flex-col justify-center items-center h-48 gap-2">
            <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>Aucun dossier trouvé</p>
            {statusFilter !== "all" && (
              <button onClick={() => setStatusFilter("all")} className="text-xs text-blue-500 font-bold underline">
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* La liste des dossiers filtrée */}
        <div className="space-y-3">
          {displayedDossiers.map((dossier) => (
            <DossierCard 
              key={dossier.id} 
              dossier={dossier}
              onDelete={(id) => setDossiers((p) => p.filter((d) => d.id !== id))}
              onUpdate={(id, patch) => setDossiers((p) => p.map((d) => d.id === id ? { ...d, ...patch } : d))}
            />
          ))}
        </div>
      </div>
    </AppContainer>
  );
}