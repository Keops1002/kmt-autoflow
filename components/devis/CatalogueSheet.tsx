"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CatalogueItem } from "@/components/catalogue/catalogue.types";
import { TYPE_CONFIG } from "@/components/catalogue/catalogue.types";
import type { DevisLigne } from "./devis.types";

interface Props {
  onSelect: (ligne: DevisLigne) => void;
  onClose: () => void;
}

export default function CatalogueSheet({ onSelect, onClose }: Props) {
  const [items, setItems]   = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("catalogue").select("*").order("label")
      .then(({ data }) => { setItems((data as CatalogueItem[]) || []); setLoading(false); });
  }, []);

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(item: CatalogueItem) {
    onSelect({ label: item.label, quantity: 1, unit_price: item.unit_price, tva: item.tva });
    onClose();
  }

  return (
  <>
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <div
      className="fixed left-0 right-0 z-[60] flex justify-center"
      style={{ bottom: "60px", pointerEvents: "none" }}
    >
      <div
        className="w-full max-w-md rounded-3xl flex flex-col mx-4"
        style={{
          background: "var(--card-bg-active)",
          maxHeight: "calc(100dvh - 140px)",
          overflow: "hidden",
          pointerEvents: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0"
          style={{ borderColor: "var(--card-border)" }}>
          <p className="font-black text-sm" style={{ color: "var(--text-primary)" }}>
            Choisir du catalogue
          </p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
            <X size={14} />
          </button>
        </div>

        {/* Recherche */}
        <div className="px-4 py-2 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }} />
            <input
              autoFocus value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full py-2.5 pl-9 pr-4 rounded-xl border text-sm focus:outline-none"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Liste scrollable */}
        <div
          className="overflow-y-auto px-4 pb-6 space-y-2"
          style={{ minHeight: 0, overscrollBehavior: "contain" }}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm py-8 italic" style={{ color: "var(--text-muted)" }}>
              Aucun article trouvé
            </p>
          ) : (
            filtered.map((item) => {
              const cfg = TYPE_CONFIG[item.type];
              return (
                <button key={item.id} onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left active:scale-[0.98] transition-all"
                  style={{ background: cfg.bg, borderColor: cfg.border }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
                      {item.label}
                    </p>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: cfg.color + "20", color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="font-black text-base shrink-0" style={{ color: cfg.color }}>
                    {item.unit_price} €
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  </>
);
}