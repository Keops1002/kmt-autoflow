"use client";

import { useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import WeekView from "@/components/planning/WeekView";
import MonthView from "@/components/planning/MonthView";

export default function PlanningPage() {
  const [mode, setMode] = useState<"week" | "month">("week");

  return (
    <AppContainer>
      <div className="px-4 pt-10 pb-40 space-y-4">

        <div className="flex items-center justify-between px-2">
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            Planning
          </h1>

          <div className="flex p-1 rounded-2xl border shadow-sm"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <button
              onClick={() => setMode("week")}
              className="px-4 py-1.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: mode === "week" ? "var(--accent)" : "transparent",
                color: mode === "week" ? "#ffffff" : "var(--text-muted)",
              }}
            >
              Semaine
            </button>
            <button
              onClick={() => setMode("month")}
              className="px-4 py-1.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: mode === "month" ? "var(--accent)" : "transparent",
                color: mode === "month" ? "#ffffff" : "var(--text-muted)",
              }}
            >
              Mois
            </button>
          </div>
        </div>

        {mode === "week" ? <WeekView /> : <MonthView />}

      </div>
    </AppContainer>
  );
}