"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { Plus, X, CheckCircle, Loader2 } from "lucide-react";
import type { Alerte } from "@/components/alertes/alertes.types";
import { PRIORITY_ORDER } from "@/components/alertes/alertes.types";
import AlertesKPI    from "@/components/alertes/AlertesKPI";
import AlereteCard   from "@/components/alertes/AlereteCard";
import NewAlerteForm from "@/components/alertes/NewAlerteForm";

type Filter = "active" | "all" | "resolved";

export default function AlertesPage() {
  const [alertes, setAlertes]   = useState<Alerte[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState<Filter>("active");

  useEffect(() => { loadAlertes(); }, []);

  async function loadAlertes() {
    setLoading(true);
    const { data } = await supabase
      .from("alertes").select("*")
      .order("is_resolved", { ascending: true })
      .order("created_at", { ascending: false });
    setAlertes((data as Alerte[]) || []);
    setLoading(false);
  }

  const filtered = alertes
    .filter((a) => {
      if (filter === "active")   return !a.is_resolved;
      if (filter === "resolved") return a.is_resolved;
      return true;
    })
    .sort((a, b) => {
      if (a.is_resolved !== b.is_resolved) return a.is_resolved ? 1 : -1;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });

  const urgentCount = alertes.filter((a) => !a.is_resolved && a.priority === "high").length;

  return (
    <AppContainer>
      <div className="px-4 pt-10 pb-32 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Alertes
            </h1>
            {urgentCount > 0 && (
              <p className="text-xs font-bold mt-0.5" style={{ color: "#ef4444" }}>
                ⚠ {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-90"
            style={{
              background: showForm ? "var(--accent)" : "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}>
            {showForm
              ? <X size={18} className="text-white" />
              : <Plus size={18} style={{ color: "var(--accent)" }} />
            }
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <NewAlerteForm
            onCreated={(a) => { setAlertes((p) => [a, ...p]); setShowForm(false); }}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* KPI */}
        <AlertesKPI alertes={alertes} />

        {/* Filtres */}
        <div className="flex gap-2">
          {([
            { id: "active",   label: "Actives" },
            { id: "all",      label: "Toutes" },
            { id: "resolved", label: "Résolues" },
          ] as const).map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="flex-1 py-2 rounded-xl font-black text-xs transition-all active:scale-[0.97] border"
              style={{
                background: filter === f.id ? "var(--accent)" : "var(--card-bg)",
                color: filter === f.id ? "#ffffff" : "var(--text-muted)",
                borderColor: filter === f.id ? "var(--accent)" : "var(--card-border)",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <CheckCircle size={32} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
              {filter === "active" ? "Aucune alerte active 🎉" : "Aucune alerte"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((alerte) => (
              <AlereteCard
                key={alerte.id}
                alerte={alerte}
                onResolve={(id) => setAlertes((p) => p.map((a) => a.id === id ? { ...a, is_resolved: true } : a))}
                onDelete={(id) => setAlertes((p) => p.filter((a) => a.id !== id))}
              />
            ))}
          </div>
        )}

      </div>
    </AppContainer>
  );
}