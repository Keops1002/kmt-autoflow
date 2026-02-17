"use client";

import { Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { DossierCardModel } from "@/lib/types";

/* =========================================================
   DOSSIER CARD – UI MODEL
========================================================= */

type Props = {
  dossier: DossierCardModel;
};

export default function DossierCard({ dossier }: Props) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/dossiers/${dossier.id}`)}
      className="group p-6 rounded-[2rem]
                 bg-gradient-to-br from-white/70 to-white/30
                 backdrop-blur-xl
                 border border-white/50
                 shadow-[0_20px_40px_rgba(0,0,0,0.15)]
                 transition-all duration-300
                 hover:shadow-[0_30px_60px_rgba(0,0,0,0.25)]
                 hover:-translate-y-1
                 active:scale-[0.98]
                 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl
                          bg-gradient-to-br from-white to-slate-200
                          shadow-md flex items-center justify-center
                          group-hover:scale-110 transition-all duration-300">
            <Car size={20} className="text-slate-700" />
          </div>

          <div>
            <h3 className="font-extrabold text-slate-800">
              {dossier.vehicle_label}
            </h3>

            <p className="text-xs font-bold text-slate-400 uppercase">
              {dossier.problem}
            </p>

            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              {dossier.client_name}
            </p>
          </div>
        </div>

        {dossier.progress && (
          <span className="text-[10px] font-black px-4 py-2 rounded-xl
                           bg-slate-800 text-white shadow-lg
                           group-hover:scale-105 transition-all duration-300">
            {dossier.progress}
          </span>
        )}
      </div>
    </div>
  );
}
