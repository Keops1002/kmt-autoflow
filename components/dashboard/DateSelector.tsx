"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateSelector() {
  return (
    <div className="px-8 mb-8">

      <div className="flex items-center justify-between px-6 py-4 rounded-3xl
                      bg-gradient-to-b from-[#f6f8fa] to-[#d9dde2]
                      shadow-[inset_0_3px_6px_rgba(0,0,0,0.15)]
                      border border-white/40">

        <button className="text-slate-400 hover:text-slate-700 transition">
          <ChevronLeft size={24} />
        </button>

        <span className="font-extrabold text-slate-700">
          Mardi 12 Mars
        </span>

        <button className="text-slate-400 hover:text-slate-700 transition">
          <ChevronRight size={24} />
        </button>

      </div>

    </div>
  );
}
