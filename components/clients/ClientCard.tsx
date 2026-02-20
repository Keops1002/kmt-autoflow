"use client";

import type { ClientWithStats } from "@/lib/types";
import { ChevronRight, Mail, Phone } from "lucide-react";

type Props = {
  client: ClientWithStats;
  onClick?: () => void;
};

export default function ClientCard({ client, onClick }: Props) {
  return (
    <div className="p-[2px] rounded-[2.5rem] bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500">
      <button
        onClick={onClick}
        className="w-full text-left relative p-5 rounded-[2.5rem]
                   bg-white/90 backdrop-blur-md
                   transition-all active:scale-[0.98] hover:brightness-[1.02]"
      >
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

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
          {client.phone && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/30">
              <Phone size={14} className="text-slate-500" />
              {client.phone}
            </span>
          )}
          {client.email && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/30">
              <Mail size={14} className="text-slate-500" />
              {client.email}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}