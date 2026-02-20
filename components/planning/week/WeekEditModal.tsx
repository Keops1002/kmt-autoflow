"use client";

import { useState } from "react";
import { X, CalendarRange, Loader2 } from "lucide-react";
import type { PlanningBar } from "@/lib/api/planning";
import { daysBetween } from "@/lib/api/planning";

interface Props {
  bar: PlanningBar;
  onSave: (start: string, end: string) => Promise<void>;
  onClose: () => void;
}

export default function WeekEditModal({ bar, onSave, onClose }: Props) {
  const [start, setStart]   = useState(bar.start_date);
  const [end, setEnd]       = useState(bar.end_date);
  const [saving, setSaving] = useState(false);
  const isValid  = start <= end;
  const duration = daysBetween(start, end) + 1;

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    await onSave(start, end);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "var(--card-bg-active)" }}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "var(--accent)" }}>
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Modifier planning</p>
            <h3 className="text-white font-black text-lg mt-1">{bar.dossiers?.problem || "Dossier"}</h3>
            <p className="text-white/50 text-xs mt-0.5">
              {bar.dossiers?.vehicles?.brand} {bar.dossiers?.vehicles?.model}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Début */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>
              Début
            </label>
            <input
              type="date" value={start}
              onChange={(e) => { setStart(e.target.value); if (e.target.value > end) setEnd(e.target.value); }}
              className="w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Fin */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>
              Fin
            </label>
            <input
              type="date" value={end} min={start}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Durée */}
          {isValid && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "var(--accent-light)" }}>
              <CalendarRange size={14} className="shrink-0" style={{ color: "var(--accent)" }} />
              <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                {duration} jour{duration > 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
              Annuler
            </button>
            <button
              onClick={handleSave} disabled={!isValid || saving}
              className="flex-1 py-3 rounded-2xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "var(--accent)" }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}