"use client";

import { useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import PlanningCalendar from "@/components/planning/PlanningCalendar";

export default function PlanningPage() {
  const [mode, setMode] = useState<"week" | "month">("week");

  return (
    <AppContainer>
      <div className="px-8 pt-12 pb-40 space-y-6">
        {/* TITRE + Switch */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Planning
          </h1>

          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                mode === "week"
                  ? "bg-[#17179C] text-white"
                  : "bg-white border border-slate-300 text-slate-700"
              }`}
              onClick={() => setMode("week")}
            >
              Semaine
            </button>

            <button
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                mode === "month"
                  ? "bg-[#17179C] text-white"
                  : "bg-white border border-slate-300 text-slate-700"
              }`}
              onClick={() => setMode("month")}
            >
              Mois
            </button>
          </div>
        </div>

        {/* CALENDAR PRINCIPAL */}
        <PlanningCalendar />

      </div>
    </AppContainer>
  );
}
