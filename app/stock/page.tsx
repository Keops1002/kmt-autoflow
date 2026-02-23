"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { Plus, Loader2, Car, Fuel, Gauge, Tag, ExternalLink, CarFront } from "lucide-react";

interface StockVehicule {
  id: string;
  marque: string;
  modele: string;
  version: string | null;
  annee: number | null;
  carburant: string | null;
  boite: string | null;
  kilometrage: number | null;
  couleur: string | null;
  prix: number | null;
  statut: string;
  publie_leboncoin: boolean;
  publie_autoscout: boolean;
  publie_lacentrale: boolean;
  created_at: string;
}

const STATUT_STYLE: Record<string, { badge: string; label: string }> = {
  disponible: { badge: "bg-emerald-100 text-emerald-700", label: "Disponible" },
  vendu:      { badge: "bg-slate-100 text-slate-500",     label: "Vendu"      },
  reserve:    { badge: "bg-amber-100 text-amber-700",     label: "Réservé"    },
};

export default function StockPage() {
  const router = useRouter();
  const [vehicules, setVehicules] = useState<StockVehicule[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"tous" | "disponible" | "reserve" | "vendu">("tous");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("stock_vehicules")
      .select("*")
      .order("created_at", { ascending: false });
    setVehicules((data as StockVehicule[]) || []);
    setLoading(false);
  }

  const filtered = filter === "tous"
    ? vehicules
    : vehicules.filter((v) => v.statut === filter);

  const stats = {
    total:      vehicules.length,
    disponible: vehicules.filter((v) => v.statut === "disponible").length,
    vendu:      vehicules.filter((v) => v.statut === "vendu").length,
  };

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-32 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Stock
            </h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
              {stats.disponible} disponible(s) · {stats.vendu} vendu(s)
            </p>
          </div>
          <button
            onClick={() => router.push("/stock/new")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all"
            style={{ background: "var(--accent)" }}>
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["tous", "disponible", "reserve", "vendu"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-black capitalize transition-all"
              style={{
                background: filter === f ? "var(--accent)" : "var(--card-bg)",
                color: filter === f ? "#fff" : "var(--text-muted)",
                border: `1px solid ${filter === f ? "var(--accent)" : "var(--card-border)"}`,
              }}>
              {f === "tous" ? `Tous (${stats.total})` : f === "disponible" ? `Disponibles (${stats.disponible})` : f === "vendu" ? `Vendus (${stats.vendu})` : "Réservés"}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "var(--card-bg)" }}>
              <CarFront size={28} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm font-black" style={{ color: "var(--text-muted)" }}>
              Aucun véhicule en stock
            </p>
            <button onClick={() => router.push("/stock/new")}
              className="px-4 py-2 rounded-2xl text-xs font-black text-white"
              style={{ background: "var(--accent)" }}>
              + Ajouter un véhicule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((v) => {
              const st = STATUT_STYLE[v.statut] || STATUT_STYLE.disponible;
              const plateformes = [
                v.publie_leboncoin  && "LBC",
                v.publie_autoscout  && "AS24",
                v.publie_lacentrale && "LC",
              ].filter(Boolean);

              return (
                <button key={v.id} onClick={() => router.push(`/stock/${v.id}`)}
                  className="w-full text-left relative rounded-2xl border overflow-hidden transition-all active:scale-[0.98]"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

                  {/* Barre gauche */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />

                  <div className="pl-5 pr-4 py-4 space-y-2">
                    {/* Titre + badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm" style={{ color: "var(--text-primary)" }}>
                          {v.marque} {v.modele}
                        </p>
                        {v.version && (
                          <p className="text-[10px] font-medium truncate" style={{ color: "var(--text-muted)" }}>
                            {v.version}
                          </p>
                        )}
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${st.badge}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Infos */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {v.annee && (
                        <div className="flex items-center gap-1">
                          <Car size={11} style={{ color: "var(--text-muted)" }} />
                          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{v.annee}</span>
                        </div>
                      )}
                      {v.kilometrage && (
                        <div className="flex items-center gap-1">
                          <Gauge size={11} style={{ color: "var(--text-muted)" }} />
                          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{v.kilometrage.toLocaleString()} km</span>
                        </div>
                      )}
                      {v.carburant && (
                        <div className="flex items-center gap-1">
                          <Fuel size={11} style={{ color: "var(--text-muted)" }} />
                          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{v.carburant}</span>
                        </div>
                      )}
                      {v.boite && (
                        <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{v.boite}</span>
                      )}
                    </div>

                    {/* Prix + plateformes */}
                    <div className="flex items-center justify-between">
                      {v.prix ? (
                        <p className="text-lg font-black" style={{ color: "var(--accent)" }}>
                          {v.prix.toLocaleString()} €
                        </p>
                      ) : (
                        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>Prix non défini</p>
                      )}
                      {plateformes.length > 0 && (
                        <div className="flex items-center gap-1">
                          <ExternalLink size={10} style={{ color: "var(--text-muted)" }} />
                          {plateformes.map((p) => (
                            <span key={p as string} className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppContainer>
  );
}