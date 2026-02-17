"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

/* =========================================================
   FLOATING BUTTON – NAVIGATION NEW DOSSIER
========================================================= */

export default function FloatingButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/dossiers/new")}
      className="absolute bottom-32 right-6 z-50
                 w-16 h-16 rounded-full
                 flex items-center justify-center
                 bg-gradient-to-br from-white to-slate-200
                 shadow-[0_15px_35px_rgba(0,0,0,0.25)]
                 text-slate-800
                 hover:scale-105 active:scale-90 transition-all duration-200"
    >
      <Plus size={28} strokeWidth={3} />
    </button>
  );
}

