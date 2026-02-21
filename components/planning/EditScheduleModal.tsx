"use client";

import { useState } from "react";
import { scheduleDossier, clearPlanning } from "@/lib/api/planning";
import { X, Calendar, Trash2 } from "lucide-react";

export default function EditScheduleModal({
  bar,
  onClose,
}: {
  bar: any;
  onClose: () => void;
}) {
  const [start, setStart] = useState(
    bar.start_date ?? bar.start?.toISOString().slice(0, 10) ?? ""
  );
  const [end, setEnd] = useState(
    bar.end_date ?? bar.end?.toISOString().slice(0, 10) ?? ""
  );

  const diffDays =
    start && end
      ? Math.max(
          1,
          Math.round(
            (new Date(end).getTime() - new Date(start).getTime()) / 86400000
          ) + 1
        )
      : null;

  const save = async () => {
    await scheduleDossier(bar.dossier_id, start, end);
    onClose();
  };

  const d = bar.dossiers;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="relative w-full max-w-md rounded-t-3xl flex flex-col"
        style={{
          background: "var(--card-bg-active)",
          height: "90dvh",
          zIndex: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header fixe */}
        <div
          className="px-6 py-4 flex items-start justify-between shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
              Modifier Planning
            </p>
            <h3 className="text-white font-black text-lg mt-0.5">
              {d?.problem || "Dossier"}
            </h3>
            {d?.vehicles && (
              <p className="text-white/60 text-xs mt-0.5">
                {d.vehicles.brand} {d.vehicles.model}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white mt-1"
          >
            <X size={15} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div
          className="flex-1 px-6 py-5 space-y-4"
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            paddingBottom: "60px",
          }}
        >
          {/* Début */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Début
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Fin */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Fin
            </label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Durée */}
          {diffDays && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "var(--accent-light)" }}
            >
              <Calendar size={14} style={{ color: "var(--accent)" }} />
              <span
                className="text-sm font-black"
                style={{ color: "var(--accent)" }}
              >
                {diffDays} jour{diffDays > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={async () => {
                await clearPlanning(bar.dossier_id);
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-red-500 border border-red-200 active:scale-[0.98] transition-all"
              style={{ background: "rgba(239,68,68,0.05)" }}
            >
              <Trash2 size={14} /> Supprimer
            </button>
            <button
              onClick={save}
              className="flex-1 py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ background: "var(--accent)" }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}