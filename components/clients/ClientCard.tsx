"use client";

/* =========================================================
   CLIENT CARD – SILVER UI
========================================================= */

import type { ClientWithStats } from "@/lib/types";
import { ChevronRight, Mail, Phone } from "lucide-react";

type Props = {
  client: ClientWithStats;
  onClick?: () => void;
};

export default function ClientCard({ client, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left relative p-5 rounded-[2.5rem]
                 bg-white/40 backdrop-blur-md border border-white/60
                 shadow-[15px_15px_30px_#bebfc3,-15px_-15px_30px_#ffffff]
                 transition-all active:scale-[0.98] hover:brightness-[1.02]"
    >
      {/* =========================================================
         HEADER
      ========================================================= */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-extrabold text-slate-800 truncate">
            {client.name}
          </p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
            {client.dossiers_count} dossier{client.dossiers_count > 1 ? "s" : ""}
          </p>
        </div>

        <div className="shrink-0 p-2 rounded-2xl bg-[#e2e5e9]
                        shadow-[5px_5px_10px_#bebfc3,-5px_-5px_10px_#ffffff]
                        text-slate-500">
          <ChevronRight size={18} />
        </div>
      </div>

      {/* =========================================================
         FOOTER INFOS
      ========================================================= */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
        {client.phone ? (
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/30">
            <Phone size={14} className="text-slate-500" />
            {client.phone}
          </span>
        ) : null}

        {client.email ? (
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/30">
            <Mail size={14} className="text-slate-500" />
            {client.email}
          </span>
        ) : null}
      </div>
    </button>
  );
}
