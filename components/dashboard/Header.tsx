"use client";

import { Settings } from "lucide-react";

export default function Header() {
  return (
    <div className="px-8 pt-12 pb-6">
      <div className="flex justify-between items-start">

        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Atlas Carrosserie
          </h1>

          <p className="text-xs font-bold text-slate-500 mt-2 uppercase">
            Aujourd'hui – Mardi 12 Mars
          </p>
        </div>

        <button className="p-3 rounded-2xl 
                           bg-gradient-to-br from-white to-slate-300
                           shadow-[0_8px_20px_rgba(0,0,0,0.15),inset_0_2px_3px_white]
                           text-slate-600">
          <Settings size={20} />
        </button>

      </div>
    </div>
  );
}
