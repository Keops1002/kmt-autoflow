"use client";

import { useRouter } from "next/navigation";
import { Plus, Car, Users, BarChart2 } from "lucide-react";

const ACTIONS = [
  { icon: Plus,     label: "Nouveau\ndossier", path: "/dossiers/new", accent: true },
  { icon: Car,      label: "Dossiers",         path: "/dossiers",     accent: false },
  { icon: Users,    label: "Clients",          path: "/clients",      accent: false },
  { icon: BarChart2,label: "Statistiques",     path: "/stats",        accent: false },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider px-1 mb-2"
        style={{ color: "var(--text-muted)" }}>Actions rapides</p>
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => router.push(action.path)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all active:scale-95"
              style={{
                background: action.accent ? "var(--accent)" : "var(--card-bg)",
                borderColor: action.accent ? "var(--accent)" : "var(--card-border)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: action.accent ? "rgba(255,255,255,0.2)" : "var(--card-bg-active)",
                }}
              >
                <Icon size={15} style={{ color: action.accent ? "#ffffff" : "var(--accent)" }} />
              </div>
              <p
                className="text-[9px] font-black text-center leading-tight whitespace-pre-line"
                style={{ color: action.accent ? "#ffffff" : "var(--text-secondary)" }}
              >
                {action.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}