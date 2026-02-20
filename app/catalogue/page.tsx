"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { Plus, X, Loader2, BookOpen } from "lucide-react";
import type { CatalogueItem } from "@/components/catalogue/catalogue.types";
import { TYPE_CONFIG } from "@/components/catalogue/catalogue.types";
import CatalogueCard    from "@/components/catalogue/CatalogueCard";
import NewCatalogueForm from "@/components/catalogue/NewCatalogueForm";

type FilterType = "all" | CatalogueItem["type"];

export default function CataloguePage() {
  const [items, setItems]     = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]   = useState<FilterType>("all");

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase
      .from("catalogue")
      .select("*")
      .order("type")
      .order("label");
    setItems((data as CatalogueItem[]) || []);
    setLoading(false);
  }

  const filtered = filter === "all"
    ? items
    : items.filter((i) => i.type === filter);

  return (
    <AppContainer>
      <div className="px-4 pt-10 pb-32 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Catalogue
            </h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
              {items.length} article{items.length > 1 ? "s" : ""} enregistré{items.length > 1 ? "s" : ""}
            </p>
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
          <NewCatalogueForm
            onCreated={(item) => { setItems((p) => [item, ...p]); setShowForm(false); }}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* KPI */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(TYPE_CONFIG) as [CatalogueItem["type"], typeof TYPE_CONFIG["forfait"]][]).map(([key, cfg]) => (
            <div key={key} className="rounded-2xl border p-3 text-center"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <p className="text-xl font-black" style={{ color: cfg.color }}>
                {items.filter((i) => i.type === key).length}
              </p>
              <p className="text-[9px] font-black uppercase tracking-wider mt-0.5"
                style={{ color: "var(--text-muted)" }}>{cfg.label}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { id: "all",         label: "Tous" },
            { id: "forfait",     label: "Forfaits" },
            { id: "piece",       label: "Pièces" },
            { id: "main_oeuvre", label: "Main d'œuvre" },
          ] as const).map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="shrink-0 px-3 py-1.5 rounded-xl font-black text-xs transition-all border"
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
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <BookOpen size={32} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
              {filter === "all" ? "Catalogue vide — ajoutez vos premiers articles" : "Aucun article dans cette catégorie"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <CatalogueCard
                key={item.id}
                item={item}
                onDelete={(id) => setItems((p) => p.filter((i) => i.id !== id))}
                onUpdate={(updated) => setItems((p) => p.map((i) => i.id === updated.id ? updated : i))}
              />
            ))}
          </div>
        )}

      </div>
    </AppContainer>
  );
}