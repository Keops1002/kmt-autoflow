"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { Search, SlidersHorizontal, FolderOpen } from "lucide-react";

import DossierCard from "@/components/dossiers/DossierCard";
import type { Dossier } from "@/components/dossiers/dossier.types";

// ─── Config filtres statut ─────────────────────────────────────────────────────

const STATUS_FILTERS = [
  {
    key:    "all",
    label:  "Tous",
    bg:     "var(--accent)",
    color:  "#ffffff",
    bgOff:  "var(--card-bg)",
    colOff: "var(--text-muted)",
    border: "var(--card-border)",
  },
  {
    key:    "pending",
    label:  "En attente",
    bg:     "rgba(245,158,11,0.15)",
    color:  "#f59e0b",
    bgOff:  "var(--card-bg)",
    colOff: "var(--text-muted)",
    border: "rgba(245,158,11,0.3)",
  },
  {
    key:    "in_progress",
    label:  "En cours",
    bg:     "rgba(59,130,246,0.15)",
    color:  "#3b82f6",
    bgOff:  "var(--card-bg)",
    colOff: "var(--text-muted)",
    border: "rgba(59,130,246,0.3)",
  },
  {
    key:    "done",
    label:  "Terminés",
    bg:     "rgba(16,185,129,0.15)",
    color:  "#10b981",
    bgOff:  "var(--card-bg)",
    colOff: "var(--text-muted)",
    border: "rgba(16,185,129,0.3)",
  },
];

const SORT_LABELS: Record<string, string> = {
  newest: "Récents",
  oldest: "Anciens",
  az:     "A → Z",
  za:     "Z → A",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DossiersPage() {
  const [dossiers, setDossiers]       = useState<Dossier[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder]     = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSort, setShowSort]       = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem("dossiers_cache");
    if (cached) { setDossiers(JSON.parse(cached)); setLoading(false); }
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

    const result  = (data as unknown as Dossier[]) || [];
    const newJSON = JSON.stringify(result);
    const cached  = sessionStorage.getItem("dossiers_cache");
    if (newJSON !== cached) {
      setDossiers(result);
      sessionStorage.setItem("dossiers_cache", newJSON);
    }
    setLoading(false);
  }

  const displayed = dossiers
    .filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.vehicles?.clients?.name?.toLowerCase().includes(q) ||
        d.vehicles?.brand?.toLowerCase().includes(q) ||
        d.vehicles?.model?.toLowerCase().includes(q) ||
        d.vehicles?.plate?.toLowerCase().includes(q) ||
        d.problem?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      const nA = a.vehicles?.clients?.name || "Z";
      const nB = b.vehicles?.clients?.name || "Z";
      if (sortOrder === "az") return nA.localeCompare(nB);
      if (sortOrder === "za") return nB.localeCompare(nA);
      return 0;
    });

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-40 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Dossiers</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {dossiers.length} dossier{dossiers.length > 1 ? "s" : ""} au total
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl border"
            style={{ color: "var(--text-muted)", background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            {displayed.length} affiché{displayed.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Filtres statut (pilules colorées) ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className="px-4 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all active:scale-95 border"
                style={{
                  background:  active ? f.bg   : f.bgOff,
                  color:       active ? f.color : f.colOff,
                  borderColor: active ? f.border : "var(--card-border)",
                }}>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── Recherche + tri ── */}
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Client, véhicule, plaque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium outline-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Tri dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort((p) => !p)}
              className="h-full px-3 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <SlidersHorizontal size={13} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>
                {SORT_LABELS[sortOrder]}
              </span>
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 rounded-2xl border overflow-hidden shadow-xl"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", minWidth: "140px" }}>
                  {Object.entries(SORT_LABELS).map(([key, label]) => (
                    <button key={key}
                      onClick={() => { setSortOrder(key); setShowSort(false); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-black transition-all"
                      style={{
                        color:      sortOrder === key ? "var(--accent)" : "var(--text-primary)",
                        background: sortOrder === key ? "var(--accent-light)" : "transparent",
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Résultats search */}
        {searchQuery && (
          <p className="text-[11px] px-1" style={{ color: "var(--text-muted)" }}>
            {displayed.length} résultat{displayed.length > 1 ? "s" : ""} pour "{searchQuery}"
          </p>
        )}

        {/* ── Skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border p-4 space-y-2"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <div className="h-4 w-32 rounded-full animate-pulse" style={{ background: "var(--card-border)" }} />
                <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: "var(--card-border)" }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--card-bg)" }}>
              <FolderOpen size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm font-black" style={{ color: "var(--text-muted)" }}>
              Aucun dossier trouvé
            </p>
            {(statusFilter !== "all" || searchQuery) && (
              <button
                onClick={() => { setStatusFilter("all"); setSearchQuery(""); }}
                className="text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95"
                style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* ── Liste ── */}
        {!loading && displayed.length > 0 && (
          <div className="space-y-3">
            {displayed.map((dossier) => (
              <DossierCard
                key={dossier.id}
                dossier={dossier}
                onDelete={(id) => setDossiers((p) => p.filter((d) => d.id !== id))}
                onUpdate={(id, patch) => setDossiers((p) => p.map((d) => d.id === id ? { ...d, ...patch } : d))}
              />
            ))}
          </div>
        )}

      </div>
    </AppContainer>
  );
}