"use client";

import { useState } from "react";
import WeekView from "./WeekView";
import MonthView from "./MonthView";

export default function PlanningCalendar() {
  const [mode, setMode] = useState<"week" | "month">("week");

  return (
    <div className="w-full">

      {/* HEADER MODE */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setMode("week")}
          className={`px-4 py-2 rounded-xl font-semibold text-sm shadow 
            ${mode === "week" ? "bg-blue-600 text-white" : "bg-white/70 text-slate-600"}`}
        >
          Semaine
        </button>

        <button
          onClick={() => setMode("month")}
          className={`px-4 py-2 rounded-xl font-semibold text-sm shadow 
            ${mode === "month" ? "bg-blue-600 text-white" : "bg-white/70 text-slate-600"}`}
        >
          Mois
        </button>
      </div>

      {/* RENDU */}
      {mode === "week" ? <WeekView /> : <MonthView />}
    </div>
  );
}
