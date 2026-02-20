"use client";

import { useState } from "react";
import { X, Plus, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Alerte } from "./alertes.types";
import { PRIORITY_CONFIG } from "./alertes.types";

interface Props {
  onCreated: (a: Alerte) => void;
  onClose: () => void;
}

export default function NewAlerteForm({ onCreated, onClose }: Props) {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]     = useState<Alerte["priority"]>("medium");
  const [saving, setSaving]         = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("alertes")
      .insert({ title: title.trim(), description: description.trim() || null, priority })
      .select().single();
    if (!error && data) onCreated(data as Alerte);
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: "var(--accent)" }}>
        <p className="text-sm font-black text-white">Nouvelle alerte</p>
        <button onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
          <X size={13} />
        </button>
      </div>

      <div className="p-4 space-y-3">

        {/* Titre */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>Titre *</label>
          <input
            autoFocus value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Ex: Vérifier stock peinture..."
            className="w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none"
            style={{
              background: "var(--card-bg-active)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>Note (optionnel)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails supplémentaires..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border text-sm resize-none focus:outline-none"
            style={{
              background: "var(--card-bg-active)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Priorité */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>Priorité</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(PRIORITY_CONFIG) as [Alerte["priority"], typeof PRIORITY_CONFIG["high"]][]).map(([key, cfg]) => {
              const Icon     = cfg.icon;
              const isActive = priority === key;
              return (
                <button key={key} onClick={() => setPriority(key)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all active:scale-[0.97]"
                  style={{
                    background: isActive ? cfg.bg : "var(--card-bg)",
                    borderColor: isActive ? cfg.border : "var(--card-border)",
                  }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                  <span className="text-xs font-black"
                    style={{ color: isActive ? cfg.color : "var(--text-muted)" }}>
                    {cfg.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: cfg.color }}>
                      <Check size={8} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton */}
        <button
          onClick={handleSave} disabled={!title.trim() || saving}
          className="w-full py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {saving ? "Création..." : "Créer l'alerte"}
        </button>
      </div>
    </div>
  );
}