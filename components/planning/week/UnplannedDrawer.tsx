"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import type { UnplannedDossier } from "@/lib/api/planning";
import UnplannedCard from "./UnplannedCard";

interface Props {
  unplanned: UnplannedDossier[];
  open: boolean;
  onToggle: () => void;
}

export default function UnplannedDrawer({ unplanned, open, onToggle }: Props) {
  return (
    <div
      className="fixed left-0 right-0 z-40 flex justify-center px-3"
      style={{ bottom: "80px" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border shadow-lg"
        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        {/* Handle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-2.5 transition-all active:opacity-80"
          style={{ background: "var(--card-bg)" }}
        >
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
              unplanned.length > 0 ? "bg-amber-400 animate-pulse" : ""
            }`}
              style={unplanned.length === 0 ? { background: "var(--text-muted)" } : {}}
            />
            <span className="font-black text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-secondary)" }}>
              À planifier
            </span>
            <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
              ({unplanned.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {unplanned.length > 0 && !open && (
              <span className="text-[9px] italic" style={{ color: "var(--text-muted)" }}>
                Glisser vers un jour
              </span>
            )}
            {open
              ? <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
              : <ChevronUp   size={14} style={{ color: "var(--text-muted)" }} />
            }
          </div>
        </button>

        {/* Contenu */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[25vh] opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div
            className="flex flex-col gap-1.5 px-3 pb-3 overflow-y-auto"
            style={{ maxHeight: "25vh", scrollbarWidth: "none" }}
          >
            <div className="h-px mb-1" style={{ background: "var(--card-border)" }} />
            {unplanned.length > 0 ? (
              unplanned.map((d) => <UnplannedCard key={d.id} dossier={d} />)
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Tous les dossiers sont planifiés ✨
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}