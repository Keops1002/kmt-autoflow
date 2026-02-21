"use client";

import { X, CalendarRange } from "lucide-react";
import type { PlanningBar } from "@/lib/api/planning";
import { daysBetween, statusDot } from "./monthHelpers";

function statusLabel(status: string) {
  switch (status) {
    case "done":        return { label: "Terminé",    badge: "bg-emerald-100 text-emerald-700" };
    case "in_progress": return { label: "En cours",   badge: "bg-blue-100 text-blue-700" };
    default:            return { label: "En attente", badge: "bg-amber-100 text-amber-700" };
  }
}

interface Props {
  date: Date;
  bars: PlanningBar[];
  onClose: () => void;
  onEdit: (bar: PlanningBar) => void;
  onRemove: (dossierId: string) => void;
}

export default function MonthDayModal({ date, bars, onClose, onEdit, onRemove }: Props) {
  const label = date.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
   <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
  <div className="absolute inset-0" onClick={onClose} />
  
  <div
    className="relative w-full max-w-sm rounded-3xl shadow-2xl"
    style={{ background: "var(--card-bg-active)", zIndex: 101 }}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="px-6 py-4 flex items-center justify-between rounded-t-3xl"
      style={{ background: "var(--accent)" }}>
      <div>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Dossiers du jour</p>
        <h3 className="text-white font-black text-base capitalize mt-0.5">{label}</h3>
      </div>
      <button onClick={onClose}
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
        <X size={15} />
      </button>
    </div>

    {/* Contenu */}
    <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {bars.length === 0 ? (
            <p className="text-center text-sm py-6 italic" style={{ color: "var(--text-muted)" }}>
              Aucun dossier ce jour
            </p>
          ) : (
            bars.map((bar) => {
              const st       = statusLabel(bar.dossiers?.status || "pending");
              const vehicle  = bar.dossiers?.vehicles;
              const duration = daysBetween(bar.start_date, bar.end_date) + 1;

              return (
                <div key={bar.dossier_id}
                  className="relative p-4 rounded-2xl border"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${statusDot(bar.dossiers?.status)}`} />
                  <div className="pl-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                        {bar.dossiers?.problem || "Entretien"}
                      </p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${st.badge}`}>
                        {st.label}
                      </span>
                    </div>
                    {vehicle && (
                      <p className="text-xs font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
                        {vehicle.brand} {vehicle.model}{vehicle.plate ? ` · ${vehicle.plate}` : ""}
                      </p>
                    )}
                    {vehicle?.clients?.name && (
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {vehicle.clients.name}
                      </p>
                    )}
                    {duration > 1 && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ color: "var(--accent)", background: "var(--accent-light)" }}>
                        <CalendarRange size={9} />{duration} jours
                      </span>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { onEdit(bar); onClose(); }}
                        className="flex-1 py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5"
                        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                        <CalendarRange size={11} />Modifier dates
                      </button>
                      <button
                        onClick={() => { onRemove(bar.dossier_id); onClose(); }}
                        className="px-3 py-2 rounded-xl bg-red-50 text-red-500 font-bold text-xs flex items-center justify-center">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}