"use client";

import { useRouter, usePathname } from "next/navigation";
import { Plus, Bot } from "lucide-react";

export default function FloatingStack() {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="fixed left-0 right-0 z-40 flex justify-center px-4"
      style={{ bottom: "80px" }}
    >
      <div className="w-full max-w-md flex gap-3">

        {/* Assistant IA */}
        <button
          onPointerDown={() => router.push("/assistant")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                     bg-gradient-to-r from-blue-500 to-indigo-600
                     text-white font-black text-sm shadow-lg shadow-blue-500/20
                     active:scale-[0.97] transition-all duration-150"
        >
          <Bot size={17} strokeWidth={2.5} />
          Assistant IA
        </button>

        {/* Nouveau dossier */}
        <button
          onPointerDown={() => router.push("/dossiers/new")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                     bg-white text-slate-700 font-black text-sm
                     shadow-lg border border-slate-200
                     active:scale-[0.97] transition-all duration-150"
        >
          <Plus size={17} strokeWidth={3} />
          Nouveau dossier
        </button>

      </div>
    </div>
  );
}