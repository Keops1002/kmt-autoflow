"use client";

import { AlertTriangle } from "lucide-react";

export default function AlertsPanel() {
  return (
    <div className="mt-12 p-6 rounded-[2rem]
                    bg-gradient-to-b from-[#f3f6f9] to-[#d9dde2]
                    shadow-[inset_0_6px_12px_rgba(0,0,0,0.2)]
                    border border-white/40">

      <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-5">
        Alertes Système
      </h2>

      <div className="space-y-4">

        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/60">
          <AlertTriangle size={18} className="text-orange-500" />
          <span className="text-sm font-bold text-slate-700">
            Pièce manquante – BMW
          </span>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/60">
          <AlertTriangle size={18} className="text-red-500" />
          <span className="text-sm font-bold text-slate-700">
            Retard livraison – Clio
          </span>
        </div>

      </div>
    </div>
  );
}
