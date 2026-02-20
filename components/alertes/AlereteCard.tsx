"use client";

import { useState } from "react";
import { X, ChevronDown, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Alerte } from "./alertes.types";
import { PRIORITY_CONFIG } from "./alertes.types";

interface Props {
  alerte: Alerte;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AlereteCard({ alerte, onResolve, onDelete }: Props) {
  const [expanded, setExpanded]   = useState(false);
  const [resolving, setResolving] = useState(false);

  const cfg  = PRIORITY_CONFIG[alerte.priority];
  const Icon = cfg.icon;

  const date = new Date(alerte.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  async function handleResolve(e: React.MouseEvent) {
    e.stopPropagation();
    setResolving(true);
    await supabase.from("alertes").update({ is_resolved: true }).eq("id", alerte.id);
    onResolve(alerte.id);
    setResolving(false);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await supabase.from("alertes").delete().eq("id", alerte.id);
    onDelete(alerte.id);
  }

  return (
    <div
      className="relative rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.99]"
      style={{
        background: alerte.is_resolved ? "var(--card-bg)" : cfg.bg,
        borderColor: alerte.is_resolved ? "var(--card-border)" : cfg.border,
        opacity: alerte.is_resolved ? 0.6 : 1,
      }}
      onClick={() => alerte.description && setExpanded((p) => !p)}
    >
      {/* Barre gauche */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: alerte.is_resolved ? "var(--text-muted)" : cfg.color }} />

      {/* Header */}
      <div className="pl-4 pr-3 pt-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <Icon size={16} className="mt-0.5 shrink-0"
              style={{ color: alerte.is_resolved ? "var(--text-muted)" : cfg.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-black ${alerte.is_resolved ? "line-through" : ""}`}
                  style={{ color: alerte.is_resolved ? "var(--text-muted)" : "var(--text-primary)" }}>
                  {alerte.title}
                </p>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: cfg.color + "20", color: cfg.color }}>
                  {cfg.label}
                </span>
                {alerte.is_resolved && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                    Résolu ✓
                  </span>
                )}
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{date}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {!alerte.is_resolved && (
              <button onClick={handleResolve} disabled={resolving}
                className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 transition-all active:scale-90">
                {resolving ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
              </button>
            )}
            <button onClick={handleDelete}
              className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 transition-all active:scale-90">
              <X size={11} />
            </button>
            {alerte.description && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                <ChevronDown size={13} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description expandable */}
      {alerte.description && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="px-4 pb-3 pt-1">
            <div className="h-px mb-2" style={{ background: cfg.border }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {alerte.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}