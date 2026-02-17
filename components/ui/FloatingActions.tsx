"use client";

import { useRouter } from "next/navigation";
import { Plus, Bot } from "lucide-react";

export default function FloatingActions() {
  const router = useRouter();

  return (
    <div className="fixed bottom-28 right-6 flex flex-col gap-4 z-50">

      {/* IA BUTTON */}
      <button
        onClick={() => router.push("/assistant")}
        className="w-14 h-14 rounded-full
                   bg-gradient-to-br from-blue-600 to-indigo-600
                   text-white shadow-xl
                   flex items-center justify-center
                   hover:scale-110 active:scale-95
                   transition-all duration-200"
      >
        <Bot size={22} strokeWidth={2.5} />
      </button>

      {/* NEW DOSSIER BUTTON */}
      <button
        onClick={() => router.push("/dossiers/new")}
        className="w-14 h-14 rounded-full
                   bg-white
                   text-blue-600
                   shadow-xl border border-slate-200
                   flex items-center justify-center
                   hover:scale-110 active:scale-95
                   transition-all duration-200"
      >
        <Plus size={22} strokeWidth={3} />
      </button>

    </div>
  );
}
