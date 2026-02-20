"use client";

import { useState } from "react";
import { X, Pencil, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CatalogueItem } from "./catalogue.types";
import { TYPE_CONFIG } from "./catalogue.types";

interface Props {
  item: CatalogueItem;
  onDelete: (id: string) => void;
  onUpdate: (item: CatalogueItem) => void;
  selectable?: boolean;
  onSelect?: (item: CatalogueItem) => void;
}

export default function CatalogueCard({ item, onDelete, onUpdate, selectable, onSelect }: Props) {
  const [editing, setEditing]   = useState(false);
  const [label, setLabel]       = useState(item.label);
  const [price, setPrice]       = useState(String(item.unit_price));
  const [saving, setSaving]     = useState(false);
  const cfg = TYPE_CONFIG[item.type];

  async function handleSave() {
    if (!label.trim() || !price) return;
    setSaving(true);
    const { data } = await supabase
      .from("catalogue")
      .update({ label: label.trim(), unit_price: Number(price) })
      .eq("id", item.id)
      .select().single();
    if (data) onUpdate(data as CatalogueItem);
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    await supabase.from("catalogue").delete().eq("id", item.id);
    onDelete(item.id);
  }

  if (editing) {
    return (
      <div className="rounded-2xl border p-3 space-y-2"
        style={{ background: "var(--card-bg-active)", borderColor: cfg.border }}>
        <input value={label} onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
        <div className="flex gap-2">
          <input value={price} onChange={(e) => setPrice(e.target.value)}
            type="number" placeholder="Prix €"
            className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-xl text-white font-black text-xs disabled:opacity-40"
            style={{ background: "var(--accent)" }}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          </button>
          <button onClick={() => setEditing(false)}
            className="px-3 py-2 rounded-xl font-black text-xs"
            style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
        selectable ? "active:scale-[0.98] cursor-pointer" : ""
      }`}
      style={{ background: cfg.bg, borderColor: cfg.border }}
      onClick={() => selectable && onSelect?.(item)}
    >
      {/* Barre gauche */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: cfg.color }} />

      <div className="flex-1 min-w-0 pl-1">
        <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
          {item.label}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: cfg.color + "20", color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
            TVA {item.tva}%
          </span>
        </div>
      </div>

      <p className="font-black text-base shrink-0" style={{ color: cfg.color }}>
        {item.unit_price}€
      </p>

      {!selectable && (
        <div className="flex gap-1.5 shrink-0">
          <button onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
            <Pencil size={11} />
          </button>
          <button onClick={handleDelete}
            className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 transition-all active:scale-90">
            <X size={11} />
          </button>
        </div>
      )}

      {selectable && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: cfg.color + "20" }}>
          <Check size={12} style={{ color: cfg.color }} />
        </div>
      )}
    </div>
  );
}