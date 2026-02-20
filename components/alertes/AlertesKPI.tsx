"use client";

import type { Alerte } from "./alertes.types";

export default function AlertesKPI({ alertes }: { alertes: Alerte[] }) {
  const kpis = [
    { label: "Actives",  value: alertes.filter((a) => !a.is_resolved).length,                         color: "var(--accent)" },
    { label: "Urgentes", value: alertes.filter((a) => !a.is_resolved && a.priority === "high").length, color: "#ef4444" },
    { label: "Résolues", value: alertes.filter((a) => a.is_resolved).length,                           color: "#10b981" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {kpis.map((kpi) => (
        <div key={kpi.label}
          className="rounded-2xl border p-3 text-center"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <p className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
          <p className="text-[9px] font-black uppercase tracking-wider mt-0.5"
            style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}