"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CatalogueItem } from "./catalogue.types";
import { TYPE_CONFIG } from "./catalogue.types";

interface Props {
  onCreated: (item: CatalogueItem) => void;
  onClose: () => void;
}

export default function NewCatalogueForm({ onCreated, onClose }: Props) {
  const [label, setLabel]   = useState("");
  const [price, setPrice]   = useState("");
  const [tva, setTva]       = useState("20");
  const [type, setType]     = useState<CatalogueItem["type"]>("forfait");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!label.trim() || !price) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("catalogue")
      .insert({ label: label.trim(), unit_price: Number(price), tva: Number(tva), type })
      .select().single();
    if (!error && data) onCreated(data as CatalogueItem);
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: "var(--accent)" }}>
        <p className="text-sm font-black text-white">Nouvel article</p>
        <button onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
          <X size={13} />
        </button>
      </div>

      <div className="p-4 space-y-3">

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(TYPE_CONFIG) as [CatalogueItem["type"], typeof TYPE_CONFIG["forfait"]][]).map(([key, cfg]) => (
              <button key={key} onClick={() => setType(key)}
                className="py-2 rounded-xl border text-xs font-black transition-all active:scale-95"
                style={{
                  background: type === key ? cfg.bg : "var(--card-bg)",
                  borderColor: type === key ? cfg.border : "var(--card-border)",
                  color: type === key ? cfg.color : "var(--text-muted)",
                }}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>Désignation *</label>
          <input
            autoFocus value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Polish Stage 1, Redressage aile..."
            className="w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none"
            style={{
              background: "var(--card-bg-active)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Prix + TVA */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>Prix unitaire (€) *</label>
            <input
              type="number" value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="350"
              className="w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none"
              style={{
                background: "var(--card-bg-active)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div className="w-24 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>TVA %</label>
            <select value={tva} onChange={(e) => setTva(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border text-sm font-medium focus:outline-none"
              style={{
                background: "var(--card-bg-active)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}>
              <option value="0">0%</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave} disabled={!label.trim() || !price || saving}
          className="w-full py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {saving ? "Création..." : "Ajouter au catalogue"}
        </button>
      </div>
    </div>
  );
}