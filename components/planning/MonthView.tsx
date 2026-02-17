"use client";

import { useEffect, useState } from "react";
import { getPlanningMonth } from "@/lib/api/planning";
import PlanningBar from "./PlanningBar";

export default function MonthView() {
  const [calendar, setCalendar] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    getPlanningMonth().then((res) => {
      setEntries(res.entries || []);
      generateCalendar(res.year, res.month);
    });
  }, []);

  function generateCalendar(year: number, month: number) {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const days: any[] = [];

    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    setCalendar(days);
  }

  return (
    <div className="grid grid-cols-7 gap-2 mt-6">
      {calendar.map((date) => {
        const id = date.toISOString().slice(0, 10);

        return (
          <div
            key={id}
            className="p-2 h-24 bg-white/60 rounded-xl shadow flex flex-col text-xs"
          >
            <span className="font-bold">{date.getDate()}</span>

            <div className="flex flex-col gap-1 mt-1">
              {entries
                .filter((e) => e.start_date === id)
                .map((e) => (
                  <PlanningBar key={e.dossier_id} bar={e} />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
