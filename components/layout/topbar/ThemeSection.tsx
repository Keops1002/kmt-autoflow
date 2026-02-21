"use client";

import { Sun, Moon } from "lucide-react";
import type { Theme } from "../AppContainer";

export default function ThemeSection({ currentTheme, onThemeChange, onBack }: {
  currentTheme: Theme;
  onThemeChange: (t: Theme) => void;
  onBack: () => void;
}) {
  const themes = [
    { id: "light"  as Theme, label: "Light Blue",  desc: "Fond clair, accent bleu",    preview: "bg-gradient-to-br from-[#eef1f4] to-[#cfd4d9]", icon: Sun  },
    { id: "silver" as Theme, label: "Silver Dark",  desc: "Fond dark, bordures argent", preview: "bg-gradient-to-br from-[#16213e] to-[#0f0f1a]", icon: Moon },
    { id: "gold"   as Theme, label: "Gold Égypte",  desc: "Fond noir, or antique",      preview: "bg-gradient-to-br from-[#1a1508] to-[#0a0805]", icon: Sun  },
  ];

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-slate-400">← Retour</button>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Choisir un thème</p>
      <div className="space-y-2">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = currentTheme === t.id;
          return (
            <button key={t.id} onClick={() => onThemeChange(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all active:scale-[0.98] ${
                isActive ? "border-[#17179C]/40 bg-[#17179C]/5" : "border-slate-100 bg-white/60"
              }`}>
              <div className={`w-10 h-10 rounded-xl ${t.preview} flex items-center justify-center shadow-inner`}>
                <Icon size={16} className={t.id === "light" ? "text-slate-600" : "text-slate-300"} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-black text-slate-700">{t.label}</p>
                <p className="text-[10px] text-slate-400">{t.desc}</p>
              </div>
              {isActive && (
                <div className="w-4 h-4 rounded-full bg-[#17179C] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}